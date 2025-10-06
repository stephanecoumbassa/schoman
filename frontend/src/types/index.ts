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
  studentNumber: string;
  dateOfBirth: string;
  address: string;
  level: string;
  class?: string;
  enrollmentDate: string;
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
  evaluationType: string;
  score: number;
  grade: number;
  maxScore: number;
  maxGrade: number;
  coefficient: number;
  percentage: number;
  examDate: string;
  date: string;
  teacherComments?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GradeFormData {
  student: string;
  class: string;
  subject: string;
  semester: string;
  academicYear: string;
  examType?: string;
  evaluationType?: string;
  score?: number;
  grade?: number;
  maxScore?: number;
  maxGrade?: number;
  coefficient?: number;
  examDate?: string;
  date?: string;
  teacherComments?: string;
  comments?: string;
}

// Attendance types
export interface Attendance {
  _id: string;
  student: string | Student;
  class: string | Class;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  timeIn?: string;
  timeOut?: string;
  reason?: string;
  comments?: string;
  markedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceFormData {
  student: string;
  class: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  timeIn?: string;
  timeOut?: string;
  reason?: string;
  comments?: string;
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
  status?: string;
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
  amount?: number;
  date?: string;
  method?: string;
  reference?: string;
  _id?: string;
  paymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
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

// Event types
export interface Event {
  _id: string;
  title: string;
  description?: string;
  eventType: 'meeting' | 'celebration' | 'outing' | 'conference' | 'exam' | 'holiday' | 'other';
  startDate: string;
  endDate: string;
  location?: string;
  organizer?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  targetAudience: ('all' | 'students' | 'teachers' | 'parents' | 'admin')[];
  classes?: Array<{
    _id: string;
    name: string;
    level: string;
  }>;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventFormData {
  title: string;
  description?: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location?: string;
  organizer?: string;
  targetAudience: string[];
  classes?: string[];
  maxParticipants?: number;
  status?: string;
  notes?: string;
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  ongoingEvents: number;
  completedEvents: number;
  eventsByType: Array<{
    _id: string;
    count: number;
  }>;
}

// Expense types
export interface Expense {
  _id: string;
  expenseNumber: string;
  title: string;
  description?: string;
  category: 'salary' | 'supplies' | 'maintenance' | 'utilities' | 'transport' | 'food' | 'equipment' | 'other';
  amount: number;
  expenseDate: string;
  paymentDate?: string;
  paymentMethod?: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'mobile_money';
  paymentReference?: string;
  supplier?: string;
  supplierContact?: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvalDate?: string;
  notes?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  title: string;
  description?: string;
  category: string;
  amount: number;
  expenseDate: string;
  supplier?: string;
  supplierContact?: string;
  notes?: string;
}

export interface ExpenseStats {
  totalExpenses: number;
  pendingExpenses: number;
  approvedExpenses: number;
  paidExpenses: number;
  totalAmount: number;
  paidAmount: number;
  expensesByCategory: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
}

// Dashboard types
export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  totalTeachers: number;
  totalParents: number;
  activeStudents: number;
  upcomingEvents?: number;
  pendingExpenses?: number;
  totalExpenses?: number;
  totalRevenue?: number;
  overdueInvoices?: number;
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

// Message types
export interface Message {
  _id: string;
  subject: string;
  content: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  recipients: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }[];
  conversationId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'academic' | 'administrative' | 'event' | 'announcement';
  readBy: {
    user: string;
    readAt: string;
  }[];
  isArchived: boolean;
  parentMessage?: {
    _id: string;
    subject: string;
    sender: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MessageFormData {
  subject: string;
  content: string;
  recipients: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: 'general' | 'academic' | 'administrative' | 'event' | 'announcement';
  parentMessage?: string;
}

export interface MessageStats {
  totalReceived: number;
  totalSent: number;
  unreadCount: number;
  readPercentage: string;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}
