import math
from typing import Dict, List, Tuple, Optional
from .inverted_index import InvertedIndex

class BM25Scorer:
    """Thuật toán xếp hạng Okapi BM25 chuẩn."""
    def __init__(self, index: InvertedIndex, k1: float = 1.5, b: float = 0.75):
        self.index = index
        self.k1 = k1
        self.b = b

    def compute_idf(self, term: str) -> float:
        """Tính Inverse Document Frequency (IDF) theo chuẩn BM25."""
        N = self.index.total_docs
        df = self.index.get_document_frequency(term)
        if df == 0 or N == 0:
            return 0.0
        # BM25 probabilistic IDF formula: ln((N - df + 0.5) / (df + 0.5) + 1)
        return math.log(((N - df + 0.5) / (df + 0.5)) + 1.0)

    def score(self, query_tokens: List[str]) -> List[Tuple[int, float]]:
        """Tính điểm BM25 cho tất cả tài liệu khớp với câu truy vấn."""
        scores: Dict[int, float] = {}
        avgdl = self.index.avg_doc_length or 1.0

        for term in query_tokens:
            postings = self.index.get_postings(term)
            if not postings:
                continue

            idf = self.compute_idf(term)
            for doc_id, posting in postings.items():
                tf = posting.term_frequency
                doc_len = self.index.doc_lengths.get(doc_id, 1)

                # BM25 TF weight
                numerator = tf * (self.k1 + 1.0)
                denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / avgdl))
                term_score = idf * (numerator / denominator)

                scores[doc_id] = scores.get(doc_id, 0.0) + term_score

        # Sắp xếp giảm dần theo điểm số
        sorted_results = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        return sorted_results

    def score_term_for_doc(self, term: str, doc_id: int) -> float:
        """Tính điểm BM25 của 1 term trong 1 doc cụ thể."""
        postings = self.index.get_postings(term)
        if not postings or doc_id not in postings:
            return 0.0
        idf = self.compute_idf(term)
        posting = postings[doc_id]
        tf = posting.term_frequency
        doc_len = self.index.doc_lengths.get(doc_id, 1)
        avgdl = self.index.avg_doc_length or 1.0
        numerator = tf * (self.k1 + 1.0)
        denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / avgdl))
        return idf * (numerator / denominator)


class TFIDFScorer:
    """Thuật toán xếp hạng TF-IDF chuẩn (Log-scaled TF x IDF)."""
    def __init__(self, index: InvertedIndex):
        self.index = index

    def compute_idf(self, term: str) -> float:
        N = self.index.total_docs
        df = self.index.get_document_frequency(term)
        if df == 0 or N == 0:
            return 0.0
        return math.log((N + 1.0) / (df + 1.0)) + 1.0

    def score(self, query_tokens: List[str]) -> List[Tuple[int, float]]:
        scores: Dict[int, float] = {}

        for term in query_tokens:
            postings = self.index.get_postings(term)
            if not postings:
                continue

            idf = self.compute_idf(term)
            for doc_id, posting in postings.items():
                # Sublinear term frequency scaling: 1 + ln(tf)
                tf_weight = 1.0 + math.log(posting.term_frequency)
                term_score = tf_weight * idf

                scores[doc_id] = scores.get(doc_id, 0.0) + term_score

        sorted_results = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        return sorted_results

    def score_term_for_doc(self, term: str, doc_id: int) -> float:
        """Tính điểm TF-IDF của 1 term trong 1 doc cụ thể."""
        postings = self.index.get_postings(term)
        if not postings or doc_id not in postings:
            return 0.0
        idf = self.compute_idf(term)
        posting = postings[doc_id]
        tf_weight = 1.0 + math.log(posting.term_frequency)
        return tf_weight * idf


class HybridScorer:
    """Thuật toán xếp hạng lai (Hybrid Ranking) kết hợp BM25 và TF-IDF."""
    def __init__(self, bm25_scorer: BM25Scorer, tfidf_scorer: TFIDFScorer, alpha: float = 0.65):
        self.bm25_scorer = bm25_scorer
        self.tfidf_scorer = tfidf_scorer
        self.alpha = alpha

    def score(self, query_tokens: List[str], alpha: Optional[float] = None) -> List[Tuple[int, float, float, float]]:
        """
        Tính điểm kết hợp chuẩn hóa:
        returns list of (doc_id, hybrid_score, bm25_score, tfidf_score)
        với điểm số được chuẩn hóa Min-Max để cộng hợp công bằng.
        """
        w = alpha if alpha is not None else self.alpha
        bm25_list = self.bm25_scorer.score(query_tokens)
        tfidf_list = self.tfidf_scorer.score(query_tokens)

        bm25_dict = dict(bm25_list)
        tfidf_dict = dict(tfidf_list)

        all_doc_ids = set(bm25_dict.keys()) | set(tfidf_dict.keys())
        if not all_doc_ids:
            return []

        # Chuẩn hóa Min-Max cho BM25
        bm25_vals = list(bm25_dict.values())
        min_b = min(bm25_vals) if bm25_vals else 0.0
        max_b = max(bm25_vals) if bm25_vals else 0.0
        range_b = (max_b - min_b) if (max_b - min_b) > 0 else 0.0

        # Chuẩn hóa Min-Max cho TF-IDF
        tfidf_vals = list(tfidf_dict.values())
        min_t = min(tfidf_vals) if tfidf_vals else 0.0
        max_t = max(tfidf_vals) if tfidf_vals else 0.0
        range_t = (max_t - min_t) if (max_t - min_t) > 0 else 0.0

        hybrid_scores = []
        for doc_id in all_doc_ids:
            raw_b = bm25_dict.get(doc_id, 0.0)
            raw_t = tfidf_dict.get(doc_id, 0.0)

            norm_b = (raw_b - min_b) / range_b if range_b > 0 else (1.0 if raw_b > 0 else 0.0)
            norm_t = (raw_t - min_t) / range_t if range_t > 0 else (1.0 if raw_t > 0 else 0.0)

            # Điểm Hybrid thang điểm 0 - 10
            hybrid = (w * norm_b + (1.0 - w) * norm_t) * 10.0
            hybrid_scores.append((doc_id, round(hybrid, 4), round(raw_b, 4), round(raw_t, 4)))

        # Sắp xếp giảm dần theo điểm Hybrid
        hybrid_scores.sort(key=lambda x: x[1], reverse=True)
        return hybrid_scores
