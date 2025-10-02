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

  // Classes endpoints
  async getClasses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    academicYear?: string;
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
    return this.request<{ classes: any[]; pagination: any }>(
      `/classes?${queryParams}`
    );
  }

  async getClass(id: string) {
    return this.request<{ class: any; students: any[] }>(`/classes/${id}`);
  }

  async createClass(classData: any) {
    return this.request<{ class: any }>('/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  }

  async updateClass(id: string, classData: any) {
    return this.request<{ class: any }>(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    });
  }

  async deleteClass(id: string) {
    return this.request(`/classes/${id}`, {
      method: 'DELETE',
    });
  }

  async getClassStatistics(id: string) {
    return this.request<any>(`/classes/${id}/statistics`);
  }

  // Grades endpoints
  async getGrades(params?: {
    page?: number;
    limit?: number;
    student?: string;
    class?: string;
    subject?: string;
    semester?: string;
    academicYear?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    return this.request<{ grades: any[]; pagination: any }>(
      `/grades?${queryParams}`
    );
  }

  async getGrade(id: string) {
    return this.request<{ grade: any }>(`/grades/${id}`);
  }

  async createGrade(gradeData: any) {
    return this.request<{ grade: any }>('/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  }

  async updateGrade(id: string, gradeData: any) {
    return this.request<{ grade: any }>(`/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gradeData),
    });
  }

  async deleteGrade(id: string) {
    return this.request(`/grades/${id}`, {
      method: 'DELETE',
    });
  }

  async getStudentGradesSummary(studentId: string) {
    return this.request<any>(`/grades/student/${studentId}/summary`);
  }

  // Attendance endpoints
  async getAttendances(params?: {
    page?: number;
    limit?: number;
    student?: string;
    class?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    return this.request<{ attendances: any[]; pagination: any }>(
      `/attendance?${queryParams}`
    );
  }

  async getAttendance(id: string) {
    return this.request<{ attendance: any }>(`/attendance/${id}`);
  }

  async createAttendance(attendanceData: any) {
    return this.request<{ attendance: any }>('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async updateAttendance(id: string, attendanceData: any) {
    return this.request<{ attendance: any }>(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attendanceData),
    });
  }

  async deleteAttendance(id: string) {
    return this.request(`/attendance/${id}`, {
      method: 'DELETE',
    });
  }

  async getStudentAttendanceStats(studentId: string) {
    return this.request<any>(`/attendance/student/${studentId}/stats`);
  }

  async getClassAttendanceForDate(classId: string, date: string) {
    return this.request<any>(`/attendance/class/${classId}/date?date=${date}`);
  }
}

export const api = new ApiService();
export default api;
