import type {
  User,
  Student,
  StudentFormData,
  Class,
  ClassFormData,
  Grade,
  GradeFormData,
  Attendance,
  AttendanceFormData,
  AttendanceStats,
  Book,
  BookFormData,
  BookStatistics,
  Loan,
  LoanFormData,
  Invoice,
  InvoiceFormData,
  InvoiceStats,
  DashboardStats,
  Pagination,
  QueryParams,
  Payment,
} from '@/types';

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
    } catch (error) {
      console.error('API Error:', error);
      return { error: error instanceof Error ? error.message : 'An error occurred' };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: Partial<User> & { password: string }) {
    return this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request<{ user: User }>('/auth/profile');
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
    return this.request<{ students: Student[]; pagination: Pagination }>(
      `/students?${queryParams}`
    );
  }

  async getStudent(id: string) {
    return this.request<{ student: Student }>(`/students/${id}`);
  }

  async createStudent(studentData: StudentFormData) {
    return this.request<{ student: Student }>('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id: string, studentData: Partial<StudentFormData>) {
    return this.request<{ student: Student }>(`/students/${id}`, {
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
    return this.request<DashboardStats>('/dashboard/stats');
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
    return this.request<{ classes: Class[]; pagination: Pagination }>(
      `/classes?${queryParams}`
    );
  }

  async getClass(id: string) {
    return this.request<{ class: Class; students: Student[] }>(`/classes/${id}`);
  }

  async createClass(classData: ClassFormData) {
    return this.request<{ class: Class }>('/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  }

  async updateClass(id: string, classData: Partial<ClassFormData>) {
    return this.request<{ class: Class }>(`/classes/${id}`, {
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
    return this.request<Record<string, number>>(`/classes/${id}/statistics`);
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
    return this.request<{ grades: Grade[]; pagination: Pagination }>(
      `/grades?${queryParams}`
    );
  }

  async getGrade(id: string) {
    return this.request<{ grade: Grade }>(`/grades/${id}`);
  }

  async createGrade(gradeData: GradeFormData) {
    return this.request<{ grade: Grade }>('/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  }

  async updateGrade(id: string, gradeData: Partial<GradeFormData>) {
    return this.request<{ grade: Grade }>(`/grades/${id}`, {
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
    return this.request<Record<string, unknown>>(`/grades/student/${studentId}/summary`);
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
    return this.request<{ attendances: Attendance[]; pagination: Pagination }>(
      `/attendance?${queryParams}`
    );
  }

  async getAttendance(id: string) {
    return this.request<{ attendance: Attendance }>(`/attendance/${id}`);
  }

  async createAttendance(attendanceData: AttendanceFormData) {
    return this.request<{ attendance: Attendance }>('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async updateAttendance(id: string, attendanceData: Partial<AttendanceFormData>) {
    return this.request<{ attendance: Attendance }>(`/attendance/${id}`, {
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
    return this.request<AttendanceStats>(`/attendance/student/${studentId}/stats`);
  }

  async getClassAttendanceForDate(classId: string, date: string) {
    return this.request<{ attendances: Attendance[] }>(`/attendance/class/${classId}/date?date=${date}`);
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
    return this.request<{ books: Book[]; pagination: Pagination }>(
      `/books?${queryParams}`
    );
  }

  async getBook(id: string) {
    return this.request<{ book: Book }>(`/books/${id}`);
  }

  async createBook(bookData: BookFormData) {
    return this.request<{ book: Book }>('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  }

  async updateBook(id: string, bookData: Partial<BookFormData>) {
    return this.request<{ book: Book }>(`/books/${id}`, {
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
    return this.request<BookStatistics>('/books/statistics');
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
    return this.request<{ loans: Loan[]; pagination: Pagination }>(
      `/loans?${queryParams}`
    );
  }

  async getLoan(id: string) {
    return this.request<{ loan: Loan }>(`/loans/${id}`);
  }

  async createLoan(loanData: LoanFormData) {
    return this.request<{ loan: Loan }>('/loans', {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
  }

  async returnLoan(id: string) {
    return this.request<{ loan: Loan }>(`/loans/${id}/return`, {
      method: 'POST',
    });
  }

  async updateLoan(id: string, loanData: Partial<LoanFormData>) {
    return this.request<{ loan: Loan }>(`/loans/${id}`, {
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
    return this.request<{ loans: Loan[] }>(`/loans/student/${studentId}`);
  }

  async updateOverdueLoans() {
    return this.request<{ message: string; updated: number }>('/loans/update-overdue', {
      method: 'POST',
    });
  }

  // Invoice endpoints
  async getInvoices(params?: QueryParams) {
    const queryParams = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<{ invoices: Invoice[]; pagination: Pagination }>(`/invoices${queryParams ? `?${queryParams}` : ''}`);
  }

  async getInvoice(id: string) {
    return this.request<{ invoice: Invoice }>(`/invoices/${id}`);
  }

  async createInvoice(invoiceData: InvoiceFormData) {
    return this.request<{ invoice: Invoice }>('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async updateInvoice(id: string, invoiceData: Partial<InvoiceFormData>) {
    return this.request<{ invoice: Invoice }>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    });
  }

  async deleteInvoice(id: string) {
    return this.request<{ message: string }>(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  async recordPayment(id: string, paymentData: Payment) {
    return this.request<{ invoice: Invoice }>(`/invoices/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getInvoiceStats() {
    return this.request<InvoiceStats>('/invoices/stats');
  }
}

export const api = new ApiService();
export default api;
