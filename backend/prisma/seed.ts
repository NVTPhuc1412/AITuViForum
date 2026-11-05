import { PrismaClient, Role, DocumentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu nạp dữ liệu mẫu (Seed Data) cho AstroAI Forum...');

  // 1. Dọn dẹp dữ liệu cũ nếu có
  await prisma.searchClickLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.document.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Tạo Users cho từng Role (mật khẩu chung: Password123@)
  const passwordHash = await bcrypt.hash('Password123@', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@astroai.vn',
      password_hash: passwordHash,
      name: 'Nguyễn Văn Minh (Super Admin)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: Role.SUPER_ADMIN,
      bio: 'Kiến trúc sư hệ thống AstroAI & Quản trị viên tối cao.',
    },
  });

  const contentManager = await prisma.user.create({
    data: {
      email: 'content@astroai.vn',
      password_hash: passwordHash,
      name: 'Trần Thị Thu Hà (Content Manager)',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      role: Role.CONTENT_MANAGER,
      bio: 'Biên tập viên trưởng nội dung Khoa học Dữ liệu & Tử Vi cổ điển.',
    },
  });

  const moderator = await prisma.user.create({
    data: {
      email: 'moderator@astroai.vn',
      password_hash: passwordHash,
      name: 'Lê Hoàng Long (Moderator)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: Role.MODERATOR,
      bio: 'Kiểm duyệt viên chuyên trách phòng chống spam và giữ gìn văn hóa thảo luận.',
    },
  });

  const seoSpecialist = await prisma.user.create({
    data: {
      email: 'seo@astroai.vn',
      password_hash: passwordHash,
      name: 'Vũ Quốc Huy (SEO Specialist)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      role: Role.SEO_SPECIALIST,
      bio: 'Chuyên gia Phân tích Từ khóa & Tối ưu hóa Công cụ Tìm kiếm AstroAI.',
    },
  });

  const normalUser1 = await prisma.user.create({
    data: {
      email: 'user@astroai.vn',
      password_hash: passwordHash,
      name: 'Phạm Đức Anh (Member)',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      role: Role.USER,
      bio: 'Kỹ sư AI đam mê nghiên cứu cổ học phương Đông.',
    },
  });

  const normalUser2 = await prisma.user.create({
    data: {
      email: 'hoang.nam@astroai.vn',
      password_hash: passwordHash,
      name: 'Hoàng Hoài Nam',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
      role: Role.USER,
      bio: 'Thực tập sinh NLP, chuyên gia về Prompting Tử Vi.',
    },
  });

  const normalUser3 = await prisma.user.create({
    data: {
      email: 'dang.dung@astroai.vn',
      password_hash: passwordHash,
      name: 'Đặng Thùy Dung',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      role: Role.USER,
      bio: 'Chuyên gia Phân tích Dữ liệu chuỗi thời gian Tử Vi.',
    },
  });

  const normalUser4 = await prisma.user.create({
    data: {
      email: 'quang.huy@astroai.vn',
      password_hash: passwordHash,
      name: 'Bùi Quang Huy',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      role: Role.USER,
      bio: 'Kỹ sư Machine Learning, nghiên cứu Thuật toán BM25 & Hybrid Search.',
    },
  });

  const authors = [superAdmin, contentManager, moderator, seoSpecialist, normalUser1, normalUser2, normalUser3, normalUser4];

  // 3. Tạo các Danh mục (Categories)
  const categoriesData = [
    {
      name: 'AI & Học thuyết Tử Vi',
      slug: 'ai-hoc-thuyet-tu-vi',
      description: 'Nghiên cứu ma trận 14 chính tinh, ngũ hành nạp âm dưới góc nhìn xác suất thống kê và Data Science.',
    },
    {
      name: 'Prompt Kỹ thuật & Luận 12 Cung',
      slug: 'prompt-ky-thuat-12-cung',
      description: 'Chia sẻ system prompt, kỹ thuật Chain-of-Thought (CoT) cho Claude, ChatGPT, Gemini luận giải lá số.',
    },
    {
      name: 'RAG & Số hóa Thư tịch Cổ',
      slug: 'rag-so-hoa-thu-tich-co',
      description: 'Ứng dụng Retrieval-Augmented Generation, vector embedding cho Tử Vi Đẩu Số Toàn Thư, Tử Vi Hàm Số.',
    },
    {
      name: 'Đối sánh Thực chứng & Case Studies',
      slug: 'doi-sanh-thuc-chung',
      description: 'Đối chiếu kết quả luận giải của mô hình ngôn ngữ lớn (LLM) với thực tế và phán đoán của các đại sư phụ.',
    },
    {
      name: 'Công nghệ Lập Lá Số & Thuật toán',
      slug: 'cong-nghe-lap-la-so',
      description: 'Thuật toán an sao bằng Python, TypeScript, xử lý tiết khí âm dương, múi giờ GMT+7 và năm nhuận.',
    },
    {
      name: 'Hỏi Đáp Học Thuật & Trợ Giúp',
      slug: 'hoi-dap-tro-giup',
      description: 'Góc giải đáp các câu hỏi học thuật kinh điển về các cách cục phức tạp, tuần triệt và tứ hóa.',
    },
    {
      name: 'Kiến Trúc Search Engine & AI',
      slug: 'kien-truc-search-engine-ai',
      description: 'Đặc tả và trao đổi về Inverted Index, Okapi BM25, TF-IDF và Hybrid Search Engine.',
    },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const c = await prisma.category.create({ data: cat });
    categories.push(c);
  }

  // 4. Danh sách 65 bài viết mẫu thực tế (Realistic Data)
  const articles = [
    // --- CHUYÊN MỤC 1: AI & Học thuyết Tử Vi (15 bài) ---
    {
      title: 'Ma trận tương quan 14 Chính Tinh: Tiếp cận từ mô hình Vector Embedding đa chiều',
      catIdx: 0,
      tags: ['Embedding', '14 Chính Tinh', 'Machine Learning', 'Vector Space'],
      summary: 'Biểu diễn 14 chính tinh (Tử Vi, Thiên Phủ, Vũ Khúc, Thiên Đồng...) thành các vector 128 chiều để đo lường tính chất tương hỗ và triệt tiêu trong cách cục.',
      content: `<p>Trong Tử Vi Đẩu Số truyền thống, mối quan hệ giữa các sao như <strong>Tử Vi</strong>, <strong>Thiên Phủ</strong>, <strong>Thất Sát</strong> thường được mô tả thông qua các phú quyết cổ xưa. Khi áp dụng kỹ thuật <em>Word2Vec</em> hoặc <em>Dense Embedding</em>, chúng ta có thể ánh xạ từng ngôi sao vào không gian vector đa chiều.</p><p>Kết quả phân tích cụm (K-Means) chỉ ra rằng nhóm sao Nam Đẩu Tinh và Bắc Đẩu Tinh có sự phân tách rõ rệt về độ biến thiên năng lượng. Điều này mở ra cách tiếp cận tính điểm cách cục tự động mà không bị phụ thuộc vào cảm tính của người luận giải.</p>`,
    },
    {
      title: 'Ứng dụng mạng Bayes để tính xác suất các biến cố vận hạn trong chu kỳ 10 năm Đại Vận',
      catIdx: 0,
      tags: ['Mạng Bayes', 'Đại Vận', 'Xác Suất', 'Dự Báo'],
      summary: 'Mô hình hóa chu kỳ 10 năm Đại Vận bằng Directed Acyclic Graph (DAG) nhằm ước lượng xác suất thăng tiến công danh hoặc hạn tài chính.',
      content: `<p>Mạng Bayes là công cụ toán học hoàn hảo để kết nối các quan hệ phụ thuộc có điều kiện giữa Cung Mệnh, Thân và Lưu Đại Vận. Bằng việc xây dựng bảng xác suất có điều kiện (CPT) từ 5,000 lá số thực tế, thuật toán cho phép đưa ra độ tin cậy phần trăm (%) cho từng khả năng biến cố.</p><p>Nghiên cứu cho thấy khi Lưu Niên Thái Tuế trùng phùng với Cung Quan Lộc có Hóa Quyền, xác suất thay đổi công việc tích cực đạt trên 74.2%.</p>`,
    },
    {
      title: 'So sánh cấu trúc phân tầng ngũ hành Nạp Âm với cơ chế Multi-Head Attention',
      catIdx: 0,
      tags: ['Ngũ Hành', 'Nạp Âm', 'Attention', 'Transformer'],
      summary: 'Khám phá sự tương đồng kỳ thú giữa cơ chế trọng số chú ý trong kiến trúc Transformer và nguyên lý Nạp Âm Ngũ Hành sinh khắc.',
      content: `<p>Ngũ hành Nạp Âm 60 Hoa Giáp có tính chất điều hòa và lọc tín hiệu giống như lớp Layer Normalization. Khi một hành chủ đạo (như Hải Trung Kim) tương tác với môi trường bên ngoài, ma trận Attention gán trọng số suy giảm hoặc kích hoạt tùy vào vị trí cung nhị hợp và tam hợp.</p>`,
    },
    {
      title: 'Độ nhạy cảm của cung Tật Ách: Phân tích hồi quy Logistic dự đoán nguy cơ sức khỏe',
      catIdx: 0,
      tags: ['Cung Tật Ách', 'Hồi Quy Logistic', 'Sức Khỏe', 'Data Science'],
      summary: 'Kiểm nghiệm mối liên hệ giữa các bộ sao Hóa Kỵ, Kình Dương, Đà La đóng tại Tật Ách với hồ sơ y tế ẩn danh của 1,200 người.',
      content: `<p>Cung Tật Ách từ lâu được xem là chỉ báo quan trọng về thể chất. Nhóm nghiên cứu sử dụng hồi quy Logistic để tìm tương quan giữa các sao bại tinh và bệnh lý mãn tính. Kết quả cho thấy sự xuất hiện của Liêm Trinh - Thất Sát đồng cung có p-value < 0.01 đối với nguy cơ phẫu thuật chỉnh hình.</p>`,
    },
    {
      title: 'Thuật toán đồ thị tri thức (Knowledge Graph) biểu diễn quan hệ Tam Hợp và Nhị Hợp',
      catIdx: 0,
      tags: ['Knowledge Graph', 'Tam Hợp', 'Nhị Hợp', 'Graph Database'],
      summary: 'Xây dựng ontology hoàn chỉnh cho 12 cung địa bàn, liên kết các cạnh có hướng đại diện cho quan hệ xung - chiếu, nhị hợp và tam hợp sinh khắc.',
      content: `<p>Biểu diễn tử vi bằng đồ thị tri thức (Neo4j/RDF) cho phép truy vấn các cách cục phức tạp như "Mã Đầu Đới Kiếm" hay "Nhật Nguyệt Tịnh Minh" chỉ bằng một câu lệnh Cypher đơn giản. Điều này vượt trội hơn hẳn so với việc viết hàng trăm câu lệnh IF-ELSE lồng nhau trong code truyền thống.</p>`,
    },
    {
      title: 'Khảo sát độ tin cậy của sao Triệt Không và Tuần Không qua góc nhìn Dropout trong Deep Learning',
      catIdx: 0,
      tags: ['Tuần Triệt', 'Dropout', 'Deep Learning', 'Học Thuyết'],
      summary: 'So sánh tác động giảm 70% năng lượng của Tuần/Triệt đối với chính tinh tương đương với kỹ thuật Dropout ngắt kết nối nơ-ron.',
      content: `<p>Trong mạng nơ-ron sâu, Dropout làm bất hoạt ngẫu nhiên các nơ-ron để tránh over-fitting. Tương tự, Tuần và Triệt đóng vai trò rào chắn, làm biến đổi hoàn toàn thuộc tính của sao hãm địa thành đắc địa hoặc ngược lại. Bài viết phân tích cơ chế tính điểm trọng số khi có Tuần Triệt án ngữ.</p>`,
    },
    {
      title: 'Phân tích cụm (Clustering) 144 cách cục cơ bản trong Tử Vi Đẩu Số Toàn Thư',
      catIdx: 0,
      tags: ['Cách Cục', 'Phân Tích Cụm', '144 Dáng Đứng', 'Unsupervised Learning'],
      summary: 'Áp dụng thuật toán Hierarchical Clustering để gom nhóm 144 dáng đứng của Tử Vi và Thiên Phủ theo các mô hình nghề nghiệp hiện đại.',
      content: `<p>Mười hai thế đứng của sao Tử Vi tạo thành 144 thế bàn căn bản. Bằng cách trích xuất vector đặc trưng về công danh, tài lộc, gia đạo, mô hình phân cụm đã phân loại rõ nét các nhóm thế bàn phù hợp cho ngành Công nghệ phần mềm, Nghiên cứu khoa học và Quản trị kinh doanh.</p>`,
    },
    {
      title: 'Ảnh hưởng của giờ sinh âm lịch đối với sự hội tụ phân phối xác suất tính cách',
      catIdx: 0,
      tags: ['Giờ Sinh', 'Phân Phối Xác Suất', 'Tâm Lý Học', 'Big Data'],
      summary: 'Khảo sát 12 khung giờ Tý - Hợi đối chiếu với bảng bài trắc nghiệm tính cách Big Five và MBTI trên tập mẫu 3,000 tình nguyện viên.',
      content: `<p>Liệu người sinh giờ Dần thực sự có thiên hướng lãnh đạo mạnh mẽ hơn? Kết hợp dữ liệu sinh thần và kết quả trắc nghiệm MBTI cho thấy một mức độ tương quan nhất định giữa trục giờ sinh Dần - Thân và chỉ số Extraversion (E) trong tâm lý học hiện đại.</p>`,
    },
    {
      title: 'Tự động hóa phát hiện các phản cách (Phản vi kỳ cách) bằng thuật toán cây quyết định Random Forest',
      catIdx: 0,
      tags: ['Random Forest', 'Phản Vi Kỳ Cách', 'Decision Tree', 'Machine Learning'],
      summary: 'Xử lý các tình huống ngoại lệ cực đoan trong tử vi khi sao xấu gặp thời biến thành đại phú đại quý.',
      content: `<p>Một trong những điểm khó nhất của người học tử vi là nhớ các cách cục ngoại lệ như "Tham Lang ngộ Hỏa Tinh". Mô hình Random Forest giúp học các quy tắc phân nhánh từ dữ liệu tiền nhân, tự động gắn nhãn "Kỳ Cách" với độ chính xác đạt 89.6%.</p>`,
    },
    {
      title: 'Nguyên lý Cân bằng Động (Dynamic Equilibrium) trong giải thuật phối sao và giải hạn',
      catIdx: 0,
      tags: ['Cân Bằng Động', 'Giải Hạn', 'Thuật Toán', 'Toán Học'],
      summary: 'Dùng lý thuyết điều khiển tự động (Control Theory) để mô phỏng sự tương tác giữa các bộ sao cát tinh và sát tinh.',
      content: `<p>Một lá số không bao giờ hoàn toàn tốt hay hoàn toàn xấu. Khái niệm hồi tiếp âm (Negative Feedback) trong điều khiển tự động giải thích cơ chế sao Hóa Khoa hoặc Quang Quý kìm hãm hung tính của Kình Đà Linh Hỏa một cách mạch lạc.</p>`,
    },
    {
      title: 'Mô hình ẩn Markov (HMM) dự báo chuỗi bước chuyển sự nghiệp qua các cung Thân và Quan',
      catIdx: 0,
      tags: ['Markov Chain', 'HMM', 'Sự Nghiệp', 'Cung Quan Lộc'],
      summary: 'Xây dựng chuỗi trạng thái ẩn mô phỏng các giai đoạn thăng trầm công danh của một đời người dựa trên vị trí sao Thiên Khôi, Thiên Việt.',
      content: `<p>Hidden Markov Model cho phép chúng ta tính toán xác suất chuyển trạng thái từ nhân viên lên quản lý hoặc khởi nghiệp dựa vào tín hiệu từ cung Thân và Lưu Niên Đại Hạn.</p>`,
    },
    {
      title: 'Ứng dụng PCA (Principal Component Analysis) để giảm chiều 114 phụ tinh trong lá số',
      catIdx: 0,
      tags: ['PCA', 'Phụ Tinh', 'Dimensionality Reduction', 'Data Analytics'],
      summary: 'Tìm ra 5 thành phần chính (Principal Components) đóng góp hơn 82% ảnh hưởng tổng thể của hệ thống sao phụ.',
      content: `<p>Với hơn 100 phụ tinh, người luận giải rất dễ rơi vào bẫy quá tải thông tin. Bằng kỹ thuật PCA, các phụ tinh được gộp thành 5 nhóm nhân tố chính: Năng lượng tài chính, Năng lượng thị phi, Hỗ trợ quý nhân, Đột biến bất ngờ và Phúc đức gia tộc.</p>`,
    },
    {
      title: 'Xử lý tính mơ hồ (Fuzzy Logic) trong việc xác định ranh giới giữa hai giờ sinh',
      catIdx: 0,
      tags: ['Fuzzy Logic', 'Giờ Sinh', 'Logic Mờ', 'Biên Giờ'],
      summary: 'Giải pháp tính toán cho các trường hợp sinh vào đúng thời khắc giao thời (ví dụ: 10h59 hoặc 11h01).',
      content: `<p>Khi người dùng không chắc chắn sinh ở giờ Tỵ hay giờ Ngọ, việc dùng logic nhị phân truyền thống sẽ dẫn đến kết quả sai lệch 180 độ. Fuzzy Logic cung cấp hàm thuộc (membership function) để dung hòa hai lá số với tỷ trọng tương ứng.</p>`,
    },
    {
      title: 'Mô hình hóa tác động tương tác giữa Cung Phu Thê và Cung Nô Bộc trong xã hội số',
      catIdx: 0,
      tags: ['Cung Phu Thê', 'Cung Nô Bộc', 'Xã Hội Số', 'Quan Hệ'],
      summary: 'Phân tích dữ liệu mạng xã hội và mối quan hệ đối tác qua góc nhìn dịch chuyển ý nghĩa của cung Nô Bộc thời 4.0.',
      content: `<p>Trong xã hội hiện đại, cung Nô Bộc không chỉ là người làm mà đại diện cho cộng đồng followers, đồng nghiệp và đối tác kinh doanh. Bài viết khảo sát sự thay đổi biên độ ảnh hưởng của sao Cự Môn, Thiên Cơ trong thời đại số.</p>`,
    },
    {
      title: 'Đánh giá chỉ số biến động cảm xúc (Emotional Volatility) qua bộ sao Tang Môn - Bạch Hổ',
      catIdx: 0,
      tags: ['Tang Môn', 'Bạch Hổ', 'Tâm Lý Học', 'Phân Tích Dữ Liệu'],
      summary: 'Sử dụng kỹ thuật Sentiment Analysis trên nhật ký cá nhân để đối chiếu với vị trí sao Tang Hổ trên lá số.',
      content: `<p>Tập dữ liệu gồm 500 bài viết nhật ký ẩn danh được chấm điểm cảm xúc (VADER Sentiment). Các cá nhân có Tang Môn tọa thủ Mệnh biểu hiện tần suất từ ngữ u hoài cao hơn 28% so với nhóm đối chứng.</p>`,
    },

    // --- CHUYÊN MỤC 2: Prompt Kỹ thuật & Luận 12 Cung (15 bài) ---
    {
      title: 'Master System Prompt: Hướng dẫn Claude 3.5 Sonnet luận giải chuyên sâu Cung Mệnh',
      catIdx: 1,
      tags: ['Prompt Engineering', 'Claude 3.5', 'Cung Mệnh', 'System Prompt'],
      summary: 'Bộ khung prompt phân tầng theo nguyên lý Tinh - Cung - Hóa - Vận, giúp LLM không bị ảo giác (hallucination) khi đọc lá số.',
      content: `<p>Để LLM luận giải chính xác, chúng ta không thể chỉ ném toàn bộ danh sách sao vào khung chat. Cần thiết lập System Prompt quy định rõ vai trò: Chuyên gia Tử Vi trường phái Nam Phái, tuân thủ quy tắc ngũ hành sinh khắc trước khi kết luận cát hung.</p><pre><code>ROLE: Senior Tử Vi Astrologer & Data Scientist\nFORMAT: 1. Tổng quan cách cục -> 2. Tác động của chính tinh -> 3. Phụ tinh chế hóa -> 4. Lời khuyên hành động cụ thể.</code></pre>`,
    },
    {
      title: 'Kỹ thuật Chain-of-Thought (CoT) từng bước bóc tách cung Tài Bạch có Hóa Lộc ngộ Địa Không',
      catIdx: 1,
      tags: ['CoT', 'Cung Tài Bạch', 'Hóa Lộc', 'Địa Không'],
      summary: 'Áp dụng suy luận từng bước (Step-by-step reasoning) để phân tích thế kẹt giữa cơ hội làm giàu nhanh và nguy cơ rủi ro trắng tay.',
      content: `<p>Hóa Lộc chủ về tiền tài, nhưng khi gặp Địa Không, tiền bạc dễ như bọt nước. Prompt CoT yêu cầu mô hình suy nghĩ qua 4 bước: Đánh giá độ sáng của chính tinh, xem xét cung Phúc Đức đối chiếu, tính chu kỳ đại vận và đưa ra phương án phân bổ tài sản an toàn.</p>`,
    },
    {
      title: 'Prompt mẫu so sánh thế đứng Cự Môn tại Tý và Cự Môn tại Ngọ cho ChatGPT-4o',
      catIdx: 1,
      tags: ['ChatGPT-4o', 'Cự Môn', 'Thạch Trung Ẩn Ngọc', 'So Sánh'],
      summary: 'Hướng dẫn prompt đối sánh cách cục Thạch Trung Ẩn Ngọc (Ngọc giấu trong đá) giữa hai vị trí Tý và Ngọ.',
      content: `<p>Cự Môn tại Tý và Ngọ đều là cách Thạch Trung Ẩn Ngọc, tuy nhiên khi ở cung Tý thì đắc thủy sinh mộc, tính cách kín đáo hơn so với thế đứng tại Ngọ. Prompt này giúp trích xuất phân tích chi tiết về phong cách giao tiếp và khả năng hùng biện của đương số.</p>`,
    },
    {
      title: 'Kỹ thuật Few-Shot Prompting: Dạy LLM nhận diện 10 bộ sao quý hiển thường gặp',
      catIdx: 1,
      tags: ['Few-Shot', 'Quý Hiển', 'Bộ Sao', 'Prompting'],
      summary: 'Cung cấp 3 ví dụ đối chiếu (input -> reasoning -> output) giúp mô hình ngôn ngữ nắm vững cách nhận diện Tả Hữu, Xương Khúc, Khôi Việt.',
      content: `<p>Few-Shot Prompting là chìa khóa để LLM hiểu được ngôn ngữ ước lệ của cổ nhân. Bài viết chia sẻ 3 cặp ví dụ hoàn chỉnh về cách phân tích bộ sao Khoa Quyền Lộc kèm theo prompt thực thi trên Gemini 1.5 Pro.</p>`,
    },
    {
      title: 'Prompt bóc tách cung Phu Thê: Phân tích xung đột và độ hòa hợp hôn nhân',
      catIdx: 1,
      tags: ['Cung Phu Thê', 'Hôn Nhân', 'Hòa Hợp', 'Prompt'],
      summary: 'Template prompt yêu cầu AI đưa ra góc nhìn tâm lý trị liệu dựa trên tín hiệu của sao Cô Thần, Quả Tú và Thiên Khốc.',
      content: `<p>Thay vì đưa ra những phán đoán bi quan về sự chia ly, prompt được tinh chỉnh để biến các chỉ báo tử vi thành bài tập giao tiếp và thấu cảm giữa hai vợ chồng trong đời sống thực tế.</p>`,
    },
    {
      title: 'Xử lý Hallucination khi LLM tự "bịa" sao không có trong lá số: Chiến thuật Guardrails',
      catIdx: 1,
      tags: ['Guardrails', 'Hallucination', 'Chống Ảo Giác', 'AI Safety'],
      summary: 'Thiết lập bộ lọc kiểm tra nghiêm ngặt danh sách sao đầu vào (Input Whitelist) trước khi gửi prompt đến LLM.',
      content: `<p>Hiện tượng thường gặp là khi hỏi về cung Quan Lộc, AI tự động thêm sao Hóa Khoa dù trong lá số không hề có. Bài viết hướng dẫn viết JSON Schema chuẩn và sử dụng Pydantic để khóa chặt phạm vi dữ liệu được phép phân tích.</p>`,
    },
    {
      title: 'Prompt đánh giá cung Quan Lộc trong thời đại Trí Tuệ Nhân Tạo: Định hướng nghề nghiệp mới',
      catIdx: 1,
      tags: ['Cung Quan Lộc', 'Nghề Nghiệp AI', 'Prompt', 'Định Hướng'],
      summary: 'Chuyển hóa các nghề cổ như "quan lại, văn sĩ, thương nhân" sang các vị trí hiện đại như AI Engineer, Product Manager, Data Scientist.',
      content: `<p>Thiên Cơ chủ về mưu trí, thuật toán; Vũ Khúc chủ về tài chính và thực thi; Liêm Trinh chủ về hệ thống và nguyên tắc. Prompt này giúp kết nối các chính tinh với bản đồ nghề nghiệp công nghệ chuẩn xác.</p>`,
    },
    {
      title: 'Template Prompt phân tích Lưu Niên 2026: Đón đầu thời cơ và phòng ngừa rủi ro',
      catIdx: 1,
      tags: ['Lưu Niên', '2026', 'Hạn Năm', 'Template Prompt'],
      summary: 'Khung prompt chuyên biệt cho việc soi chiếu Lưu Niên Thái Tuế kết hợp Lưu Kình Dương và Lưu Đà La.',
      content: `<p>Cách tổ chức dữ liệu đầu vào cho một năm hạn gồm: Gốc Đại Vận 10 năm, Tiểu Hạn năm Bính Ngọ 2026, các sao lưu động và tam phương tứ chính hội chiếu.</p>`,
    },
    {
      title: 'Kỹ thuật Meta-Prompting: Yêu cầu AI tự kiểm chứng tính logic của lời bình giải',
      catIdx: 1,
      tags: ['Meta-Prompting', 'Self-Reflection', 'Logic', 'Độ Chính Xác'],
      summary: 'Phương pháp hai lượt (Two-turn prompting): Lượt 1 luận giải, lượt 2 tự phản biện và chấm điểm độ khách quan.',
      content: `<p>Mô hình tự đóng vai một học giả đối trọng để rà soát xem kết luận có mâu thuẫn với quy tắc gốc của môn Tử Vi hay không. Nếu phát hiện mâu thuẫn, mô hình tự động hiệu chỉnh lại trước khi trả lời người dùng.</p>`,
    },
    {
      title: 'Prompt giải mã cung Nô Bộc: Nhận diện bạn tốt và đối tác kinh doanh tin cậy',
      catIdx: 1,
      tags: ['Cung Nô Bộc', 'Đối Tác', 'Bạn Bè', 'Prompt'],
      summary: 'Hướng dẫn viết câu lệnh chi tiết để AI phân tích bộ sao Phục Binh, Hóa Kỵ và Tả Phù, Hữu Bật.',
      content: `<p>Trong kinh doanh, cung Nô Bộc phản ánh cấp dưới và cộng sự. Bài viết cung cấp mẫu prompt phân tích sâu về mức độ trung thành và rủi ro bị phản trắc trong hợp tác làm ăn.</p>`,
    },
    {
      title: 'Prompt luận giải cung Điền Trạch: Đầu tư bất động sản và không gian sống lý tưởng',
      catIdx: 1,
      tags: ['Cung Điền Trạch', 'Bất Động Sản', 'Phong Thủy', 'Prompt'],
      summary: 'Tập trung vào các chính tinh Cự Môn, Thái Âm, Thiên Phủ khi tọa thủ tại cung Điền Trạch.',
      content: `<p>Kết hợp giữa yếu tố địa lý phong thủy và chu kỳ kinh tế thông qua phân tích tương tác của sao Hóa Quyền tại cung Điền Trạch.</p>`,
    },
    {
      title: 'Prompt phân tích cung Phụ Mẫu: Thấu hiểu gốc rễ gia đình và di truyền học',
      catIdx: 1,
      tags: ['Cung Phụ Mẫu', 'Gia Đình', 'Tâm Lý Học', 'Prompt'],
      summary: 'Khai thác mối quan hệ giữa đương số và cha mẹ dưới lăng kính của sự bao bọc hay xung khắc thế hệ.',
      content: `<p>Mẫu prompt giúp khai phóng những tổn thương thời thơ ấu (inner child) qua các tín hiệu của sao Thái Dương, Thái Âm ngộ Kình Đà.</p>`,
    },
    {
      title: 'Prompt giải mã thế kẹt Vô Chính Diệu: Khi cung Mệnh không có chính tinh',
      catIdx: 1,
      tags: ['Vô Chính Diệu', 'Đắc Tam Không', 'Cung Mệnh', 'Prompt'],
      summary: 'Cách đặt câu hỏi để LLM hiểu nguyên lý "mượn sao cung đối diện" và cách cục Đắc Tam Không.',
      content: `<p>Mệnh Vô Chính Diệu như nhà không nóc, cần mượn ánh sáng của Nhật Nguyệt hoặc cung đối chiếu. Prompt hướng dẫn phân tích độ nhạy của cung này với môi trường xung quanh.</p>`,
    },
    {
      title: 'Tối ưu hóa Token Context Window khi nạp toàn bộ 12 cung vào một lượt prompt',
      catIdx: 1,
      tags: ['Context Window', 'Tối Ưu Token', 'JSON Compression', 'Kỹ Thuật'],
      summary: 'Nén dữ liệu lá số bằng định dạng JSON rút gọn (Compact notation) giúp tiết kiệm 65% token đầu vào.',
      content: `<p>Thay vì viết văn xuôi dài dòng mô tả 12 cung, việc chuẩn hóa thành cấu trúc JSON rút gọn (ví dụ: {"cung": 1, "sao": ["TV_V", "TP_M"], "hoa": ["KHOA"]}) giúp mô hình tập trung tối đa sự chú ý vào thuật toán luận giải.</p>`,
    },
    {
      title: 'Prompt luận giải lá số trẻ em: Tôn trọng tiềm năng và tránh gieo rắc định kiến',
      catIdx: 1,
      tags: ['Lá Số Trẻ Em', 'Giáo Dục', 'Đạo Đức AI', 'Prompt'],
      summary: 'Thiết kế prompt định hướng giáo dục sớm dựa trên sao Thiên Khôi, Thiên Việt, Văn Xương thay vì xem hạn xấu.',
      content: `<p>Đạo đức trong ứng dụng tử vi: Nghiêm cấm đưa ra các phán đoán tiêu cực về thọ mệnh đối với trẻ nhỏ, tập trung gợi ý phương pháp học tập phù hợp theo đặc tính cung Mệnh.</p>`,
    },

    // --- CHUYÊN MỤC 3: RAG & Số hóa Thư tịch Cổ (12 bài) ---
    {
      title: 'Xây dựng đường ống RAG (Retrieval-Augmented Generation) cho Tử Vi Đẩu Số Toàn Thư',
      catIdx: 2,
      tags: ['RAG', 'Thư Tịch Cổ', 'Vector DB', 'LlamaIndex'],
      summary: 'Quy trình OCR, làm sạch văn bản chữ Hán Nôm và tiếng Việt cổ, chia đoạn ngữ nghĩa (Semantic Chunking) và lưu trữ vào ChromaDB.',
      content: `<p>Sách cổ thường có cấu trúc thơ phú lục bát hoặc câu đối biền ngẫu. Khi chia đoạn thông thường theo độ dài ký tự, ngữ nghĩa sẽ bị đứt gãy. Chúng tôi đề xuất giải pháp Semantic Chunking dựa trên đơn vị bài phú để đảm bảo tính toàn vẹn của văn cảnh.</p>`,
    },
    {
      title: 'Đánh giá các mô hình Embedding tiếng Việt (PhoBERT, BKAI, BGE-M3) trên văn bản cổ học',
      catIdx: 2,
      tags: ['Embedding', 'PhoBERT', 'BGE-M3', 'Benchmark'],
      summary: 'So sánh độ chính xác thu hồi (Recall@k) khi truy vấn các thuật ngữ như "Hỏa Tham tương hội", "Phụ Mẫu nan toàn".',
      content: `<p>Thử nghiệm trên 1,000 cặp câu truy vấn cổ học cho thấy mô hình đa ngữ BGE-M3 vượt trội hơn các mô hình đơn ngữ truyền thống nhờ khả năng hiểu ngữ cảnh Hán Việt sâu rộng.</p>`,
    },
    {
      title: 'Giải pháp xử lý từ viết tắt và biến thể Hán Việt trong quá trình Tokenization',
      catIdx: 2,
      tags: ['Tokenization', 'Hán Việt', 'Xử Lý Ngôn Ngữ', 'Preprocessing'],
      summary: 'Xây dựng từ điển đồng nghĩa (Synonym Map) tùy biến cho các từ như "Kình" (Kình Dương), "Đà" (Đà La), "Khôi Việt".',
      content: `<p>Bộ tách từ thông thường thường hiểu nhầm "Kình Dương" là hai từ rời rạc. Việc bổ sung Custom Dictionary vào Underthesea/PyVi giúp Inverted Index đạt độ chính xác gần như tuyệt đối.</p>`,
    },
    {
      title: 'Kỹ thuật HyDE (Hypothetical Document Embeddings) cải thiện độ chính xác tìm kiếm phú quyết',
      catIdx: 2,
      tags: ['HyDE', 'Phú Quyết', 'Search', 'RAG'],
      summary: 'Dùng LLM sinh ra đoạn văn bản giả định trước khi vector hóa giúp thu hẹp khoảng cách giữa câu hỏi của người dùng và văn phong cổ thư.',
      content: `<p>Khi người dùng hỏi "Làm sao biết người có số làm bác sĩ?", phương pháp HyDE tạo ra một đoạn giả định chứa các sao Thiên Y, Hóa Khoa, sau đó đem đoạn này đi tìm trong kho sách cổ.</p>`,
    },
    {
      title: 'Tự động trích xuất thực thể (Named Entity Recognition - NER) các vị sao và cung vị từ PDF scan',
      catIdx: 2,
      tags: ['NER', 'Trích Xuất Thực Thể', 'Spacy', 'Hán Nôm'],
      summary: 'Huấn luyện mô hình Spacy tùy chỉnh nhận diện 4 nhãn thực thể: STAR_MAIN, STAR_SUB, PALACE, LUNAR_ELEMENT.',
      content: `<p>Giới thiệu tập dữ liệu gán nhãn 10,000 câu văn bản tử vi cổ giúp cộng đồng dễ dàng huấn luyện lại các mô hình trích xuất thông tin tự động.</p>`,
    },
    {
      title: 'Tích hợp Reranker Cohere / BGE-Reranker nâng cao chất lượng tìm kiếm ngữ nghĩa',
      catIdx: 2,
      tags: ['Reranker', 'Cross-Encoder', 'Ranking', 'BM25'],
      summary: 'Kết hợp mô hình lai (Hybrid Search: BM25 + Dense Retrieval) và dùng Cross-Encoder để tái xếp hạng top 20 kết quả.',
      content: `<p>Thực nghiệm cho thấy bước tái xếp hạng (Reranking) giúp giảm thiểu hiện tượng LLM trích dẫn sai bài phú tới 43%.</p>`,
    },
    {
      title: 'Số hóa và chú giải cuốn "Tử Vi Hàm Số" của cụ Nguyễn Phát Lộc bằng công nghệ AI',
      catIdx: 2,
      tags: ['Tử Vi Hàm Số', 'Số Hóa', 'Nguyễn Phát Lộc', 'Kho Sách'],
      summary: 'Hành trình chuyển đổi từ bản in năm 1972 sang định dạng Markdown chuẩn kèm siêu dữ liệu liên kết chéo.',
      content: `<p>Cuốn sách kinh điển tiếp cận tử vi theo góc nhìn toán học hàm số được số hóa hoàn toàn, cung cấp kho tri thức khổng lồ cho các thế hệ lập trình viên sau này.</p>`,
    },
    {
      title: 'Vector Database Benchmark: Qdrant vs Milvus vs pgvector khi lưu trữ 500,000 đoạn phú cổ',
      catIdx: 2,
      tags: ['Vector DB', 'pgvector', 'Qdrant', 'Benchmark'],
      summary: 'So sánh tốc độ phản hồi (latency), dung lượng RAM và khả năng kết hợp lọc metadata (Metadata Filtering).',
      content: `<p>Đối với hệ thống tích hợp sẵn PostgreSQL, pgvector với chỉ mục HNSW là lựa chọn cân bằng nhất về cả chi phí vận hành lẫn hiệu năng thực tế.</p>`,
    },
    {
      title: 'Phát hiện mâu thuẫn giữa các trường phái (Nam Phái, Bắc Phái, Khâm Thiên) bằng RAG đối chiếu',
      catIdx: 2,
      tags: ['Trường Phái', 'Bắc Phái', 'Khâm Thiên', 'So Sánh'],
      summary: 'Hệ thống tự động hiển thị song song các quan điểm khác biệt khi luận về cách cục Phi Tinh Tứ Hóa.',
      content: `<p>RAG không chỉ trích xuất một câu trả lời duy nhất mà tổng hợp đa chiều: Bắc Phái chú trọng Tứ Hóa phi tinh, Nam Phái chú trọng thế đứng tinh đẩu và phụ tinh đi kèm.</p>`,
    },
    {
      title: 'Tối ưu hóa chi phí token với Contextual Compression trong LangChain cho tài liệu cổ',
      catIdx: 2,
      tags: ['LangChain', 'Contextual Compression', 'Chi Phí', 'Token'],
      summary: 'Chỉ trích xuất các câu thơ thực sự chứa đáp án thay vì nhồi toàn bộ chương sách vào prompt.',
      content: `<p>Sử dụng LLMChainExtractor để lọc sạch các đoạn văn dẫn nhập không cần thiết, giúp tiết kiệm tới 70% chi phí gọi API OpenAI/Anthropic.</p>`,
    },
    {
      title: 'Chiến lược cập nhật Knowledge Base động: Khi người dùng đóng góp các trường hợp kiểm chứng mới',
      catIdx: 2,
      tags: ['Knowledge Base', 'Cộng Đồng', 'Dynamic Update', 'Embedding'],
      summary: 'Quy trình kiểm duyệt và vector hóa tự động các bài viết chất lượng cao từ diễn đàn vào kho tri thức chung.',
      content: `<p>Mô hình cộng đồng đóng góp tri thức: Các bài viết được Moderator duyệt sẽ tự động được đưa vào hàng đợi (Queue) để nhúng vector vào hệ thống RAG.</p>`,
    },
    {
      title: 'Đánh giá độ trung thực (Faithfulness) và độ phủ thông tin (Context Precision) qua khung RAGAS',
      catIdx: 2,
      tags: ['RAGAS', 'Đánh Giá', 'Metrics', 'Evaluation'],
      summary: 'Thiết lập hệ thống chấm điểm tự động cho chất lượng trả lời của chatbot tử vi.',
      content: `<p>Sử dụng bộ chỉ số RAGAS chuẩn quốc tế để đảm bảo chatbot không đưa ra thông tin mê tín dị đoan hoặc sai lệch so với sách gốc.</p>`,
    },

    // --- CHUYÊN MỤC 4: Đối sánh Thực chứng & Case Studies (12 bài) ---
    {
      title: 'Case Study 1: Đối chiếu dự đoán hạn tài chính năm 2024 của AI và 3 đại sư phụ nổi tiếng',
      catIdx: 3,
      tags: ['Case Study', 'Hạn Tài Chính', 'Thực Chứng', 'So Sánh'],
      summary: 'Phân tích lá số của một nhà đầu tư chứng khoán sinh năm 1988 trong năm Giáp Thìn.',
      content: `<p>Cả 3 chuyên gia truyền thống và mô hình AI đều cảnh báo nguy cơ hao tài vào tháng 7 âm lịch do Lưu Kình Dương nhập cung Điền Trạch. Tuy nhiên, AI cung cấp thêm bảng phân tích xác suất chi tiết theo từng tuần dựa trên sao Lưu Niên.</p>`,
    },
    {
      title: 'Case Study 2: Phân tích lá số các nhà sáng lập công nghệ kỳ lân (Unicorn Founders)',
      catIdx: 3,
      tags: ['Startup', 'Kỳ Lân', 'Cung Mệnh', 'Vũ Khúc'],
      summary: 'Khảo sát 30 nhà sáng lập công nghệ tại Đông Nam Á: Tần suất xuất hiện của bộ sao Tử Phủ Vũ Tướng và Sát Phá Tham.',
      content: `<p>Điểm thú vị là hơn 60% các founder công nghệ mạo hiểm sở hữu bộ Sát Phá Tham đắc địa tại Mệnh hoặc Thân, thể hiện tính cách dám đương đầu với bất định và đổi mới liên tục.</p>`,
    },
    {
      title: 'Thực nghiệm mù (Blind Test): Liệu người dùng có nhận ra bài luận do AI viết hay thầy viết?',
      catIdx: 3,
      tags: ['Blind Test', 'Turing Test', 'Tử Vi', 'Thực Nghiệm'],
      summary: 'Thử nghiệm trên 200 người với 400 bài luận giải ẩn danh danh tính tác giả.',
      content: `<p>Kết quả bất ngờ: 64% người tham gia đánh giá bài luận của Claude 3.5 Sonnet mạch lạc, logic và giàu tính xây dựng hơn so với bản luận giải viết tay của người thật.</p>`,
    },
    {
      title: 'Phân tích độ lệch chuẩn giữa giờ sinh khai sinh và giờ sinh thực tế tại bệnh viện',
      catIdx: 3,
      tags: ['Giờ Sinh', 'Độ Lệch Chuẩn', 'Thực Chứng', 'Dữ Liệu'],
      summary: 'Nghiên cứu trên 500 hồ sơ bệnh án sản khoa: Xu hướng làm tròn số 15 phút, 30 phút của y tá.',
      content: `<p>Dữ liệu chỉ ra rằng việc làm tròn giờ sinh khiến khoảng 18% lá số bị nhảy sang cung giờ khác. Đây là nguyên nhân hàng đầu khiến nhiều người cảm thấy "tử vi xem không đúng".</p>`,
    },
    {
      title: 'Case Study 3: Sao Thiên Hình tại Mệnh và định mệnh trở thành chuyên gia Pháp lý / An ninh mạng',
      catIdx: 3,
      tags: ['Thiên Hình', 'An Ninh Mạng', 'Luật', 'Nghề Nghiệp'],
      summary: 'Khảo sát 80 chuyên gia Penetration Testing và luật sư doanh nghiệp.',
      content: `<p>Thiên Hình chủ về sự khắt khe, kỷ luật và soi xét lỗi. Khi kết hợp với sao Thiên Cơ hoặc Hóa Quyền, đương số có khả năng rà quét lỗ hổng bảo mật phi thường.</p>`,
    },
    {
      title: 'Case Study 4: Luận giải đường học vấn của học sinh chuyên toán qua bộ sao Xương Khúc - Khôi Việt',
      catIdx: 3,
      tags: ['Học Vấn', 'Xương Khúc', 'Toán Học', 'Tài Năng'],
      summary: 'Thực tế đối chiếu lá số của đội tuyển học sinh giỏi quốc gia môn Toán và Tin học.',
      content: `<p>Sự hội tụ của Văn Xương, Văn Khúc tại Mệnh hoặc Quan Lộc đi kèm Hóa Khoa phản ánh trực tiếp khả năng tư duy trừu tượng và ghi nhớ có cấu trúc.</p>`,
    },
    {
      title: 'Thực tế kiểm chứng: Sao Đào Hoa cư Tý (Đào hoa phiếm chủy) trong ngành giải trí hiện đại',
      catIdx: 3,
      tags: ['Đào Hoa', 'Showbiz', 'KOL', 'Truyền Thông'],
      summary: 'Phân tích cách cục của 25 người mẫu, ca sĩ và nhà sáng tạo nội dung triệu view.',
      content: `<p>Cổ nhân coi Đào Hoa cư Tý là phong lưu trắc trở, nhưng trong thời đại truyền thông số, đây lại là "vũ khí" thu hút sự chú ý của hàng triệu khán giả.</p>`,
    },
    {
      title: 'Nghiên cứu hiện tượng "Đồng bệnh tương lân": Hai người sinh cùng ngày giờ có cuộc đời ra sao?',
      catIdx: 3,
      tags: ['Sinh Đôi', 'Cùng Giờ Sinh', 'Biến Số Môi Trường', 'Nghiên Cứu'],
      summary: 'Theo dõi hành trình 20 năm của 10 cặp cá nhân sinh cùng thời khắc nhưng khác biệt gia cảnh.',
      content: `<p>Lá số tử vi quy định biên độ dao động (range) và các mốc biến cố lớn, nhưng môi trường gia đình và nỗ lực tự thân đóng vai trò quyết định điểm rơi cụ thể.</p>`,
    },
    {
      title: 'Case Study 5: Hóa Giải cách cục Kình Đà Hiệp Kỵ trong quản trị khủng hoảng doanh nghiệp',
      catIdx: 3,
      tags: ['Kình Đà Hiệp Kỵ', 'Khủng Hoảng', 'Doanh Nghiệp', 'Hóa Giải'],
      summary: 'Bài học từ một CEO công nghệ vượt qua năm khó khăn nhất nhờ chiến lược thu hẹp quy mô.',
      content: `<p>Thay vì cố mở rộng thị trường khi gặp thế Kẹp Sát Tinh, doanh nghiệp chủ động cắt giảm chi phí và tập trung củng cố sản phẩm cốt lõi.</p>`,
    },
    {
      title: 'Độ chính xác của việc dự báo thuyên chuyển nơi ở qua cung Thiên Di và sao Mã',
      catIdx: 3,
      tags: ['Thiên Di', 'Thiên Mã', 'Xuất Ngoại', 'Định Cư'],
      summary: 'Thống kê trên 150 trường hợp du học sinh và người định cư nước ngoài.',
      content: `<p>Thiên Mã gặp Tràng Sinh hoặc Phượng Các tại cung Thiên Di có tỷ lệ xuất ngoại thành công trên 85%.</p>`,
    },
    {
      title: 'Case Study 6: Khi sao Địa Kiếp trở thành động lực cho sự sáng tạo đột phá',
      catIdx: 3,
      tags: ['Địa Kiếp', 'Sáng Tạo', 'Nghệ Thuật', 'Đột Phá'],
      summary: 'Lăng kính mới về sát tinh Địa Kiếp trong các lĩnh vực thiết kế, kiến trúc và nghệ thuật đương đại.',
      content: `<p>Địa Kiếp phá vỡ các quy chuẩn cũ kỹ, thúc đẩy những tư duy ngoài chiếc hộp (out-of-the-box thinking) mà những sao chính phái không làm được.</p>`,
    },
    {
      title: 'Tổng kết 1,000 phản hồi từ người dùng thực tế trên nền tảng thử nghiệm AstroAI',
      catIdx: 3,
      tags: ['Báo Cáo', 'Feedback', 'Thực Nghiệm', 'Nền Tảng'],
      summary: 'Báo cáo số liệu hài lòng, độ tin cậy và các góc nhìn phản biện từ cộng đồng nghiên cứu.',
      content: `<p>Đa số thành viên đánh giá cao tính minh bạch trong việc giải thích "tại sao đưa ra kết luận này" của hệ thống thay vì phán bừa như bói toán dân gian.</p>`,
    },

    // --- CHUYÊN MỤC 5: Công nghệ Lập Lá Số & Thuật toán (11 bài) ---
    {
      title: 'Mã nguồn mở thuật toán An Sao Tử Vi bằng TypeScript chuẩn ES2022',
      catIdx: 4,
      tags: ['TypeScript', 'Mã Nguồn Mở', 'An Sao', 'Thuật Toán'],
      summary: 'Hướng dẫn cài đặt package tính Can Chi, xác định Cung Mệnh Thân và an 114 vì sao chính xác đến từng phút.',
      content: `<p>Thư viện gọn nhẹ không phụ thuộc thư viện ngoài, tối ưu cho cả môi trường trình duyệt và Node.js. Hỗ trợ đầy đủ các trường phái an sao phổ biến tại Việt Nam.</p><pre><code>import { LapLaSo } from 'astroai-core';\nconst laSo = LapLaSo({ ngay: 15, thang: 8, nam: 1995, gio: 10.5, gioiTinh: 'nam' });</code></pre>`,
    },
    {
      title: 'Xử lý bài toán múi giờ lịch sử tại Việt Nam (UTC+7, UTC+8 và giờ mùa hè Pháp)',
      catIdx: 4,
      tags: ['Múi Giờ', 'Lịch Sử', 'Thời Gian', 'Toán Học'],
      summary: 'Bảng tra cứu quy đổi giờ sinh chính xác theo các sắc lệnh múi giờ từ năm 1945 đến nay.',
      content: `<p>Một lỗi lập trình nghiêm trọng thường gặp là áp dụng múi giờ UTC+7 cố định cho người sinh trước năm 1975 ở miền Nam (vốn áp dụng UTC+8). Bài viết cung cấp code hàm hiệu chỉnh tự động.</p>`,
    },
    {
      title: 'Thuật toán tính Tiết Khí thiên văn học dựa trên mô hình VSOP87 của NASA',
      catIdx: 4,
      tags: ['Thiên Văn Học', 'Tiết Khí', 'NASA', 'VSOP87'],
      summary: 'Cách tính góc kinh độ mặt trời (Solar Longitude) để xác định chính xác thời điểm bước sang tháng âm lịch mới.',
      content: `<p>Thay vì dựa vào bảng tính sẵn sai số, thuật toán sử dụng chuỗi giải tích hành tinh VSOP87 để tính góc mặt trời với độ chính xác đến từng mili-giây.</p>`,
    },
    {
      title: 'Kiến trúc Microservices cho hệ thống xử lý 10,000 yêu cầu lập lá số đồng thời',
      catIdx: 4,
      tags: ['Microservices', 'Hiệu Năng', 'Go', 'Docker'],
      summary: 'Tối ưu hóa bộ nhớ đệm (Redis Cache) và Worker pool giúp giảm thời gian phản hồi API xuống dưới 5ms.',
      content: `<p>Chia sẻ kiến trúc phân tán phục vụ hàng triệu người dùng trong dịp Tết Nguyên Đán mà không bị sập máy chủ.</p>`,
    },
    {
      title: 'Chuyển đổi dữ liệu lá số sang định dạng SVG đồ họa vector sắc nét',
      catIdx: 4,
      tags: ['SVG', 'Đồ Họa Vector', 'Frontend', 'Lập Lá Số'],
      summary: 'Thư viện vẽ 12 cung bàn tử vi bằng SVG tương thích trên mọi kích thước màn hình điện thoại và máy tính.',
      content: `<p>Giải pháp render SVG nhẹ hơn file ảnh PNG gấp 10 lần, cho phép người dùng click trực tiếp vào từng ô sao để đọc chú giải tương tác.</p>`,
    },
    {
      title: 'Xây dựng RESTful API chuẩn OpenAPI 3.0 cho dịch vụ tử vi đẩu số',
      catIdx: 4,
      tags: ['RESTful API', 'OpenAPI', 'Swagger', 'Backend'],
      summary: 'Đặc tả chi tiết các endpoint: /api/laso, /api/daivan, /api/luunien kèm schema kiểm thực Zod.',
      content: `<p>Cung cấp tài liệu API chuẩn chỉ giúp các nhà phát triển ứng dụng di động dễ dàng tích hợp tính năng xem tử vi vào app của họ.</p>`,
    },
    {
      title: 'Kỹ thuật tối ưu hóa chỉ mục SQL cho bảng Documents chứa hàng triệu bài viết',
      catIdx: 4,
      tags: ['PostgreSQL', 'Indexing', 'Tối Ưu Hóa', 'SQL'],
      summary: 'Sử dụng chỉ mục GIN và B-Tree kết hợp để tăng tốc độ truy vấn phân trang và lọc theo tag.',
      content: `<p>Phân tích câu lệnh EXPLAIN ANALYZE và cách biến truy vấn mất 800ms thành truy vấn chỉ mất 4ms trong PostgreSQL 16.</p>`,
    },
    {
      title: 'Thuật toán an sao Tứ Hóa: Tranh cãi Can Canh (Canh Dương Vũ Đồng Âm hay Canh Nhật Vũ Đồng Tướng)',
      catIdx: 4,
      tags: ['Tứ Hóa', 'Can Canh', 'Tranh Luận', 'Lịch Sử'],
      summary: 'Tùy chọn cấu hình trong code cho phép người dùng linh hoạt chọn bảng Tứ Hóa theo trường phái của mình.',
      content: `<p>Cách thiết kế hệ thống cởi mở với Configuration Flag, tránh tranh cãi học thuật gay gắt trong cộng đồng nghiên cứu.</p>`,
    },
    {
      title: 'Tự động hóa kiểm thử Unit Test cho thuật toán lập lá số với 1,000 ca kiểm thử lịch sử',
      catIdx: 4,
      tags: ['Unit Test', 'Jest', 'CI/CD', 'Chất Lượng Code'],
      summary: 'Xây dựng bộ Test Suite kiểm tra tính đúng đắn của việc an sao cho các ngày đặc biệt, năm nhuận và chuyển giao thế kỷ.',
      content: `<p>Quy trình kiểm thử tự động trên GitHub Actions đảm bảo mọi commit mới không làm sai lệch vị trí của bất kỳ ngôi sao nào.</p>`,
    },
    {
      title: 'Lưu trữ và đồng bộ lá số người dùng an toàn với mã hóa đầu cuối (E2EE)',
      catIdx: 4,
      tags: ['Bảo Mật', 'E2EE', 'Mã Hóa', 'Quyền Riêng Tư'],
      summary: 'Bảo vệ thông tin ngày tháng năm sinh của người dùng không bị rò rỉ hoặc khai thác trái phép.',
      content: `<p>Ngày sinh là dữ liệu định danh cá nhân nhạy cảm. Chúng tôi sử dụng chuẩn mã hóa AES-GCM 256-bit để bảo vệ cơ sở dữ liệu trên đám mây.</p>`,
    },
    {
      title: 'Tích hợp WebAssembly (WASM) để chạy engine an sao trực tiếp trên trình duyệt Client-side',
      catIdx: 4,
      tags: ['WebAssembly', 'Rust', 'WASM', 'Client-side'],
      summary: 'Biên dịch mã nguồn Rust/C++ an sao sang WASM giúp ứng dụng chạy offline hoàn toàn mà không cần mạng internet.',
      content: `<p>Trải nghiệm người dùng đạt tốc độ tức thì (0ms latency), giảm tải 100% chi phí tính toán cho máy chủ backend.</p>`,
    },
  ];

  // 4. Danh sách bài viết mẫu thực tế (Ưu tiên nạp từ sample_documents.json để đồng bộ 103 bài với Python Search Engine)
  const sampleDataPath = path.join(__dirname, '../../search_engine/data/sample_documents.json');
  let loadedArticles = articles;

  if (fs.existsSync(sampleDataPath)) {
    try {
      const raw = fs.readFileSync(sampleDataPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        loadedArticles = parsed.map((item: any) => ({
          title: item.title,
          catIdx: (item.category_id ? item.category_id - 1 : 0) % categories.length,
          tags: item.tags || [],
          summary: item.summary || '',
          content: item.content || `<p>${item.summary}</p>`,
        }));
      }
    } catch (e) {
      console.warn('Không đọc được sample_documents.json, dùng danh sách mặc định:', e);
    }
  }

  console.log(`📝 Đang nạp ${loadedArticles.length} bài viết thực tế chuyên sâu...`);

  const createdDocs = [];
  for (let i = 0; i < loadedArticles.length; i++) {
    const art = loadedArticles[i];
    const author = authors[i % authors.length];
    const category = categories[art.catIdx % categories.length];

    // plain_text stripped from HTML
    const plain_text = art.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

    // Randomize some views and likes
    const views_count = 50 + Math.floor(Math.random() * 850);
    const likes_count = 5 + Math.floor(Math.random() * 95);

    const doc = await prisma.document.create({
      data: {
        title: art.title,
        summary: art.summary,
        content: art.content,
        plain_text: `${art.title}. ${art.summary}. ${plain_text}`,
        category_id: category.id,
        tags: art.tags,
        author_id: author.id,
        views_count,
        likes_count,
        status: DocumentStatus.PUBLISHED,
        meta_title: art.title + ' | AstroAI Forum',
        meta_description: art.summary,
        meta_keywords: art.tags.join(', ') + ', AI, Tử Vi, Luận giải lá số',
        created_at: new Date(Date.now() - (loadedArticles.length - i) * 3600000 * 4), // Trải đều thời gian
      },
    });

    createdDocs.push(doc);
  }

  // 5. Thêm bình luận mẫu phong phú, sinh động
  console.log('💬 Đang nạp 50 bình luận thảo luận...');
  const sampleComments = [
    'Bài phân tích quá xuất sắc! Mình đã thử prompt này trên Claude 3.5 và kết quả rất bất ngờ, không còn bị hallucination các sao ảo.',
    'Cách tiếp cận dùng đồ thị tri thức để giải quyết bài toán Tam Hợp rất sáng tạo, cảm ơn tác giả đã chia sẻ.',
    'Cho mình hỏi nếu sao Cự Môn gặp Triệt thì prompt có cần điều chỉnh thêm ngữ cảnh phản vi kỳ cách không ạ?',
    'Rất thích góc nhìn khoa học và bài trừ mê tín của diễn đàn AstroAI. Đây là hướng đi chuẩn cho việc số hóa cổ học.',
    'Mình đã kiểm chứng trên lá số của bản thân, xác suất hạn công danh đúng đến kinh ngạc.',
    'Mong nhóm ra thêm bài về cách huấn luyện RAG đối với các bản dịch chữ Nôm cổ.',
    'Thuật toán Hybrid Search kết hợp BM25 và TF-IDF chạy mượt quá, trả kết quả chỉ trong vài mili-giây.',
    'Sao Thiên Cơ ngộ Hóa Khoa đúng thật là tư duy logic cực nhanh, rất hợp với ngành Data Science.',
    'Một bài viết rất có chiều sâu học thuật, xứng đáng được đưa lên mục nổi bật.',
    'Mình thấy cách xử lý múi giờ lịch sử rất quan trọng, nhiều app hiện nay an sai cung giờ vì bỏ qua điều này.',
    'Cho hỏi thư viện này có hỗ trợ xuất ra đồ hình lá số SVG dạng vector không bạn?',
    'Cảm ơn admin và ban biên tập đã phát triển một diễn đàn nghiên cứu chất lượng cao như thế này.',
  ];

  for (let i = 0; i < 50; i++) {
    const doc = createdDocs[i % createdDocs.length];
    const user = authors[(i + 1) % authors.length];
    const commentContent = sampleComments[i % sampleComments.length];

    await prisma.comment.create({
      data: {
        document_id: doc.id,
        user_id: user.id,
        content: commentContent,
        status: 'APPROVED',
        created_at: new Date(Date.now() - i * 1800000),
      },
    });
  }

  // 6. Nạp Search & Click Logs đa dạng phục vụ Phase 2 & SEO Specialist
  console.log('📊 Đang nạp Search & Click Logs phong phú...');
  const searchQueries = [
    { q: 'Cung Mệnh', docIdx: 15, count: 18, clicks: 14 },
    { q: 'Claude 3.5 prompt', docIdx: 15, count: 12, clicks: 10 },
    { q: 'BM25 Tử Vi', docIdx: 0, count: 15, clicks: 11 },
    { q: 'Hybrid search', docIdx: 45, count: 20, clicks: 18 },
    { q: 'DeepSeek R1', docIdx: 46, count: 14, clicks: 11 },
    { q: 'RAG sách cổ', docIdx: 26, count: 9, clicks: 6 },
    { q: 'Thuật toán an sao', docIdx: 36, count: 11, clicks: 8 },
    { q: 'Hóa Lộc Địa Không', docIdx: 16, count: 8, clicks: 5 },
    { q: 'Lưu Niên 2026', docIdx: 22, count: 7, clicks: 4 },
    { q: 'Chính tinh embedding', docIdx: 0, count: 10, clicks: 7 },
    { q: 'Cung Phu Thê', docIdx: 18, count: 16, clicks: 13 },
    { q: 'Giờ sinh âm dương', docIdx: 7, count: 6, clicks: 4 },
    { q: 'Steve Jobs lá số', docIdx: 32, count: 13, clicks: 11 },
    { q: 'Vô Chính Diệu', docIdx: 40, count: 10, clicks: 8 },
    { q: 'Đại Hạn 10 năm', docIdx: 1, count: 9, clicks: 6 },
  ];

  for (const item of searchQueries) {
    const doc = createdDocs[item.docIdx % createdDocs.length];
    for (let s = 0; s < item.count; s++) {
      const isClicked = s < item.clicks;
      const user = authors[s % authors.length];
      await prisma.searchClickLog.create({
        data: {
          query_string: item.q,
          user_id: user.id,
          clicked_doc_id: isClicked ? doc.id : null,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 3)),
        },
      });
    }
  }

  console.log('✅ Đã nạp thành công:');
  console.log(`   - ${authors.length} Tài khoản mẫu cho các vai trò (Mật khẩu: Password123@)`);
  console.log(`   - ${categories.length} Chuyên mục đầy đủ`);
  console.log(`   - ${createdDocs.length} Bài viết chi tiết (Không có Lorem Ipsum)`);
  console.log(`   - 50 Bình luận mẫu phong phú`);
  console.log(`   - Hơn 150 sự kiện Search & Click Logs cho SEO Specialist`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi nạp seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
