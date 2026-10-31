import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { DocumentStatus, Role } from '@prisma/client';

// Simple helper to strip HTML tags to produce plain_text for indexing/search
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const { category_id, tag, search, from_date, to_date, status } = req.query;

    const where: any = {};

    // Filter by status (default only PUBLISHED for regular users)
    if (status && Object.values(DocumentStatus).includes(status as DocumentStatus)) {
      where.status = status as DocumentStatus;
    } else {
      where.status = DocumentStatus.PUBLISHED;
    }

    // Filter by Category
    if (category_id) {
      where.category_id = parseInt(category_id as string);
    }

    // Filter by Tag
    if (tag) {
      where.tags = { has: tag as string };
    }

    // Filter by Date Range
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) {
        where.created_at.gte = new Date(from_date as string);
      }
      if (to_date) {
        where.created_at.lte = new Date(to_date as string);
      }
    }

    // Basic Standard Search (LIKE / ILIKE) across title, summary, plain_text
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { plain_text: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          summary: true,
          category_id: true,
          tags: true,
          views_count: true,
          likes_count: true,
          status: true,
          created_at: true,
          author: {
            select: { id: true, name: true, avatar: true },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách bài viết: ' + error.message });
  }
};

export const getDocumentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'ID bài viết không hợp lệ.' });
      return;
    }

    // Increment views_count atomically
    const document = await prisma.document.update({
      where: { id },
      data: { views_count: { increment: 1 } },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, bio: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        comments: {
          where: { status: 'APPROVED' },
          orderBy: { created_at: 'desc' },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    res.json({ success: true, data: document });
  } catch (error: any) {
    res.status(404).json({ success: false, message: 'Không tìm thấy bài viết hoặc bài viết đã bị xóa.' });
  }
};

export const createDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập.' });
      return;
    }

    const { title, summary, content, category_id, tags, meta_title, meta_description, meta_keywords } = req.body;

    if (!title || !summary || !content || !category_id) {
      res.status(400).json({ success: false, message: 'Vui lòng điền đủ tiêu đề, tóm tắt, nội dung và chuyên mục.' });
      return;
    }

    const plain_text = stripHtml(content);

    const doc = await prisma.document.create({
      data: {
        title,
        summary,
        content,
        plain_text,
        category_id: parseInt(category_id),
        tags: Array.isArray(tags) ? tags : [],
        author_id: req.user.id,
        meta_title: meta_title || title,
        meta_description: meta_description || summary,
        meta_keywords: meta_keywords || (Array.isArray(tags) ? tags.join(', ') : ''),
        status: DocumentStatus.PUBLISHED,
      },
    });

    res.status(201).json({ success: true, message: 'Tạo bài viết thành công.', data: doc });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi tạo bài viết: ' + error.message });
  }
};

export const updateDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập.' });
      return;
    }

    const id = parseInt(req.params.id);
    const existing = await prisma.document.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Không tìm thấy bài viết.' });
      return;
    }

    // Check ownership or managerial privileges
    const isOwner = existing.author_id === req.user.id;
    const isPrivileged = [Role.SUPER_ADMIN, Role.CONTENT_MANAGER].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa bài viết này.' });
      return;
    }

    const { title, summary, content, category_id, tags, meta_title, meta_description, meta_keywords, status } = req.body;

    const data: any = {};
    if (title) data.title = title;
    if (summary) data.summary = summary;
    if (content) {
      data.content = content;
      data.plain_text = stripHtml(content);
    }
    if (category_id) data.category_id = parseInt(category_id);
    if (tags) data.tags = Array.isArray(tags) ? tags : [];
    if (meta_title !== undefined) data.meta_title = meta_title;
    if (meta_description !== undefined) data.meta_description = meta_description;
    if (meta_keywords !== undefined) data.meta_keywords = meta_keywords;
    if (status && isPrivileged) data.status = status;

    const updated = await prisma.document.update({
      where: { id },
      data,
    });

    res.json({ success: true, message: 'Cập nhật bài viết thành công.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật bài viết: ' + error.message });
  }
};

export const deleteDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập.' });
      return;
    }

    const id = parseInt(req.params.id);
    const existing = await prisma.document.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Không tìm thấy bài viết.' });
      return;
    }

    const isOwner = existing.author_id === req.user.id;
    const isPrivileged = [Role.SUPER_ADMIN, Role.CONTENT_MANAGER].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bài viết này.' });
      return;
    }

    await prisma.document.delete({ where: { id } });

    res.json({ success: true, message: 'Xóa bài viết thành công.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa bài viết: ' + error.message });
  }
};

export const likeDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const updated = await prisma.document.update({
      where: { id },
      data: { likes_count: { increment: 1 } },
      select: { id: true, likes_count: true },
    });

    res.json({ success: true, message: 'Thích bài viết thành công.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi: ' + error.message });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { documents: { where: { status: DocumentStatus.PUBLISHED } } },
        },
      },
    });

    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi: ' + error.message });
  }
};

export const getPopularTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const docs = await prisma.document.findMany({
      where: { status: DocumentStatus.PUBLISHED },
      select: { tags: true },
    });

    const tagCounts: Record<string, number> = {};
    for (const doc of docs) {
      for (const tag of doc.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    res.json({ success: true, data: sortedTags });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi: ' + error.message });
  }
};
