import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { Role, DocumentStatus, CommentStatus } from '@prisma/client';

// ================= SUPER ADMIN =================
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        created_at: true,
        _count: {
          select: { documents: true, comments: true },
        },
      },
    });

    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách người dùng: ' + error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);
    const { role } = req.body;

    if (!role || !Object.values(Role).includes(role)) {
      res.status(400).json({ success: false, message: 'Vai trò (role) không hợp lệ.' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    res.json({ success: true, message: `Đã cập nhật vai trò của ${updatedUser.name} thành ${updatedUser.role}.`, data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật vai trò: ' + error.message });
  }
};

export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [userCount, docCount, commentCount, searchCount] = await Promise.all([
      prisma.user.count(),
      prisma.document.count(),
      prisma.comment.count(),
      prisma.searchClickLog.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: userCount,
        totalDocuments: docCount,
        totalComments: commentCount,
        totalSearches: searchCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi: ' + error.message });
  }
};

// ================= CONTENT MANAGER =================
export const getAdminDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const docs = await prisma.document.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, data: docs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi: ' + error.message });
  }
};

export const updateDocumentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!status || !Object.values(DocumentStatus).includes(status)) {
      res.status(400).json({ success: false, message: 'Trạng thái bài viết không hợp lệ.' });
      return;
    }

    const updated = await prisma.document.update({
      where: { id },
      data: { status },
      select: { id: true, title: true, status: true },
    });

    res.json({ success: true, message: `Đã đổi trạng thái bài viết thành ${status}.`, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái: ' + error.message });
  }
};

// ================= MODERATOR =================
export const getAdminComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await prisma.comment.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        document: { select: { id: true, title: true } },
      },
    });

    res.json({ success: true, data: comments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi: ' + error.message });
  }
};

export const updateCommentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const commentId = parseInt(req.params.commentId);
    const { status } = req.body;

    if (!status || !Object.values(CommentStatus).includes(status)) {
      res.status(400).json({ success: false, message: 'Trạng thái bình luận không hợp lệ.' });
      return;
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { status },
      select: { id: true, status: true },
    });

    res.json({ success: true, message: `Đã chuyển bình luận sang trạng thái ${status}.`, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật bình luận: ' + error.message });
  }
};

// ================= DATA & SEO SPECIALIST =================
export const updateDocumentSEO = async (req: Request, res: Response): Promise<void> => {
  try {
    const docId = parseInt(req.params.docId);
    const { meta_title, meta_description, meta_keywords } = req.body;

    const updated = await prisma.document.update({
      where: { id: docId },
      data: {
        ...(meta_title !== undefined ? { meta_title } : {}),
        ...(meta_description !== undefined ? { meta_description } : {}),
        ...(meta_keywords !== undefined ? { meta_keywords } : {}),
      },
      select: {
        id: true,
        title: true,
        meta_title: true,
        meta_description: true,
        meta_keywords: true,
      },
    });

    res.json({ success: true, message: 'Cập nhật cấu hình SEO bài viết thành công.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật SEO: ' + error.message });
  }
};
