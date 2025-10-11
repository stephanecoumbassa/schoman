import api from './api';

export interface School {
  _id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  director?: string;
  academicYearStart: string;
  academicYearEnd: string;
  settings: {
    currency: string;
    language: string;
    timezone: string;
    dateFormat: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolStats {
  school: {
    id: string;
    name: string;
    code: string;
  };
  statistics: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalRevenue: number;
  };
}

class SchoolService {
  private baseURL = '/api/schools';

  async getAll(params?: { isActive?: boolean; search?: string }): Promise<School[]> {
    const response = await api.get(this.baseURL, { params });
    return response.data;
  }

  async getById(id: string): Promise<School> {
    const response = await api.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async getByCode(code: string): Promise<School> {
    const response = await api.get(`${this.baseURL}/code/${code}`);
    return response.data;
  }

  async create(data: Partial<School>): Promise<School> {
    const response = await api.post(this.baseURL, data);
    return response.data;
  }

  async update(id: string, data: Partial<School>): Promise<School> {
    const response = await api.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<{ message: string; school: School }> {
    const response = await api.delete(`${this.baseURL}/${id}`);
    return response.data;
  }

  async getStats(id: string): Promise<SchoolStats> {
    const response = await api.get(`${this.baseURL}/${id}/stats`);
    return response.data;
  }
}

export default new SchoolService();
