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
      bio: 'Biên tập viên trưởng nội dung Information Retrieval & Search Engines.',
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
      bio: 'Sinh viên SEG301, đam mê tìm hiểu kiến trúc Search Engine.',
    },
  });

  const normalUser2 = await prisma.user.create({
    data: {
      email: 'hoang.nam@astroai.vn',
      password_hash: passwordHash,
      name: 'Hoàng Hoài Nam',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
      role: Role.USER,
      bio: 'Thực tập sinh NLP, quan tâm đến Text Processing và Ranking.',
    },
  });

  const normalUser3 = await prisma.user.create({
    data: {
      email: 'dang.dung@astroai.vn',
      password_hash: passwordHash,
      name: 'Đặng Thùy Dung',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      role: Role.USER,
      bio: 'Chuyên gia Phân tích Dữ liệu, quan tâm đến Evaluation & SEO.',
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

  // 3. Tạo các Danh mục (Categories) — theo cấu trúc môn SEG301 (Search Engines)
  const categoriesData = [
    {
      name: 'Nền tảng Truy hồi Thông tin',
      slug: 'nen-tang-truy-hoi-thong-tin',
      description: 'Định nghĩa Information Retrieval, lịch sử Search Engine và tổng quan kiến trúc một hệ thống tìm kiếm hiện đại.',
    },
    {
      name: 'Kiến trúc & Thu thập Dữ liệu',
      slug: 'kien-truc-thu-thap-du-lieu',
      description: 'Các thành phần của một Search Engine, Web Crawler, Politeness Policy, Document Feeds và xử lý dữ liệu thô.',
    },
    {
      name: 'Xử lý Văn bản & Lập Chỉ mục',
      slug: 'xu-ly-van-ban-lap-chi-muc',
      description: 'Tokenization, Stemming, Zipf/Heap Law, Inverted Index, PageRank và các kỹ thuật lập chỉ mục, nén dữ liệu.',
    },
    {
      name: 'Truy vấn & Mô hình Truy hồi',
      slug: 'truy-van-mo-hinh-truy-hoi',
      description: 'Query Processing, Spell Checking, Query Expansion, Boolean/Vector Space Model, BM25 và Learning to Rank.',
    },
    {
      name: 'Đánh giá & Tối ưu Công cụ Tìm kiếm',
      slug: 'danh-gia-toi-uu-cong-cu-tim-kiem',
      description: 'SEO (On-Page/Off-Page/Technical), Precision/Recall, MAP, NDCG và các phương pháp đánh giá Search Engine.',
    },
    {
      name: 'Phân loại, Tìm kiếm Xã hội & Chủ đề Nâng cao',
      slug: 'phan-loai-tim-kiem-xa-hoi-nang-cao',
      description: 'Classification, Clustering, Social Search, Collaborative Filtering và các kỹ thuật ngoài Bag-of-Words.',
    },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const c = await prisma.category.create({ data: cat });
    categories.push(c);
  }

  // 4. Fallback nếu chưa chạy generate_dataset.py (không dùng khi sample_documents.json đã có)
  const articles: { title: string; catIdx: number; tags: string[]; summary: string; content: string }[] = [];

  // 4. Danh sách bài viết mẫu thực tế (Ưu tiên nạp từ sample_documents.json để đồng bộ với Python Search Engine)
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
        tags: JSON.stringify(art.tags),
        author_id: author.id,
        views_count,
        likes_count,
        status: DocumentStatus.PUBLISHED,
        meta_title: art.title + ' | AstroAI Forum',
        meta_description: art.summary,
        meta_keywords: art.tags.join(', ') + ', SEG301, Information Retrieval, Search Engine',
        created_at: new Date(Date.now() - (loadedArticles.length - i) * 3600000 * 4), // Trải đều thời gian
      },
    });

    createdDocs.push(doc);
  }

  // 5. Thêm bình luận mẫu phong phú, sinh động
  console.log('💬 Đang nạp 50 bình luận thảo luận...');
  const sampleComments = [
    'Bài phân tích quá chi tiết! Mình học SEG301 kỳ này nên đọc bài này đúng lúc cần ôn lại BM25 và Vector Space Model.',
    'Cách giải thích Inverted Index kèm ví dụ posting list rất dễ hiểu, cảm ơn tác giả đã chia sẻ.',
    'Cho mình hỏi nếu dùng Porter Stemmer thì có cần xử lý stopword trước hay sau bước stemming ạ?',
    'Rất thích góc nhìn thực tế khi so sánh TF-IDF với BM25, giúp mình hiểu rõ hơn vì sao BM25 được dùng phổ biến hơn.',
    'Mình đã thử cài Inverted Index theo bài viết này, chạy đúng như mô tả, rất chi tiết.',
    'Mong nhóm ra thêm bài về cách tune tham số k1 và b trong công thức BM25.',
    'Thuật toán PageRank giải thích bằng ví dụ random surfer dễ hiểu hơn nhiều so với slide trên lớp.',
    'Phần so sánh Precision/Recall với NDCG đúng thứ mình đang bí trong bài tập lớn, cảm ơn nhiều!',
    'Một bài viết rất có chiều sâu học thuật, xứng đáng được đưa lên mục nổi bật.',
    'Mình thấy phần Crawler Politeness Policy rất quan trọng, nhiều sinh viên hay bỏ qua khi làm đồ án.',
    'Cho hỏi bài viết có ví dụ code Python minh họa Inverted Index không bạn?',
    'Cảm ơn admin và ban biên tập đã tổng hợp nội dung SEG301 thành các bài viết dễ đọc như thế này.',
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
    { q: 'Information Retrieval', docIdx: 0, count: 18, clicks: 14 },
    { q: 'Inverted Index', docIdx: 180, count: 12, clicks: 10 },
    { q: 'BM25', docIdx: 181, count: 15, clicks: 11 },
    { q: 'Hybrid search', docIdx: 270, count: 20, clicks: 18 },
    { q: 'PageRank', docIdx: 182, count: 14, clicks: 11 },
    { q: 'Web Crawler', docIdx: 91, count: 9, clicks: 6 },
    { q: 'Query Expansion', docIdx: 271, count: 11, clicks: 8 },
    { q: 'Precision Recall', docIdx: 362, count: 8, clicks: 5 },
    { q: 'SEO on-page', docIdx: 363, count: 7, clicks: 4 },
    { q: 'Vector Space Model', docIdx: 272, count: 10, clicks: 7 },
    { q: 'TF-IDF', docIdx: 183, count: 16, clicks: 13 },
    { q: 'Politeness Policy', docIdx: 92, count: 6, clicks: 4 },
    { q: 'NDCG', docIdx: 364, count: 13, clicks: 11 },
    { q: 'Clustering K-means', docIdx: 457, count: 10, clicks: 8 },
    { q: 'Social search', docIdx: 458, count: 9, clicks: 6 },
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
