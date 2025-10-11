import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

// Actions that should be logged
const AUDITABLE_ACTIONS: Record<string, string[]> = {
  // Authentication actions
  'POST /api/auth/login': ['login', 'Auth'],
  'POST /api/auth/register': ['register', 'Auth'],
  'POST /api/auth/logout': ['logout', 'Auth'],
  'POST /api/auth/change-password': ['change_password', 'Auth'],
  'POST /api/auth/forgot-password': ['forgot_password', 'Auth'],
  'POST /api/auth/reset-password': ['reset_password', 'Auth'],
  
  // User actions
  'POST /api/users': ['create_user', 'User'],
  'PUT /api/users': ['update_user', 'User'],
  'DELETE /api/users': ['delete_user', 'User'],
  
  // Student actions
  'POST /api/students': ['create_student', 'Student'],
  'PUT /api/students': ['update_student', 'Student'],
  'DELETE /api/students': ['delete_student', 'Student'],
  
  // Grade actions
  'POST /api/grades': ['create_grade', 'Grade'],
  'PUT /api/grades': ['update_grade', 'Grade'],
  'DELETE /api/grades': ['delete_grade', 'Grade'],
  
  // Invoice actions
  'POST /api/invoices': ['create_invoice', 'Invoice'],
  'PUT /api/invoices': ['update_invoice', 'Invoice'],
  'DELETE /api/invoices': ['delete_invoice', 'Invoice'],
  
  // Transaction actions
  'POST /api/transactions': ['create_transaction', 'Transaction'],
  'PUT /api/transactions': ['update_transaction', 'Transaction'],
  'DELETE /api/transactions': ['delete_transaction', 'Transaction'],
  
  // Class actions
  'POST /api/classes': ['create_class', 'Class'],
  'PUT /api/classes': ['update_class', 'Class'],
  'DELETE /api/classes': ['delete_class', 'Class'],
  
  // School actions
  'POST /api/schools': ['create_school', 'School'],
  'PUT /api/schools': ['update_school', 'School'],
  'DELETE /api/schools': ['delete_school', 'School'],
  
  // Expense actions
  'POST /api/expenses': ['create_expense', 'Expense'],
  'PUT /api/expenses': ['update_expense', 'Expense'],
  'DELETE /api/expenses': ['delete_expense', 'Expense'],
  'PUT /api/expenses/approve': ['approve_expense', 'Expense'],
  'PUT /api/expenses/reject': ['reject_expense', 'Expense'],
  
  // 2FA actions
  'POST /api/2fa/enable': ['enable_2fa', 'Auth'],
  'POST /api/2fa/disable': ['disable_2fa', 'Auth'],
};

// Helper to extract resource ID from path
const extractResourceId = (path: string): string | undefined => {
  // Match patterns like /api/users/123, /api/students/abc123, etc.
  const match = path.match(/\/api\/[^/]+\/([^/?]+)/);
  return match ? match[1] : undefined;
};

// Helper to determine action and resource from request
const getActionAndResource = (method: string, path: string): [string, string] | null => {
  // Normalize path by removing IDs
  const normalizedPath = path.replace(/\/[a-f0-9]{24}/, '').replace(/\/[^/]+$/, '');
  const key = `${method} ${normalizedPath}`;
  
  // Check exact match first
  if (AUDITABLE_ACTIONS[key]) {
    return AUDITABLE_ACTIONS[key] as [string, string];
  }
  
  // Check for partial matches
  for (const [pattern, [action, resource]] of Object.entries(AUDITABLE_ACTIONS)) {
    const [patternMethod, patternPath] = pattern.split(' ');
    if (method === patternMethod && path.startsWith(patternPath)) {
      return [action, resource];
    }
  }
  
  return null;
};

// Middleware to log auditable actions
export const auditLogger = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  
  // Store original send to capture response
  const originalSend = res.send;
  let responseBody: any;
  
  res.send = function (body: any): Response {
    responseBody = body;
    return originalSend.call(this, body);
  };
  
  // Wait for response to finish
  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const actionResource = getActionAndResource(req.method, req.path);
      
      // Only log if it's an auditable action
      if (!actionResource) {
        return;
      }
      
      const [action, resource] = actionResource;
      const resourceId = extractResourceId(req.path) || req.body?.id || req.params?.id;
      
      // Prepare audit log data
      const auditData: any = {
        user: req.user?.id,
        school: req.user?.school,
        action,
        resource,
        resourceId,
        method: req.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        endpoint: req.originalUrl,
        statusCode: res.statusCode,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        duration,
        metadata: {
          query: req.query,
          params: req.params
        }
      };
      
      // Add error if status is 4xx or 5xx
      if (res.statusCode >= 400) {
        try {
          const errorBody = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
          auditData.error = errorBody?.message || errorBody?.error || 'Unknown error';
        } catch (e) {
          auditData.error = 'Error parsing response';
        }
      }
      
      // For updates and deletes, we could store before/after states
      // This would require additional logic to fetch the resource before the operation
      
      // Save audit log asynchronously (don't block response)
      AuditLog.create(auditData).catch((error) => {
        logger.error('Failed to create audit log', { error, auditData });
      });
      
    } catch (error) {
      logger.error('Audit logging error', { error });
    }
  });
  
  next();
};

// Helper function to manually log an audit entry
export const logAuditEntry = async (data: {
  user?: string;
  school?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  statusCode: number;
  ipAddress?: string;
  metadata?: Record<string, any>;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
}): Promise<void> => {
  try {
    await AuditLog.create(data);
  } catch (error) {
    logger.error('Failed to create manual audit log', { error, data });
  }
};
