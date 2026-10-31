import React, { useState, useEffect } from 'react';
import { X, Eye, Heart, Calendar, Tag, Send, Trash2, Globe } from 'lucide-react';
import { DocumentItem, User } from '../types';
import { api } from '../api/client';

interface ArticleDetailModalProps {
  documentId: number | null;
  currentUser: User | null;
  onClose: () => void;
  onLikeUpdate: (docId: number, likesCount: number) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  documentId,
  currentUser,
  onClose,
  onLikeUpdate,
}) => {
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!documentId) return;

    setLoading(true);
    api.getDocumentById(documentId)
      .then((res) => {
        if (res.success) {
          setDoc(res.data);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải chi tiết bài viết:', err);
      })
      .finally(() => setLoading(false));
  }, [documentId]);

  if (!documentId) return null;

  const handleLike = async () => {
    if (!doc) return;
    try {
      const res = await api.likeDocument(doc.id);
      if (res.success) {
        setDoc({ ...doc, likes_count: res.data.likes_count });
        onLikeUpdate(doc.id, res.data.likes_count);
      }
    } catch (err) {
      console.error('Lỗi like:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc || !newComment.trim() || !currentUser) return;

    setSubmittingComment(true);
    try {
      const res = await api.addComment(doc.id, newComment.trim());
      if (res.success) {
        setDoc({
          ...doc,
          comments: [res.data, ...(doc.comments || [])],
        });
        setNewComment('');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi bình luận');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!doc || !window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;
    try {
      const res = await api.deleteComment(commentId);
      if (res.success) {
        setDoc({
          ...doc,
          comments: doc.comments?.filter((c) => c.id !== commentId) || [],
        });
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi xóa bình luận');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {doc?.category?.name || 'Chuyên mục'}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {doc?.created_at ? new Date(doc.created_at).toLocaleDateString('vi-VN') : ''}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-8 h-8 border-4 border-astro-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm">Đang tải bài viết...</p>
            </div>
          ) : doc ? (
            <>
              {/* Title & Author */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">
                  {doc.title}
                </h1>

                <div className="flex items-center justify-between flex-wrap gap-4 py-3 border-y border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${doc.author?.name}`}
                      alt={doc.author?.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-200">{doc.author?.name}</div>
                      <div className="text-xs text-slate-400">{doc.author?.bio || 'Tác giả bài viết'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400" title="Lượt xem bài">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span>{doc.views_count} xem</span>
                    </div>

                    <button
                      onClick={handleLike}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold transition"
                    >
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
                      <span>{doc.likes_count} Thích</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Blockquote */}
              <div className="p-4 rounded-xl bg-slate-800/40 border-l-4 border-astro-gold text-slate-300 text-sm italic">
                {doc.summary}
              </div>

              {/* Main Content */}
              <div
                className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: doc.content || '' }}
              />

              {/* Tags */}
              {doc.tags && doc.tags.length > 0 && (
                <div className="pt-4 flex items-center gap-2 flex-wrap border-t border-slate-800">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Tags:
                  </span>
                  {doc.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* SEO Specialist Info preview */}
              {doc.meta_title && (
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1 text-cyan-400 font-bold">
                    <Globe className="w-3.5 h-3.5" />
                    <span>SEO Specialist Preview:</span>
                  </div>
                  <div><strong>Meta Title:</strong> {doc.meta_title}</div>
                  <div><strong>Meta Description:</strong> {doc.meta_description}</div>
                  <div><strong>Meta Keywords:</strong> {doc.meta_keywords}</div>
                </div>
              )}

              {/* Comments Section */}
              <div className="pt-6 border-t border-slate-800 space-y-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Thảo luận cộng đồng</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {doc.comments?.length || 0}
                  </span>
                </h3>

                {/* Add comment box */}
                {currentUser ? (
                  <form onSubmit={handleAddComment} className="flex gap-3">
                    <img
                      src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Tham gia thảo luận về tử vi hoặc AI..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-astro-gold"
                      />
                      <button
                        type="submit"
                        disabled={submittingComment || !newComment.trim()}
                        className="px-4 py-2 rounded-xl bg-astro-gold text-slate-950 text-xs font-bold hover:brightness-110 disabled:opacity-50 transition flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-800/40 rounded-xl text-xs text-center text-slate-400">
                    Vui lòng đăng nhập để tham gia bình luận bài viết.
                  </div>
                )}

                {/* Comments list */}
                <div className="space-y-3 pt-2">
                  {doc.comments && doc.comments.length > 0 ? (
                    doc.comments.map((comment) => {
                      const canDelete =
                        currentUser &&
                        (currentUser.id === comment.user_id ||
                          ['SUPER_ADMIN', 'MODERATOR'].includes(currentUser.role));

                      return (
                        <div
                          key={comment.id}
                          className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                              {comment.user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-200">{comment.user.name}</span>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>

                          {canDelete && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-slate-500 hover:text-red-400 p-1 transition"
                              title="Xóa bình luận"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500 italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-center py-10 text-slate-400">Không tìm thấy bài viết.</p>
          )}
        </div>
      </div>
    </div>
  );
};
