import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';

// Get audit logs with filters and pagination
export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can view audit logs
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('Accès refusé. Seuls les administrateurs peuvent consulter les logs d\'audit.');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};

    // Filter by user
    if (req.query.userId) {
      filter.user = req.query.userId;
    }

    // Filter by school
    if (req.query.schoolId) {
      filter.school = req.query.schoolId;
    }

    // Filter by action
    if (req.query.action) {
      filter.action = req.query.action;
    }

    // Filter by resource
    if (req.query.resource) {
      filter.resource = req.query.resource;
    }

    // Filter by method
    if (req.query.method) {
      filter.method = req.query.method;
    }

    // Filter by status code
    if (req.query.statusCode) {
      filter.statusCode = parseInt(req.query.statusCode as string);
    }

    // Filter by status code range
    if (req.query.statusCodeMin || req.query.statusCodeMax) {
      filter.statusCode = {};
      if (req.query.statusCodeMin) {
        filter.statusCode.$gte = parseInt(req.query.statusCodeMin as string);
      }
      if (req.query.statusCodeMax) {
        filter.statusCode.$lte = parseInt(req.query.statusCodeMax as string);
      }
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    // Filter errors only
    if (req.query.errorsOnly === 'true') {
      filter.statusCode = { $gte: 400 };
    }

    // Search in action or resource
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [
        { action: searchRegex },
        { resource: searchRegex },
        { endpoint: searchRegex }
      ];
    }

    // Execute query
    const logs = await AuditLog.find(filter)
      .populate('user', 'firstName lastName email role')
      .populate('school', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      res.status(403).json({ message: error.message });
    } else {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des logs d\'audit' });
    }
  }
};

// Get a single audit log by ID
export const getAuditLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can view audit logs
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('Accès refusé. Seuls les administrateurs peuvent consulter les logs d\'audit.');
    }

    const { id } = req.params;
    const log = await AuditLog.findById(id)
      .populate('user', 'firstName lastName email role')
      .populate('school', 'name')
      .lean();

    if (!log) {
      throw new NotFoundError('Log d\'audit non trouvé');
    }

    res.json(log);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: error.message });
    } else if (error instanceof AuthorizationError) {
      res.status(403).json({ message: error.message });
    } else {
      console.error('Error fetching audit log:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du log d\'audit' });
    }
  }
};

// Get audit logs for current user
export const getMyAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const filter: any = { user: userId };

    // Filter by action
    if (req.query.action) {
      filter.action = req.query.action;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    const logs = await AuditLog.find(filter)
      .populate('school', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de vos logs d\'audit' });
  }
};

// Get audit log statistics
export const getAuditStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can view audit stats
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('Accès refusé. Seuls les administrateurs peuvent consulter les statistiques d\'audit.');
    }

    const filter: any = {};

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    // Get statistics
    const [
      totalLogs,
      errorLogs,
      actionStats,
      resourceStats,
      topUsers
    ] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.countDocuments({ ...filter, statusCode: { $gte: 400 } }),
      AuditLog.aggregate([
        { $match: filter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      AuditLog.aggregate([
        { $match: filter },
        { $group: { _id: '$resource', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      AuditLog.aggregate([
        { $match: { ...filter, user: { $exists: true } } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 1,
            count: 1,
            'user.firstName': 1,
            'user.lastName': 1,
            'user.email': 1
          }
        }
      ])
    ]);

    res.json({
      totalLogs,
      errorLogs,
      successRate: totalLogs > 0 ? ((totalLogs - errorLogs) / totalLogs * 100).toFixed(2) : '100',
      topActions: actionStats.map(s => ({ action: s._id, count: s.count })),
      topResources: resourceStats.map(s => ({ resource: s._id, count: s.count })),
      topUsers: topUsers.map(u => ({
        userId: u._id,
        count: u.count,
        user: `${u.user.firstName} ${u.user.lastName}`,
        email: u.user.email
      }))
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      res.status(403).json({ message: error.message });
    } else {
      console.error('Error fetching audit stats:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques d\'audit' });
    }
  }
};

// Delete old audit logs (admin only)
export const deleteOldLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can delete audit logs
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('Accès refusé. Seuls les administrateurs peuvent supprimer les logs d\'audit.');
    }

    const daysToKeep = parseInt(req.query.days as string) || 365;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    res.json({
      message: `${result.deletedCount} logs d'audit supprimés`,
      deletedCount: result.deletedCount,
      cutoffDate
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      res.status(403).json({ message: error.message });
    } else {
      console.error('Error deleting old audit logs:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression des logs d\'audit' });
    }
  }
};
