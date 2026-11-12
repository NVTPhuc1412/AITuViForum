import os
import time
import requests
from typing import List, Dict, Any, Optional
from .tokenizer import VietnameseTokenizer
from .inverted_index import InvertedIndex
from .bm25 import BM25Scorer, TFIDFScorer, HybridScorer
from .semantic import SemanticEmbedder

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000/api")

class SearchEngine:
    def __init__(self):
        self.tokenizer = VietnameseTokenizer(filter_stopwords=True)
        self.index = InvertedIndex()
        self.bm25_scorer = BM25Scorer(self.index)
        self.tfidf_scorer = TFIDFScorer(self.index)
        self.semantic = SemanticEmbedder()
        self.hybrid_scorer = HybridScorer(self.bm25_scorer, self.tfidf_scorer)
        self._pending_embed_texts: Dict[int, str] = {}

    def index_document(self, doc: Dict[str, Any]):
        """Index a single document object."""
        doc_id = doc.get("id")
        title = doc.get("title", "")
        summary = doc.get("summary", "")
        content = doc.get("plain_text") or doc.get("content", "")

        # Full searchable text with title weighting (repeating title gives it higher weight)
        full_text = f"{title}. {title}. {summary}. {content}"
        tokens_with_pos = self.tokenizer.tokenize_with_positions(full_text)

        metadata = {
            "id": doc_id,
            "title": title,
            "summary": summary,
            "category_id": doc.get("category_id"),
            "category_name": doc.get("category", {}).get("name") if isinstance(doc.get("category"), dict) else "",
            "tags": doc.get("tags", []),
            "views_count": doc.get("views_count", 0),
            "likes_count": doc.get("likes_count", 0),
            "created_at": doc.get("created_at"),
            "author_name": doc.get("author", {}).get("name") if isinstance(doc.get("author"), dict) else "",
        }

        self.index.add_document(doc_id, tokens_with_pos, metadata)
        # Semantic embedding dùng title + summary (ngắn gọn, súc tích hơn full content,
        # tránh bị cắt bớt bởi giới hạn độ dài token của mô hình embedding).
        self._pending_embed_texts[doc_id] = f"{title}. {summary}"

    def rebuild_index_from_backend(self) -> int:
        """Fetch all documents from backend API and rebuild Inverted Index. Fallback to local sample dataset if backend is offline."""
        self.index.clear()
        self.semantic.clear()
        self._pending_embed_texts = {}
        # 1. Thử tải dữ liệu từ Backend API
        try:
            url = f"{BACKEND_API_URL}/documents?limit=200"
            resp = requests.get(url, timeout=3)
            if resp.status_code == 200:
                data = resp.json()
                docs = data.get("data", {}).get("documents", [])
                for d in docs:
                    self.index_document(d)
                # Backend phản hồi thành công (ngay cả khi rỗng) -> không fallback sang dữ liệu mẫu
                self.semantic.build_index(self._pending_embed_texts)
                return len(docs)
        except Exception as e:
            print(f"[SearchEngine] Backend offline hoặc chưa khởi chạy ({e}). Đang nạp dữ liệu mẫu nội bộ...")

        # 2. Fallback: Nạp kho bài viết thực tế từ sample_documents.json
        try:
            data_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "sample_documents.json")
            if os.path.exists(data_file):
                import json
                with open(data_file, "r", encoding="utf-8") as f:
                    local_docs = json.load(f)
                    for d in local_docs:
                        self.index_document(d)
                    self.semantic.build_index(self._pending_embed_texts)
                    print(f"✅ [SearchEngine] Đã nạp thành công {len(local_docs)} bài viết từ kho dữ liệu mẫu nội bộ.")
                    return len(local_docs)
        except Exception as err:
            print(f"[SearchEngine] Lỗi nạp dữ liệu mẫu nội bộ: {err}")

        return 0

    def generate_snippet(self, text: str, query_tokens: List[str], max_chars: int = 160) -> str:
        """Tạo trích đoạn (snippet) quanh từ khóa tìm kiếm."""
        if not text:
            return ""
        norm_text = text.lower()
        first_pos = -1
        matched_token = ""

        for tok in query_tokens:
            raw_tok = tok.replace("_", " ")
            pos = norm_text.find(raw_tok)
            if pos != -1 and (first_pos == -1 or pos < first_pos):
                first_pos = pos
                matched_token = raw_tok

        if first_pos == -1:
            return text[:max_chars] + ("..." if len(text) > max_chars else "")

        start = max(0, first_pos - 40)
        end = min(len(text), first_pos + len(matched_token) + 120)
        snippet = text[start:end].strip()
        if start > 0:
            snippet = "..." + snippet
        if end < len(text):
            snippet = snippet + "..."
        return snippet

    def get_token_breakdown_for_doc(self, doc_id: int, query_tokens: List[str], scorer) -> List[Dict[str, Any]]:
        """Tính toán tỷ lệ đóng góp của từng token vào điểm số của tài liệu (theo đúng scorer của mode đang active)."""
        breakdown = []
        total_term_score = 0.0

        for tok in query_tokens:
            postings = self.index.get_postings(tok)
            tf = postings.get(doc_id).term_frequency if (postings and doc_id in postings) else 0
            idf = scorer.compute_idf(tok)
            score_contrib = scorer.score_term_for_doc(tok, doc_id)
            total_term_score += score_contrib
            breakdown.append({
                "term": tok,
                "idf": round(idf, 3),
                "tf": tf,
                "score_contrib": round(score_contrib, 4),
            })

        for item in breakdown:
            item["percentage"] = round((item["score_contrib"] / total_term_score * 100), 1) if total_term_score > 0 else 0.0

        return breakdown

    def search(
        self,
        query: str,
        mode: str = "hybrid",
        limit: int = 10,
        alpha: float = 0.65,
        beta: float = 0.35,
    ) -> Dict[str, Any]:
        """Thực hiện tìm kiếm với thuật toán xếp hạng Hybrid, BM25, TF-IDF hoặc Semantic Embedding."""
        start_time = time.perf_counter()
        query_tokens = self.tokenizer.tokenize(query)
        if not query_tokens:
            return {
                "query": query,
                "tokens": [],
                "mode": mode,
                "total_results": 0,
                "execution_time_ms": 0.0,
                "results": [],
            }

        # Luôn tính toán bảng điểm của cả BM25, TF-IDF, Semantic và Hybrid để phục vụ so sánh / trực quan hóa
        bm25_scored = self.bm25_scorer.score(query_tokens)
        tfidf_scored = self.tfidf_scorer.score(query_tokens)
        semantic_scored = self.semantic.score(query) if self.semantic.is_ready() else []
        hybrid_scored = self.hybrid_scorer.score(query_tokens, alpha=alpha, semantic_scores=semantic_scored, beta=beta)

        bm25_ranks = {doc_id: idx + 1 for idx, (doc_id, _) in enumerate(bm25_scored)}
        tfidf_ranks = {doc_id: idx + 1 for idx, (doc_id, _) in enumerate(tfidf_scored)}
        semantic_ranks = {doc_id: idx + 1 for idx, (doc_id, _) in enumerate(semantic_scored)}
        hybrid_ranks = {item[0]: idx + 1 for idx, item in enumerate(hybrid_scored)}
        bm25_score_map = {doc_id: round(score, 4) for doc_id, score in bm25_scored}
        tfidf_score_map = {doc_id: round(score, 4) for doc_id, score in tfidf_scored}
        semantic_score_map = {doc_id: round(score, 4) for doc_id, score in semantic_scored}

        mode_clean = mode.lower()
        if mode_clean == "tfidf":
            scored_docs = [
                (doc_id, score, bm25_score_map.get(doc_id, 0.0), score, semantic_score_map.get(doc_id, 0.0))
                for doc_id, score in tfidf_scored
            ]
            breakdown_scorer = self.tfidf_scorer
        elif mode_clean == "bm25":
            scored_docs = [
                (doc_id, score, score, tfidf_score_map.get(doc_id, 0.0), semantic_score_map.get(doc_id, 0.0))
                for doc_id, score in bm25_scored
            ]
            breakdown_scorer = self.bm25_scorer
        elif mode_clean == "semantic":
            # Semantic dùng Cosine Similarity trên vector câu, không tách điểm theo từng token.
            scored_docs = [
                (doc_id, score, bm25_score_map.get(doc_id, 0.0), tfidf_score_map.get(doc_id, 0.0), score)
                for doc_id, score in semantic_scored
            ]
            breakdown_scorer = None
        else:
            # Mặc định: HYBRID (Ưu việt & tốt nhất) - kết hợp cả lexical (BM25/TF-IDF) và semantic
            mode_clean = "hybrid"
            scored_docs = hybrid_scored
            breakdown_scorer = self.bm25_scorer

        total_results = len(scored_docs)
        top_docs = scored_docs[:limit]

        results = []
        for idx, item in enumerate(top_docs):
            doc_id, main_score, b_score, t_score, s_score = item

            meta = self.index.doc_metadata.get(doc_id, {})
            snippet = self.generate_snippet(meta.get("summary", ""), query_tokens)
            token_breakdown = (
                self.get_token_breakdown_for_doc(doc_id, query_tokens, breakdown_scorer)
                if breakdown_scorer is not None else []
            )

            results.append({
                "id": doc_id,
                "score": round(main_score, 4),
                "bm25_score": b_score,
                "tfidf_score": t_score,
                "semantic_score": s_score,
                "hybrid_rank": hybrid_ranks.get(doc_id, 999),
                "bm25_rank": bm25_ranks.get(doc_id, 999),
                "tfidf_rank": tfidf_ranks.get(doc_id, 999),
                "semantic_rank": semantic_ranks.get(doc_id, 999),
                "title": meta.get("title"),
                "summary": meta.get("summary"),
                "snippet": snippet,
                "category_name": meta.get("category_name"),
                "tags": meta.get("tags", []),
                "views_count": meta.get("views_count", 0),
                "likes_count": meta.get("likes_count", 0),
                "author_name": meta.get("author_name"),
                "created_at": meta.get("created_at"),
                "token_breakdown": token_breakdown,
            })

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return {
            "query": query,
            "tokens": query_tokens,
            "mode": mode_clean,
            "total_results": total_results,
            "execution_time_ms": duration_ms,
            "vocabulary_size": len(self.index.index),
            "indexed_docs_count": self.index.total_docs,
            "semantic_ready": self.semantic.is_ready(),
            "results": results,
        }
