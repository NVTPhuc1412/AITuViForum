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
      alert(`${res.message || 'Đã đồng bộ lại chỉ mục thành công!'}`);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-fade-in">
      {/* Title & Role Info */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-6 bg-night-800 border border-night-line">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-brass" />
            <h1 className="font-serif text-xl sm:text-2xl font-medium text-parchment">
              Cổng quản trị hệ thống (RBAC Portal)
            </h1>
          </div>
          <p className="text-xs text-parchment-muted">
            Đang đăng nhập với vai trò: <strong className="text-brass-light">{currentUser.role}</strong> ({currentUser.name})
          </p>
        </div>

        {/* Python Index Rebuild Button */}
        <button
          onClick={handleRebuildIndex}
          disabled={rebuildingIndex}
          className="flex items-center gap-2 px-4 py-2 border border-jade/30 text-jade-light hover:bg-jade/10 text-xs font-semibold transition"
          title="Yêu cầu Python Search Engine đọc lại dữ liệu và lập lại Inverted Index"
        >
          <RefreshCw className={`w-4 h-4 ${rebuildingIndex ? 'animate-spin' : ''}`} />
          <span>{rebuildingIndex ? 'Đang index lại...' : 'Dựng lại Inverted Index (Python)'}</span>
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-night-line gap-6 overflow-x-auto pb-px">
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 pb-2.5 text-xs font-bold transition border-b-2 ${
              activeTab === 'users' ? 'border-brass text-brass-light' : 'border-transparent text-parchment-muted hover:text-parchment'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Super Admin: Quản lý Roles</span>
          </button>
        )}

        {isContentMgr && (
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 pb-2.5 text-xs font-bold transition border-b-2 ${
              activeTab === 'content' ? 'border-brass text-brass-light' : 'border-transparent text-parchment-muted hover:text-parchment'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Content Manager: Duyệt bài</span>
          </button>
        )}

        {isMod && (
          <button
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center gap-2 pb-2.5 text-xs font-bold transition border-b-2 ${
              activeTab === 'moderation' ? 'border-brass text-brass-light' : 'border-transparent text-parchment-muted hover:text-parchment'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Moderator: Kiểm duyệt bình luận</span>
          </button>
        )}

        {isSEO && (
          <button
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-2 pb-2.5 text-xs font-bold transition border-b-2 ${
              activeTab === 'seo' ? 'border-brass text-brass-light' : 'border-transparent text-parchment-muted hover:text-parchment'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Data & SEO: Analytics & Keywords</span>
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="bg-night-800/60 border border-night-line p-6 min-h-[400px]">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-7 h-7 border-2 border-brass border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* TAB 1: SUPER ADMIN */}
            {activeTab === 'users' && isSuperAdmin && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-base text-parchment">Quản lý tài khoản & phân quyền Role</h2>
                  <span className="text-xs text-parchment-dim">Tổng cộng: {usersList.length} người dùng</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-parchment-muted">
                    <thead className="text-parchment-dim font-bold text-[10px] border-b border-night-line">
                      <tr>
                        <th className="px-4 py-3">Người dùng</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Vai trò hiện tại</th>
                        <th className="px-4 py-3">Hành động đổi Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-night-line">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-night-700/50">
                          <td className="px-4 py-3 flex items-center gap-2 font-medium text-parchment">
                            <img src={u.avatar || ''} alt={u.name} className="w-6 h-6 object-cover border border-night-line" />
                            <span>{u.name}</span>
                          </td>
                          <td className="px-4 py-3 text-parchment-dim">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-night-700 border border-night-line">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              className="bg-night-900 border border-night-line px-2 py-1 text-xs text-parchment focus:outline-none focus:border-brass/50"
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
                  <h2 className="font-serif text-base text-parchment">Quản lý & duyệt bài viết (Publication Status)</h2>
                  <span className="text-xs text-parchment-dim">{docsList.length} bài viết</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-parchment-muted">
                    <thead className="text-parchment-dim font-bold text-[10px] border-b border-night-line">
                      <tr>
                        <th className="px-4 py-3">Tiêu đề bài viết</th>
                        <th className="px-4 py-3">Tác giả</th>
                        <th className="px-4 py-3">Lượt xem</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-night-line">
                      {docsList.map((d) => (
                        <tr key={d.id} className="hover:bg-night-700/50">
                          <td className="px-4 py-3 max-w-sm">
                            <div
                              onClick={() => onSelectDoc(d.id)}
                              className="font-medium text-parchment hover:text-brass-light cursor-pointer truncate flex items-center gap-1.5"
                            >
                              <span>{d.title}</span>
                              <ExternalLink className="w-3 h-3 text-parchment-dim" />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-parchment-dim">{d.author?.name}</td>
                          <td className="px-4 py-3">{d.views_count}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold border ${
                                d.status === 'PUBLISHED'
                                  ? 'bg-jade/10 text-jade-light border-jade/30'
                                  : 'bg-brass/10 text-brass-light border-brass/30'
                              }`}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleDocStatus(d.id, d.status)}
                              className={`px-3 py-1 text-xs font-semibold border transition ${
                                d.status === 'PUBLISHED'
                                  ? 'border-lacquer/30 text-lacquer-light hover:bg-lacquer/10'
                                  : 'border-jade/30 text-jade-light hover:bg-jade/10'
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
                  <h2 className="font-serif text-base text-parchment">Kiểm duyệt bình luận & báo cáo spam</h2>
                  <span className="text-xs text-parchment-dim">{commentsList.length} bình luận</span>
                </div>

                <div className="space-y-3">
                  {commentsList.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 bg-night-900 border border-night-line flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold text-parchment">{c.user.name}</span>
                          <span className="text-[10px] text-parchment-dim">
                            trên bài: <em>{c.document?.title}</em>
                          </span>
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold ${
                              c.status === 'APPROVED' ? 'text-jade-light' : 'text-lacquer-light'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-parchment-muted leading-relaxed">{c.content}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {c.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateCommentStatus(c.id, 'APPROVED')}
                            className="px-2.5 py-1 border border-jade/30 text-jade-light hover:bg-jade/10 text-xs font-semibold flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Duyệt</span>
                          </button>
                        )}
                        {c.status !== 'FLAGGED' && (
                          <button
                            onClick={() => handleUpdateCommentStatus(c.id, 'FLAGGED')}
                            className="px-2.5 py-1 border border-lacquer/30 text-lacquer-light hover:bg-lacquer/10 text-xs font-semibold"
                          >
                            Gắn cờ spam
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
                  <h2 className="font-serif text-base text-parchment mb-1">
                    Báo cáo phân tích nhật ký tìm kiếm & tương tác (Search & Click Logs)
                  </h2>
                  <p className="text-xs text-parchment-dim">
                    Dữ liệu thu thập tự động từ hành vi tìm kiếm và nhấp chuột của người dùng, sẵn sàng phục vụ Re-ranking cho Phase 2.
                  </p>
                </div>

                {/* Metrics Cards */}
                {analytics && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-night-900 border border-night-line">
                      <div className="text-xs text-parchment-dim mb-1">Tổng lượt tìm kiếm</div>
                      <div className="font-serif text-2xl text-brass-light">{analytics.totalSearches}</div>
                    </div>
                    <div className="p-4 bg-night-900 border border-night-line">
                      <div className="text-xs text-parchment-dim mb-1">Tổng lượt click kết quả</div>
                      <div className="font-serif text-2xl text-jade-light">{analytics.totalClicks}</div>
                    </div>
                    <div className="p-4 bg-night-900 border border-night-line">
                      <div className="text-xs text-parchment-dim mb-1">Tỷ lệ Click (Overall CTR)</div>
                      <div className="font-serif text-2xl text-parchment">{analytics.overallCTR}</div>
                    </div>
                  </div>
                )}

                {/* Top queries table */}
                <div>
                  <h3 className="text-xs font-bold text-parchment-muted mb-2">
                    Top 10 từ khóa được tìm kiếm nhiều nhất
                  </h3>
                  <div className="overflow-x-auto bg-night-900 border border-night-line">
                    <table className="w-full text-left text-xs text-parchment-muted">
                      <thead className="text-[10px] font-bold text-parchment-dim border-b border-night-line">
                        <tr>
                          <th className="px-4 py-2.5">Từ khóa (Query String)</th>
                          <th className="px-4 py-2.5">Số lần Search</th>
                          <th className="px-4 py-2.5">Số lần Click</th>
                          <th className="px-4 py-2.5">Tỷ lệ CTR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-night-line">
                        {analytics?.topQueries && analytics.topQueries.length > 0 ? (
                          analytics.topQueries.map((item, idx) => (
                            <tr key={idx} className="hover:bg-night-700/40">
                              <td className="px-4 py-2 font-semibold text-parchment flex items-center gap-1.5">
                                <Search className="w-3 h-3 text-brass" />
                                <span>{item.query}</span>
                              </td>
                              <td className="px-4 py-2">{item.count}</td>
                              <td className="px-4 py-2">{item.clicks}</td>
                              <td className="px-4 py-2 text-jade-light font-bold">{item.ctr}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-4 text-center text-parchment-dim italic">
                              Chưa có log tìm kiếm nào được ghi nhận.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Document SEO Metadata Editor */}
                <div className="pt-4 border-t border-night-line">
                  <h3 className="text-xs font-bold text-parchment-muted mb-3">
                    Cấu hình thẻ meta SEO cho bài viết
                  </h3>

                  {editingSeoDoc ? (
                    <form onSubmit={handleSaveSEO} className="p-5 bg-night-900 border border-night-line space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brass-light truncate max-w-lg">
                          Đang sửa SEO cho: {editingSeoDoc.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingSeoDoc(null)}
                          className="text-xs text-parchment-dim hover:text-parchment"
                        >
                          Hủy
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-parchment-muted mb-1">Meta Title</label>
                        <input
                          type="text"
                          value={seoForm.meta_title}
                          onChange={(e) => setSeoForm({ ...seoForm, meta_title: e.target.value })}
                          className="w-full bg-night-800 border border-night-line px-3 py-1.5 text-xs text-parchment focus:outline-none focus:border-brass/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-parchment-muted mb-1">Meta Description</label>
                        <textarea
                          rows={2}
                          value={seoForm.meta_description}
                          onChange={(e) => setSeoForm({ ...seoForm, meta_description: e.target.value })}
                          className="w-full bg-night-800 border border-night-line px-3 py-1.5 text-xs text-parchment focus:outline-none focus:border-brass/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-parchment-muted mb-1">Meta Keywords</label>
                        <input
                          type="text"
                          value={seoForm.meta_keywords}
                          onChange={(e) => setSeoForm({ ...seoForm, meta_keywords: e.target.value })}
                          className="w-full bg-night-800 border border-night-line px-3 py-1.5 text-xs text-parchment focus:outline-none focus:border-brass/50"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingSeo}
                        className="px-4 py-2 bg-brass text-night-950 text-xs font-bold hover:bg-brass-light flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingSeo ? 'Đang lưu...' : 'Lưu cấu hình SEO'}</span>
                      </button>
                    </form>
                  ) : (
                    <div className="overflow-x-auto bg-night-900 border border-night-line">
                      <table className="w-full text-left text-xs text-parchment-muted">
                        <thead className="text-[10px] font-bold text-parchment-dim border-b border-night-line">
                          <tr>
                            <th className="px-4 py-2.5">Bài viết</th>
                            <th className="px-4 py-2.5">Meta Title</th>
                            <th className="px-4 py-2.5">Meta Keywords</th>
                            <th className="px-4 py-2.5">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-night-line">
                          {docsList.slice(0, 10).map((doc) => (
                            <tr key={doc.id} className="hover:bg-night-700/40">
                              <td className="px-4 py-2 font-medium text-parchment truncate max-w-xs">{doc.title}</td>
                              <td className="px-4 py-2 text-parchment-dim truncate max-w-xs">{doc.meta_title || '-'}</td>
                              <td className="px-4 py-2 text-parchment-dim truncate max-w-xs">{doc.meta_keywords || '-'}</td>
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
                                  className="px-2.5 py-1 border border-jade/30 text-jade-light hover:bg-jade/10 text-xs font-semibold"
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
