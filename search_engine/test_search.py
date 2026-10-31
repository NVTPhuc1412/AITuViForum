import sys
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
from core.tokenizer import VietnameseTokenizer
from core.inverted_index import InvertedIndex
from core.bm25 import BM25Scorer, TFIDFScorer

def test_search_engine_logic():
    print("🔬 [Test 1] Kiểm tra Vietnamese Tokenizer & Compound words...")
    tokenizer = VietnameseTokenizer()
    text = "Ứng dụng Claude 3.5 Sonnet prompt luận giải Cung Mệnh và các sao Tử Vi, Hóa Lộc tại cung Tài Bạch."
    tokens = tokenizer.tokenize(text)
    print("Tokens thu được:", tokens)
    assert "cung_mệnh" in tokens, "Lỗi: Không nhận diện được từ ghép 'cung_mệnh'"
    assert "tử_vi" in tokens, "Lỗi: Không nhận diện được từ ghép 'tử_vi'"
    assert "hóa_lộc" in tokens, "Lỗi: Không nhận diện được từ ghép 'hóa_lộc'"
    assert "và" not in tokens, "Lỗi: Stopword 'và' chưa được lọc"
    print("✅ Tokenizer hoạt động hoàn hảo!")

    print("\n🔬 [Test 2] Kiểm tra Inverted Index & BM25 Scoring...")
    index = InvertedIndex()
    docs = [
        (1, "Master System Prompt Claude 3.5 Sonnet luận giải Cung Mệnh", "Hướng dẫn prompt chuyên sâu cung mệnh."),
        (2, "Xử lý sao Triệt Không và Tuần Không bằng học máy Dropout", "Tuần và Triệt đóng vai trò rào chắn giảm năng lượng chính tinh."),
        (3, "Phân tích cung Tài Bạch có Hóa Lộc ngộ Địa Không", "Thế kẹt giữa cơ hội làm giàu nhanh và nguy cơ rủi ro trắng tay."),
    ]

    for doc_id, title, content in docs:
        tokens_with_pos = tokenizer.tokenize_with_positions(f"{title}. {content}")
        index.add_document(doc_id, tokens_with_pos, {"id": doc_id, "title": title, "summary": content})

    assert index.total_docs == 3
    print(f"Index chứa {index.total_docs} docs, Vocabulary: {len(index.index)} terms.")

    bm25 = BM25Scorer(index)
    query = "prompt cung mệnh"
    q_tokens = tokenizer.tokenize(query)
    scores = bm25.score(q_tokens)
    print(f"Kết quả BM25 cho query '{query}':", scores)

    assert len(scores) > 0, "Không tìm thấy kết quả"
    assert scores[0][0] == 1, f"Doc 1 phải đứng đầu nhưng lại là Doc {scores[0][0]}"
    print("✅ BM25 Scorer xếp hạng chính xác Doc 1 ở vị trí số 1!")

    tfidf = TFIDFScorer(index)
    tfidf_scores = tfidf.score(q_tokens)
    print(f"Kết quả TF-IDF cho query '{query}':", tfidf_scores)
    assert tfidf_scores[0][0] == 1
    print("✅ TF-IDF Scorer cũng xếp hạng chính xác!")

    print("\n🎉 Toàn bộ bài test thuật toán Search Engine bằng Python đã PASS 100%!")

if __name__ == "__main__":
    test_search_engine_logic()
