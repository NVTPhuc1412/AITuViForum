import os
import pickle
import time
import requests
from typing import List, Dict, Any, Optional
from .tokenizer import VietnameseTokenizer
from .inverted_index import InvertedIndex
from .bm25 import BM25Scorer, TFIDFScorer, HybridScorer
from .semantic import SemanticEmbedder

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000/api")

# Nơi lưu snapshot của Inverted Index + Semantic Embedding đã dựng xong,
# để lần khởi động sau không phải tải lại từ backend / tính lại embedding.
INDEX_CACHE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "index_cache.pkl")
INDEX_CACHE_VERSION = 1

class SearchEngine:
    def __init__(self):
        self.tokenizer = VietnameseTokenizer(filter_stopwords=True)
        self.index = InvertedIndex()
        self.bm25_scorer = BM25Scorer(self.index)
        self.tfidf_scorer = TFIDFScorer(self.index)
        self.semantic = SemanticEmbedder()
        self.hybrid_scorer = HybridScorer(self.bm25_scorer, self.tfidf_scorer)
        self._pending_embed_texts: Dict[int, str] = {}

    def save_index(self, path: str = INDEX_CACHE_PATH) -> None:
        """Lưu snapshot Inverted Index + Semantic Embedding hiện tại xuống đĩa."""
        snapshot = {
            "version": INDEX_CACHE_VERSION,
            "index": self.index.index,
            "doc_lengths": self.index.doc_lengths,
            "doc_metadata": self.index.doc_metadata,
            "total_docs": self.index.total_docs,
            "avg_doc_length": self.index.avg_doc_length,
            "semantic_model_name": self.semantic.model_name,
            "semantic_doc_ids": self.semantic.doc_ids,
            "semantic_doc_matrix": self.semantic.doc_matrix,
        }
        os.makedirs(os.path.dirname(path), exist_ok=True)
        tmp_path = f"{path}.tmp"
        with open(tmp_path, "wb") as f:
            pickle.dump(snapshot, f, protocol=pickle.HIGHEST_PROTOCOL)
        os.replace(tmp_path, path)

    def load_index(self, path: str = INDEX_CACHE_PATH) -> bool:
        """Nạp snapshot đã lưu trước đó. Trả về True nếu nạp thành công và có dữ liệu."""
        if not os.path.exists(path):
            return False
        try:
            with open(path, "rb") as f:
                snapshot = pickle.load(f)
            if snapshot.get("version") != INDEX_CACHE_VERSION:
                return False

            self.index.index = snapshot["index"]
            self.index.doc_lengths = snapshot["doc_lengths"]
            self.index.doc_metadata = snapshot["doc_metadata"]
            self.index.total_docs = snapshot["total_docs"]
            self.index.avg_doc_length = snapshot["avg_doc_length"]

            if snapshot.get("semantic_model_name") == self.semantic.model_name:
                self.semantic.doc_ids = snapshot["semantic_doc_ids"]
                self.semantic.doc_matrix = snapshot["semantic_doc_matrix"]

            return self.index.total_docs > 0
        except Exception as e:
            print(f"[SearchEngine] Không thể nạp index_cache.pkl ({e}). Sẽ dựng lại từ đầu...")
            return False

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
            # Toàn văn (đã bỏ HTML) dùng để sinh snippet query-biased; fallback về summary nếu rỗng.
            "plain_text": content or summary,
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
        # 1. Thử tải dữ liệu từ Backend API (phân trang để lấy toàn bộ tài liệu,
        # vì backend giới hạn tối đa 200 bản ghi mỗi trang)
        try:
            page = 1
            page_size = 200
            total_indexed = 0
            first_resp = requests.get(f"{BACKEND_API_URL}/documents?limit={page_size}&page={page}", timeout=5)
            if first_resp.status_code != 200:
                raise RuntimeError(f"Backend trả về mã lỗi {first_resp.status_code}")

            resp = first_resp
            while True:
                data = resp.json()
                docs = data.get("data", {}).get("documents", [])
                for d in docs:
                    self.index_document(d)
                total_indexed += len(docs)

                total_pages = data.get("data", {}).get("pagination", {}).get("totalPages", 1)
                if page >= total_pages or not docs:
                    break
                page += 1
                resp = requests.get(f"{BACKEND_API_URL}/documents?limit={page_size}&page={page}", timeout=5)
                if resp.status_code != 200:
                    break

            # Backend phản hồi thành công (ngay cả khi rỗng) -> không fallback sang dữ liệu mẫu
            self.semantic.build_index(self._pending_embed_texts)
            self.save_index()
            return total_indexed
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
                    self.save_index()
                    print(f"✅ [SearchEngine] Đã nạp thành công {len(local_docs)} bài viết từ kho dữ liệu mẫu nội bộ.")
                    return len(local_docs)
        except Exception as err:
            print(f"[SearchEngine] Lỗi nạp dữ liệu mẫu nội bộ: {err}")

        return 0

    # Khoảng cách ký tự tối đa giữa hai từ khóa để được coi là cùng một "cluster"
    # ý nghĩa (significance cluster) — theo thuật toán Luhn (1958) cho tóm tắt
    # trích xuất: những cụm chứa nhiều từ khóa truy vấn nằm gần nhau mang điểm cao hơn.
    SNIPPET_CLUSTER_GAP_CHARS = 40

    @staticmethod
    def _split_sentences(text: str) -> List[str]:
        import re
        text = (text or "").strip()
        if not text:
            return []
        parts = re.split(r"(?<=[.!?…])\s+", text)
        return [p.strip() for p in parts if p.strip()]

    def _find_term_spans(self, sentence: str, query_tokens: List[str]) -> List[tuple]:
        """Tìm toạ độ (start, end) của mọi lần xuất hiện các từ khóa truy vấn trong câu."""
        sentence_lower = sentence.lower()
        spans = []
        seen_terms = set()
        for tok in query_tokens:
            raw_term = tok.replace("_", " ").strip()
            if not raw_term or raw_term in seen_terms:
                continue
            seen_terms.add(raw_term)
            start = 0
            while True:
                idx = sentence_lower.find(raw_term, start)
                if idx == -1:
                    break
                spans.append((idx, idx + len(raw_term)))
                start = idx + len(raw_term)
        spans.sort()
        return spans

    def _score_sentence(self, sentence: str, query_tokens: List[str]):
        """Chấm điểm câu theo nguyên lý Luhn: gom các từ khóa gần nhau thành
        cluster, điểm cluster = (số từ khóa)^2 / độ dài cluster. Trả về
        (điểm cao nhất, cluster tương ứng) để khoanh vùng cửa sổ trích đoạn."""
        spans = self._find_term_spans(sentence, query_tokens)
        if not spans:
            return 0.0, []

        clusters = [[spans[0]]]
        for span in spans[1:]:
            if span[0] - clusters[-1][-1][1] <= self.SNIPPET_CLUSTER_GAP_CHARS:
                clusters[-1].append(span)
            else:
                clusters.append([span])

        best_score, best_cluster = 0.0, clusters[0]
        for cluster in clusters:
            count = len(cluster)
            span_len = cluster[-1][1] - cluster[0][0]
            score = (count ** 2) / span_len if span_len > 0 else float(count)
            if score > best_score:
                best_score, best_cluster = score, cluster
        return best_score, best_cluster

    def generate_snippet(self, doc_id: int, query_tokens: List[str], max_chars: int = 220) -> Dict[str, Any]:
        """Sinh trích đoạn (snippet) query-biased: chọn câu có cụm từ khóa ý nghĩa
        nhất (thuật toán chấm điểm kiểu Luhn), rồi khoanh vùng cửa sổ max_chars
        ký tự quanh cụm đó. Trả về text + danh sách từ khóa khớp để frontend
        highlight an toàn (không chèn HTML thô)."""
        meta = self.index.doc_metadata.get(doc_id, {})
        source_text = meta.get("plain_text") or meta.get("summary") or meta.get("title") or ""

        if not source_text:
            return {"text": "", "matched_terms": []}

        if not query_tokens:
            text = source_text[:max_chars]
            return {"text": text + ("..." if len(source_text) > max_chars else ""), "matched_terms": []}

        sentences = self._split_sentences(source_text) or [source_text]

        best_score, best_sentence, best_cluster = -1.0, sentences[0], []
        for sentence in sentences:
            score, cluster = self._score_sentence(sentence, query_tokens)
            if score > best_score:
                best_score, best_sentence, best_cluster = score, sentence, cluster

        if best_score <= 0:
            text = best_sentence[:max_chars]
            return {"text": text + ("..." if len(best_sentence) > max_chars else ""), "matched_terms": []}

        cluster_start, cluster_end = best_cluster[0][0], best_cluster[-1][1]
        mid = (cluster_start + cluster_end) // 2
        start = max(0, mid - max_chars // 2)
        end = min(len(best_sentence), start + max_chars)
        start = max(0, end - max_chars)

        snippet_text = best_sentence[start:end].strip()
        if start > 0:
            snippet_text = "..." + snippet_text
        if end < len(best_sentence):
            snippet_text = snippet_text + "..."

        matched_terms = []
        seen = set()
        for tok in query_tokens:
            raw_term = tok.replace("_", " ").strip()
            if raw_term and raw_term not in seen and raw_term in best_sentence.lower():
                seen.add(raw_term)
                matched_terms.append(raw_term)

        return {"text": snippet_text, "matched_terms": matched_terms}

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
            snippet_data = self.generate_snippet(doc_id, query_tokens)
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
                "snippet": snippet_data["text"],
                "matched_terms": snippet_data["matched_terms"],
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
