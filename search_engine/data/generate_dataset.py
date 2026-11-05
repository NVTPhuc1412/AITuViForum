# -*- coding: utf-8 -*-
import sys
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
import json
import os

categories = [
    {"id": 1, "name": "AI & Học thuyết Tử Vi", "slug": "ai-hoc-thuyet-tu-vi"},
    {"id": 2, "name": "Prompt Kỹ thuật & Luận 12 Cung", "slug": "prompt-ky-thuat-12-cung"},
    {"id": 3, "name": "RAG & Số hóa Thư tịch Cổ", "slug": "rag-so-hoa-thu-tich-co"},
    {"id": 4, "name": "Đối sánh Thực chứng & Case Studies", "slug": "doi-sanh-thuc-chung"},
    {"id": 5, "name": "Công nghệ Lập Lá Số & Thuật toán", "slug": "cong-nghe-lap-la-so"},
    {"id": 6, "name": "Hỏi Đáp Học Thuật & Trợ Giúp", "slug": "hoi-dap-tro-giup"},
    {"id": 7, "name": "Kiến Trúc Search Engine & AI", "slug": "kien-truc-search-engine-ai"},
]

authors = [
    {"name": "Nguyễn Văn Minh (Super Admin)", "role": "SUPER_ADMIN"},
    {"name": "Trần Thị Thu Hà (Content Manager)", "role": "CONTENT_MANAGER"},
    {"name": "Lê Hoàng Long (Moderator)", "role": "MODERATOR"},
    {"name": "Vũ Quốc Huy (SEO Specialist)", "role": "SEO_SPECIALIST"},
    {"name": "Phạm Đức Anh (Member)", "role": "USER"},
    {"name": "Hoàng Hoài Nam", "role": "USER"},
    {"name": "Đặng Thùy Dung", "role": "USER"},
    {"name": "Bùi Quang Huy", "role": "USER"},
    {"name": "Lý Gia Hân", "role": "USER"},
    {"name": "Hoàng Kim Oanh", "role": "USER"},
]

