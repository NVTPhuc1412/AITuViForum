import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const recordSearchClickLog = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { query_string, clicked_doc_id } = req.body;

    if (!query_string || typeof query_string !== 'string') {
      res.status(400).json({ success: false, message: 'query_string là bắt buộc.' });
      return;
    }

    const userId = req.user ? req.user.id : (req.body.user_id ? parseInt(req.body.user_id) : null);
    const clickedDocId = clicked_doc_id ? parseInt(clicked_doc_id) : null;

    const log = await prisma.searchClickLog.create({
      data: {
        query_string: query_string.trim(),
        user_id: userId,
        clicked_doc_id: clickedDocId,
        timestamp: new Date(),
      },
    });

    res.status(201).json({ success: true, message: 'Đã ghi nhận log tương tác.', data: log });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi ghi log: ' + error.message });
  }
};

export const getSearchLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [total, logs] = await Promise.all([
      prisma.searchClickLog.count(),
      prisma.searchClickLog.findMany({
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          clicked_doc: { select: { id: true, title: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi: ' + error.message });
  }
};

export const getSearchAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total searches
    const totalLogs = await prisma.searchClickLog.count();
    const totalClicks = await prisma.searchClickLog.count({
      where: { clicked_doc_id: { not: null } },
    });

    const ctr = totalLogs > 0 ? ((totalClicks / totalLogs) * 100).toFixed(2) : '0';

    // Top queries
    const allLogs = await prisma.searchClickLog.findMany({
      select: { query_string: true, clicked_doc_id: true },
    });

    const queryStats: Record<string, { count: number; clicks: number }> = {};
    for (const l of allLogs) {
      const q = l.query_string.toLowerCase();
      if (!queryStats[q]) {
        queryStats[q] = { count: 0, clicks: 0 };
      }
      queryStats[q].count++;
      if (l.clicked_doc_id) {
        queryStats[q].clicks++;
      }
    }

    const topQueries = Object.entries(queryStats)
      .map(([query, stat]) => ({
        query,
        count: stat.count,
        clicks: stat.clicks,
        ctr: ((stat.clicks / stat.count) * 100).toFixed(1) + '%',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        totalSearches: totalLogs,
        totalClicks,
        overallCTR: `${ctr}%`,
        topQueries,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Lỗi: ' + error.message });
  }
};
