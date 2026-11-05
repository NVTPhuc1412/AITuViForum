import React, { useState, useEffect } from 'react';
import {
  User,
  DocumentItem,
  Category,
  PythonSearchResult,
  SearchMode,
} from './types';
import { api, getStoredUser, setStoredToken, setStoredUser } from './api/client';
import { Navbar } from './components/Navbar';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { AdminDashboard } from './components/AdminDashboard';
import { QuickLoginModal } from './components/QuickLoginModal';
import { CreateArticleModal } from './components/CreateArticleModal';
import { AstroChart } from './components/AstroChart';
import { ForumGuideModal } from './components/ForumGuideModal';
import { AlgorithmVisualizer } from './components/AlgorithmVisualizer';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Tag,
  Info,
  BookOpen,
  Layers,
  ShieldCheck,
  LayoutGrid,
  BarChart3,
} from 'lucide-react';

export const App: React.FC = () => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  // View mode: Articles Feed or Algorithm Visualizer
  const [viewMode, setViewMode] = useState<'feed' | 'visualizer'>('feed');

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularTags, setPopularTags] = useState<{ tag: string; count: number }[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [pythonResults, setPythonResults] = useState<PythonSearchResult[]>([]);
  const [searchTokens, setSearchTokens] = useState<string[]>([]);
  const [executionTimeMs, setExecutionTimeMs] = useState(4.2);
  const [loading, setLoading] = useState(false);

  // Filter & Search states - HYBRID IS DEFAULT
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('hybrid');
  const [hybridAlpha, setHybridAlpha] = useState(0.65);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  // Initial load
  useEffect(() => {
    loadMetadata();
  }, []);

  // Fetch when filters or page change
  useEffect(() => {
    if (searchMode === 'db' || !searchQuery.trim()) {
      loadDocuments();
      if (searchMode === 'db') {
        // Dữ liệu Python engine (BM25/TF-IDF/Hybrid) không còn hợp lệ khi đang ở mode DB
        setPythonResults([]);
        setSearchTokens([]);
      }
    } else {
      executePythonSearch();
    }
  }, [page, selectedCategory, selectedTag, fromDate, toDate, searchMode, hybridAlpha]);

  const loadMetadata = async () => {
    try {
      const [resCats, resTags] = await Promise.all([
        api.getCategories(),
        api.getPopularTags(),
      ]);
      if (resCats.success) setCategories(resCats.data);
      if (resTags.success) setPopularTags(resTags.data);
    } catch (err) {
      console.error('Lỗi tải metadata:', err);
    }
  };

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.getDocuments({
        page,
        limit: 9,
        category_id: selectedCategory || undefined,
        tag: selectedTag || undefined,
        search: searchQuery.trim() || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      });

      if (res.success) {
        setDocuments(res.data.documents);
        setTotalPages(res.data.pagination.totalPages);
        setTotalCount(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách bài viết:', err);
    } finally {
      setLoading(false);
    }
  };

  const executePythonSearch = async (queryOverride?: string) => {
    const activeQuery = (queryOverride ?? searchQuery).trim();
    if (!activeQuery) {
      loadDocuments();
      return;
    }

    setLoading(true);
    try {
      const pythonMode = searchMode === 'db' ? 'hybrid' : searchMode;
      const res = await api.pythonSearch(activeQuery, pythonMode, 15, hybridAlpha);
      if (res.success) {
        setPythonResults(res.data.results);
        setSearchTokens(res.data.tokens);
        setTotalCount(res.data.total_results);
        if (res.data.execution_time_ms !== undefined) {
          setExecutionTimeMs(res.data.execution_time_ms);
        }
      }
    } catch (err) {
      console.warn('Python Search Engine offline hoặc lỗi, fallback sang DB search:', err);
      // Fallback
      loadDocuments();
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);

    // Record search log in database
    if (searchQuery.trim()) {
      api.recordSearchClick(searchQuery.trim());
    }

    if (searchMode === 'db' || !searchQuery.trim()) {
      loadDocuments();
    } else {
      executePythonSearch();
    }
  };

  const handleArticleClick = (docId: number) => {
    // Record click log event in database (Phase 2 Prep)
    if (searchQuery.trim()) {
      api.recordSearchClick(searchQuery.trim(), docId);
    }
    setSelectedDocId(docId);
  };

  const handleLogout = () => {
    setStoredToken(null);
    setStoredUser(null);
    setCurrentUser(null);
    setIsAdminView(false);
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setFromDate('');
    setToDate('');
    setSearchQuery('');
    setPage(1);
    setPythonResults([]);
    loadDocuments();
  };

  const modeLabel = {
    hybrid: 'Thuật toán lai Hybrid (BM25 + TF-IDF) tối ưu nhất',
    bm25: 'Python Okapi BM25 — tách từ chuyên ngành',
    tfidf: 'Python TF-IDF Ranking Engine',
    db: 'PostgreSQL LIKE Query chuẩn',
  }[searchMode];

  const modeColor = {
    hybrid: 'bg-lacquer',
    bm25: 'bg-brass',
    tfidf: 'bg-jade',
    db: 'bg-parchment-muted',
  }[searchMode];

  return (
    <div className="min-h-screen bg-night-950 text-parchment flex flex-col">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        searchMode={searchMode}
        onSearchModeChange={(mode) => {
          setSearchMode(mode);
          setPage(1);
        }}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onOpenAdmin={() => setIsAdminView(true)}
        isAdminView={isAdminView}
        onToggleAdminView={() => setIsAdminView(!isAdminView)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isAdminView && currentUser ? (
          <AdminDashboard
            currentUser={currentUser}
            onSelectDoc={(id) => setSelectedDocId(id)}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
            {/* Hero */}
            <div className="relative bg-chart-grid border-b border-night-line pb-10 sm:pb-14">
              <div className="flex items-start justify-between gap-10">
                <div className="max-w-xl space-y-5">
                  <p className="font-serif italic text-brass text-sm">Diễn đàn nghiên cứu Tử Vi Đẩu Số</p>
                  <h1 className="font-serif text-3xl sm:text-5xl font-medium leading-[1.1]">
                    <span className="block text-parchment">Trí tuệ nhân tạo gặp</span>
                    <span className="block text-brass">tinh hoa chiêm tinh phương Đông</span>
                  </h1>
                  <p className="text-sm text-parchment-muted leading-relaxed max-w-md">
                    Nơi khoa học dữ liệu hiện đại — LLM, Prompting, BM25, RAG — soi lại lá số, cung mệnh và
                    những quy tắc đã được truyền qua nhiều thế kỷ.
                  </p>

                  <div className="flex items-center gap-2 text-xs text-parchment-dim pt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${modeColor}`} />
                    <span>Đang tìm kiếm bằng {modeLabel}</span>
                  </div>

                  <div className="pt-2 flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsGuideModalOpen(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brass/15 hover:bg-brass/25 border border-brass/40 text-brass-light text-xs font-semibold rounded transition shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-brass" />
                      <span>📖 Cẩm nang Forum: Thành phần cốt lõi & Cách quản lý</span>
                    </button>
                  </div>
                </div>

                <div className="hidden lg:block text-brass/25 shrink-0 pt-1">
                  <AstroChart size={200} animated />
                </div>
              </div>
            </div>

            {/* Forum Architecture & Management Knowledge Section */}
            <section className="bg-night-900 border border-night-line rounded-lg p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-night-line">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-brass/10 border border-brass/30 flex items-center justify-center text-brass">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-parchment flex items-center gap-2">
                      <span>I. Những thành phần cần có của một Forum</span>
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-night-800 text-brass border border-brass/30">
                        Chuẩn Diễn đàn Trực tuyến
                      </span>
                    </h3>
                    <p className="text-xs text-parchment-dim">
                      Một diễn đàn trực tuyến chuẩn cần được cấu trúc rõ ràng để người dùng dễ dàng thảo luận và tìm kiếm thông tin:
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGuideModalOpen(true)}
                  className="text-xs font-semibold text-brass hover:text-brass-light flex items-center gap-1.5 px-3 py-1.5 rounded bg-brass/10 hover:bg-brass/20 border border-brass/30 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-brass" />
                  <span>II. Xem Cách quản lý Forum hiệu quả →</span>
                </button>
              </div>

              {/* 6 Key Components Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* 1. Categories & Boards */}
                <div className="bg-night-850 p-3.5 rounded border border-night-line space-y-1.5 hover:border-brass/40 transition">
                  <div className="text-xs font-semibold text-brass-light flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brass"></span>
                    <span>Hệ thống Danh mục và Chủ đề (Categories & Boards)</span>
                  </div>
                  <p className="text-[11px] text-parchment-muted leading-relaxed">
                    Phân chia các chuyên mục lớn nhỏ khác nhau (ví dụ: Quy định chung, Thảo luận chung, Góc học tập, Giải trí, Mua bán...). Giống như việc sắp xếp các phòng trong một ngôi nhà vậy đó bạn.
                  </p>
                </div>

                {/* 2. Threads & Posts */}
                <div className="bg-night-850 p-3.5 rounded border border-night-line space-y-1.5 hover:border-jade/40 transition">
                  <div className="text-xs font-semibold text-jade-light flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-jade"></span>
                    <span>Hệ thống Bài viết (Threads & Posts)</span>
                  </div>
                  <div className="text-[11px] text-parchment-muted leading-relaxed space-y-1">
                    <p><strong className="text-parchment">Chủ đề (Thread/Topic):</strong> Nơi người dùng mở ra một vấn đề mới để bàn luận.</p>
                    <p><strong className="text-parchment">Bài phản hồi (Reply/Post):</strong> Các ý kiến đóng góp, trả lời bên dưới chủ đề đó.</p>
                  </div>
                </div>

                {/* 3. Users & Roles */}
                <div className="bg-night-850 p-3.5 rounded border border-night-line space-y-1.5 hover:border-lacquer/40 transition">
                  <div className="text-xs font-semibold text-lacquer-light flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-lacquer"></span>
                    <span>Hệ thống Thành viên và Phân quyền (Users & Roles)</span>
                  </div>
                  <p className="text-[11px] text-parchment-muted leading-relaxed">
                    Quản lý tài khoản đăng ký, đăng nhập, hồ sơ cá nhân (profile), chữ ký và điểm uy tín. Phân quyền rõ ràng: Khách (Guest), Thành viên (Member), Kiểm duyệt viên (Moderator), Quản trị viên (Admin).
                  </p>
                </div>

                {/* 4. Search & Filter */}
                <div className="bg-night-850 p-3.5 rounded border border-night-line space-y-1.5 hover:border-brass/40 transition">
                  <div className="text-xs font-semibold text-brass-light flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brass"></span>
                    <span>Công cụ Tìm kiếm và Lọc (Search & Filter)</span>
                  </div>
                  <p className="text-[11px] text-parchment-muted leading-relaxed">
                    Giúp người dùng tìm nhanh các bài viết cũ, từ khóa, hoặc lọc bài theo độ hot, mới nhất, chưa đọc.
                  </p>
                </div>

                {/* 5. UI/UX */}
                <div className="bg-night-850 p-3.5 rounded border border-night-line space-y-1.5 hover:border-jade/40 transition">
                  <div className="text-xs font-semibold text-jade-light flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-jade"></span>
                    <span>Giao diện và Trải nghiệm (UI/UX)</span>
                  </div>
                  <p className="text-[11px] text-parchment-muted leading-relaxed">
                    Thiết kế trực quan, thân thiện, tương thích tốt trên cả máy tính lẫn điện thoại (responsive).
                  </p>
                </div>

                {/* 6. Notifications & Messaging */}
                <div className="bg-night-850 p-3.5 rounded border border-night-line space-y-1.5 hover:border-lacquer/40 transition">
                  <div className="text-xs font-semibold text-lacquer-light flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-lacquer"></span>
                    <span>Hệ thống Thông báo và Nhắn tin (Notifications & Messaging)</span>
                  </div>
                  <p className="text-[11px] text-parchment-muted leading-relaxed">
                    Thông báo khi có người trả lời bài viết, nhắc tên (tag), hoặc nhắn tin riêng (inbox) giữa các thành viên.
                  </p>
                </div>
              </div>
            </section>

            {/* Filter Bar (Categories, Tags, Date Range) */}
            <div className="space-y-4">
              {/* Category Tabs */}
              <div className="flex items-center gap-5 overflow-x-auto pb-px border-b border-night-line scrollbar-none">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setPage(1);
                  }}
                  className={`pb-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                    selectedCategory === null
                      ? 'border-brass text-brass-light'
                      : 'border-transparent text-parchment-muted hover:text-parchment'
                  }`}
                >
                  Tất cả chuyên mục
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setPage(1);
                    }}
                    className={`pb-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                      selectedCategory === cat.id
                        ? 'border-brass text-brass-light'
                        : 'border-transparent text-parchment-muted hover:text-parchment'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Secondary Filter Row (Date & Popular Tags) */}
              <div className="flex items-center justify-between flex-wrap gap-4 py-3 text-xs text-parchment-muted">
                {/* Date range filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brass" /> Lọc theo ngày
                  </span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(1);
                    }}
                    className="bg-night-800 border border-night-line px-2 py-1 text-parchment focus:outline-none focus:border-brass/50"
                  />
                  <span className="text-parchment-dim">—</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(1);
                    }}
                    className="bg-night-800 border border-night-line px-2 py-1 text-parchment focus:outline-none focus:border-brass/50"
                  />
                </div>

                {/* Popular Tags */}
                <div className="flex items-center gap-x-3 gap-y-1.5 flex-wrap">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-jade" /> Tags thịnh hành
                  </span>
                  {popularTags.slice(0, 6).map((item) => (
                    <button
                      key={item.tag}
                      onClick={() => {
                        setSelectedTag(selectedTag === item.tag ? null : item.tag);
                        setPage(1);
                      }}
                      className={`transition ${
                        selectedTag === item.tag ? 'text-jade-light font-bold' : 'hover:text-parchment'
                      }`}
                    >
                      #{item.tag} ({item.count})
                    </button>
                  ))}
                  {(selectedCategory || selectedTag || fromDate || toDate || searchQuery) && (
                    <button onClick={resetFilters} className="text-lacquer-light hover:underline font-semibold">
                      Xóa lọc
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Token details when in Python Search Mode */}
            {searchMode !== 'db' && searchQuery.trim() && searchTokens.length > 0 && (
              <div className="py-3 border-t border-night-line flex items-center gap-2 text-xs text-parchment-muted">
                <Info className="w-4 h-4 text-jade shrink-0" />
                <span>Python Tokenizer đã phân tách câu truy vấn thành:</span>
                <div className="flex gap-1 flex-wrap">
                  {searchTokens.map((t, idx) => (
                    <span key={idx} className="bg-night-800 border border-night-line text-parchment px-1.5 py-0.5 text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Articles Feed or Visualizer */}
            <div>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-4 border-b border-night-line pb-4">
                <h2 className="font-serif text-xl text-parchment flex items-baseline gap-2.5">
                  <span>
                    {searchQuery.trim()
                      ? `Kết quả tìm kiếm cho "${searchQuery}"`
                      : 'Bài viết & thảo luận mới nhất'}
                  </span>
                  <span className="text-xs text-parchment-dim font-sans">{totalCount} bài</span>
                </h2>

                {/* Dedicated View Tabs */}
                <div className="flex items-center bg-night-900 border border-night-line rounded p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('feed')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition font-medium ${
                      viewMode === 'feed'
                        ? 'bg-night-800 text-parchment shadow-sm border border-night-line'
                        : 'text-parchment-dim hover:text-parchment'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>📰 Danh sách bài viết</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('visualizer');
                      if (!searchQuery.trim()) {
                        const defaultQuery = 'Cung Mệnh';
                        setSearchQuery(defaultQuery);
                        executePythonSearch(defaultQuery);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition font-medium ${
                      viewMode === 'visualizer'
                        ? 'bg-brass text-night-950 font-bold shadow-sm'
                        : 'text-brass hover:text-brass-light'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>📊 Trực quan hóa thuật toán (Visualizer)</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center text-parchment-muted gap-3">
                  <div className="w-9 h-9 border-2 border-brass border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm">Đang tải dữ liệu bài viết & chạy xếp hạng...</p>
                </div>
              ) : viewMode === 'visualizer' ? (
                <AlgorithmVisualizer
                  query={searchQuery.trim() || 'Cung Mệnh'}
                  tokens={searchTokens.length > 0 ? searchTokens : ['cung_mệnh']}
                  results={pythonResults}
                  executionTimeMs={executionTimeMs}
                  totalResults={totalCount}
                  searchMode={searchMode}
                  onSelectDoc={(id) => handleArticleClick(id)}
                  onAlphaChange={(newAlpha) => setHybridAlpha(newAlpha)}
                  alpha={hybridAlpha}
                />
              ) : searchMode !== 'db' && searchQuery.trim() ? (
                // PYTHON ENGINE SEARCH RESULTS
                pythonResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pythonResults.map((item) => (
                      <ArticleCard
                        key={item.id}
                        document={item}
                        score={item.score}
                        searchMode={searchMode}
                        onClick={() => handleArticleClick(item.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center border border-night-line space-y-2">
                    <p className="text-parchment font-semibold text-sm">
                      Không tìm thấy kết quả nào phù hợp với thuật toán {searchMode.toUpperCase()}.
                    </p>
                    <p className="text-xs text-parchment-dim">
                      Hãy thử từ khóa khác như "Cung Mệnh", "Claude", "An sao", "BM25".
                    </p>
                  </div>
                )
              ) : documents.length > 0 ? (
                // STANDARD DB DOCUMENTS
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <ArticleCard
                      key={doc.id}
                      document={doc}
                      searchMode={searchMode}
                      onClick={() => handleArticleClick(doc.id)}
                      onLike={async (id) => {
                        const res = await api.likeDocument(id);
                        if (res.success) {
                          setDocuments(documents.map((d) => (d.id === id ? { ...d, likes_count: res.data.likes_count } : d)));
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border border-night-line">
                  <p className="text-parchment-muted text-sm">Không có bài viết nào phù hợp với bộ lọc hiện tại.</p>
                </div>
              )}
            </div>

            {/* Pagination Controls (for DB view) */}
            {viewMode !== 'visualizer' && (!searchQuery.trim() || searchMode === 'db') && totalPages > 1 && (
              <div className="pt-4 flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 border border-night-line hover:border-brass/40 disabled:opacity-30 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-parchment-muted px-3">
                  Trang {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 border border-night-line hover:border-brass/40 disabled:opacity-30 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-night-line py-8 text-center text-xs text-parchment-dim">
        <div className="max-w-7xl mx-auto px-4 space-y-1.5">
          <p className="text-parchment-muted font-semibold">AstroAI Forum — Search Engine Assignment, Phase 1 & 2</p>
          <p>Full-Stack CRUD, RBAC, Document Store & Python BM25/TF-IDF Ranking Engine.</p>
        </div>
      </footer>

      {/* Modals */}
      <ArticleDetailModal
        documentId={selectedDocId}
        currentUser={currentUser}
        onClose={() => setSelectedDocId(null)}
        onLikeUpdate={(docId, likes) => {
          setDocuments(documents.map((d) => (d.id === docId ? { ...d, likes_count: likes } : d)));
        }}
      />

      <QuickLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      <CreateArticleModal
        isOpen={isCreateModalOpen}
        categories={categories}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newDoc) => {
          setDocuments([newDoc, ...documents]);
        }}
      />

      <ForumGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
};
