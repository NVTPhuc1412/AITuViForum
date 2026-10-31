from dataclasses import dataclass, field
from typing import Dict, List, Any
import math

@dataclass
class Posting:
    term_frequency: int = 0
    positions: List[int] = field(default_factory=list)

class InvertedIndex:
    def __init__(self):
        # term -> { doc_id: Posting }
        self.index: Dict[str, Dict[int, Posting]] = {}
        # doc_id -> total token count
        self.doc_lengths: Dict[int, int] = {}
        # doc_id -> metadata (title, summary, tags, category, views, etc.)
        self.doc_metadata: Dict[int, Dict[str, Any]] = {}
        self.total_docs: int = 0
        self.avg_doc_length: float = 0.0

    def clear(self):
        self.index.clear()
        self.doc_lengths.clear()
        self.doc_metadata.clear()
        self.total_docs = 0
        self.avg_doc_length = 0.0

    def add_document(self, doc_id: int, tokens_with_pos: List[tuple], metadata: Dict[str, Any]):
        """Thêm một tài liệu vào Inverted Index."""
        doc_len = len(tokens_with_pos)
        self.doc_lengths[doc_id] = doc_len
        self.doc_metadata[doc_id] = metadata

        # Track term frequencies and positions
        term_map: Dict[str, List[int]] = {}
        for token, pos in tokens_with_pos:
            if token not in term_map:
                term_map[token] = []
            term_map[token].append(pos)

        for term, positions in term_map.items():
            if term not in self.index:
                self.index[term] = {}
            self.index[term][doc_id] = Posting(
                term_frequency=len(positions),
                positions=positions
            )

        self.total_docs = len(self.doc_lengths)
        if self.total_docs > 0:
            self.avg_doc_length = sum(self.doc_lengths.values()) / self.total_docs

    def get_document_frequency(self, term: str) -> int:
        """Số lượng tài liệu chứa từ khóa này (Document Frequency - df)."""
        if term in self.index:
            return len(self.index[term])
        return 0

    def get_postings(self, term: str) -> Dict[int, Posting]:
        """Lấy danh sách posting của một term."""
        return self.index.get(term, {})
