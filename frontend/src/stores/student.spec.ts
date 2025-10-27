import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useStudentStore } from './student';
import api from '@/services/api';
import type { Student, StudentFormData, Pagination } from '@/types';

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    getStudents: vi.fn(),
    getStudent: vi.fn(),
    createStudent: vi.fn(),
    updateStudent: vi.fn(),
    deleteStudent: vi.fn(),
  },
}));

describe('Student Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockStudent1: Student = {
    _id: 'student1',
    userId: {
      _id: 'user1',
      firstName: 'John',
      lastName: 'Student',
      email: 'john@test.com',
    },
    matricule: 'STU001',
    studentNumber: '2024001',
    dateOfBirth: '2010-05-15',
    address: '123 Student St',
    level: '10th Grade',
    class: 'class1',
    enrollmentDate: '2024-09-01',
    parentContact: '+1234567890',
    emergencyContact: '+0987654321',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockStudent2: Student = {
    _id: 'student2',
    userId: {
      _id: 'user2',
      firstName: 'Jane',
      lastName: 'Student',
      email: 'jane@test.com',
    },
    matricule: 'STU002',
    studentNumber: '2024002',
    dateOfBirth: '2011-03-20',
    address: '456 Student Ave',
    level: '9th Grade',
    enrollmentDate: '2024-09-01',
    parentContact: '+1234567891',
    emergencyContact: '+0987654322',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockInactiveStudent: Student = {
    _id: 'student3',
    userId: {
      _id: 'user3',
      firstName: 'Bob',
      lastName: 'Inactive',
      email: 'bob@test.com',
    },
    matricule: 'STU003',
    studentNumber: '2023003',
    dateOfBirth: '2009-12-10',
    address: '789 Student Blvd',
    level: '11th Grade',
    enrollmentDate: '2023-09-01',
    parentContact: '+1234567892',
    emergencyContact: '+0987654323',
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockPagination: Pagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 3,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  };

  describe('Initial State', () => {
    it('should have empty students array', () => {
      const store = useStudentStore();
      expect(store.students).toEqual([]);
    });

    it('should have null currentStudent', () => {
      const store = useStudentStore();
      expect(store.currentStudent).toBeNull();
    });

    it('should not be loading', () => {
      const store = useStudentStore();
      expect(store.loading).toBe(false);
    });

    it('should have no error', () => {
      const store = useStudentStore();
      expect(store.error).toBeNull();
    });
  });

  describe('Getters', () => {
    it('should filter active students', () => {
      const store = useStudentStore();
      store.students = [mockStudent1, mockStudent2, mockInactiveStudent];
      expect(store.activeStudents).toHaveLength(2);
      expect(store.activeStudents[0]._id).toBe(mockStudent1._id);
      expect(store.activeStudents[1]._id).toBe(mockStudent2._id);
    });

    it('should filter inactive students', () => {
      const store = useStudentStore();
      store.students = [mockStudent1, mockStudent2, mockInactiveStudent];
      expect(store.inactiveStudents).toHaveLength(1);
      expect(store.inactiveStudents[0]).toEqual(mockInactiveStudent);
    });

    it('should filter students by level', () => {
      const store = useStudentStore();
      store.students = [mockStudent1, mockStudent2, mockInactiveStudent];
      const tenthGrade = store.studentsByLevel('10th Grade');
      const ninthGrade = store.studentsByLevel('9th Grade');
      
      expect(tenthGrade).toHaveLength(1);
      expect(tenthGrade[0]).toEqual(mockStudent1);
      expect(ninthGrade).toHaveLength(1);
      expect(ninthGrade[0]).toEqual(mockStudent2);
    });

    it('should count total students', () => {
      const store = useStudentStore();
      store.students = [mockStudent1, mockStudent2, mockInactiveStudent];
      expect(store.totalStudents).toBe(3);
    });
  });

  describe('Fetch Students', () => {
    it('should fetch students successfully', async () => {
      const store = useStudentStore();
      vi.mocked(api.getStudents).mockResolvedValue({
        data: {
          students: [mockStudent1, mockStudent2],
          pagination: mockPagination,
        },
      });

      await store.fetchStudents();

      expect(store.loading).toBe(false);
      expect(store.students).toHaveLength(2);
      expect(store.students[0]._id).toBe(mockStudent1._id);
      expect(store.pagination).toEqual(mockPagination);
      expect(store.error).toBeNull();
    });

    it('should handle fetch students error', async () => {
      const store = useStudentStore();
      const errorMessage = 'Network error';
      vi.mocked(api.getStudents).mockResolvedValue({
        error: errorMessage,
      });

      await store.fetchStudents();

      expect(store.loading).toBe(false);
      expect(store.students).toHaveLength(0);
      expect(store.error).toBe(errorMessage);
    });

    it('should fetch students with filters', async () => {
      const store = useStudentStore();
      const params = { level: '10th Grade', isActive: true };
      vi.mocked(api.getStudents).mockResolvedValue({
        data: {
          students: [mockStudent1],
          pagination: mockPagination,
        },
      });

      await store.fetchStudents(params);

      expect(api.getStudents).toHaveBeenCalledWith(params);
      expect(store.students).toHaveLength(1);
    });
  });

  describe('Fetch Student By ID', () => {
    it('should fetch student by id successfully', async () => {
      const store = useStudentStore();
      vi.mocked(api.getStudent).mockResolvedValue({
        data: { student: mockStudent1 },
      });

      await store.fetchStudentById('student1');

      expect(store.loading).toBe(false);
      expect(store.currentStudent).toEqual(mockStudent1);
      expect(store.error).toBeNull();
    });

    it('should handle fetch student by id error', async () => {
      const store = useStudentStore();
      const errorMessage = 'Student not found';
      vi.mocked(api.getStudent).mockResolvedValue({
        error: errorMessage,
      });

      await store.fetchStudentById('invalid-id');

      expect(store.loading).toBe(false);
      expect(store.currentStudent).toBeNull();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Create Student', () => {
    it('should create student successfully', async () => {
      const store = useStudentStore();
      const newStudentData: StudentFormData = {
        email: 'new@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'Student',
        matricule: 'STU004',
        dateOfBirth: '2010-06-15',
        address: '999 New St',
        level: '10th Grade',
        parentContact: '+1234567893',
        emergencyContact: '+0987654324',
      };

      const createdStudent: Student = {
        _id: 'student4',
        userId: {
          _id: 'user4',
          firstName: 'New',
          lastName: 'Student',
          email: 'new@test.com',
        },
        ...newStudentData,
        studentNumber: '2024004',
        enrollmentDate: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(api.createStudent).mockResolvedValue({
        data: { student: createdStudent },
      });

      const result = await store.createStudent(newStudentData);

      expect(store.loading).toBe(false);
      expect(store.students).toHaveLength(1);
      expect(store.students[0]._id).toBe(createdStudent._id);
      expect(result).toEqual(createdStudent);
      expect(store.error).toBeNull();
    });

    it('should handle create student error', async () => {
      const store = useStudentStore();
      const errorMessage = 'Validation failed';
      vi.mocked(api.createStudent).mockResolvedValue({
        error: errorMessage,
      });

      const invalidData: StudentFormData = {
        email: 'invalid',
        password: '123',
        firstName: '',
        lastName: '',
        matricule: '',
        dateOfBirth: '',
        address: '',
        level: '',
        parentContact: '',
        emergencyContact: '',
      };

      await expect(store.createStudent(invalidData)).rejects.toThrow();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Update Student', () => {
    it('should update student successfully', async () => {
      const store = useStudentStore();
      store.students = [mockStudent1, mockStudent2];
      
      const updatedStudent = { ...mockStudent1, level: '11th Grade' };
      vi.mocked(api.updateStudent).mockResolvedValue({
        data: { student: updatedStudent },
      });

      await store.updateStudent('student1', { level: '11th Grade' });

      expect(store.loading).toBe(false);
      expect(store.students[0].level).toBe('11th Grade');
      expect(store.error).toBeNull();
    });

    it('should update currentStudent if it matches', async () => {
      const store = useStudentStore();
      store.currentStudent = mockStudent1;
      
      const updatedStudent = { ...mockStudent1, level: '11th Grade' };
      vi.mocked(api.updateStudent).mockResolvedValue({
        data: { student: updatedStudent },
      });

      await store.updateStudent('student1', { level: '11th Grade' });

      expect(store.currentStudent?.level).toBe('11th Grade');
    });

    it('should handle update student error', async () => {
      const store = useStudentStore();
      const errorMessage = 'Update failed';
      vi.mocked(api.updateStudent).mockResolvedValue({
        error: errorMessage,
      });

      await expect(store.updateStudent('student1', { level: '11th Grade' })).rejects.toThrow();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Delete Student', () => {
    it('should delete student successfully', async () => {
      const store = useStudentStore();
      store.students = [mockStudent1, mockStudent2];
      
      vi.mocked(api.deleteStudent).mockResolvedValue({
        data: { message: 'Student deleted' },
      });

      await store.deleteStudent('student1');

      expect(store.loading).toBe(false);
      expect(store.students).toHaveLength(1);
      expect(store.students[0]._id).toBe(mockStudent2._id);
      expect(store.error).toBeNull();
    });

    it('should clear currentStudent if deleted', async () => {
      const store = useStudentStore();
      store.currentStudent = mockStudent1;
      store.students = [mockStudent1];
      
      vi.mocked(api.deleteStudent).mockResolvedValue({
        data: { message: 'Student deleted' },
      });

      await store.deleteStudent('student1');

      expect(store.currentStudent).toBeNull();
    });

    it('should handle delete student error', async () => {
      const store = useStudentStore();
      const errorMessage = 'Delete failed';
      vi.mocked(api.deleteStudent).mockResolvedValue({
        error: errorMessage,
      });

      await expect(store.deleteStudent('student1')).rejects.toThrow();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Utility Actions', () => {
    it('should clear error', () => {
      const store = useStudentStore();
      store.error = 'Some error';
      
      store.clearError();
      
      expect(store.error).toBeNull();
    });

    it('should clear current student', () => {
      const store = useStudentStore();
      store.currentStudent = mockStudent1;
      
      store.clearCurrentStudent();
      
      expect(store.currentStudent).toBeNull();
    });
  });
});
