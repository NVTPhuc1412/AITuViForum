# 🔮 AstroAI Forum - Diễn đàn AI & Số hóa Tử Vi Đẩu Số

> **Dự án Bài tập lớn Search Engine:** Full-Stack Web Application kết hợp Document Data Store, RBAC 4 vai trò, Search & Click Logging và Công cụ xếp hạng tìm kiếm BM25/TF-IDF bằng Python.

---

## 🌟 1. Tổng quan Kiến trúc

Dự án được xây dựng theo mô hình **Service-Oriented Architecture (SOA)** gồm 3 thành phần chính:

```
assignment-searchengine/
├── backend/               # Node.js + Express + Prisma ORM (Port 5000)
│   ├── prisma/            # PostgreSQL Schema & Realistic Seed Script (65 bài)
│   └── src/               # RESTful API: Auth, Documents, Comments, RBAC, Logs
├── search_engine/         # Python 3.11 + FastAPI Service (Port 8000)
│   ├── core/              # Vietnamese Tokenizer, Inverted Index, BM25, TF-IDF
│   └── main.py            # Search Engine Endpoints & Index Builder
├── frontend/              # React 18 + Vite + TypeScript + Tailwind CSS (Port 5173)
│   └── src/               # Responsive Client UI, RBAC Admin Portal, Search Mode Switcher
└── docker-compose.yml     # PostgreSQL 16 Container (Port 5432)
```

---

## 🚀 2. Hướng dẫn Khởi chạy Hệ thống

### Bước 1: Khởi động Cơ sở dữ liệu PostgreSQL
Yêu cầu đã cài Docker Desktop:
```powershell
docker compose up -d
```
*(Cơ sở dữ liệu PostgreSQL 16 sẽ lắng nghe tại cổng `5432`)*

---

### Bước 2: Khởi động Backend (Node.js / Express)
Mở terminal thứ nhất:
```powershell
cd backend
npm.cmd install
npm.cmd run prisma:push     # Đồng bộ bảng dữ liệu vào PostgreSQL
npm.cmd run prisma:seed     # Nạp 65 bài viết thực tế về AI & Tử Vi
npm.cmd run dev             # Khởi chạy Backend tại http://localhost:5000
```

---

### Bước 3: Khởi động Python Search Engine (FastAPI / BM25)
Mở terminal thứ hai:
```powershell
cd search_engine
python -m pip install -r requirements.txt
python main.py              # Khởi chạy Python Search Engine tại http://localhost:8000
```
> Hoặc chạy script kiểm thử độc lập thuật toán BM25:
> ```powershell
> python test_search.py
> ```

---

### Bước 4: Khởi động Frontend (React / Vite)
Mở terminal thứ ba:
```powershell
cd frontend
npm.cmd install
npm.cmd run dev             # Khởi chạy giao diện tại http://localhost:5173
```
Truy cập trình duyệt tại: **`http://localhost:5173`**

---

## 🛡️ 3. Danh sách Tài khoản Kiểm thử Phân quyền (RBAC)

Hệ thống có sẵn nút **"Đăng nhập Demo (RBAC)"** trên thanh Navbar để chuyển đổi 1-click giữa các vai trò, hoặc đăng nhập thủ công bằng thông tin sau (mật khẩu chung: `Password123@`):

| Vai trò (Role) | Email | Mật khẩu | Trách nhiệm kiểm thử trong hệ thống |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@astroai.vn` | `Password123@` | Toàn quyền: Xem danh sách user, cấp phát/đổi role, xem system stats. |
| **Content Manager** | `content@astroai.vn` | `Password123@` | Duyệt bài viết, chuyển trạng thái `PUBLISHED` <-> `UNPUBLISHED`. |
| **Moderator** | `moderator@astroai.vn` | `Password123@` | Kiểm duyệt bình luận, xóa spam, gắn cờ bài viết vi phạm. |
| **Data & SEO Specialist** | `seo@astroai.vn` | `Password123@` | Chỉnh sửa thẻ Meta SEO bài viết, xem biểu đồ từ khóa & CTR từ `search_click_logs`. |
| **Member (User)** | `user@astroai.vn` | `Password123@` | Đăng bài viết mới, thả tim, gửi bình luận thảo luận. |

---

## ⚡ 4. Tính năng Search Engine & So sánh Đối chiếu (Phase 1 vs Phase 2)

Trên thanh tìm kiếm ở đầu trang, người dùng có thể chuyển đổi linh hoạt giữa 3 chế độ tìm kiếm:

1. **⚡ BM25 (Python Engine):**
   - Bộ tách từ **Vietnamese Tokenizer** nhận diện các cụm từ chuyên môn: *"Cung Mệnh"*, *"Tử Vi"*, *"Hóa Lộc"*, *"Prompt Engineering"*, *"Chain of Thought"*.
   - Chỉ mục ngược (**Inverted Index**) tra cứu posting lists.
   - Thuật toán **Okapi BM25** xếp hạng tài liệu theo độ liên quan, hiển thị trực quan **BM25 Score** trên từng thẻ bài viết.
2. **📈 TF-IDF (Python Engine):**
   - Thuật toán xếp hạng dựa trên trọng số tần suất từ và nghịch đảo tần suất tài liệu.
3. **🔍 SQL (PostgreSQL):**
   - Truy vấn LIKE / Case-insensitive trên các cột `title`, `summary`, `plain_text`.

### Ghi nhận Nhật ký Tìm kiếm & Tương tác (Search & Click Logs):
- Mỗi lần người dùng tìm kiếm, câu truy vấn `query_string` được tự động ghi vào bảng `search_click_logs`.
- Khi người dùng click vào bất kỳ bài viết nào từ kết quả tìm kiếm, sự kiện click `clicked_doc_id` được ghi nhận lập tức, phục vụ tính tỷ lệ **Click-Through Rate (CTR)** trong trang SEO Specialist.
