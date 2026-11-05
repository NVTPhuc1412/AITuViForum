# AstroAI Forum — Tổng quan & Tóm tắt dự án

> Bài tập lớn môn Search Engine: xây dựng một diễn đàn full-stack (chủ đề AI & Tử Vi Đẩu Số) có Document Data Store, RBAC 4+1 vai trò, Search/Click Logging, và một Search Engine riêng viết bằng Python triển khai Inverted Index + BM25/TF-IDF/Hybrid ranking từ đầu (không dùng Elasticsearch/Lucene có sẵn).

## 1. Mục tiêu dự án

Minh họa toàn bộ vòng đời của một hệ thống tìm kiếm trong một ứng dụng web thực tế:

- Lưu trữ tài liệu (Document Store) có cấu trúc, phân loại, gắn thẻ.
- Xây dựng chỉ mục ngược (Inverted Index) và các thuật toán xếp hạng truy vấn kinh điển (BM25, TF-IDF) cùng một chiến lược kết hợp (Hybrid).
- Ghi nhận hành vi tìm kiếm/click của người dùng để phục vụ phân tích (CTR, từ khóa phổ biến).
- Áp dụng kiểm soát truy cập theo vai trò (RBAC) cho một hệ thống quản trị nội dung nhiều cấp.

## 2. Kiến trúc hệ thống

Mô hình Service-Oriented Architecture (SOA) với 3 service độc lập + 1 database:

```
assignment-searchengine/
├── backend/        Node.js + Express + Prisma ORM   (REST API,  cổng 5000)
├── search_engine/  Python 3.11 + FastAPI             (Search service, cổng 8000)
├── frontend/       React 18 + Vite + TypeScript + Tailwind CSS (cổng 5173)
└── docker-compose.yml   PostgreSQL 16 (cổng 5432)
```

- **Backend** là nguồn sự thật (source of truth) cho dữ liệu: user, document, comment, log. Expose REST API cho frontend và cho search_engine đọc dữ liệu để lập chỉ mục.
- **Search Engine** là một service Python độc lập, không chạm trực tiếp vào DB — nó kéo danh sách document từ Backend API (`GET /api/documents`) để build Inverted Index trong RAM, rồi phục vụ truy vấn `/search` theo BM25/TF-IDF/Hybrid.
- **Frontend** gọi cả hai backend (Node cho CRUD/RBAC/log, Python cho search) và tổng hợp kết quả trên UI.

## 3. Mô hình dữ liệu (Prisma / PostgreSQL)

| Model | Vai trò chính | Field đáng chú ý |
| --- | --- | --- |
| `User` | Tài khoản, phân quyền | `role` (enum `Role`: SUPER_ADMIN, CONTENT_MANAGER, MODERATOR, SEO_SPECIALIST, USER) |
| `Category` | Chuyên mục bài viết | `slug` duy nhất |
| `Document` | Bài viết/tài liệu | `status` (PUBLISHED/DRAFT/UNPUBLISHED/FLAGGED), `tags[]`, `meta_title/description/keywords` (dành cho SEO), `views_count`, `likes_count` |
| `Comment` | Bình luận dưới bài viết | `status` (APPROVED/PENDING/FLAGGED) |
| `SearchClickLog` | Nhật ký truy vấn & click | `query_string`, `clicked_doc_id` (nullable — ghi cả khi chỉ search mà không click) |

Index đã khai báo trên `Document` (`category_id`, `author_id`, `status`, `created_at`) và `SearchClickLog` (`query_string`, `timestamp`) để phục vụ filter/log analytics.

## 4. Backend API (Node.js/Express, mount tại `/api`)

