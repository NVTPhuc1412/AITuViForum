import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { User, Role } from '../types';
import { api, setStoredToken, setStoredUser } from '../api/client';

interface QuickLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const DEMO_ACCOUNTS: { role: Role; name: string; email: string; desc: string; accent: string }[] = [
  {
    role: 'SUPER_ADMIN',
    name: 'Nguyễn Văn Minh',
    email: 'admin@astroai.vn',
    desc: 'Quản trị tối cao: Quản lý users, gán quyền Role, cấu hình toàn hệ thống.',
    accent: 'border-lacquer/40 text-lacquer-light',
  },
  {
    role: 'CONTENT_MANAGER',
    name: 'Trần Thị Thu Hà',
    email: 'content@astroai.vn',
    desc: 'Biên tập viên: Quản lý bài viết, xuất bản / ẩn bài viết (Publish status).',
    accent: 'border-brass/40 text-brass-light',
  },
  {
    role: 'MODERATOR',
    name: 'Lê Hoàng Long',
    email: 'moderator@astroai.vn',
    desc: 'Kiểm duyệt viên: Duyệt bình luận, xóa spam, gắn cờ nội dung vi phạm.',
    accent: 'border-jade/40 text-jade-light',
  },
  {
    role: 'SEO_SPECIALIST',
    name: 'Vũ Quốc Huy',
    email: 'seo@astroai.vn',
    desc: 'Chuyên gia SEO: Cấu hình thẻ meta SEO, xem phân tích Search & Click Logs.',
    accent: 'border-parchment-dim/50 text-parchment',
  },
  {
    role: 'USER',
    name: 'Phạm Đức Anh',
    email: 'user@astroai.vn',
    desc: 'Thành viên thường: Đăng bài, thảo luận, thích, tìm kiếm nội dung.',
    accent: 'border-night-line text-parchment-muted',
  },
];

export const QuickLoginModal: React.FC<QuickLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState<'demo' | 'login' | 'register'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = async (accEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(accEmail, 'Password123@');
      if (res.success) {
        setStoredToken(res.data.token);
        setStoredUser(res.data.user);
        onLoginSuccess(res.data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        setStoredToken(res.data.token);
        setStoredUser(res.data.user);
        onLoginSuccess(res.data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.register(name, email, password);
      if (res.success) {
        setStoredToken(res.data.token);
        setStoredUser(res.data.user);
        onLoginSuccess(res.data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-night-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-night-900 border border-night-line shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-night-line">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brass" />
            <h2 className="font-serif text-lg text-parchment">Xác thực & phân quyền (RBAC)</h2>
          </div>
          <button onClick={onClose} className="text-parchment-dim hover:text-parchment p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-night-line mt-4 gap-5">
          <button
            onClick={() => setTab('demo')}
            className={`pb-2 text-xs font-bold transition border-b-2 ${
              tab === 'demo' ? 'border-brass text-brass-light' : 'border-transparent text-parchment-dim'
            }`}
          >
            Đăng nhập 1-chạm (5 Roles)
          </button>
          <button
            onClick={() => setTab('login')}
            className={`pb-2 text-xs font-bold transition border-b-2 ${
              tab === 'login' ? 'border-brass text-brass-light' : 'border-transparent text-parchment-dim'
            }`}
          >
            Đăng nhập Email
          </button>
          <button
            onClick={() => setTab('register')}
            className={`pb-2 text-xs font-bold transition border-b-2 ${
              tab === 'register' ? 'border-brass text-brass-light' : 'border-transparent text-parchment-dim'
            }`}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-lacquer/10 border border-lacquer/30 text-lacquer-light text-xs">
            {error}
          </div>
        )}

        {/* TAB 1: QUICK DEMO ACCOUNTS */}
        {tab === 'demo' && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-parchment-dim">
              Chọn ngay một trong 5 vai trò bên dưới để kiểm thử tính năng phân quyền:
            </p>
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.email}
                onClick={() => !loading && handleQuickLogin(acc.email)}
                className="group p-3 bg-night-800 hover:bg-night-700 border border-night-line hover:border-brass/30 cursor-pointer transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 flex items-center justify-center font-bold text-xs border ${acc.accent}`}>
                    {acc.role.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-parchment group-hover:text-brass-light transition">
                        {acc.name}
                      </span>
                      <span className="text-[9px] font-bold px-1 bg-night-900 text-parchment-dim border border-night-line">
                        {acc.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-parchment-dim line-clamp-1 mt-0.5">{acc.desc}</p>
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="px-2.5 py-1 text-[11px] font-bold border border-brass/30 text-brass-light group-hover:bg-brass group-hover:text-night-950 group-hover:border-brass transition shrink-0"
                >
                  Chọn
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: MANUAL LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleManualLogin} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-parchment-muted mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@astroai.vn"
                className="w-full bg-night-800 border border-night-line px-3 py-2 text-xs text-parchment focus:outline-none focus:border-brass/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-parchment-muted mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password123@"
                className="w-full bg-night-800 border border-night-line px-3 py-2 text-xs text-parchment focus:outline-none focus:border-brass/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brass text-night-950 font-bold text-xs hover:bg-brass-light transition"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>
        )}

        {/* TAB 3: REGISTER */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-parchment-muted mb-1">Họ và tên</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-night-800 border border-night-line px-3 py-2 text-xs text-parchment focus:outline-none focus:border-brass/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-parchment-muted mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nguyenvana@gmail.com"
                className="w-full bg-night-800 border border-night-line px-3 py-2 text-xs text-parchment focus:outline-none focus:border-brass/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-parchment-muted mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                className="w-full bg-night-800 border border-night-line px-3 py-2 text-xs text-parchment focus:outline-none focus:border-brass/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-jade text-night-950 font-bold text-xs hover:bg-jade-light transition"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
