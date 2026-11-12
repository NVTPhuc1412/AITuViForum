import sys
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.engine import SearchEngine

engine = SearchEngine()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: dùng lại Inverted Index + Semantic Embedding đã lưu từ lần dựng trước
    # (nếu có) để khởi động nhanh, tránh gọi lại backend / tính lại embedding mỗi lần restart.
    # Chỉ dựng lại từ đầu khi chưa có cache, hoặc khi người dùng bấm "Rebuild Index".
    print("🚀 [Python Search Engine] Đang khởi động...")
    if engine.load_index():
        print(f"✅ [Python Search Engine] Đã nạp lại index đã lưu cho {engine.index.total_docs} bài viết.")
    else:
        print("ℹ️ [Python Search Engine] Chưa có index đã lưu, đang dựng mới từ backend...")
        count = engine.rebuild_index_from_backend()
        print(f"✅ [Python Search Engine] Đã lập chỉ mục cho {count} bài viết ban đầu.")
    yield
    print("👋 [Python Search Engine] Đang dừng dịch vụ.")

app = FastAPI(
    title="AstroAI Python Search Engine",
    description="Search Engine service with Inverted Index, Vietnamese Tokenization, BM25 / TF-IDF Ranking & Semantic Embedding (Sentence-Transformers)",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "AstroAI Python Search Engine",
        "indexed_documents": engine.index.total_docs,
        "vocabulary_size": len(engine.index.index),
        "average_doc_length": round(engine.index.avg_doc_length, 2),
        "semantic_ready": engine.semantic.is_ready(),
        "semantic_model": engine.semantic.model_name,
        "semantic_indexed_docs": len(engine.semantic.doc_ids),
    }

@app.post("/index/rebuild")
def rebuild_index():
    count = engine.rebuild_index_from_backend()
    return {
        "success": True,
        "message": f"Đã xây dựng lại Inverted Index thành công cho {count} tài liệu.",
        "indexed_documents": engine.index.total_docs,
        "vocabulary_size": len(engine.index.index),
    }

@app.get("/search")
def search_documents(
    q: str = Query(..., description="Từ khóa tìm kiếm"),
    mode: str = Query("hybrid", description="Thuật toán xếp hạng (hybrid, bm25, tfidf, hoặc semantic)"),
    limit: int = Query(15, ge=1, le=50, description="Số lượng kết quả tối đa"),
    alpha: float = Query(0.65, ge=0.0, le=1.0, description="Trọng số alpha của BM25 trong thành phần lexical (BM25 vs TF-IDF)"),
    beta: float = Query(0.35, ge=0.0, le=1.0, description="Trọng số beta của Semantic Embedding so với lexical trong Hybrid"),
):
    results = engine.search(query=q, mode=mode, limit=limit, alpha=alpha, beta=beta)
    return {
        "success": True,
        "data": results,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
