import { Router } from 'express';
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  likeDocument,
  getCategories,
  getPopularTags,
} from '../controllers/document.controller.js';
import { addComment, getCommentsByDocument, deleteComment } from '../controllers/comment.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Metadata & Taxonomy
router.get('/meta/categories', getCategories);
router.get('/meta/tags', getPopularTags);

// Documents CRUD
router.get('/', optionalAuth, getDocuments);
router.get('/:id', optionalAuth, getDocumentById);
router.post('/', requireAuth, createDocument);
router.put('/:id', requireAuth, updateDocument);
router.delete('/:id', requireAuth, deleteDocument);
router.post('/:id/like', likeDocument);

// Comments
router.get('/:id/comments', getCommentsByDocument);
router.post('/:id/comments', requireAuth, addComment);
router.delete('/comments/:commentId', requireAuth, deleteComment);

export default router;
