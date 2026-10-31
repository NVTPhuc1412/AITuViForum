import { Router } from 'express';
import {
  getAllUsers,
  updateUserRole,
  getSystemStats,
  getAdminDocuments,
  updateDocumentStatus,
  getAdminComments,
  updateCommentStatus,
  updateDocumentSEO,
} from '../controllers/admin.controller.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

// ================= SUPER ADMIN =================
router.get('/users', requireAuth, requireRoles(Role.SUPER_ADMIN), getAllUsers);
router.put('/users/:userId/role', requireAuth, requireRoles(Role.SUPER_ADMIN), updateUserRole);
router.get('/stats', requireAuth, requireRoles(Role.SUPER_ADMIN), getSystemStats);

// ================= CONTENT MANAGER =================
router.get('/documents', requireAuth, requireRoles(Role.SUPER_ADMIN, Role.CONTENT_MANAGER), getAdminDocuments);
router.put('/documents/:id/status', requireAuth, requireRoles(Role.SUPER_ADMIN, Role.CONTENT_MANAGER), updateDocumentStatus);

// ================= MODERATOR =================
router.get('/comments', requireAuth, requireRoles(Role.SUPER_ADMIN, Role.MODERATOR), getAdminComments);
router.put('/comments/:commentId/status', requireAuth, requireRoles(Role.SUPER_ADMIN, Role.MODERATOR), updateCommentStatus);

// ================= DATA & SEO SPECIALIST =================
router.put('/seo/:docId', requireAuth, requireRoles(Role.SUPER_ADMIN, Role.SEO_SPECIALIST), updateDocumentSEO);

export default router;