raw_articles = [
    # 1. AI & Học thuyết Tử Vi
    (
        "Ma trận tương quan 14 Chính Tinh: Tiếp cận từ mô hình Vector Embedding đa chiều",
        1,
        ["Embedding", "14 Chính Tinh", "Machine Learning", "Vector Space"],
        "Biểu diễn 14 chính tinh (Tử Vi, Thiên Phủ, Vũ Khúc, Thiên Đồng...) thành các vector 128 chiều để đo lường tính chất tương hỗ và triệt tiêu trong cách cục.",
        "Trong Tử Vi Đẩu Số truyền thống, mối quan hệ giữa các sao như Tử Vi, Thiên Phủ, Thất Sát thường được mô tả qua phú quyết. Áp dụng kỹ thuật Word2Vec hoặc Dense Embedding cho phép biểu diễn các sao thành vector đa chiều, đo lường độ tương đồng ngữ nghĩa và xung chiếu khách quan."
    ),
    (
        "Ứng dụng mạng Bayes để tính xác suất các biến cố vận hạn trong chu kỳ 10 năm Đại Vận",
        1,
        ["Mạng Bayes", "Đại Vận", "Xác Suất", "Dự Báo"],
        "Mô hình hóa chu kỳ 10 năm Đại Vận bằng Directed Acyclic Graph (DAG) nhằm ước lượng xác suất thăng tiến công danh hoặc hạn tài chính.",
        "Mạng Bayes là công cụ toán học hoàn hảo để kết nối quan hệ phụ thuộc có điều kiện giữa Cung Mệnh, Thân và Lưu Đại Vận. Xây dựng bảng xác suất từ 5,000 lá số thực tế giúp định lượng xác suất sự kiện chính xác."
    ),
    (
        "So sánh cấu trúc phân tầng ngũ hành Nạp Âm với cơ chế Multi-Head Attention",
        1,
        ["Ngũ Hành", "Nạp Âm", "Attention", "Transformer"],
        "Khám phá sự tương đồng kỳ thú giữa cơ chế trọng số chú ý trong kiến trúc Transformer và nguyên lý Nạp Âm Ngũ Hành sinh khắc.",
        "Ngũ hành Nạp Âm 60 Hoa Giáp có tính chất điều hòa và lọc tín hiệu tương tự Layer Normalization trong mạng nơ-ron Transformer hiện đại."
    ),
    (
        "Độ nhạy cảm của cung Tật Ách: Phân tích hồi quy Logistic dự đoán nguy cơ sức khỏe",
        1,
        ["Cung Tật Ách", "Hồi Quy Logistic", "Sức Khỏe", "Data Science"],
        "Kiểm nghiệm mối liên hệ giữa các bộ sao Hóa Kỵ, Kình Dương, Đà La đóng tại Tật Ách với hồ sơ y tế ẩn danh của 1,200 người.",
        "Phân tích hồi quy Logistic cho thấy sự kết hợp giữa Liêm Trinh, Thất Sát và Kình Dương tại cung Tật Ách có ý nghĩa thống kê cao đối với nguy cơ phẫu thuật chỉnh hình."
    ),
    (
        "Thuật toán đồ thị tri thức (Knowledge Graph) biểu diễn quan hệ Tam Hợp và Nhị Hợp",
        1,
        ["Knowledge Graph", "Tam Hợp", "Nhị Hợp", "Graph Database"],
        "Xây dựng ontology hoàn chỉnh cho 12 cung địa bàn, liên kết các cạnh có hướng đại diện cho quan hệ xung - chiếu, nhị hợp và tam hợp sinh khắc.",
        "Biểu diễn tử vi bằng đồ thị tri thức (Neo4j) cho phép truy vấn các cách cục phức tạp như Mã Đầu Đới Kiếm hay Nhật Nguyệt Tịnh Minh chỉ bằng một câu lệnh Cypher đơn giản."
    ),
    (
        "Phân cụm K-Means phát hiện các biến thể ẩn của cách cục Sát Phá Tham trong kỷ nguyên số",
        1,
        ["K-Means", "Sát Phá Tham", "Phân Cụm", "Cách Cục"],
        "Phân tích dữ liệu 3,500 người mang bộ sao Thất Sát, Phá Quân, Tham Lang để tìm ra các nhóm mẫu hình nghề nghiệp công nghệ cao hiện đại.",
        "Thuật toán K-Means phát hiện mẫu hình Sát Phá Tham hội ngộ Hóa Quyền và Hóa Lộc có tỷ lệ làm việc trong ngành khởi nghiệp công nghệ và đầu tư mạo hiểm cao gấp 3.8 lần mức trung bình."
    ),
    (
        "Đánh giá tính phi tuyến của cung Thiên Di qua mạng nơ-ron nhân tạo MLP",
        1,
        ["Cung Thiên Di", "MLP", "Phi Tuyến", "Neural Network"],
        "Xây dựng mạng nơ-ron truyền thẳng (Multi-Layer Perceptron) để dự đoán mức độ thành công khi thay đổi môi trường sống hoặc xuất ngoại.",
        "Mô hình MLP ghi nhận cung Thiên Di có tác động phi tuyến mạnh mẽ đến Cung Mệnh khi bước vào Đại Vận thứ tư, vượt trội hơn mô hình tuyến tính đơn giản."
    ),
    (
        "Thống kê tần suất xuất hiện cách cục Tử Phủ Vũ Tướng đối với giới lãnh đạo doanh nghiệp",
        1,
        ["Tử Phủ Vũ Tướng", "Thống Kê", "Lãnh Đạo", "Doanh Nhân"],
        "Khảo sát trên 800 hồ sơ CEO và nhà sáng lập tại Việt Nam để kiểm chứng tính ưu việt của cách cục đế vương.",
        "Dữ liệu thực nghiệm xác nhận tỷ lệ nắm giữ chức vụ quản lý cấp cao ở người có bộ Tử Phủ Vũ Tướng miếu vượng đạt 42.1%, cao hơn có ý nghĩa so với phân phối ngẫu nhiên."
    ),
    (
        "Ứng dụng phân tích thành phần chính (PCA) để giảm chiều dữ liệu 108 phụ tinh",
        1,
        ["PCA", "Phụ Tinh", "Giảm Chiều", "Feature Extraction"],
        "Rút gọn 108 phụ tinh thành 8 chiều đặc trưng cốt lõi (Tài lộc, Quyền lực, Khoa cử, Sát khí, Đào hoa, Hình thương, Cô độc, Tâm linh).",
        "Kỹ thuật PCA giúp giải thích 83.5% phương sai dữ liệu lá số chỉ với 8 thành phần chính, tăng tốc độ xử lý của mô hình học máy lên 12 lần."
    ),
    (
        "Mô hình chuỗi thời gian ARIMA dự báo nhịp độ biến động năng lượng sao Lưu Thái Tuế",
        1,
        ["ARIMA", "Lưu Thái Tuế", "Time Series", "Dự Báo"],
        "Kết hợp mô hình tự hồi quy tích hợp trung bình trượt (ARIMA) với quy luật chu kỳ 12 năm của Thái Tuế để phân tích chu kỳ hưng suy.",
        "Nghiên cứu chỉ ra tính chu kỳ 12 năm của Lưu Thái Tuế có sự đồng pha rõ nét với chu kỳ kinh tế vĩ mô và chu kỳ đổi mới công nghệ."
    ),
    (
        "Học tăng cường (Reinforcement Learning) tìm kiếm chiến lược hành động tối ưu theo đại vận",
        1,
        ["Reinforcement Learning", "Chiến Lược", "Q-Learning", "Tối Ưu Hóa"],
        "Định nghĩa bài toán đưa ra quyết định sự nghiệp theo từng năm hạn như một Markov Decision Process (MDP).",
        "Mô hình Q-Learning đề xuất chiến lược tích lũy tri thức khi gặp hạn Triệt Không và mở rộng kinh doanh khi gặp hạn Hóa Lộc, đạt phần thưởng dài hạn tối ưu."
    ),
    (
        "Phân tích entropy thông tin đo lường mức độ hỗn loạn của các lá số Vô Chính Diệu",
        1,
        ["Vô Chính Diệu", "Entropy", "Lý Thuyết Thông Tin", "Hỗn Loạn"],
        "Sử dụng công thức Shannon Entropy để định lượng độ bất định trong tính cách và cuộc đời của người có Cung Mệnh không có chính tinh.",
        "Lá số Vô Chính Diệu có chỉ số entropy thông tin cao hơn 34% so với lá số có chính tinh đơn thủ, giải thích tính cách dễ thích nghi nhưng thiếu lập trường kiên định."
    ),
    (
        "Kiểm định giả thuyết thống kê A/B Testing về hiệu ứng của Tuần Không và Triệt Không",
        1,
        ["A/B Testing", "Tuần Triệt", "Kiểm Định Thống Kê", "P-Value"],
        "Thiết lập thử nghiệm đối chứng trên 2 nhóm mẫu có cùng ngày sinh nhưng khác giờ sinh để cô lập tác động của cặp sao không vong.",
        "Kết quả kiểm định A/B với p-value < 0.05 khẳng định Triệt Không làm giảm 60% năng lượng kích hoạt của các sao tài tinh trong nửa đầu cuộc đời."
    ),
    (
        "Giải mã Cung Nô Bộc: Mô hình đồ thị mạng xã hội (Social Network Analysis) trong Tử Vi",
        1,
        ["Cung Nô Bộc", "SNA", "Mạng Xã Hội", "Đồ Thị"],
        "Ứng dụng độ đo trung tâm (Betweenness Centrality) để đánh giá mạng lưới bạn bè và cộng sự thông qua các sao tại cung Nô Bộc.",
        "Nghiên cứu cho thấy người có Hóa Lộc hoặc Tả Phù Hữu Bật tại cung Nô Bộc sở hữu mạng lưới quan hệ rộng mở và có hệ số lan truyền thông tin cao."
    ),
    (
        "Học sâu (Deep Learning) tự động nhận diện hoa văn cách cục từ ma trận địa bàn 12 cung",
        1,
        ["Deep Learning", "CNN", "Nhận Diện Cách Cục", "Hình Ảnh"],
        "Chuyển đổi lá số 12 cung thành dạng tensor 2D và sử dụng mạng tích chập (CNN) để phân loại các thế cờ tử vi kinh điển.",
        "Mô hình CNN đạt độ chính xác 96.8% trong việc phát hiện các cách cục như Thạch Trung Ẩn Ngọc, Cự Nhật Đồng Cung và Sát Phá Lang."
    ),

    # 2. Prompt Kỹ thuật & Luận 12 Cung
    (
        "Master System Prompt Claude 3.5 Sonnet luận giải Cung Mệnh: Kỹ thuật Role-Playing chuẩn",
        2,
        ["Claude 3.5", "Prompt Engineering", "Cung Mệnh", "System Prompt"],
        "Mẫu Prompt hệ thống hoàn chỉnh giúp mô hình ngôn ngữ lớn nhập vai đại sư phụ Tử Vi, phân tích chuyên sâu Cung Mệnh kết hợp ngũ hành nạp âm.",
        "Để LLM không bị ảo giác sinh sao bậy bạ, cần thiết lập quy tắc Role-playing nghiêm ngặt: 'Bạn là chuyên gia số hóa Tử Vi Đẩu Số Toàn Thư. Khi nhận tọa độ Cung Mệnh, bắt buộc phân tích theo tam hợp Mệnh Tài Quan trước khi xét xung chiếu.' Kỹ thuật này nâng độ chính xác của phản hồi lên trên 92%."
    ),
    (
        "Kỹ thuật Chain-of-Thought (CoT) 5 bước luận giải hạn tài chính tại Cung Tài Bạch",
        2,
        ["Chain of Thought", "Cung Tài Bạch", "Tài Chính", "Prompt"],
        "Chia nhỏ quy trình luận đoán tiền bạc thành 5 bước suy luận logic tuần tự giúp ChatGPT và Gemini đưa ra lời khuyên đầu tư chuẩn xác.",
        "Thay vì yêu cầu AI đưa ra kết luận ngay, chuỗi suy luận CoT hướng dẫn mô hình: Bước 1: Liệt kê chính tinh cung Tài. Bước 2: Đánh giá độ miếu hãm. Bước 3: Tìm kiếm Tứ Hóa can năm. Bước 4: Kiểm tra sát tinh cản trở. Bước 5: Tổng hợp xác suất."
    ),
    (
        "Xử lý hiện tượng Hallucination khi LLM tự bịa ra vị trí sao trong đồ hình 12 cung",
        2,
        ["Hallucination", "LLM", "Kiểm Thực", "Chất Lượng"],
        "Phương pháp chèn JSON Schema ràng buộc chặt chẽ trong Prompt để buộc mô hình chỉ được phép luận giải trên các sao đã an thực tế.",
        "Kỹ thuật Grounding bằng Structured JSON Output giúp loại bỏ 100% tình trạng mô hình tự sáng tác ra vị trí của sao Thiên Khôi, Thiên Việt sai quy tắc can chi."
    ),
    (
        "Prompt Template so sánh mức độ hòa hợp hôn nhân giữa hai lá số qua Cung Phu Thê",
        2,
        ["Cung Phu Thê", "Hôn Nhân", "Prompt Template", "Hòa Hợp"],
        "Khuôn mẫu câu lệnh phân tích tương quan giữa hai cung phối ngẫu, phát hiện xung đột tiềm ẩn và thời điểm kết hôn lý tưởng.",
        "Prompt hướng dẫn mô hình đối chiếu chéo ngũ hành cung Mệnh của hai đương số với chính tinh tại cung Phu Thê của nhau, chỉ ra các điểm tựa cảm xúc và điểm mù giao tiếp."
    ),
    (
        "Fine-tuning Llama-3 8B chuyên biệt cho văn phong bình giải Tử Vi cổ điển phong nhã",
        2,
        ["Fine-tuning", "Llama 3", "Văn Phong", "NLP"],
        "Bộ dữ liệu 15,000 cặp câu đối đáp mẫu được chắt lọc từ các bài phú của cụ Thái Thứ Lang và cụ Thiên Đức dùng để huấn luyện mô hình mở.",
        "Sau khi fine-tune bằng phương pháp LoRA, mô hình Llama-3 tạo ra các đoạn bình giải vừa đậm chất thơ cổ văn vừa giữ vững tính logic của khoa học dữ liệu."
    ),
    (
        "Kỹ thuật Few-Shot Prompting nhận diện cách cục 'Thạch Trung Ẩn Ngọc' của sao Cự Môn",
        2,
        ["Few-Shot", "Cự Môn", "Thạch Trung Ẩn Ngọc", "Prompt"],
        "Cung cấp 3 ví dụ mẫu thực chứng giúp mô hình AI phân biệt rạch ròi giữa Cự Môn đắc cách tại Tý Ngọ và Cự Môn hãm địa gặp Hóa Kỵ.",
        "Few-Shot Prompting giúp mô hình hiểu sâu triết lý viên ngọc thô cần mài giũa, tránh đưa ra nhận định bi quan khi thấy sao Cự Môn độc thủ."
    ),
    (
        "Tối ưu hóa độ dài ngữ cảnh (Context Window) khi nạp toàn bộ dữ liệu đại vận 60 năm",
        2,
        ["Context Window", "Đại Vận", "Tối Ưu Hóa", "Bộ Nhớ"],
        "Kỹ thuật tóm tắt phân cấp (Hierarchical Summarization) giúp nén dữ liệu lá số trọn đời vào trong giới hạn 4K token mà không mất thông tin quan trọng.",
        "Phương pháp tóm tắt theo cụm 3 đại vận giúp tiết kiệm 70% chi phí gọi API đồng thời giữ được mạch logic diễn biến cuộc đời của người xem."
    ),
    (
        "Prompt đánh giá thế đứng 'Mã Đầu Đới Kiếm' (Kình Dương cư Ngọ): Hung hay Cát?",
        2,
        ["Mã Đầu Đới Kiếm", "Kình Dương", "Prompt Kỹ Thuật", "Phân Tích"],
        "Câu lệnh chuyên sâu yêu cầu AI phân tích tính hai mặt của đại sát tinh Kình Dương tại cung Ngọ đối với người tuổi Bính Mậu.",
        "Hướng dẫn mô hình phân tích điều kiện chuyển hung thành cát khi có Phượng Các, Giải Thần hoặc Thiên Giải hội chiếu giải trừ bớt tính hung bạo của sát tinh."
    ),
    (
        "Tạo sinh lời khuyên phát triển sự nghiệp cá nhân hóa dựa trên Cung Quan Lộc",
        2,
        ["Cung Quan Lộc", "Sự Nghiệp", "Personalization", "Prompt"],
        "Biến Tử Vi thành công cụ định hướng nghề nghiệp thời đại 4.0 với Prompt kết hợp khung năng lực O*NET của Bộ Lao động Hoa Kỳ.",
        "Prompt kết nối các sao Thiên Cơ, Vũ Khúc với các ngành nghề mũi nhọn như Kỹ sư AI, Chuyên gia An ninh mạng và Nhà quản trị tài chính doanh nghiệp."
    ),
    (
        "Kỹ thuật Prompt Chaining: Tách biệt khâu tính toán an sao và khâu biên soạn văn bản",
        2,
        ["Prompt Chaining", "Pipeline", "Kỹ Thuật", "Kiến Trúc"],
        "Mô hình kiến trúc 2 giai đoạn: Giai đoạn 1 dùng Code Python tính toán tọa độ chính xác, Giai đoạn 2 dùng LLM trau chuốt lời bình.",
        "Sự phân tách trách nhiệm giữa Engine tính toán và Model tạo sinh văn bản giúp hệ thống đạt độ tin cậy tuyệt đối về mặt thuật toán toán học."
    ),

    # 3. RAG & Số hóa Thư tịch Cổ
    (
        "Kiến trúc RAG đa tầng cho kho thư tịch cổ Tử Vi Đẩu Số Toàn Thư và Ma Y Thần Tướng",
        3,
        ["RAG", "Thư Tịch Cổ", "Vector Search", "ChromaDB"],
        "Xây dựng pipeline tìm kiếm ngữ nghĩa kết hợp Inverted Index và Dense Vector để tra cứu chính xác các đoạn phú cổ chữ Nôm và Hán Việt.",
        "Hệ thống RAG sử dụng mô hình embedding đa ngôn ngữ BGE-M3 kết hợp thuật toán BM25 để truy xuất tài liệu gốc từ thư tịch cổ triều nhà Tống và triều nhà Minh."
    ),
    (
        "Xử lý OCR chữ Hán Nôm cổ: Quy trình làm sạch dữ liệu và gán nhãn thực thể ngữ nghĩa",
        3,
        ["OCR", "Hán Nôm", "Data Cleaning", "NER"],
        "Quy trình số hóa các bản khắc gỗ cổ, sử dụng mô hình PaddleOCR kết hợp hiệu đính tự động bằng LLM để đạt độ chính xác 98.5%.",
        "Dữ liệu sau OCR được bóc tách thực thể tên sao, tên cung và quan hệ sinh khắc đưa vào cơ sở dữ liệu có cấu trúc phục vụ tìm kiếm."
    ),
    (
        "Đánh giá hiệu năng của các mô hình Text Embedding tiếng Việt trong việc hiểu thuật ngữ Tử Vi",
        3,
        ["Embedding Benchmark", "Vietnamese NLP", "Đánh Giá", "BGE-M3"],
        "Thử nghiệm so sánh OpenAI text-embedding-3, PhoBERT, Cohere v3 và BGE-M3 trên tập dữ liệu kiểm thử 2,000 câu phú quyết.",
        "BGE-M3 và PhoBERT cho kết quả vượt trội trong việc phân biệt các từ đồng âm dị nghĩa như Triệt Không vs Thiên Không, Hóa Lộc vs Lộc Tồn."
    ),
    (
        "Chiến lược phân mảnh tài liệu (Chunking Strategy) tối ưu cho các bài phú tứ tự, bát tự",
        3,
        ["Chunking", "Phú Quyết", "RAG Optimization", "NLP"],
        "Tại sao phương pháp phân đoạn theo độ dài cố định làm gãy ngữ cảnh của bài thơ phú cổ, và cách khắc phục bằng Semantic Chunking.",
        "Semantic Chunking theo từng câu thơ lục bát hoặc thể phú song thất lục bát giúp vector embedding lưu giữ trọn vẹn ngữ nghĩa của quy tắc luận giải."
    ),
    (
        "Hybrid Search kết hợp BM25 và Dense Vector: Công thức dung hòa trọng số alpha tối ưu",
        3,
        ["Hybrid Search", "BM25", "Dense Vector", "Alpha Tuning"],
        "Khảo sát thực nghiệm tìm giá trị alpha lý tưởng giữa tìm kiếm từ khóa chính xác và tìm kiếm ngữ nghĩa trừu tượng trong thư viện số.",
        "Thực nghiệm cho thấy alpha = 0.65 (nghiêng về BM25) mang lại điểm số NDCG@10 cao nhất khi người dùng tìm kiếm chính xác tên các bộ sao hiếm."
    ),
    (
        "Lập chỉ mục ngữ nghĩa cho tác phẩm 'Tử Vi Hàm Số' của tác giả Nguyễn Phát Lộc",
        3,
        ["Tử Vi Hàm Số", "Nguyễn Phát Lộc", "Indexing", "Sách Cổ"],
        "Số hóa và phân tích 500 trang sách kinh điển, chuyển đổi các công thức đại số hóa tử vi thành các hàm truy vấn có thể thực thi.",
        "Tác phẩm Tử Vi Hàm Số là cầu nối hoàn hảo giữa tư duy toán học hiện đại và tinh hoa phương Đông, được số hóa hoàn chỉnh trên nền tảng AstroAI."
    ),

    # 4. Đối sánh Thực chứng & Case Studies
    (
        "Phân tích lá số Steve Jobs qua lăng kính Data Science: Mệnh Phá Quân cư Tý và trực giác",
        4,
        ["Steve Jobs", "Case Study", "Phá Quân", "Trực Giác"],
        "Khảo cứu chi tiết lá số người sáng lập Apple: Cách cục Thất Sát triều đẩu kết hợp Hóa Quyền tạo nên tính cách duy mỹ và quyết đoán tột bậc.",
        "Steve Jobs sinh năm Ất Mùi mang bộ sao Phá Quân cư Tý miếu địa. Dữ liệu đối chiếu tiểu sử với các mốc đại vận cho thấy giai đoạn bị sa thải khỏi Apple trùng khớp với Lưu Niên gặp Kình Đà Linh Hỏa."
    ),
    (
        "Nghiên cứu đối chứng 1,000 lá số song sinh: Giải mã bài toán cùng giờ sinh khác số phận",
        4,
        ["Song Sinh", "Cùng Giờ Sinh", "Case Study", "Nghiên Cứu"],
        "Áp dụng nguyên lý phân hóa âm dương, môi trường sống và trường năng lượng tương tác để giải thích sự khác biệt nghề nghiệp của các cặp sinh đôi.",
        "Nghiên cứu khẳng định yếu tố hoàn cảnh địa lý (phong thủy) và sự lựa chọn cá nhân đóng vai trò trọng số điều biến quan trọng trên cùng một khung xác suất tử vi."
    ),
    (
        "Cách cục 'Cự Nhật Đồng Cung' của các luật sư và chính khách nổi tiếng thế giới",
        4,
        ["Cự Nhật Đồng Cung", "Luật Sư", "Chính Khách", "Thực Chứng"],
        "Phân tích mẫu hình sao Thái Dương và Cự Môn đồng cung tại Thân Dần ở những người có tài hùng biện và tư duy tranh biện xuất chúng.",
        "Bộ sao Cự Nhật khi hội ngộ Văn Xương, Hóa Khoa tạo nên những bộ óc lập pháp xuất sắc, phản ánh tài năng ngôn ngữ và khả năng thuyết phục đám đông."
    ),
    (
        "Đại vận phá sản và phục hồi: Phân tích 50 case study doanh nhân thất bại rồi làm lại",
        4,
        ["Phá Sản", "Phục Hồi", "Doanh Nhân", "Đại Vận"],
        "Mẫu số chung của các đại vận gặp Thiên Không, Hóa Kỵ ngộ Kiếp Sát và cách các nhà khởi nghiệp vượt qua cơn bĩ cực.",
        "Dữ liệu chỉ ra việc chủ động thu hẹp quy mô và chuyển sang hình thức làm việc nghiên cứu chuyên môn giúp giảm 80% thiệt hại vật chất trong năm hạn xấu."
    ),

    # 5. Công nghệ Lập Lá Số & Thuật toán
    (
        "Thuật toán an 14 chính tinh và 108 phụ tinh bằng TypeScript và Python hướng đối tượng",
        5,
        ["Thuật Toán", "TypeScript", "Python", "An Sao"],
        "Chia sẻ kiến trúc mã nguồn mở module an sao chuẩn xác theo quy tắc ngũ hành cục, can chi giờ sinh và lịch thiên văn.",
        "Module mã nguồn mở được thiết kế theo hướng đối tượng thuần túy, có độ bao phủ kiểm thử Unit Test 99.4%, hỗ trợ xử lý mượt mà năm nhuận và múi giờ quốc tế."
    ),
    (
        "Xử lý chuẩn xác múi giờ lịch sử Việt Nam (GMT+7, GMT+8, GMT+9) qua các thời kỳ",
        5,
        ["Múi Giờ", "Lịch Sử", "Thiên Văn", "Độ Chính Xác"],
        "Bảng tra cứu và thuật toán tự động bù trừ giờ sinh cho các giai đoạn áp dụng giờ mùa hè và thay đổi múi giờ hành chính tại Việt Nam từ năm 1945 đến nay.",
        "Sai lệch múi giờ lịch sử là nguyên nhân hàng đầu khiến lá số bị an sai cung giờ. Thuật toán bù trừ tự động của AstroAI loại bỏ hoàn toàn sai số tai hại này."
    ),
    (
        "Kỹ thuật tối ưu hóa chỉ mục SQL và Inverted Index cho hệ thống tìm kiếm 100,000 bài viết",
        5,
        ["PostgreSQL", "Inverted Index", "Tối Ưu Hóa", "Database"],
        "Sử dụng chỉ mục GIN kết hợp B-Tree và bộ nhớ đệm Inverted Index RAM để hạ độ trễ truy vấn từ 800ms xuống dưới 5ms.",
        "Phân tích câu lệnh EXPLAIN ANALYZE và chiến lược phân vùng bảng partition theo thời gian giúp hệ thống chịu tải hàng triệu lượt tìm kiếm mỗi ngày."
    ),

    # 6. Hỏi Đáp Học Thuật & Trợ Giúp
    (
        "Hỏi đáp: Cung Mệnh Vô Chính Diệu có Tuần Triệt án ngữ thì nên luận giải thế nào?",
        6,
        ["Hỏi Đáp", "Vô Chính Diệu", "Tuần Triệt", "Cung Mệnh"],
        "Thảo luận giải đáp thắc mắc kinh điển về câu phú 'Mệnh Vô Chính Diệu đắc Tam Không' và cách xác định độ vững của lá số.",
        "Khi cung Mệnh không có chính tinh mà gặp Tuần Không hoặc Triệt Không đóng đúng vị trí, lá số lại trở nên vững vàng như chiếc thuyền có neo giữa biển lớn."
    ),
    (
        "Hỏi đáp: Sao Hóa Khoa có thể hóa giải được hoàn toàn sát tinh Địa Không Địa Kiếp không?",
        6,
        ["Hóa Khoa", "Địa Không", "Địa Kiếp", "Hỏi Đáp"],
        "Phân tích cơ chế giải cứu của đệ nhất cứu giải Tinh Hóa Khoa khi hội ngộ cặp đại sát tinh hạng nặng trong tam hợp.",
        "Hóa Khoa mang bản chất trí tuệ và sự sáng suốt, giúp đương số nhìn nhận biến cố như bài học trưởng thành, chuyển hóa nguy cơ thành cơ hội tái sinh."
    ),
    (
        "Hỏi đáp: Làm sao để kiểm tra lá số của mình an đúng giờ sinh khi bố mẹ không nhớ rõ?",
        6,
        ["Giờ Sinh", "Xác Thực", "Hỏi Đáp", "Kinh Nghiệm"],
        "Quy trình 7 bước khảo sát ngược (Backtracking) dựa trên các biến cố lớn trong quá khứ để xác định chính xác cung giờ sinh thực tế.",
        "Đối chiếu các cột mốc kết hôn, sinh con, đổi nhà và tai nạn giúp chuyên gia xác định giờ sinh chính xác với độ tin cậy trên 95%."
    ),
    (
        "Hỏi đáp: Sự khác biệt bản chất giữa Tử Vi Nam Phái và Tử Vi Bắc Phái Khâm Thiên Môn?",
        6,
        ["Nam Phái", "Bắc Phái", "Khâm Thiên Môn", "Học Thuật"],
        "So sánh phương pháp luận giải chú trọng tinh đẩu của Nam Phái với phương pháp chú trọng phi tinh tứ hóa của Bắc Phái.",
        "Nam Phái coi 14 chính tinh là bộ khung cá tính, trong khi Bắc Phái Khâm Thiên xem Tứ Hóa phi tinh là động lực vận hành thời không của số phận."
    ),
    (
        "Hỏi đáp: Người có sao Thiên Cơ cư Mệnh có phù hợp với ngành Lập trình và Khoa học Dữ liệu?",
        6,
        ["Thiên Cơ", "Lập Trình", "Data Science", "Hỏi Đáp"],
        "Đánh giá năng lực tư duy thuật toán, độ nhạy bén với cấu trúc dữ liệu của chòm sao trí tuệ bậc nhất trên bầu trời tử vi.",
        "Thiên Cơ thủ mệnh có tư duy logic phản biện rất nhanh, khả năng học ngôn ngữ lập trình mới thần tốc và rất phù hợp với vai trò Kỹ sư Phần mềm hoặc AI Architect."
    ),

    # 7. Kiến Trúc Search Engine & AI
    (
        "Kiến trúc Search Engine Đa Mô Thức: So sánh chi tiết Okapi BM25, TF-IDF và Vector Search",
        7,
        ["BM25", "TF-IDF", "Vector Search", "Kiến Trúc Search Engine"],
        "Đặc tả kỹ thuật thiết kế bộ máy tìm kiếm văn bản tiếng Việt kết hợp Inverted Index và thuật toán xếp hạng BM25 độ phức tạp O(1).",
        "Bộ tách từ Vietnamese Tokenizer kết hợp từ điển ghép chuyên ngành và thuật toán Okapi BM25 giúp tìm kiếm chính xác các cụm từ đa âm tiết như Cung Mệnh, Hóa Lộc, Tử Vi Toàn Thư."
    ),
    (
        "Kỹ thuật Đánh giá Mô hình Tìm kiếm: Cách tính toán chỉ số MAP, MRR và NDCG@10 trong thực tế",
        7,
        ["Đánh Giá Search", "NDCG", "MAP", "MRR", "Information Retrieval"],
        "Hướng dẫn chi tiết phương pháp lập Benchmark đối chiếu độ chính xác của các thuật toán tìm kiếm thông tin bằng Python.",
        "Đo lường độ hài lòng của người dùng thông qua chỉ số Click-Through Rate (CTR) và Normalized Discounted Cumulative Gain (NDCG) giúp tinh chỉnh tham số k1 và b của BM25."
    ),
    (
        "Tối ưu hóa Inverted Index bằng bộ nhớ đệm LRU Cache và thuật toán nén danh sách Posting",
        7,
        ["Inverted Index", "LRU Cache", "Tối Ưu Hóa", "Hiệu Năng"],
        "Giảm 60% mức tiêu thụ RAM của Search Engine bằng kỹ thuật mã hóa khoảng cách d-gaps và nén Variable Byte.",
        "Cơ chế LRU Cache giữ chân các kết quả tìm kiếm cho các từ khóa thịnh hành giúp đáp ứng 10,000 truy vấn mỗi giây với độ trễ dưới 2ms."
    ),
    (
        "Xây dựng hệ thống Ghi nhận Nhật ký Tìm kiếm (Search & Click Logging) cho bài toán xếp hạng Phase 2",
        7,
        ["Search Logs", "Click Logs", "CTR Analytics", "Phase 2"],
        "Thiết kế cơ sở dữ liệu phi tập trung lưu trữ hàng triệu sự kiện tìm kiếm và nhấp chuột phục vụ huấn luyện mô hình Learning-to-Rank (LTR).",
        "Mỗi lượt tìm kiếm được ghi nhận query_string, và mỗi lượt nhấp chuột ghi nhận clicked_doc_id giúp tính toán tỷ lệ CTR chuẩn xác cho từng từ khóa mục tiêu."
    ),
    (
        "Xử lý hiện tượng bão hòa tần suất từ (Term Saturation) trong công cụ tìm kiếm tiếng Việt",
        7,
        ["Term Saturation", "BM25 vs TF-IDF", "Xếp Hạng", "Thuật Toán"],
        "Tại sao công thức TF-IDF truyền thống bị lỗi khi tài liệu lặp lại từ khóa quá nhiều lần, và cách BM25 khắc phục bằng hàm tiệm cận.",
        "Hàm bão hòa của BM25 đặt giới hạn trên cho điểm số đóng góp của tần suất từ, ngăn chặn hoàn toàn hiện tượng spam từ khóa trong văn bản SEO."
    ),
]

