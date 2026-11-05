import { Response } from 'express';
import { prisma } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Role } from '@prisma/client';

export const addComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập để bình luận.' });
      return;
    }

    const document_id = parseInt(req.params.id);
    const { content } = req.body;

    if (!content || content.trim() === '') {
      res.status(400).json({ success: false, message: 'Nội dung bình luận không được để trống.' });
      return;
    }

    const doc = await prisma.document.findUnique({ where: { id: document_id } });
    if (!doc) {
      res.status(404).json({ success: false, message: 'Bài viết không tồn tại.' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        document_id,
        user_id: req.user.id,
        content: content.trim(),
        status: 'APPROVED', // Default approved, Moderator can flag/delete later
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.status(201).json({ success: true, message: 'Đăng bình luận thành công.', data: comment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi khi gửi bình luận: ' + error.message });
  }
};

export const getCommentsByDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const document_id = parseInt(req.params.id);
    const comments = await prisma.comment.findMany({
      where: { document_id, status: 'APPROVED' },
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.json({ success: true, data: comments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi tải bình luận: ' + error.message });
  }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập.' });
      return;
    }

    const commentId = parseInt(req.params.commentId);
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
      res.status(404).json({ success: false, message: 'Bình luận không tồn tại.' });
      return;
    }

    const isOwner = comment.user_id === req.user.id;
    const isModOrAdmin = ([Role.SUPER_ADMIN, Role.MODERATOR] as Role[]).includes(req.user.role);

    if (!isOwner && !isModOrAdmin) {
      res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bình luận này.' });
      return;
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ success: true, message: 'Xóa bình luận thành công.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa bình luận: ' + error.message });
  }
};