| Route prefix | Endpoint chính | Quyền |
| --- | --- | --- |
| `/api/auth` | `POST /register`, `POST /login`, `GET /profile`, `PUT /profile` | Public / cần login |
| `/api/documents` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`, `POST /:id/like`, `GET /:id/comments`, `POST /:id/comments`, `DELETE /comments/:commentId`, `GET /meta/categories`, `GET /meta/tags` | Public đọc, cần login để tạo/sửa/xoá |
| `/api/logs` | `POST /search-click`, `GET /` (list), `GET /analytics` | Ghi log public; xem log/analytics chỉ SUPER_ADMIN & SEO_SPECIALIST |
| `/api/admin` | `GET /users`, `PUT /users/:userId/role`, `GET /stats`, `GET /documents`, `PUT /documents/:id/status`, `GET /comments`, `PUT /comments/:commentId/status`, `PUT /seo/:docId` | Theo từng vai trò RBAC tương ứng (middleware `requireRoles`) |

RBAC được áp bằng middleware `requireAuth` (xác thực JWT) + `requireRoles(...)` (whitelist role) trong `backend/src/middleware/auth.ts`.

## 5. Search Engine (Python/FastAPI, `search_engine/`)

Thành phần (`search_engine/core/`):

- `tokenizer.py` — `VietnameseTokenizer`: tách từ tiếng Việt, nhận diện cụm từ chuyên ngành ("Cung Mệnh", "Tử Vi", "Hóa Lộc", "Prompt Engineering"...), lọc stopword.
- `inverted_index.py` — cấu trúc Inverted Index (posting list theo token → doc_id, term frequency, document length, average doc length).
- `bm25.py` — `BM25Scorer` (Okapi BM25, k1=1.5, b=0.75), `TFIDFScorer` (sublinear TF × IDF), `HybridScorer` (kết hợp điểm chuẩn hóa Min-Max của hai scorer trên theo trọng số α).
- `engine.py` — `SearchEngine`: nạp dữ liệu (`rebuild_index_from_backend`, có fallback sang `data/sample_documents.json` khi backend thật sự không gọi được), thực hiện `search()` trả về kết quả đã rank kèm snippet, token breakdown (đóng góp IDF/TF từng từ) và các rank so sánh (`bm25_rank`, `tfidf_rank`, `hybrid_rank`).

API (`search_engine/main.py`), chạy ở cổng 8000:

- `GET /health` — trạng thái service, số doc đã index, vocabulary size, avg doc length.
- `POST /index/rebuild` — build lại Inverted Index từ Backend API.
- `GET /search?q=&mode=&limit=&alpha=` — tìm kiếm, `mode` ∈ {`hybrid` (mặc định), `bm25`, `tfidf`}; `alpha` là trọng số BM25 trong Hybrid (0–1).

Công thức Hybrid: `Score_hybrid = α·BM25_norm + (1-α)·TFIDF_norm`.

## 6. Frontend (React 18 + Vite + TypeScript + Tailwind)

- `App.tsx` — điều phối state tìm kiếm/filter/pagination, chuyển đổi giữa 2 nguồn kết quả: DB (PostgreSQL LIKE qua backend) và Python engine (BM25/TF-IDF/Hybrid).
- `components/Navbar.tsx` — thanh tìm kiếm, chọn mode tìm kiếm, đăng nhập demo RBAC.
- `components/ArticleCard.tsx`, `ArticleDetailModal.tsx` — hiển thị bài viết, chi tiết, like, comment.
- `components/CreateArticleModal.tsx` — tạo bài viết mới.
- `components/AdminDashboard.tsx` — portal quản trị theo vai trò (user/role, duyệt bài, kiểm duyệt comment, SEO, thống kê, search analytics).
- `components/AlgorithmVisualizer.tsx` — tab trực quan hóa thuật toán: so sánh điểm Hybrid/BM25/TF-IDF, ma trận biến thiên thứ hạng (rank shift), phân rã trọng số token, thanh trượt chỉnh α theo thời gian thực.
- `components/AstroChart.tsx`, `ForumGuideModal.tsx` — thành phần trang trí/giới thiệu chủ đề và hướng dẫn sử dụng forum.

## 7. Phân quyền RBAC (5 vai trò)

| Vai trò | Phạm vi |
| --- | --- |
| **SUPER_ADMIN** | Toàn quyền: quản lý user/role, xem system stats, toàn bộ chức năng các vai trò khác |
| **CONTENT_MANAGER** | Duyệt bài viết, đổi trạng thái PUBLISHED ↔ UNPUBLISHED |
| **MODERATOR** | Kiểm duyệt comment (approve/flag/xóa spam) |
| **SEO_SPECIALIST** | Chỉnh meta SEO bài viết, xem search analytics/CTR |
| **USER** | Đăng bài, like, comment |

## 8. Luồng ghi log tìm kiếm

Mỗi lần người dùng gửi query, frontend gọi `POST /api/logs/search-click` để ghi `query_string` vào `search_click_logs`; khi click vào một kết quả, cùng endpoint được gọi lại kèm `clicked_doc_id`. Dữ liệu này phục vụ tính Click-Through Rate và từ khóa phổ biến ở trang SEO Specialist (`GET /api/logs/analytics`).

## 9. Chạy dự án (tóm tắt — chi tiết xem `README.md`)

1. `docker compose up -d` — khởi động PostgreSQL 16.
2. `cd backend && npm install && npm run prisma:push && npm run prisma:seed && npm run dev` — API tại `:5000`.
3. `cd search_engine && pip install -r requirements.txt && python main.py` — search service tại `:8000`.
4. `cd frontend && npm install && npm run dev` — UI tại `:5173`.

## 10. Trạng thái hiện tại (ghi chú ngữ cảnh)

- Repo vẫn còn một lượng lớn thay đổi working-tree chưa commit từ phiên làm việc trước (seed.ts mở rộng lên 103 bài, các component frontend mới, chỉnh sửa controllers...), song song với một commit riêng đã chốt các bản fix logic cho `search_engine/core/engine.py` và `frontend/src/App.tsx` (hybrid rank thật, fallback dữ liệu mẫu chỉ khi backend lỗi thật, token breakdown đúng theo mode, tab Visualizer trigger search thật, xoá kết quả Python cũ khi đổi sang mode DB).
- Danh sách lỗi/cải tiến nhỏ hơn còn tồn đọng (chưa fix): trùng lặp logic kiểm tra role trong `comment.controller.ts`/`document.controller.ts`, seed script dùng insert tuần tự thay vì batch, mỗi request search luôn tính cả BM25 và TF-IDF dù chỉ cần 1, badge điểm số ẩn sai khi score = 0, sai tên class Tailwind `animate-fadeIn` (đúng là `animate-fade-in`).