# Generate 105 total documents by duplicating variations with unique titles, authors, and metrics
all_docs = []
doc_id = 1

for item in raw_articles:
    title, cat_id, tags, summary, content = item
    cat_obj = next((c for c in categories if c["id"] == cat_id), categories[0])
    author = authors[(doc_id - 1) % len(authors)]
    
    views_count = 50 + (doc_id * 37) % 850
    likes_count = 5 + (doc_id * 13) % 95
    
    all_docs.append({
        "id": doc_id,
        "title": title,
        "summary": summary,
        "content": f"<p>{content}</p>",
        "plain_text": f"{title}. {summary}. {content}",
        "category_id": cat_id,
        "category": cat_obj,
        "category_name": cat_obj["name"],
        "tags": tags,
        "author": author,
        "author_name": author["name"],
        "views_count": views_count,
        "likes_count": likes_count,
        "created_at": f"2026-10-{(doc_id % 28) + 1:02d}T10:00:00Z"
    })
    doc_id += 1

# Generate additional high quality articles to reach 105 items
additional_titles = [
    ("DeepSeek R1 và mô hình suy luận sâu trong phân tích đại hạn 10 năm", 1, ["DeepSeek", "Suy Luận Sâu", "Đại Hạn"]),
    ("Ứng dụng đồ thị GNN dự đoán tính tương thích cách cục giữa hai lá số", 1, ["GNN", "Đồ Thị", "Tương Thích"]),
    ("Luận giải Cung Điền Trạch: Phân tích tài sản tích lũy qua mô hình Random Forest", 1, ["Cung Điền Trạch", "Random Forest", "Bất Động Sản"]),
    ("Phân tích tương quan giữa giờ sinh âm dương và sai số phân loại nhị phân", 1, ["Giờ Sinh", "Âm Dương", "Phân Loại"]),
    ("Kỹ thuật nén danh sách Posting với thuật toán Elias Gamma và VByte", 7, ["Elias Gamma", "VByte", "Nén Dữ Liệu"]),
    ("Thiết kế hệ thống Search Logging và tính toán CTR thời gian thực", 7, ["Search Logs", "CTR", "ClickHouse"]),
    ("Chiến lược phân tầng Redis Cache cho kết quả tìm kiếm BM25", 7, ["Redis", "Cache", "Tối Ưu Hóa"]),
    ("Đánh giá khả năng đọc đồ hình lá số ASCII của Gemini 1.5 Pro", 2, ["Gemini 1.5", "ASCII Art", "Multimodal"]),
    ("Cung Thiên Di có Thiên Mã ngộ Trường Sinh: Xác suất định cư nước ngoài", 4, ["Thiên Di", "Thiên Mã", "Định Cư"]),
    ("Sử dụng thuật toán KNN tìm kiếm lá số tương đồng nhất trong kho dữ liệu", 1, ["KNN", "Tương Đồng", "Lá Số"]),
    ("Xử lý lỗi bão hòa tần suất từ trong TF-IDF bằng hàm Okapi BM25", 7, ["BM25", "TF-IDF", "Term Saturation"]),
    ("Prompt Chain khám phá tiềm năng sự nghiệp từ Cung Quan Lộc", 2, ["Prompt Chain", "Cung Quan Lộc", "Nghề Nghiệp"]),
    ("Benchmark hiệu năng Inverted Index Python vs C++ trên 100,000 bài viết", 7, ["Benchmark", "Python", "C++"]),
    ("Cung Phúc Đức có Thiên Cơ Hóa Khoa: Tư duy logic và tố chất học thuật", 4, ["Phúc Đức", "Thiên Cơ", "Hóa Khoa"]),
    ("Ứng dụng PageRank tìm ngôi sao giữ vai trò hạt nhân trong tổ hợp tam hợp", 1, ["PageRank", "Hạt Nhân", "Tam Hợp"]),
    ("Kỹ thuật cào dữ liệu và làm sạch ngữ liệu cổ học với Playwright", 3, ["Web Scraping", "Playwright", "Dữ Liệu"]),
    ("Cung Tử Tức có Cự Môn Hóa Kỵ: Bài toán giao tiếp giữa cha mẹ và con cái", 6, ["Tử Tức", "Cự Môn", "Giao Tiếp"]),
    ("Sử dụng mô hình BGE-M3 xử lý truy vấn tìm kiếm tiếng Việt đa ngôn ngữ", 3, ["BGE-M3", "Embedding", "Đa Ngôn Ngữ"]),
    ("Định giá bất động sản dựa trên Cung Điền Trạch và dữ liệu bản đồ địa chính", 4, ["Điền Trạch", "Định Giá", "Bản Đồ"]),
    ("Phương pháp đánh giá Offline Metrics cho Search Engine: MAP và MRR", 7, ["Offline Metrics", "MAP", "MRR"]),
    ("Tạo sinh biểu đồ phân tích tương tác lá số bằng D3.js và SVG", 5, ["D3.js", "Trực Quan Hóa", "SVG"]),
    ("Tương lai của AI Tử Vi: Từ mô hình ngôn ngữ lớn đến hệ thống cố vấn", 1, ["Tương Lai AI", "Cố Vấn", "LLM"]),
    ("Hỏi đáp: Cung Phu Thê có Hóa Kỵ ngộ Thiên Hình thì hóa giải ra sao?", 6, ["Phu Thê", "Hóa Kỵ", "Hóa Giải"]),
    ("Hỏi đáp: Cách phân biệt giữa sao Thái Âm miếu địa và hãm địa?", 6, ["Thái Âm", "Miếu Hãm", "Hỏi Đáp"]),
    ("Hỏi đáp: Tại sao người tuổi Giáp lại có Hóa Lộc tại sao Liêm Trinh?", 6, ["Tuổi Giáp", "Liêm Trinh", "Hóa Lộc"]),
    ("Hỏi đáp: Sao Thiên Đồng ngộ Hóa Quyền có mất đi tính trẻ con không?", 6, ["Thiên Đồng", "Hóa Quyền", "Tính Cách"]),
    ("Hỏi đáp: Khi nào thì Cung Tật Ách kích hoạt bệnh lý tiềm ẩn?", 6, ["Tật Ách", "Kích Hoạt", "Bệnh Lý"]),
    ("Hỏi đáp: Làm sao để học thuộc 14 chính tinh và 108 phụ tinh nhanh nhất?", 6, ["Mẹo Học", "Chính Tinh", "Ghi Nhớ"]),
    ("Hỏi đáp: Sự khác biệt giữa sao Lộc Tồn và sao Hóa Lộc về mặt tài lộc?", 6, ["Lộc Tồn", "Hóa Lộc", "Tài Chính"]),
    ("Hỏi đáp: Cách chọn ngày giờ khai trương theo cung Tài Bạch và Lưu Thái Tuế?", 6, ["Khai Trương", "Chọn Ngày", "Tài Bạch"]),
    ("Hỏi đáp: Sao Vũ Khúc gặp Thất Sát tại Mão Dậu có phải là cách nguy hiểm?", 6, ["Vũ Khúc", "Thất Sát", "Mão Dậu"]),
    ("Hỏi đáp: Cung Mệnh có sao Thiên Phủ thì tính cách quản lý tiền ra sao?", 6, ["Thiên Phủ", "Quản Lý", "Tài Sản"]),
    ("Hỏi đáp: Ý nghĩa của bộ sao Tứ Đức (Long Đức, Nguyệt Đức, Phúc Đức, Thiên Đức)?", 6, ["Tứ Đức", "Tâm Linh", "Phúc Lộc"]),
    ("Hỏi đáp: Sao Hóa Quyền tại cung Mệnh có tạo nên tính độc đoán chuyên quyền?", 6, ["Hóa Quyền", "Lãnh Đạo", "Độc Đoán"]),
    ("Hỏi đáp: Khi nào thì sát tinh Địa Không Địa Kiếp phát huy tác dụng bộc phát?", 6, ["Không Kiếp", "Bộc Phát", "Làm Giàu"]),
    ("Hỏi đáp: Cung Huynh Đệ có Hóa Lộc thì anh em có giúp đỡ nhau làm ăn không?", 6, ["Huynh Đệ", "Hóa Lộc", "Kinh Doanh"]),
    ("Hỏi đáp: Sao Thiên Lương đóng tại Cung Tý có ý nghĩa gì đối với tuổi thọ?", 6, ["Thiên Lương", "Tuổi Thọ", "Cung Tý"]),
    ("Hỏi đáp: Cách phối hợp giữa Prompt Engineering và thuật toán BM25 trong RAG?", 7, ["Prompt", "BM25", "RAG Pipeline"]),
    ("Hỏi đáp: Chỉ mục Inverted Index cập nhật theo thời gian thực như thế nào?", 7, ["Realtime Indexing", "Inverted Index", "Streaming"]),
    ("Hỏi đáp: Làm sao để đo lường độ trễ (P99 Latency) của Python Search Engine?", 7, ["Latency", "Benchmark", "P99"]),
    ("Hỏi đáp: Cách khắc phục tình trạng truy vấn rỗng khi người dùng gõ từ không dấu?", 7, ["Không Dấu", "Tiếng Việt", "Tokenizer"]),
    ("Hỏi đáp: Thuật toán Reciprocal Rank Fusion (RRF) hoạt động như thế nào trong Hybrid Search?", 7, ["RRF", "Hybrid Search", "Fusion"]),
    ("Cung Huynh Đệ có Hóa Khoa: Mối quan hệ học hỏi và hỗ trợ tri thức giữa anh em", 6, ["Huynh Đệ", "Hóa Khoa", "Tri Thức"]),
    ("Phân tích cách cục Liêm Tham Tị Hợi: Vượt qua nghịch cảnh bằng công nghệ và kỷ luật", 4, ["Liêm Tham", "Tị Hợi", "Nghịch Cảnh"]),
    ("Đo lường độ ổn định của hệ thống phân cấp 12 cung khi có biến động giờ sinh biên giới", 5, ["Giờ Sinh", "Biên Giới", "Độ Ổn Định"]),
    ("Tối ưu hóa bộ tách từ tiếng Việt cho các từ khóa Hán Việt hiếm gặp trong sách cổ", 7, ["Tokenizer", "Hán Việt", "NLP"]),
    ("Ứng dụng đồ thị tri thức để gợi ý chủ đề thảo luận tiếp theo cho người dùng diễn đàn", 7, ["Knowledge Graph", "Recommender", "Gợi Ý"]),
    ("Luận giải hạn kết hôn qua Cung Phu Thê và Lưu Đại Vận: Thống kê trên 500 cặp đôi", 4, ["Hôn Nhân", "Lưu Đại Vận", "Thống Kê"]),
    ("Khai thác mô hình ngôn ngữ lớn để tạo câu đố tử vi tương tác tăng gắn kết thành viên", 2, ["Gamification", "Câu Đố", "Tương Tác"]),
    ("Cung Phụ Mẫu có Thiên Khôi Thiên Việt: Phúc ấm tổ tiên và điểm tựa gia đình", 6, ["Phụ Mẫu", "Khôi Việt", "Phúc Ấm"]),
    ("Phân tích ma trận hiệp phương sai giữa 14 chính tinh và chỉ số hạnh phúc gia đình", 1, ["Hiệp Phương Sai", "Hạnh Phúc", "14 Chính Tinh"]),
    ("Kỹ thuật lưu trữ chỉ mục ngược trên đĩa SSD với RocksDB và mmap", 7, ["RocksDB", "mmap", "Lưu Trữ"]),
    ("Hỏi đáp: Sao Vũ Khúc gặp Hóa Lộc có phải là cách đại phú gia không?", 6, ["Vũ Khúc", "Hóa Lộc", "Đại Phú"]),
    ("Đánh giá tác động của sao Hóa Quyền đối với năng lực lãnh đạo dự án công nghệ", 4, ["Hóa Quyền", "Lãnh Đạo", "Quản Lý Dự Án"]),
    ("Xây dựng bộ từ điển đồng nghĩa (Synonyms) cho công cụ tìm kiếm thuật ngữ Tử Vi", 7, ["Synonyms", "Từ Điển", "Search Expansion"]),
]

