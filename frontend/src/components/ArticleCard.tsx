import React from 'react';
import { Eye, Heart, MessageSquare, Tag, Award } from 'lucide-react';
import { DocumentItem, PythonSearchResult } from '../types';

interface ArticleCardProps {
  document: DocumentItem | PythonSearchResult;
  score?: number;
  searchMode: string;
  onClick: () => void;
  onLike?: (id: number) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  document,
  score,
  searchMode,
  onClick,
  onLike,
}) => {
  const isPythonResult = 'snippet' in document;
  const authorName = isPythonResult
    ? (document as PythonSearchResult).author_name || 'AstroAI Member'
    : (document as DocumentItem).author?.name || 'AstroAI Member';

  const categoryName = isPythonResult
    ? (document as PythonSearchResult).category_name || 'Tử Vi & AI'
    : (document as DocumentItem).category?.name || 'Tử Vi & AI';

  const commentsCount = !isPythonResult && (document as DocumentItem)._count
    ? (document as DocumentItem)._count?.comments || 0
    : 0;

  const displaySnippet = isPythonResult
    ? (document as PythonSearchResult).snippet
    : document.summary;

  return (
    <article
      onClick={onClick}
      className="group relative bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-purple-950/20 flex flex-col justify-between"
    >
      <div>
        {/* Header: Category & Score */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
            {categoryName}
          </span>

          {score !== undefined && score > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-astro-gold border border-amber-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>{searchMode.toUpperCase()} Score: {score}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-100 group-hover:text-astro-cyan transition line-clamp-2 leading-snug mb-2">
          {document.title}
        </h3>

        {/* Snippet / Summary */}
        <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
          {displaySnippet}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 border border-slate-700">
            {authorName.charAt(0)}
          </div>
          <span className="truncate max-w-[120px] text-slate-300 font-medium">{authorName}</span>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1 hover:text-slate-200" title="Lượt xem">
            <Eye className="w-3.5 h-3.5" />
            <span>{document.views_count}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike && onLike(document.id);
            }}
            className="flex items-center gap-1 hover:text-rose-400 transition"
            title="Thích bài viết"
          >
            <Heart className="w-3.5 h-3.5 group-hover:scale-110 transition" />
            <span>{document.likes_count}</span>
          </button>

          {!isPythonResult && (
            <div className="flex items-center gap-1" title="Bình luận">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{commentsCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tags pill */}
      {document.tags && document.tags.length > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          {document.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md flex items-center gap-0.5"
            >
              <Tag className="w-2.5 h-2.5 text-slate-500" />
              {tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="text-[10px] text-slate-500">+{document.tags.length - 3}</span>
          )}
        </div>
      )}
    </article>
  );
};
