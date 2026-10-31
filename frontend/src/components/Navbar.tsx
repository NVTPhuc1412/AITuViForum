import React from 'react';
import { User } from '../types';
import { Shield, LogOut, PlusCircle, UserCheck } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  searchMode: 'db' | 'bm25' | 'tfidf';
  onSearchModeChange: (mode: 'db' | 'bm25' | 'tfidf') => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenCreate: () => void;
  onOpenAdmin: () => void;
  isAdminView: boolean;
  onToggleAdminView: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  searchMode,
  onSearchModeChange,
  onOpenLogin,
  onLogout,
  onOpenCreate,
  isAdminView,
  onToggleAdminView,
}) => {
  const isPrivileged = user && user.role !== 'USER';

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'CONTENT_MANAGER':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'MODERATOR':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'SEO_SPECIALIST':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-astro-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => isAdminView && onToggleAdminView()}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-xl">🔮</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-astro-gold bg-clip-text text-transparent">
                  AstroAI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-astro-gold/10 text-astro-gold border border-astro-gold/20">
                  Forum
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">AI & Số hóa Tử Vi Đẩu Số</p>
            </div>
          </div>

          {/* Central Search with Toggle */}
          <div className="flex-1 max-w-2xl">
            <form onSubmit={onSearchSubmit} className="relative flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={
                    searchMode === 'bm25'
                      ? '⚡ Tìm kiếm BM25 (Python Engine): VD "Cung Mệnh", "Claude prompt"...'
                      : searchMode === 'tfidf'
                      ? '📈 Tìm kiếm TF-IDF: VD "Hóa Lộc", "14 chính tinh"...'
                      : '🔍 Tìm kiếm LIKE chuẩn SQL: Nhập từ khóa...'
                  }
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-4 pr-32 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-astro-cyan focus:ring-1 focus:ring-astro-cyan transition shadow-inner"
                />

                {/* Search Engine Mode Switcher */}
                <div className="absolute right-1 top-1 bottom-1 flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => onSearchModeChange('bm25')}
                    title="Chạy thuật toán Okapi BM25 trên Python Service"
                    className={`px-2 py-1 text-[11px] font-semibold rounded-md transition flex items-center gap-1 ${
                      searchMode === 'bm25'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>⚡ BM25</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSearchModeChange('tfidf')}
                    title="Chạy thuật toán TF-IDF trên Python Service"
                    className={`px-2 py-1 text-[11px] font-semibold rounded-md transition ${
                      searchMode === 'tfidf'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    TF-IDF
                  </button>
                  <button
                    type="button"
                    onClick={() => onSearchModeChange('db')}
                    title="Chạy truy vấn SQL LIKE/Regex chuẩn trên PostgreSQL"
                    className={`px-2 py-1 text-[11px] font-semibold rounded-md transition ${
                      searchMode === 'db'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    SQL
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* User Controls & Navigation */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={onOpenCreate}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Đăng bài</span>
                </button>

                {isPrivileged && (
                  <button
                    onClick={onToggleAdminView}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      isAdminView
                        ? 'bg-astro-gold text-slate-950 border-astro-gold shadow-md'
                        : 'bg-slate-800 text-astro-gold border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{isAdminView ? 'Về Forum' : 'Admin Panel'}</span>
                  </button>
                )}

                {/* Profile Pill */}
                <div className="flex items-center gap-2 bg-slate-800/80 pl-2 pr-3 py-1 rounded-xl border border-slate-700/60">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-600"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">{user.name}</div>
                    <span className={`text-[9px] uppercase font-bold tracking-wider px-1 rounded border ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Đăng xuất"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-astro-gold to-amber-600 text-slate-950 text-xs font-bold hover:brightness-110 transition shadow-md shadow-amber-500/10"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Đăng nhập Demo (RBAC)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
