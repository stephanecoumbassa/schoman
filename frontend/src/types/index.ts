// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Student types
export interface Student {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string;
  matricule: string;
  dateOfBirth: string;
  address: string;
  level: string;
  class?: string;
  parentContact: string;
  emergencyContact: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  matricule: string;
  dateOfBirth: string;
  address: string;
  level: string;
  class?: string;
  parentContact: string;
  emergencyContact: string;
}

// Class types
export interface Class {
  _id: string;
  name: string;
  level: string;
  academicYear: string;
  maxCapacity: number;
  currentEnrollment: number;
  mainTeacher?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  schedule?: string;
  room?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassFormData {
  name: string;
  level: string;
  academicYear: string;
  maxCapacity: number;
  mainTeacher?: string;
  schedule?: string;
  room?: string;
}

// Grade types
export interface Grade {
  _id: string;
  student: string | Student;
  class: string | Class;
  subject: string;
  semester: string;
  academicYear: string;
  examType: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  examDate: string;
  teacherComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GradeFormData {
  student: string;
  class: string;
  subject: string;
  semester: string;
  academicYear: string;
  examType: string;
  score: number;
  maxScore: number;
  examDate: string;
  teacherComments?: string;
}

// Attendance types
export interface Attendance {
  _id: string;
  student: string | Student;
  class: string | Class;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  reason?: string;
  markedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceFormData {
  student: string;
  class: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  reason?: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
}

// Book types
export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  publishedYear?: number;
  description?: string;
  totalQuantity: number;
  availableQuantity: number;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  publishedYear?: number;
  description?: string;
  totalQuantity: number;
  availableQuantity: number;
  location?: string;
}

export interface BookStatistics {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  borrowRate: number;
  categoriesCount: number;
  topCategories: Array<{ _id: string; count: number }>;
}

// Loan types
export interface Loan {
  _id: string;
  book: {
    _id: string;
    title: string;
    author: string;
    isbn: string;
  } | string;
  student: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
    };
  } | string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanFormData {
  book: string;
  student: string;
  dueDate: string;
  notes?: string;
}

// Invoice types
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Payment {
  amount: number;
  date: string;
  method: string;
  reference?: string;
  _id?: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  student: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
    };
    matricule: string;
  } | string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payments: Payment[];
  paidAmount: number;
  balanceAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFormData {
  student: string;
  items: InvoiceItem[];
  taxRate: number;
  issueDate: string;
  dueDate: string;
  notes?: string;
}

export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  recentInvoices: Invoice[];
}

// Dashboard types
export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  totalTeachers: number;
  activeStudents: number;
  recentStudents: Student[];
  enrollmentByLevel: Array<{
    _id: string;
    count: number;
  }>;
}

// Pagination types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// API Response types
export interface PaginatedResponse<T> {
  data?: T[];
  pagination?: Pagination;
}

export interface SingleResponse<T> {
  data?: T;
}

// Record type for query parameters
export type QueryParams = Record<string, string | number | boolean | undefined | null>;
