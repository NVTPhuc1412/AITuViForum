import React, { useState, useEffect } from 'react';
import { User, DocumentItem, Comment, SearchAnalytics } from '../types';
import { api } from '../api/client';
import {
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Save,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  onSelectDoc: (id: number) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onSelectDoc }) => {
  // Determine accessible tabs based on current role
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isContentMgr = isSuperAdmin || currentUser.role === 'CONTENT_MANAGER';
  const isMod = isSuperAdmin || currentUser.role === 'MODERATOR';
  const isSEO = isSuperAdmin || currentUser.role === 'SEO_SPECIALIST';

  const defaultTab = isSuperAdmin ? 'users' : isContentMgr ? 'content' : isMod ? 'moderation' : 'seo';
  const [activeTab, setActiveTab] = useState<'users' | 'content' | 'moderation' | 'seo'>(defaultTab);

  // States for each section
  const [usersList, setUsersList] = useState<User[]>([]);
  const [docsList, setDocsList] = useState<DocumentItem[]>([]);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [rebuildingIndex, setRebuildingIndex] = useState(false);

  // SEO Editing
  const [editingSeoDoc, setEditingSeoDoc] = useState<DocumentItem | null>(null);
  const [seoForm, setSeoForm] = useState({ meta_title: '', meta_description: '', meta_keywords: '' });
  const [savingSeo, setSavingSeo] = useState(false);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: string) => {
    setLoading(true);
    try {
      if (tab === 'users' && isSuperAdmin) {
        const res = await api.getAllUsers();
        if (res.success) setUsersList(res.data);
      } else if (tab === 'content' && isContentMgr) {
        const res = await api.getAdminDocuments();
        if (res.success) setDocsList(res.data);
      } else if (tab === 'moderation' && isMod) {
        const res = await api.getAdminComments();
        if (res.success) setCommentsList(res.data);
      } else if (tab === 'seo' && isSEO) {
        const [resAnalytics, resDocs] = await Promise.all([
          api.getSearchAnalytics(),
          api.getAdminDocuments(),
        ]);
        if (resAnalytics.success) setAnalytics(resAnalytics.data);
        if (resDocs.success) setDocsList(resDocs.data);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const res = await api.updateUserRole(userId, newRole);
      if (res.success) {
        setUsersList(usersList.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u)));
        alert(`Đã đổi vai trò thành công!`);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật vai trò');
    }
  };

  const handleToggleDocStatus = async (docId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
    try {
      const res = await api.updateDocumentStatus(docId, newStatus);
      if (res.success) {
        setDocsList(docsList.map((d) => (d.id === docId ? { ...d, status: newStatus as any } : d)));
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái bài viết');
    }
  };

  const handleUpdateCommentStatus = async (commentId: number, status: string) => {
    try {
      const res = await api.updateCommentStatus(commentId, status);
      if (res.success) {
        setCommentsList(commentsList.map((c) => (c.id === commentId ? { ...c, status: status as any } : c)));
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái bình luận');
    }
  };

  const handleRebuildIndex = async () => {
    setRebuildingIndex(true);
    try {
      const res = await api.rebuildPythonIndex();
      alert(`✅ ${res.message || 'Đã đồng bộ lại chỉ mục thành công!'}`);
    } catch (err: any) {
      alert('Không thể kết nối Python Search Engine: ' + err.message);
    } finally {
      setRebuildingIndex(false);
    }
  };

  const handleSaveSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeoDoc) return;
    setSavingSeo(true);
    try {
      const res = await api.updateDocumentSEO(editingSeoDoc.id, seoForm);
      if (res.success) {
        alert('Cập nhật thẻ SEO thành công!');
        setEditingSeoDoc(null);
        loadTabData('seo');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu SEO');
    } finally {
      setSavingSeo(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Title & Role Info */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-6 h-6 text-astro-gold" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Cổng Quản Trị Hệ Thống (RBAC Portal)
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Đang đăng nhập với vai trò: <strong className="text-astro-cyan">{currentUser.role}</strong> ({currentUser.name})
          </p>
        </div>

        {/* Python Index Rebuild Button */}
        <button
          onClick={handleRebuildIndex}
          disabled={rebuildingIndex}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 text-xs font-semibold transition"
          title="Yêu cầu Python Search Engine đọc lại dữ liệu và lập lại Inverted Index"
        >
          <RefreshCw className={`w-4 h-4 ${rebuildingIndex ? 'animate-spin' : ''}`} />
          <span>{rebuildingIndex ? 'Đang index lại...' : 'Dựng lại Inverted Index (Python)'}</span>
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'users'
                ? 'border-astro-gold text-astro-gold bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Super Admin: Quản lý Roles</span>
          </button>
        )}

        {isContentMgr && (
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'content'
                ? 'border-purple-400 text-purple-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Content Manager: Duyệt bài</span>
          </button>
        )}

        {isMod && (
          <button
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'moderation'
                ? 'border-amber-400 text-amber-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Moderator: Kiểm duyệt bình luận</span>
          </button>
        )}

        {isSEO && (
          <button
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
              activeTab === 'seo'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Data & SEO: Analytics & Keywords</span>
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 min-h-[400px]">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-astro-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* TAB 1: SUPER ADMIN */}
            {activeTab === 'users' && isSuperAdmin && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">Quản lý Tài khoản & Phân quyền Role</h2>
                  <span className="text-xs text-slate-400">Tổng cộng: {usersList.length} người dùng</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Người dùng</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Vai trò hiện tại</th>
                        <th className="px-4 py-3">Hành động đổi Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3 flex items-center gap-2 font-medium text-white">
                            <img src={u.avatar || ''} alt={u.name} className="w-6 h-6 rounded-md object-cover" />
                            <span>{u.name}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-astro-gold"
                            >
                              <option value="USER">USER (Thành viên)</option>
                              <option value="CONTENT_MANAGER">CONTENT_MANAGER</option>
                              <option value="MODERATOR">MODERATOR</option>
                              <option value="SEO_SPECIALIST">SEO_SPECIALIST</option>
                              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: CONTENT MANAGER */}
            {activeTab === 'content' && isContentMgr && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">Quản lý & Duyệt Bài viết (Publication Status)</h2>
                  <span className="text-xs text-slate-400">{docsList.length} bài viết</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Tiêu đề bài viết</th>
                        <th className="px-4 py-3">Tác giả</th>
                        <th className="px-4 py-3">Lượt xem</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {docsList.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3 max-w-sm">
                            <div
                              onClick={() => onSelectDoc(d.id)}
                              className="font-medium text-white hover:text-astro-cyan cursor-pointer truncate flex items-center gap-1.5"
                            >
                              <span>{d.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{d.author?.name}</td>
                          <td className="px-4 py-3">{d.views_count}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                d.status === 'PUBLISHED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleDocStatus(d.id, d.status)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                d.status === 'PUBLISHED'
                                  ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20'
                                  : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20'
                              }`}
                            >
                              {d.status === 'PUBLISHED' ? 'Gỡ bài (Unpublish)' : 'Xuất bản (Publish)'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: MODERATOR */}
            {activeTab === 'moderation' && isMod && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">Kiểm duyệt Bình luận & Báo cáo Spam</h2>
                  <span className="text-xs text-slate-400">{commentsList.length} bình luận</span>
                </div>

                <div className="space-y-3">
                  {commentsList.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold text-white">{c.user.name}</span>
                          <span className="text-[10px] text-slate-500">
                            trên bài: <em>{c.document?.title}</em>
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              c.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{c.content}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {c.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateCommentStatus(c.id, 'APPROVED')}
                            className="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Duyệt</span>
                          </button>
                        )}
                        {c.status !== 'FLAGGED' && (
                          <button
                            onClick={() => handleUpdateCommentStatus(c.id, 'FLAGGED')}
                            className="px-2.5 py-1 rounded bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 text-xs font-semibold"
                          >
                            Gắn cờ Spam
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: DATA & SEO SPECIALIST */}
            {activeTab === 'seo' && isSEO && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-white mb-1">
                    Báo cáo Phân tích Nhật ký Tìm kiếm & Tương tác (Search & Click Logs)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Dữ liệu thu thập tự động từ hành vi tìm kiếm và nhấp chuột của người dùng, sẵn sàng phục vụ Re-ranking cho Phase 2.
                  </p>
                </div>

                {/* Metrics Cards */}
                {analytics && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <div className="text-xs text-slate-400 mb-1">Tổng lượt tìm kiếm</div>
                      <div className="text-2xl font-extrabold text-astro-gold">{analytics.totalSearches}</div>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <div className="text-xs text-slate-400 mb-1">Tổng lượt click kết quả</div>
                      <div className="text-2xl font-extrabold text-astro-cyan">{analytics.totalClicks}</div>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                      <div className="text-xs text-slate-400 mb-1">Tỷ lệ Click (Overall CTR)</div>
                      <div className="text-2xl font-extrabold text-emerald-400">{analytics.overallCTR}</div>
                    </div>
                  </div>
                )}

                {/* Top queries table */}
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Top 10 Từ Khóa Được Tìm Kiếm Nhiều Nhất
                  </h3>
                  <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-2.5">Từ khóa (Query String)</th>
                          <th className="px-4 py-2.5">Số lần Search</th>
                          <th className="px-4 py-2.5">Số lần Click</th>
                          <th className="px-4 py-2.5">Tỷ lệ CTR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {analytics?.topQueries && analytics.topQueries.length > 0 ? (
                          analytics.topQueries.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/60">
                              <td className="px-4 py-2 font-semibold text-white flex items-center gap-1.5">
                                <Search className="w-3 h-3 text-astro-gold" />
                                <span>{item.query}</span>
                              </td>
                              <td className="px-4 py-2">{item.count}</td>
                              <td className="px-4 py-2">{item.clicks}</td>
                              <td className="px-4 py-2 text-emerald-400 font-bold">{item.ctr}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-4 text-center text-slate-500 italic">
                              Chưa có log tìm kiếm nào được ghi nhận.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Document SEO Metadata Editor */}
                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Cấu hình Thẻ Meta SEO cho Bài viết
                  </h3>

                  {editingSeoDoc ? (
                    <form onSubmit={handleSaveSEO} className="p-5 bg-slate-950 rounded-xl border border-slate-700 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-astro-cyan truncate max-w-lg">
                          Đang sửa SEO cho: {editingSeoDoc.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingSeoDoc(null)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Hủy
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Meta Title</label>
                        <input
                          type="text"
                          value={seoForm.meta_title}
                          onChange={(e) => setSeoForm({ ...seoForm, meta_title: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Meta Description</label>
                        <textarea
                          rows={2}
                          value={seoForm.meta_description}
                          onChange={(e) => setSeoForm({ ...seoForm, meta_description: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Meta Keywords</label>
                        <input
                          type="text"
                          value={seoForm.meta_keywords}
                          onChange={(e) => setSeoForm({ ...seoForm, meta_keywords: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingSeo}
                        className="px-4 py-2 rounded-xl bg-astro-gold text-slate-950 text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingSeo ? 'Đang lưu...' : 'Lưu cấu hình SEO'}</span>
                      </button>
                    </form>
                  ) : (
                    <div className="overflow-x-auto bg-slate-950 rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                          <tr>
                            <th className="px-4 py-2.5">Bài viết</th>
                            <th className="px-4 py-2.5">Meta Title</th>
                            <th className="px-4 py-2.5">Meta Keywords</th>
                            <th className="px-4 py-2.5">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {docsList.slice(0, 10).map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-900/60">
                              <td className="px-4 py-2 font-medium text-white truncate max-w-xs">{doc.title}</td>
                              <td className="px-4 py-2 text-slate-400 truncate max-w-xs">{doc.meta_title || '-'}</td>
                              <td className="px-4 py-2 text-slate-400 truncate max-w-xs">{doc.meta_keywords || '-'}</td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => {
                                    setEditingSeoDoc(doc);
                                    setSeoForm({
                                      meta_title: doc.meta_title || doc.title,
                                      meta_description: doc.meta_description || doc.summary,
                                      meta_keywords: doc.meta_keywords || doc.tags.join(', '),
                                    });
                                  }}
                                  className="px-2.5 py-1 rounded bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 text-xs font-semibold"
                                >
                                  Chỉnh sửa
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
