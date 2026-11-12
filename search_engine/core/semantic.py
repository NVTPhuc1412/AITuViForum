import os
from typing import Dict, List, Optional, Tuple

import numpy as np

# Multilingual MiniLM: small (~470MB), supports Vietnamese reasonably well,
# downloaded once from the HuggingFace Hub and cached locally afterwards.
DEFAULT_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "paraphrase-multilingual-MiniLM-L12-v2")


class SemanticEmbedder:
    """Sinh vector embedding ngữ nghĩa và tính Cosine Similarity (Dense Retrieval)."""

    def __init__(self, model_name: str = DEFAULT_MODEL_NAME):
        self.model_name = model_name
        self._model = None
        self.doc_ids: List[int] = []
        self.doc_matrix: Optional[np.ndarray] = None  # (num_docs, dim), đã L2-normalize

    def _load_model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            print(f"[SemanticEmbedder] Đang nạp mô hình embedding '{self.model_name}' "
                  f"(lần đầu tiên sẽ tải từ HuggingFace Hub, cần kết nối internet)...")
            self._model = SentenceTransformer(self.model_name)
            print("[SemanticEmbedder] Đã nạp xong mô hình embedding.")
        return self._model

    def encode(self, texts: List[str]) -> np.ndarray:
        model = self._load_model()
        return model.encode(
            texts,
            normalize_embeddings=True,  # L2-normalize -> dot product = cosine similarity
            convert_to_numpy=True,
            show_progress_bar=False,
        )

    def clear(self):
        self.doc_ids = []
        self.doc_matrix = None

    def build_index(self, doc_texts: Dict[int, str]):
        """doc_texts: doc_id -> văn bản đại diện (title + summary) cần nhúng vector."""
        self.doc_ids = list(doc_texts.keys())
        if not self.doc_ids:
            self.doc_matrix = None
            return
        texts = [doc_texts[d] or "" for d in self.doc_ids]
        self.doc_matrix = self.encode(texts)

    def is_ready(self) -> bool:
        return self.doc_matrix is not None and len(self.doc_ids) > 0

    def score(self, query: str) -> List[Tuple[int, float]]:
        """Trả về [(doc_id, cosine_similarity)] sắp xếp giảm dần theo độ tương đồng ngữ nghĩa."""
        if not self.is_ready() or not query or not query.strip():
            return []
        query_vec = self.encode([query])[0]
        sims = self.doc_matrix @ query_vec  # cosine similarity (cả 2 vế đều đã normalize)
        order = np.argsort(-sims)
        return [(self.doc_ids[i], float(sims[i])) for i in order]
