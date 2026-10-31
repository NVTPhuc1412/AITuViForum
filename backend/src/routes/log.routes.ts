import { Router } from 'express';
import { recordSearchClickLog, getSearchLogs, getSearchAnalytics } from '../controllers/log.controller.js';
import { optionalAuth, requireAuth, requireRoles } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

// Endpoint for client to record searches and clicks
router.post('/search-click', optionalAuth, recordSearchClickLog);

// Analytics and log inspection for SEO Specialists & Admins
router.get('/', requireAuth, requireRoles(Role.SUPER_ADMIN, Role.SEO_SPECIALIST), getSearchLogs);
router.get('/analytics', requireAuth, requireRoles(Role.SUPER_ADMIN, Role.SEO_SPECIALIST), getSearchAnalytics);

export default router;
