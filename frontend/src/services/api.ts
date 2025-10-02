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

  // Books endpoints
  async getBooks(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    available?: boolean;
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
    return this.request<{ books: any[]; pagination: any }>(
      `/books?${queryParams}`
    );
  }

  async getBook(id: string) {
    return this.request<{ book: any }>(`/books/${id}`);
  }

  async createBook(bookData: any) {
    return this.request<{ book: any }>('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  }

  async updateBook(id: string, bookData: any) {
    return this.request<{ book: any }>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  }

  async deleteBook(id: string) {
    return this.request(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  async getBookStatistics() {
    return this.request<any>('/books/statistics');
  }

  // Loans endpoints
  async getLoans(params?: {
    page?: number;
    limit?: number;
    student?: string;
    book?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    return this.request<{ loans: any[]; pagination: any }>(
      `/loans?${queryParams}`
    );
  }

  async getLoan(id: string) {
    return this.request<{ loan: any }>(`/loans/${id}`);
  }

  async createLoan(loanData: any) {
    return this.request<{ loan: any }>('/loans', {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
  }

  async returnLoan(id: string) {
    return this.request<{ loan: any }>(`/loans/${id}/return`, {
      method: 'POST',
    });
  }

  async updateLoan(id: string, loanData: any) {
    return this.request<{ loan: any }>(`/loans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(loanData),
    });
  }

  async deleteLoan(id: string) {
    return this.request(`/loans/${id}`, {
      method: 'DELETE',
    });
  }

  async getStudentLoans(studentId: string) {
    return this.request<any>(`/loans/student/${studentId}`);
  }

  async updateOverdueLoans() {
    return this.request<any>('/loans/update-overdue', {
      method: 'POST',
    });
  }

  // Invoice endpoints
  async getInvoices(params?: {
    page?: number;
    limit?: number;
    student?: string;
    status?: string;
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
    return this.request<{ invoices: any[]; pagination: any }>(
      `/invoices?${queryParams}`
    );
  }

  async getInvoice(id: string) {
    return this.request<{ invoice: any; payments: any[] }>(`/invoices/${id}`);
  }

  async createInvoice(invoiceData: any) {
    return this.request<{ invoice: any }>('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async updateInvoice(id: string, invoiceData: any) {
    return this.request<{ invoice: any }>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    });
  }

  async deleteInvoice(id: string) {
    return this.request(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  async getStudentInvoices(studentId: string) {
    return this.request<any>(`/invoices/student/${studentId}`);
  }

  async updateOverdueInvoices() {
    return this.request<any>('/invoices/update-overdue', {
      method: 'POST',
    });
  }

  async getInvoiceStatistics() {
    return this.request<any>('/invoices/statistics');
  }

  // Payment endpoints
  async getPayments(params?: {
    page?: number;
    limit?: number;
    student?: string;
    invoice?: string;
    paymentMethod?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    return this.request<{ payments: any[]; pagination: any }>(
      `/payments?${queryParams}`
    );
  }

  async getPayment(id: string) {
    return this.request<{ payment: any }>(`/payments/${id}`);
  }

  async recordPayment(paymentData: any) {
    return this.request<{ payment: any }>('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async updatePayment(id: string, paymentData: any) {
    return this.request<{ payment: any }>(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  }

  async deletePayment(id: string) {
    return this.request(`/payments/${id}`, {
      method: 'DELETE',
    });
  }

  async getStudentPayments(studentId: string) {
    return this.request<any>(`/payments/student/${studentId}`);
  }

  async getPaymentStatistics() {
    return this.request<any>('/payments/statistics');
  }
}

export const api = new ApiService();
export default api;
