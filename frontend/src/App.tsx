import React, { useState, useEffect } from 'react';
import {
  User,
  DocumentItem,
  Category,
  PythonSearchResult,
} from './types';
import { api, getStoredUser, setStoredToken, setStoredUser } from './api/client';
import { Navbar } from './components/Navbar';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { AdminDashboard } from './components/AdminDashboard';
import { QuickLoginModal } from './components/QuickLoginModal';
import { CreateArticleModal } from './components/CreateArticleModal';
import {
  Sparkles,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Tag,
  Zap,
  Info,
} from 'lucide-react';

export const App: React.FC = () => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularTags, setPopularTags] = useState<{ tag: string; count: number }[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [pythonResults, setPythonResults] = useState<PythonSearchResult[]>([]);
  const [searchTokens, setSearchTokens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'db' | 'bm25' | 'tfidf'>('bm25');
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
    } else {
      executePythonSearch();
    }
  }, [page, selectedCategory, selectedTag, fromDate, toDate, searchMode]);

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

  const executePythonSearch = async () => {
    if (!searchQuery.trim()) {
      loadDocuments();
      return;
    }

    setLoading(true);
    try {
      const res = await api.pythonSearch(searchQuery.trim(), searchMode === 'tfidf' ? 'tfidf' : 'bm25', 15);
      if (res.success) {
        setPythonResults(res.data.results);
        setSearchTokens(res.data.tokens);
        setTotalCount(res.data.total_results);
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

  return (
    <div className="min-h-screen bg-astro-900 text-slate-100 flex flex-col">
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
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isAdminView && currentUser ? (
          <AdminDashboard
            currentUser={currentUser}
            onSelectDoc={(id) => setSelectedDocId(id)}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 p-8 sm:p-10 shadow-2xl">
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-astro-gold/10 border border-astro-gold/20 text-astro-gold text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kỷ nguyên Số hóa Cổ học & AI</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Diễn đàn Nghiên cứu & Ứng dụng <br />
                  <span className="bg-gradient-to-r from-astro-gold via-amber-300 to-cyan-400 bg-clip-text text-transparent">
                    Trí Tuệ Nhân Tạo vào Tử Vi Đẩu Số
                  </span>
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                  Nơi giao thoa giữa khoa học dữ liệu hiện đại (LLM, Prompting, BM25, RAG) và tinh hoa chiêm tinh học phương Đông.
                </p>

                {/* Search Engine Engine Status Badge */}
                <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-400">Đang tìm kiếm bằng:</span>
                  {searchMode === 'bm25' && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-astro-gold border border-amber-500/30 font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-astro-gold" />
                      <span>Python Okapi BM25 Ranking Engine (Tách từ chuyên ngành)</span>
                    </span>
                  )}
                  {searchMode === 'tfidf' && (
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-purple-300" />
                      <span>Python TF-IDF Ranking Engine</span>
                    </span>
                  )}
                  {searchMode === 'db' && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-blue-300" />
                      <span>Standard PostgreSQL LIKE Query</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-purple-600/10 to-transparent pointer-events-none"></div>
            </div>

            {/* Filter Bar (Categories, Tags, Date Range) */}
            <div className="space-y-4">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                    selectedCategory === null
                      ? 'bg-astro-gold text-slate-950 border-astro-gold shadow-md shadow-amber-500/10'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
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
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap border ${
                      selectedCategory === cat.id
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Secondary Filter Row (Date & Popular Tags) */}
              <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-xs">
                {/* Date range filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-astro-gold" /> Lọc theo ngày:
                  </span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(1);
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(1);
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
                  />
                </div>

                {/* Popular Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-astro-cyan" /> Tags:
                  </span>
                  {popularTags.slice(0, 6).map((item) => (
                    <button
                      key={item.tag}
                      onClick={() => {
                        setSelectedTag(selectedTag === item.tag ? null : item.tag);
                        setPage(1);
                      }}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                        selectedTag === item.tag
                          ? 'bg-astro-cyan text-slate-950 font-bold'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{item.tag} ({item.count})
                    </button>
                  ))}
                  {(selectedCategory || selectedTag || fromDate || toDate || searchQuery) && (
                    <button
                      onClick={resetFilters}
                      className="text-red-400 hover:underline font-semibold ml-2"
                    >
                      Xóa lọc
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Token details when in Python Search Mode */}
            {searchMode !== 'db' && searchQuery.trim() && searchTokens.length > 0 && (
              <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-xl flex items-center gap-2 text-xs text-purple-300">
                <Info className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  <strong>Python Tokenizer:</strong> Đã phân tách câu truy vấn thành các token:
                </span>
                <div className="flex gap-1 flex-wrap">
                  {searchTokens.map((t, idx) => (
                    <span key={idx} className="bg-purple-900/60 text-purple-200 px-2 py-0.5 rounded font-mono text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Articles Feed */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>
                    {searchQuery.trim()
                      ? `Kết quả tìm kiếm cho "${searchQuery}"`
                      : 'Danh sách bài viết & Thảo luận mới nhất'}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                    {totalCount} bài
                  </span>
                </h2>
              </div>

              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-10 h-10 border-4 border-astro-gold border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm">Đang tải dữ liệu bài viết...</p>
                </div>
              ) : searchMode !== 'db' && searchQuery.trim() ? (
                // PYTHON ENGINE SEARCH RESULTS
                pythonResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  <div className="py-20 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                    <p className="text-slate-300 font-semibold text-sm">
                      Không tìm thấy kết quả nào phù hợp với thuật toán {searchMode.toUpperCase()}.
                    </p>
                    <p className="text-xs text-slate-500">
                      Hãy thử từ khóa khác như "Cung Mệnh", "Claude", "An sao", "BM25".
                    </p>
                  </div>
                )
              ) : documents.length > 0 ? (
                // STANDARD DB DOCUMENTS
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                <div className="py-20 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
                  <p className="text-slate-400 text-sm">Không có bài viết nào phù hợp với bộ lọc hiện tại.</p>
                </div>
              )}
            </div>

            {/* Pagination Controls (for DB view) */}
            {(!searchQuery.trim() || searchMode === 'db') && totalPages > 1 && (
              <div className="pt-4 flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-400 px-3">
                  Trang {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2 font-semibold text-slate-400">
            <span>🔮 AstroAI Forum Platform</span>
            <span>•</span>
            <span>Search Engine Assignment Phase 1 & Phase 2</span>
          </div>
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
    </div>
  );
};
