import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
  value: any;
}

export interface Report {
  _id?: string;
  name: string;
  description?: string;
  type: 'students' | 'grades' | 'attendance' | 'finances' | 'custom';
  template?: string;
  fields: string[];
  filters: ReportFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  format: 'pdf' | 'excel' | 'csv';
  scheduled?: boolean;
  scheduleExpression?: string;
  createdBy?: any;
  school?: string;
  lastRun?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReportTemplate {
  name: string;
  type: string;
  fields: string[];
  filters: ReportFilter[];
  sortBy?: string;
  sortOrder?: string;
}

export interface ReportStats {
  totalReports: number;
  scheduledReports: number;
  recentlyRun: any[];
  byType: { [key: string]: number };
  byFormat: { [key: string]: number };
}

class ReportService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Get all reports
   */
  async getReports(params?: { type?: string; scheduled?: boolean }): Promise<Report[]> {
    const response = await axios.get(`${API_URL}/reports`, {
      headers: this.getAuthHeader(),
      params,
    });
    return response.data.data;
  }

  /**
   * Get single report by ID
   */
  async getReport(id: string): Promise<Report> {
    const response = await axios.get(`${API_URL}/reports/${id}`, {
      headers: this.getAuthHeader(),
    });
    return response.data.data;
  }

  /**
   * Create a new report
   */
  async createReport(report: Partial<Report>): Promise<Report> {
    const response = await axios.post(`${API_URL}/reports`, report, {
      headers: this.getAuthHeader(),
    });
    return response.data.data;
  }

  /**
   * Update a report
   */
  async updateReport(id: string, report: Partial<Report>): Promise<Report> {
    const response = await axios.put(`${API_URL}/reports/${id}`, report, {
      headers: this.getAuthHeader(),
    });
    return response.data.data;
  }

  /**
   * Delete a report
   */
  async deleteReport(id: string): Promise<void> {
    await axios.delete(`${API_URL}/reports/${id}`, {
      headers: this.getAuthHeader(),
    });
  }

  /**
   * Generate and download report
   */
  async generateReport(id: string): Promise<void> {
    const response = await axios.post(
      `${API_URL}/reports/${id}/generate`,
      {},
      {
        headers: this.getAuthHeader(),
        responseType: 'blob',
      }
    );

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'report';
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get report templates
   */
  async getTemplates(): Promise<ReportTemplate[]> {
    const response = await axios.get(`${API_URL}/reports/templates`, {
      headers: this.getAuthHeader(),
    });
    return response.data.data;
  }

  /**
   * Get report statistics
   */
  async getStats(): Promise<ReportStats> {
    const response = await axios.get(`${API_URL}/reports/stats`, {
      headers: this.getAuthHeader(),
    });
    return response.data.data;
  }
}

export default new ReportService();
