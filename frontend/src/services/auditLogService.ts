import api from './api';

export interface AuditLog {
  _id: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  school?: {
    _id: string;
    name: string;
  };
  action: string;
  resource: string;
  resourceId?: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  statusCode: number;
  ipAddress?: string;
  userAgent?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  duration?: number;
  error?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  userId?: string;
  schoolId?: string;
  action?: string;
  resource?: string;
  method?: string;
  statusCode?: number;
  statusCodeMin?: number;
  statusCodeMax?: number;
  startDate?: string;
  endDate?: string;
  errorsOnly?: boolean;
  search?: string;
}

export interface AuditLogStats {
  totalLogs: number;
  errorLogs: number;
  successRate: string;
  topActions: Array<{ action: string; count: number }>;
  topResources: Array<{ resource: string; count: number }>;
  topUsers: Array<{
    userId: string;
    count: number;
    user: string;
    email: string;
  }>;
}

class AuditLogService {
  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters: AuditLogFilters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const response = await api.request<{
      logs: AuditLog[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/audit-logs?${queryParams}`);
    
    return response.data;
  }

  /**
   * Get a single audit log by ID
   */
  async getAuditLog(id: string) {
    const response = await api.request<AuditLog>(`/audit-logs/${id}`);
    return response.data;
  }

  /**
   * Get current user's audit logs
   */
  async getMyAuditLogs(filters: AuditLogFilters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const response = await api.request<{
      logs: AuditLog[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/audit-logs/my?${queryParams}`);
    
    return response.data;
  }

  /**
   * Get audit log statistics
   */
  async getAuditStats(filters?: { startDate?: string; endDate?: string }) {
    const queryParams = new URLSearchParams();
    
    if (filters?.startDate) {
      queryParams.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      queryParams.append('endDate', filters.endDate);
    }
    
    const response = await api.request<AuditLogStats>(
      `/audit-logs/stats?${queryParams}`
    );
    
    return response.data;
  }

  /**
   * Delete old audit logs (admin only)
   */
  async deleteOldLogs(days: number = 365) {
    const response = await api.request<{
      message: string;
      deletedCount: number;
      cutoffDate: string;
    }>(`/audit-logs/old?days=${days}`, {
      method: 'DELETE'
    });
    
    return response.data;
  }

  /**
   * Format action name for display
   */
  formatAction(action: string): string {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get status color based on status code
   */
  getStatusColor(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) {
      return 'text-green-600 bg-green-100';
    } else if (statusCode >= 400 && statusCode < 500) {
      return 'text-yellow-600 bg-yellow-100';
    } else if (statusCode >= 500) {
      return 'text-red-600 bg-red-100';
    }
    return 'text-gray-600 bg-gray-100';
  }

  /**
   * Get method color badge
   */
  getMethodColor(method: string): string {
    switch (method) {
      case 'GET':
        return 'text-blue-600 bg-blue-100';
      case 'POST':
        return 'text-green-600 bg-green-100';
      case 'PUT':
      case 'PATCH':
        return 'text-yellow-600 bg-yellow-100';
      case 'DELETE':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
}

export default new AuditLogService();
