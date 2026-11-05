import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Category, DocumentItem } from '../types';
import { api } from '../api/client';

interface CreateArticleModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onSuccess: (newDoc: DocumentItem) => void;
}

export const CreateArticleModal: React.FC<CreateArticleModalProps> = ({
  isOpen,
  categories,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 1);
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary || !content) return;

    setLoading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await api.createDocument({
        title,
        summary,
        content,
        category_id: Number(categoryId),
        tags,
      });

      if (res.success) {
        alert('Tạo bài viết mới thành công!');
        onSuccess(res.data);
        onClose();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-night-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-night-900 border border-night-line shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-night-line">
          <h2 className="font-serif text-lg text-parchment">Đăng bài thảo luận & nghiên cứu mới</h2>
          <button onClick={onClose} className="text-parchment-dim hover:text-parchment p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-parchment-muted mb-1">Tiêu đề bài viết</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Phân tích sao Tử Vi tại Ngọ bằng mô hình Gemini 1.5 Pro..."
              className="w-full bg-night-800 border border-night-line px-3 py-2 text-xs text-parchment focus:outline-none focus:border-brass/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-parchment-muted mb-1">Chuyên mục</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full bg-night-800 border border-night-line px-3 py-2 text-xs text-parchment focus:outline-none focus:border-brass/50"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-parchment-muted mb-1">Tóm tắt ngắn (Summary)</label>
            <textarea
              rows={2}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Tóm tắt 1-2 câu về ý chính của bài viết..."
              className="w-full bg-night-800 border border-night-line px-3 py-2 text-xs text-parchment focus:outline-none focus:border-brass/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-parchment-muted mb-1">Nội dung chi tiết</label>
            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung bài viết (hỗ trợ văn bản thường hoặc thẻ HTML <p>, <strong>, <pre>...)"
              className="w-full bg-night-800 border border-night-line px-3 py-2 text-xs text-parchment focus:outline-none focus:border-brass/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-parchment-muted mb-1">Tags (cách nhau bởi dấu phẩy)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Cung Mệnh, Claude, Tử Vi, Prompt"
              className="w-full bg-night-800 border border-night-line px-3 py-2 text-xs text-parchment focus:outline-none focus:border-brass/50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-parchment-dim hover:text-parchment"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-brass text-night-950 text-xs font-bold hover:bg-brass-light flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Đang tạo...' : 'Đăng bài viết'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
