import React from 'react';
import { User } from '../types';
import { Shield, LogOut, PlusCircle, UserCheck, BookOpen } from 'lucide-react';
import { AstroChart } from './AstroChart';

interface NavbarProps {
  user: User | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  searchMode: 'hybrid' | 'bm25' | 'tfidf' | 'db';
  onSearchModeChange: (mode: 'hybrid' | 'bm25' | 'tfidf' | 'db') => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenCreate: () => void;
  onOpenAdmin: () => void;
  isAdminView: boolean;
  onToggleAdminView: () => void;
  onOpenGuide?: () => void;
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
  onOpenGuide,
}) => {
  const isPrivileged = user && user.role !== 'USER';

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-lacquer/10 text-lacquer-light border-lacquer/40';
      case 'CONTENT_MANAGER':
        return 'bg-brass/10 text-brass-light border-brass/40';
      case 'MODERATOR':
        return 'bg-jade/10 text-jade-light border-jade/40';
      case 'SEO_SPECIALIST':
        return 'bg-parchment/5 text-parchment-muted border-parchment-dim/40';
      default:
        return 'bg-night-700 text-parchment-muted border-night-line';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-night-950/92 backdrop-blur-md border-b border-night-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => isAdminView && onToggleAdminView()}
          >
            <div className="w-9 h-9 flex items-center justify-center border border-brass/50 text-brass bg-night-800">
              <AstroChart size={20} />
            </div>
            <div className="hidden sm:block leading-none">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-xl font-semibold text-parchment">AstroAI</span>
                <span className="text-[11px] text-parchment-dim">Forum</span>
              </div>
              <p className="text-[10px] text-parchment-dim mt-0.5">AI & Số hóa Tử Vi Đẩu Số</p>
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
                    searchMode === 'hybrid'
                      ? '⚡ Tìm kiếm Hybrid (BM25 + TF-IDF tối ưu nhất)...'
                      : searchMode === 'bm25'
                      ? 'Tìm bằng BM25: "Cung Mệnh", "Claude prompt"...'
                      : searchMode === 'tfidf'
                      ? 'Tìm bằng TF-IDF: "Hóa Lộc", "14 chính tinh"...'
                      : 'Tìm theo truy vấn SQL chuẩn...'
                  }
                  className="w-full bg-night-800 border border-night-line rounded-md pl-4 pr-[14.5rem] py-2 text-sm text-parchment placeholder-parchment-dim focus:outline-none focus:border-brass/60 transition"
                />

                {/* Search Engine Mode Switcher */}
                <div className="absolute right-1 top-1 bottom-1 flex items-center bg-night-900 rounded-sm border border-night-line overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onSearchModeChange('hybrid')}
                    title="Thuật toán lai ghép Hybrid (BM25 + TF-IDF) - Đề xuất tốt nhất"
                    className={`px-2 h-full text-[11px] font-bold transition flex items-center gap-1 ${
                      searchMode === 'hybrid'
                        ? 'bg-lacquer/20 text-lacquer-light border-r border-lacquer/40'
                        : 'text-parchment-dim hover:text-parchment-muted'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-lacquer animate-pulse"></span>
                    <span>Hybrid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSearchModeChange('bm25')}
                    title="Xếp hạng Okapi BM25 (Python Engine)"
                    className={`px-2 h-full text-[11px] font-semibold border-l border-night-line transition ${
                      searchMode === 'bm25'
                        ? 'bg-brass/15 text-brass-light'
                        : 'text-parchment-dim hover:text-parchment-muted'
                    }`}
                  >
                    BM25
                  </button>
                  <button
                    type="button"
                    onClick={() => onSearchModeChange('tfidf')}
                    title="Xếp hạng TF-IDF (Python Engine)"
                    className={`px-2 h-full text-[11px] font-semibold border-l border-night-line transition ${
                      searchMode === 'tfidf'
                        ? 'bg-jade/15 text-jade-light'
                        : 'text-parchment-dim hover:text-parchment-muted'
                    }`}
                  >
                    TF-IDF
                  </button>
                  <button
                    type="button"
                    onClick={() => onSearchModeChange('db')}
                    title="Truy vấn SQL LIKE trên PostgreSQL"
                    className={`px-2 h-full text-[11px] font-semibold border-l border-night-line transition ${
                      searchMode === 'db'
                        ? 'bg-parchment/10 text-parchment'
                        : 'text-parchment-dim hover:text-parchment-muted'
                    }`}
                  >
                    SQL
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* User Controls & Navigation */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenGuide && (
              <button
                type="button"
                onClick={onOpenGuide}
                title="Cẩm nang: Cấu trúc Forum chuẩn & Quản trị hiệu quả"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-brass/40 text-brass-light hover:bg-brass/10 text-xs font-semibold rounded-sm transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-brass" />
                <span className="hidden sm:inline">Cẩm nang Forum</span>
              </button>
            )}

            {user ? (
              <>
                <button
                  onClick={onOpenCreate}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 border border-jade/40 text-jade-light hover:bg-jade/10 text-xs font-semibold transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Đăng bài</span>
                </button>

                {isPrivileged && (
                  <button
                    onClick={onToggleAdminView}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition ${
                      isAdminView
                        ? 'bg-brass text-night-950 border-brass'
                        : 'bg-transparent text-brass border-brass/40 hover:bg-brass/10'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{isAdminView ? 'Về Forum' : 'Admin Panel'}</span>
                  </button>
                )}

                {/* Profile Pill */}
                <div className="flex items-center gap-2 border border-night-line pl-2 pr-3 py-1">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-7 h-7 object-cover border border-night-line"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-parchment truncate max-w-[100px]">{user.name}</div>
                    <span className={`text-[9px] font-bold px-1 border ${getRoleBadgeStyle(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Đăng xuất"
                  className="p-2 text-parchment-dim hover:text-lacquer-light transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-4 py-2 bg-brass text-night-950 text-xs font-bold hover:bg-brass-light transition"
              >
                <UserCheck className="w-4 h-4" />
                <span>Đăng nhập Demo (RBAC)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
