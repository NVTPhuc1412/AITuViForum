import { DocumentItem, Category, Comment, User, PythonSearchResult, SearchAnalytics } from '../types';

const API_BASE = '/api';
const SEARCH_ENGINE_BASE = '/search-engine';

export function getStoredToken(): string | null {
  return localStorage.getItem('astroai_token');
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem('astroai_token', token);
  } else {
    localStorage.removeItem('astroai_token');
  }
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem('astroai_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem('astroai_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('astroai_user');
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Lỗi kết nối máy chủ');
  }

  return data;
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    return request<{ success: boolean; data: { token: string; user: User } }>(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  register: async (name: string, email: string, password: string, bio?: string) => {
    return request<{ success: boolean; data: { token: string; user: User } }>(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, bio }),
    });
  },
  getProfile: async () => {
    return request<{ success: boolean; data: User }>(`${API_BASE}/auth/profile`);
  },

  // Metadata
  getCategories: async () => {
    return request<{ success: boolean; data: Category[] }>(`${API_BASE}/documents/meta/categories`);
  },
  getPopularTags: async () => {
    return request<{ success: boolean; data: { tag: string; count: number }[] }>(`${API_BASE}/documents/meta/tags`);
  },

  // Documents (Standard DB Search / Feed)
  getDocuments: async (params: {
    page?: number;
    limit?: number;
    category_id?: number | string;
    tag?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.category_id) query.set('category_id', params.category_id.toString());
    if (params.tag) query.set('tag', params.tag);
    if (params.search) query.set('search', params.search);
    if (params.from_date) query.set('from_date', params.from_date);
    if (params.to_date) query.set('to_date', params.to_date);

    return request<{
      success: boolean;
      data: {
        documents: DocumentItem[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      };
    }>(`${API_BASE}/documents?${query.toString()}`);
  },
  getDocumentById: async (id: number) => {
    return request<{ success: boolean; data: DocumentItem }>(`${API_BASE}/documents/${id}`);
  },
  likeDocument: async (id: number) => {
    return request<{ success: boolean; data: { id: number; likes_count: number } }>(`${API_BASE}/documents/${id}/like`, {
      method: 'POST',
    });
  },
  createDocument: async (data: {
    title: string;
    summary: string;
    content: string;
    category_id: number;
    tags: string[];
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
  }) => {
    return request<{ success: boolean; data: DocumentItem }>(`${API_BASE}/documents`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Comments
  addComment: async (docId: number, content: string) => {
    return request<{ success: boolean; data: Comment }>(`${API_BASE}/documents/${docId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
  deleteComment: async (commentId: number) => {
    return request<{ success: boolean }>(`${API_BASE}/documents/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  // Logs (Phase 2 Prep)
  recordSearchClick: async (queryString: string, clickedDocId?: number) => {
    try {
      await request(`${API_BASE}/logs/search-click`, {
        method: 'POST',
        body: JSON.stringify({ query_string: queryString, clicked_doc_id: clickedDocId }),
      });
    } catch {
      // Fire-and-forget logging
    }
  },
  getSearchAnalytics: async () => {
    return request<{ success: boolean; data: SearchAnalytics }>(`${API_BASE}/logs/analytics`);
  },

  // Admin Portal (RBAC)
  getAllUsers: async () => {
    return request<{ success: boolean; data: User[] }>(`${API_BASE}/admin/users`);
  },
  updateUserRole: async (userId: number, role: string) => {
    return request<{ success: boolean; data: User }>(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },
  getAdminDocuments: async () => {
    return request<{ success: boolean; data: DocumentItem[] }>(`${API_BASE}/admin/documents`);
  },
  updateDocumentStatus: async (docId: number, status: string) => {
    return request<{ success: boolean; data: DocumentItem }>(`${API_BASE}/admin/documents/${docId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  getAdminComments: async () => {
    return request<{ success: boolean; data: Comment[] }>(`${API_BASE}/admin/comments`);
  },
  updateCommentStatus: async (commentId: number, status: string) => {
    return request<{ success: boolean; data: Comment }>(`${API_BASE}/admin/comments/${commentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  updateDocumentSEO: async (docId: number, seo: { meta_title?: string; meta_description?: string; meta_keywords?: string }) => {
    return request<{ success: boolean; data: DocumentItem }>(`${API_BASE}/admin/seo/${docId}`, {
      method: 'PUT',
      body: JSON.stringify(seo),
    });
  },

  // Python Search Engine (Hybrid / BM25 / TF-IDF / Semantic)
  pythonSearch: async (
    q: string,
    mode: 'hybrid' | 'bm25' | 'tfidf' | 'semantic' = 'hybrid',
    limit: number = 15,
    alpha: number = 0.65,
    beta: number = 0.35
  ) => {
    return request<{
      success: boolean;
      data: {
        query: string;
        tokens: string[];
        mode: string;
        total_results: number;
        execution_time_ms: number;
        vocabulary_size?: number;
        indexed_docs_count?: number;
        semantic_ready?: boolean;
        results: PythonSearchResult[];
      };
    }>(`${SEARCH_ENGINE_BASE}/search?q=${encodeURIComponent(q)}&mode=${mode}&limit=${limit}&alpha=${alpha}&beta=${beta}`);
  },
  rebuildPythonIndex: async () => {
    return request<{ success: boolean; message: string; indexed_documents: number }>(`${SEARCH_ENGINE_BASE}/index/rebuild`, {
      method: 'POST',
    });
  },
  getPythonHealth: async () => {
    return request<{
      status: string;
      service: string;
      indexed_documents: number;
      vocabulary_size: number;
      average_doc_length: number;
      semantic_ready?: boolean;
      semantic_model?: string;
      semantic_indexed_docs?: number;
    }>(`${SEARCH_ENGINE_BASE}/health`);
  },
};
