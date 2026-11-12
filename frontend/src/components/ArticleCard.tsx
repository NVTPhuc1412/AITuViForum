import React from 'react';
import { Eye, Heart, MessageSquare, Award } from 'lucide-react';
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
    ? (document as PythonSearchResult).category_name || 'AI & Công nghệ'
    : (document as DocumentItem).category?.name || 'AI & Công nghệ';

  const commentsCount = !isPythonResult && (document as DocumentItem)._count
    ? (document as DocumentItem)._count?.comments || 0
    : 0;

  const displaySnippet = isPythonResult
    ? (document as PythonSearchResult).snippet
    : document.summary;

  return (
    <article
      onClick={onClick}
      className="group relative bg-night-800 hover:bg-night-700 border border-night-line hover:border-brass/40 p-5 transition-colors duration-150 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Header: Category & Score */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="tag-notch inline-flex items-center px-2.5 py-1 text-[11px] font-semibold bg-brass/10 text-brass-light">
            {categoryName}
          </span>

          {score !== undefined && score > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-jade-light border border-jade/30">
              <Award className="w-3 h-3" />
              <span>{searchMode.toUpperCase()} {score}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg font-medium text-parchment group-hover:text-brass-light transition-colors line-clamp-2 leading-snug mb-2">
          {document.title}
        </h3>

        {/* Snippet / Summary */}
        <p className="text-xs text-parchment-muted line-clamp-3 mb-4 leading-relaxed">
          {displaySnippet}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-night-line flex items-center justify-between text-xs text-parchment-muted">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-night-700 flex items-center justify-center text-[10px] font-bold text-parchment-muted border border-night-line">
            {authorName.charAt(0)}
          </div>
          <span className="truncate max-w-[120px] text-parchment-muted font-medium">{authorName}</span>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1 hover:text-parchment" title="Lượt xem">
            <Eye className="w-3.5 h-3.5" />
            <span>{document.views_count}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike && onLike(document.id);
            }}
            className="flex items-center gap-1 hover:text-lacquer-light transition"
            title="Thích bài viết"
          >
            <Heart className="w-3.5 h-3.5" />
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
        <div className="mt-2.5 flex items-center gap-x-3 gap-y-1 flex-wrap text-[10px] text-parchment-dim">
          {document.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx}>#{tag}</span>
          ))}
          {document.tags.length > 3 && <span>+{document.tags.length - 3}</span>}
        </div>
      )}
    </article>
  );
};
