import os
import requests
from typing import List, Dict, Any, Optional
from .tokenizer import VietnameseTokenizer
from .inverted_index import InvertedIndex
from .bm25 import BM25Scorer, TFIDFScorer

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000/api")

class SearchEngine:
    def __init__(self):
        self.tokenizer = VietnameseTokenizer(filter_stopwords=True)
        self.index = InvertedIndex()
        self.bm25_scorer = BM25Scorer(self.index)
        self.tfidf_scorer = TFIDFScorer(self.index)

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

    def rebuild_index_from_backend(self) -> int:
        """Fetch all documents from backend API and rebuild Inverted Index."""
        self.index.clear()
        try:
            url = f"{BACKEND_API_URL}/documents?limit=100"
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                docs = data.get("data", {}).get("documents", [])
                for d in docs:
                    self.index_document(d)
                return len(docs)
        except Exception as e:
            print(f"[SearchEngine] Lỗi đồng bộ tài liệu từ Backend: {e}")
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

    def search(self, query: str, mode: str = "bm25", limit: int = 10) -> Dict[str, Any]:
        """Thực hiện tìm kiếm với thuật toán xếp hạng BM25 hoặc TF-IDF."""
        query_tokens = self.tokenizer.tokenize(query)
        if not query_tokens:
            return {
                "query": query,
                "tokens": [],
                "mode": mode,
                "total_results": 0,
                "results": [],
            }

        if mode.lower() == "tfidf":
            scored_docs = self.tfidf_scorer.score(query_tokens)
        else:
            scored_docs = self.bm25_scorer.score(query_tokens)

        total_results = len(scored_docs)
        top_docs = scored_docs[:limit]

        results = []
        for doc_id, score in top_docs:
            meta = self.index.doc_metadata.get(doc_id, {})
            snippet = self.generate_snippet(meta.get("summary", ""), query_tokens)
            results.append({
                "id": doc_id,
                "score": round(score, 4),
                "title": meta.get("title"),
                "summary": meta.get("summary"),
                "snippet": snippet,
                "category_name": meta.get("category_name"),
                "tags": meta.get("tags", []),
                "views_count": meta.get("views_count", 0),
                "likes_count": meta.get("likes_count", 0),
                "author_name": meta.get("author_name"),
                "created_at": meta.get("created_at"),
            })

        return {
            "query": query,
            "tokens": query_tokens,
            "mode": mode,
            "total_results": total_results,
            "results": results,
        }
