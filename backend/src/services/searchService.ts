import Student from '../models/Student.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Book from '../models/Book.js';
import Event from '../models/Event.js';
import Invoice from '../models/Invoice.js';
import Message from '../models/Message.js';

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  url?: string;
  relevance?: number;
}

export interface SearchOptions {
  query: string;
  limit?: number;
  types?: string[];
  schoolId?: string;
}

/**
 * Advanced search service that searches across multiple collections
 */
class SearchService {
  /**
   * Perform a global search across all entities
   */
  async globalSearch(options: SearchOptions): Promise<SearchResult[]> {
    const { query, limit = 20, types, schoolId } = options;
    
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchQuery = query.trim();
    const results: SearchResult[] = [];

    // Define which types to search
    const typesToSearch = types || ['students', 'users', 'classes', 'subjects', 'books', 'events', 'invoices', 'messages'];

    // Search students
    if (typesToSearch.includes('students')) {
      const studentResults = await this.searchStudents(searchQuery, schoolId, limit);
      results.push(...studentResults);
    }

    // Search users
    if (typesToSearch.includes('users')) {
      const userResults = await this.searchUsers(searchQuery, schoolId, limit);
      results.push(...userResults);
    }

    // Search classes
    if (typesToSearch.includes('classes')) {
      const classResults = await this.searchClasses(searchQuery, schoolId, limit);
      results.push(...classResults);
    }

    // Search subjects
    if (typesToSearch.includes('subjects')) {
      const subjectResults = await this.searchSubjects(searchQuery, schoolId, limit);
      results.push(...subjectResults);
    }

    // Search books
    if (typesToSearch.includes('books')) {
      const bookResults = await this.searchBooks(searchQuery, schoolId, limit);
      results.push(...bookResults);
    }

    // Search events
    if (typesToSearch.includes('events')) {
      const eventResults = await this.searchEvents(searchQuery, schoolId, limit);
      results.push(...eventResults);
    }

    // Search invoices
    if (typesToSearch.includes('invoices')) {
      const invoiceResults = await this.searchInvoices(searchQuery, schoolId, limit);
      results.push(...invoiceResults);
    }

    // Search messages
    if (typesToSearch.includes('messages')) {
      const messageResults = await this.searchMessages(searchQuery, schoolId, limit);
      results.push(...messageResults);
    }

    // Sort by relevance and limit
    return results
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, limit);
  }

  /**
   * Search students with text search and regex fallback
   */
  private async searchStudents(query: string, schoolId?: string, limit: number = 10): Promise<SearchResult[]> {
    const searchFilter: any = {
      isActive: true,
      $or: [
        { studentNumber: { $regex: query, $options: 'i' } },
        { level: { $regex: query, $options: 'i' } },
        { 'parentContact.name': { $regex: query, $options: 'i' } },
        { 'parentContact.email': { $regex: query, $options: 'i' } },
      ],
    };

    if (schoolId) {
      searchFilter.school = schoolId;
    }

    const students = await Student.find(searchFilter)
      .populate('userId', 'firstName lastName email')
      .limit(limit)
      .lean();

    return students.map((student: any) => ({
      type: 'student',
      id: student._id.toString(),
      title: `${student.userId?.firstName || ''} ${student.userId?.lastName || ''}`.trim(),
      subtitle: `Élève - ${student.studentNumber}`,
      description: `Niveau: ${student.level || 'N/A'} | Parent: ${student.parentContact?.name || 'N/A'}`,
      url: `/students/${student._id}`,
      relevance: this.calculateRelevance(query, [
        student.userId?.firstName,
        student.userId?.lastName,
        student.studentNumber,
        student.level,
      ]),
    }));
  }

  /**
   * Search users (teachers, admins, parents)
   */
  private async searchUsers(query: string, schoolId?: string, limit: number = 10): Promise<SearchResult[]> {
    const searchFilter: any = {
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ],
    };

    if (schoolId) {
      searchFilter.school = schoolId;
    }

    const users = await User.find(searchFilter)
      .select('firstName lastName email phone role')
      .limit(limit)
      .lean();

    return users.map((user: any) => ({
      type: 'user',
      id: user._id.toString(),
      title: `${user.firstName} ${user.lastName}`,
      subtitle: `${this.getRoleLabel(user.role)}`,
      description: `Email: ${user.email} | Tél: ${user.phone || 'N/A'}`,
      url: `/users/${user._id}`,
      relevance: this.calculateRelevance(query, [
        user.firstName,
        user.lastName,
        user.email,
        user.phone,
      ]),
    }));
  }

  /**
   * Search classes
   */
  private async searchClasses(query: string, schoolId?: string, limit: number = 10): Promise<SearchResult[]> {
    const searchFilter: any = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { level: { $regex: query, $options: 'i' } },
      ],
    };

    if (schoolId) {
      searchFilter.school = schoolId;
    }

    const classes = await Class.find(searchFilter)
      .populate('teacher', 'firstName lastName')
      .limit(limit)
      .lean();

    return classes.map((cls: any) => ({
      type: 'class',
      id: cls._id.toString(),
      title: cls.name,
      subtitle: `Classe - ${cls.level}`,
      description: `Capacité: ${cls.capacity} | Enseignant: ${cls.teacher ? `${cls.teacher.firstName} ${cls.teacher.lastName}` : 'Non assigné'}`,
      url: `/classes/${cls._id}`,
      relevance: this.calculateRelevance(query, [cls.name, cls.level]),
    }));
  }

  /**
   * Search subjects
   */
  private async searchSubjects(query: string, schoolId?: string, limit: number = 10): Promise<SearchResult[]> {
    const searchFilter: any = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { code: { $regex: query, $options: 'i' } },
        { level: { $regex: query, $options: 'i' } },
      ],
    };

    if (schoolId) {
      searchFilter.school = schoolId;
    }

    const subjects = await Subject.find(searchFilter)
      .limit(limit)
      .lean();

    return subjects.map((subject: any) => ({
      type: 'subject',
      id: subject._id.toString(),
      title: subject.name,
      subtitle: `Matière - ${subject.code}`,
      description: `Niveau: ${subject.level} | Coefficient: ${subject.coefficient || 1}`,
      url: `/subjects/${subject._id}`,
      relevance: this.calculateRelevance(query, [subject.name, subject.code, subject.level]),
    }));
  }

  /**
   * Search books
   */
  private async searchBooks(query: string, schoolId?: string, limit: number = 10): Promise<SearchResult[]> {
    const searchFilter: any = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { isbn: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    };

    if (schoolId) {
      searchFilter.school = schoolId;
    }

    const books = await Book.find(searchFilter)
      .limit(limit)
      .lean();

    return books.map((book: any) => ({
      type: 'book',
      id: book._id.toString(),
      title: book.title,
      subtitle: `Livre - ${book.author}`,
      description: `ISBN: ${book.isbn} | Catégorie: ${book.category} | Disponibles: ${book.quantity - book.borrowed}`,
      url: `/books/${book._id}`,
      relevance: this.calculateRelevance(query, [book.title, book.author, book.isbn, book.category]),
    }));
  }

  /**
   * Search events
   */
  private async searchEvents(query: string, schoolId?: string, limit: number = 10): Promise<SearchResult[]> {
    const searchFilter: any = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { type: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ],
    };

    if (schoolId) {
      searchFilter.school = schoolId;
    }

    const events = await Event.find(searchFilter)
      .limit(limit)
      .lean();

    return events.map((event: any) => ({
      type: 'event',
      id: event._id.toString(),
      title: event.title,
      subtitle: `Événement - ${event.type}`,
      description: `Date: ${new Date(event.date).toLocaleDateString('fr-FR')} | Lieu: ${event.location || 'N/A'}`,
      url: `/events/${event._id}`,
      relevance: this.calculateRelevance(query, [event.title, event.description, event.type, event.location]),
    }));
  }

  /**
   * Search invoices
   */
  private async searchInvoices(query: string, schoolId?: string, limit: number = 10): Promise<SearchResult[]> {
    const searchFilter: any = {
      $or: [
        { invoiceNumber: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    };

    if (schoolId) {
      searchFilter.school = schoolId;
    }

    const invoices = await Invoice.find(searchFilter)
      .populate('student', 'userId')
      .populate({
        path: 'student',
        populate: {
          path: 'userId',
          select: 'firstName lastName',
        },
      })
      .limit(limit)
      .lean();

    return invoices.map((invoice: any) => ({
      type: 'invoice',
      id: invoice._id.toString(),
      title: `Facture ${invoice.invoiceNumber}`,
      subtitle: `Facture - ${invoice.status}`,
      description: `Montant: ${invoice.amount} | Élève: ${invoice.student?.userId ? `${invoice.student.userId.firstName} ${invoice.student.userId.lastName}` : 'N/A'}`,
      url: `/invoices/${invoice._id}`,
      relevance: this.calculateRelevance(query, [invoice.invoiceNumber, invoice.description]),
    }));
  }

  /**
   * Search messages
   */
  private async searchMessages(query: string, schoolId?: string, limit: number = 10): Promise<SearchResult[]> {
    const searchFilter: any = {
      $or: [
        { subject: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
      ],
    };

    if (schoolId) {
      searchFilter.school = schoolId;
    }

    const messages = await Message.find(searchFilter)
      .populate('sender', 'firstName lastName')
      .limit(limit)
      .lean();

    return messages.map((message: any) => ({
      type: 'message',
      id: message._id.toString(),
      title: message.subject,
      subtitle: `Message - ${message.sender ? `${message.sender.firstName} ${message.sender.lastName}` : 'Expéditeur inconnu'}`,
      description: message.content?.substring(0, 100) + (message.content?.length > 100 ? '...' : ''),
      url: `/messages/${message._id}`,
      relevance: this.calculateRelevance(query, [message.subject, message.content]),
    }));
  }

  /**
   * Calculate relevance score based on query matches
   */
  private calculateRelevance(query: string, fields: (string | undefined)[]): number {
    const lowerQuery = query.toLowerCase();
    let score = 0;

    for (const field of fields) {
      if (!field) continue;
      
      const lowerField = field.toLowerCase();
      
      // Exact match = 100 points
      if (lowerField === lowerQuery) {
        score += 100;
      }
      // Starts with = 50 points
      else if (lowerField.startsWith(lowerQuery)) {
        score += 50;
      }
      // Contains = 25 points
      else if (lowerField.includes(lowerQuery)) {
        score += 25;
      }
    }

    return score;
  }

  /**
   * Get user-friendly role label
   */
  private getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      teacher: 'Enseignant',
      student: 'Élève',
      parent: 'Parent',
    };
    return labels[role] || role;
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocompleteSuggestions(query: string, limit: number = 5, schoolId?: string): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const suggestions = new Set<string>();

    // Get suggestions from students
    const students = await Student.find({
      $or: [
        { studentNumber: { $regex: `^${query}`, $options: 'i' } },
        { level: { $regex: `^${query}`, $options: 'i' } },
      ],
      ...(schoolId ? { school: schoolId } : {}),
    })
      .populate('userId', 'firstName lastName')
      .limit(limit)
      .lean();

    students.forEach((student: any) => {
      if (student.userId) {
        suggestions.add(`${student.userId.firstName} ${student.userId.lastName}`);
      }
      if (student.studentNumber) suggestions.add(student.studentNumber);
      if (student.level) suggestions.add(student.level);
    });

    // Get suggestions from users
    const users = await User.find({
      $or: [
        { firstName: { $regex: `^${query}`, $options: 'i' } },
        { lastName: { $regex: `^${query}`, $options: 'i' } },
      ],
      ...(schoolId ? { school: schoolId } : {}),
    })
      .limit(limit)
      .lean();

    users.forEach((user: any) => {
      if (user.firstName) suggestions.add(user.firstName);
      if (user.lastName) suggestions.add(user.lastName);
      suggestions.add(`${user.firstName} ${user.lastName}`);
    });

    return Array.from(suggestions).slice(0, limit);
  }
}

export default new SearchService();
