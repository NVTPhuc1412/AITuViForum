import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { User, Role } from '../types';
import { api, setStoredToken, setStoredUser } from '../api/client';

interface QuickLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const DEMO_ACCOUNTS: { role: Role; name: string; email: string; desc: string; color: string }[] = [
  {
    role: 'SUPER_ADMIN',
    name: 'Nguyễn Văn Minh',
    email: 'admin@astroai.vn',
    desc: 'Quản trị tối cao: Quản lý users, gán quyền Role, cấu hình toàn hệ thống.',
    color: 'from-red-600 to-rose-700',
  },
  {
    role: 'CONTENT_MANAGER',
    name: 'Trần Thị Thu Hà',
    email: 'content@astroai.vn',
    desc: 'Biên tập viên: Quản lý bài viết, xuất bản / ẩn bài viết (Publish status).',
    color: 'from-purple-600 to-indigo-700',
  },
  {
    role: 'MODERATOR',
    name: 'Lê Hoàng Long',
    email: 'moderator@astroai.vn',
    desc: 'Kiểm duyệt viên: Duyệt bình luận, xóa spam, gắn cờ nội dung vi phạm.',
    color: 'from-amber-600 to-yellow-700',
  },
  {
    role: 'SEO_SPECIALIST',
    name: 'Vũ Quốc Huy',
    email: 'seo@astroai.vn',
    desc: 'Chuyên gia SEO: Cấu hình thẻ meta SEO, xem phân tích Search & Click Logs.',
    color: 'from-cyan-600 to-teal-700',
  },
  {
    role: 'USER',
    name: 'Phạm Đức Anh',
    email: 'user@astroai.vn',
    desc: 'Thành viên thường: Đăng bài, thảo luận, thích, tìm kiếm nội dung.',
    color: 'from-blue-600 to-slate-700',
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-astro-gold" />
            <h2 className="text-lg font-bold text-white">Xác thực & Phân quyền (RBAC)</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 mt-4 gap-2">
          <button
            onClick={() => setTab('demo')}
            className={`pb-2 text-xs font-bold transition border-b-2 ${
              tab === 'demo' ? 'border-astro-gold text-astro-gold' : 'border-transparent text-slate-400'
            }`}
          >
            ⚡ Đăng nhập 1-Click (5 Roles)
          </button>
          <button
            onClick={() => setTab('login')}
            className={`pb-2 text-xs font-bold transition border-b-2 ${
              tab === 'login' ? 'border-astro-gold text-astro-gold' : 'border-transparent text-slate-400'
            }`}
          >
            Đăng nhập Email
          </button>
          <button
            onClick={() => setTab('register')}
            className={`pb-2 text-xs font-bold transition border-b-2 ${
              tab === 'register' ? 'border-astro-gold text-astro-gold' : 'border-transparent text-slate-400'
            }`}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* TAB 1: QUICK DEMO ACCOUNTS */}
        {tab === 'demo' && (
          <div className="mt-4 space-y-2.5">
            <p className="text-xs text-slate-400">
              Chọn ngay một trong 5 vai trò bên dưới để kiểm thử tính năng phân quyền:
            </p>
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.email}
                onClick={() => !loading && handleQuickLogin(acc.email)}
                className="group p-3 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${acc.color} flex items-center justify-center text-white shadow-sm font-bold text-xs`}
                  >
                    {acc.role.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-astro-cyan transition">
                        {acc.name}
                      </span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {acc.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{acc.desc}</p>
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-astro-gold/15 text-astro-gold border border-astro-gold/30 group-hover:bg-astro-gold group-hover:text-slate-950 transition"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@astroai.vn"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password123@"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-astro-gold text-slate-950 font-bold text-xs hover:brightness-110 transition"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>
        )}

        {/* TAB 3: REGISTER */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Họ và tên</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nguyenvana@gmail.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-astro-cyan text-slate-950 font-bold text-xs hover:brightness-110 transition"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