for title, cat_id, tags in additional_titles:
    cat_obj = next((c for c in categories if c["id"] == cat_id), categories[0])
    author = authors[(doc_id - 1) % len(authors)]
    summary = f"Nghiên cứu và phân tích chuyên sâu về đề tài '{title}' kết hợp dữ liệu thống kê và thuật toán hiện đại."
    content = f"Bài viết trình bày chi tiết cơ sở lý thuyết, mô hình toán học và kiểm chứng thực nghiệm đối với chủ đề {title}. Phù hợp cho cộng đồng nghiên cứu Tử Vi học thuật và Khoa học dữ liệu."
    
    views_count = 60 + (doc_id * 43) % 920
    likes_count = 8 + (doc_id * 17) % 98
    
    all_docs.append({
        "id": doc_id,
        "title": title,
        "summary": summary,
        "content": f"<p>{content}</p>",
        "plain_text": f"{title}. {summary}. {content}",
        "category_id": cat_id,
        "category": cat_obj,
        "category_name": cat_obj["name"],
        "tags": tags,
        "author": author,
        "author_name": author["name"],
        "views_count": views_count,
        "likes_count": likes_count,
        "created_at": f"2026-10-{(doc_id % 28) + 1:02d}T14:30:00Z"
    })
    doc_id += 1

output_path = os.path.join(os.path.dirname(__file__), "sample_documents.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(all_docs, f, ensure_ascii=False, indent=2)

print(f"✅ Đã tạo thành công {len(all_docs)} bài viết mẫu lưu tại {output_path}")
