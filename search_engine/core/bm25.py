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


def _min_max_normalizer(values: List[float]):
    """Trả về hàm chuẩn hóa Min-Max cho một tập điểm số, dùng để cộng hợp công bằng."""
    if not values:
        return lambda v: 0.0
    lo, hi = min(values), max(values)
    rng = (hi - lo) if (hi - lo) > 0 else 0.0

    def normalize(v: float) -> float:
        if rng > 0:
            return (v - lo) / rng
        return 1.0 if v > 0 else 0.0

    return normalize


class HybridScorer:
    """Thuật toán xếp hạng lai (Hybrid Ranking) kết hợp BM25, TF-IDF (lexical) và Semantic Embedding (dense)."""
    def __init__(self, bm25_scorer: BM25Scorer, tfidf_scorer: TFIDFScorer, alpha: float = 0.65, beta: float = 0.35):
        self.bm25_scorer = bm25_scorer
        self.tfidf_scorer = tfidf_scorer
        self.alpha = alpha  # trọng số BM25 so với TF-IDF trong thành phần lexical
        self.beta = beta    # trọng số của điểm ngữ nghĩa (semantic) so với thành phần lexical

    def score(
        self,
        query_tokens: List[str],
        alpha: Optional[float] = None,
        semantic_scores: Optional[List[Tuple[int, float]]] = None,
        beta: Optional[float] = None,
    ) -> List[Tuple[int, float, float, float, float]]:
        """
        Tính điểm kết hợp chuẩn hóa Min-Max:
        1. lexical = alpha*BM25_norm + (1-alpha)*TFIDF_norm
        2. hybrid  = beta*Semantic_norm + (1-beta)*lexical   (nếu có điểm ngữ nghĩa)
        returns list of (doc_id, hybrid_score, bm25_score, tfidf_score, semantic_score)

        Semantic Embedding có thể tìm thấy tài liệu không hề trùng từ khóa (BM25/TF-IDF = 0)
        nhưng tương đồng về ý nghĩa, nên tập doc_id đầu ra là hợp của cả 3 nguồn.
        """
        w = alpha if alpha is not None else self.alpha
        wb = beta if beta is not None else self.beta

        bm25_dict = dict(self.bm25_scorer.score(query_tokens))
        tfidf_dict = dict(self.tfidf_scorer.score(query_tokens))
        semantic_dict = dict(semantic_scores) if semantic_scores else {}

        all_doc_ids = set(bm25_dict.keys()) | set(tfidf_dict.keys()) | set(semantic_dict.keys())
        if not all_doc_ids:
            return []

        norm_b = _min_max_normalizer(list(bm25_dict.values()))
        norm_t = _min_max_normalizer(list(tfidf_dict.values()))
        norm_s = _min_max_normalizer(list(semantic_dict.values())) if semantic_dict else None

        hybrid_scores = []
        for doc_id in all_doc_ids:
            raw_b = bm25_dict.get(doc_id, 0.0)
            raw_t = tfidf_dict.get(doc_id, 0.0)
            raw_s = semantic_dict.get(doc_id, 0.0)

            lexical = w * norm_b(raw_b) + (1.0 - w) * norm_t(raw_t)
            combined = (wb * norm_s(raw_s) + (1.0 - wb) * lexical) if norm_s else lexical

            # Điểm Hybrid thang điểm 0 - 10
            hybrid = combined * 10.0
            hybrid_scores.append((
                doc_id, round(hybrid, 4), round(raw_b, 4), round(raw_t, 4), round(raw_s, 4)
            ))

        # Sắp xếp giảm dần theo điểm Hybrid
        hybrid_scores.sort(key=lambda x: x[1], reverse=True)
        return hybrid_scores
