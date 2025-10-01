const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return { data };
    } catch (error: any) {
      console.error('API Error:', error);
      return { error: error.message };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request<{ user: any }>('/auth/profile');
  }

  // Student endpoints
  async getStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    isActive?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    return this.request<{ students: any[]; pagination: any }>(
      `/students?${queryParams}`
    );
  }

  async getStudent(id: string) {
    return this.request<{ student: any }>(`/students/${id}`);
  }

  async createStudent(studentData: any) {
    return this.request<{ student: any }>('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id: string, studentData: any) {
    return this.request<{ student: any }>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }

  async deleteStudent(id: string) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request<{
      stats: any;
      recentStudents: any[];
      enrollmentByLevel: any[];
    }>('/dashboard/stats');
  }
}

export const api = new ApiService();
export default api;
