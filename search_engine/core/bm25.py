import math
from typing import Dict, List, Tuple
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
