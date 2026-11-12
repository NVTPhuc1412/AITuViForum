export type Role = 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'MODERATOR' | 'SEO_SPECIALIST' | 'USER';

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role: Role;
  bio?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    documents: number;
  };
}

export interface Comment {
  id: number;
  document_id: number;
  user_id: number;
  content: string;
  status: 'APPROVED' | 'PENDING' | 'FLAGGED';
  created_at: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  document?: {
    id: number;
    title: string;
  };
}

export interface DocumentItem {
  id: number;
  title: string;
  summary: string;
  content?: string;
  plain_text?: string;
  category_id: number;
  tags: string[];
  views_count: number;
  likes_count: number;
  status: 'PUBLISHED' | 'DRAFT' | 'UNPUBLISHED' | 'FLAGGED';
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  author: {
    id: number;
    name: string;
    avatar?: string;
    bio?: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  comments?: Comment[];
  _count?: {
    comments: number;
  };
  /** Query-biased excerpt (Luhn-style significance clustering), present only when `search` was used. */
  snippet?: string;
  matched_terms?: string[];
}

export type SearchMode = 'hybrid' | 'bm25' | 'tfidf' | 'semantic' | 'db';

export interface TokenBreakdown {
  term: string;
  idf: number;
  tf: number;
  score_contrib: number;
  percentage: number;
}

export interface PythonSearchResult {
  id: number;
  score: number;
  bm25_score?: number;
  tfidf_score?: number;
  semantic_score?: number;
  hybrid_rank?: number;
  bm25_rank?: number;
  tfidf_rank?: number;
  semantic_rank?: number;
  title: string;
  summary: string;
  snippet: string;
  matched_terms?: string[];
  category_name?: string;
  tags: string[];
  views_count: number;
  likes_count: number;
  author_name?: string;
  created_at?: string;
  token_breakdown?: TokenBreakdown[];
}

export interface SearchAnalytics {
  totalSearches: number;
  totalClicks: number;
  overallCTR: string;
  topQueries: {
    query: string;
    count: number;
    clicks: number;
    ctr: string;
  }[];
}
