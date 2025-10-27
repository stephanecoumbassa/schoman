import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAttendanceStore } from './attendance';
import api from '@/services/api';
import type { Attendance, AttendanceFormData, AttendanceStats, Pagination } from '@/types';

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    getAttendances: vi.fn(),
    getAttendance: vi.fn(),
    getStudentAttendanceStats: vi.fn(),
    getClassAttendanceForDate: vi.fn(),
    createAttendance: vi.fn(),
    updateAttendance: vi.fn(),
    deleteAttendance: vi.fn(),
  },
}));

describe('Attendance Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockAttendance1: Attendance = {
    _id: 'attendance1',
    student: 'student1',
    class: 'class1',
    date: '2024-10-01',
    status: 'present',
    timeIn: '08:00',
    timeOut: '15:00',
    markedBy: 'teacher1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockAttendance2: Attendance = {
    _id: 'attendance2',
    student: 'student2',
    class: 'class1',
    date: '2024-10-01',
    status: 'absent',
    reason: 'Sick',
    markedBy: 'teacher1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockAttendance3: Attendance = {
    _id: 'attendance3',
    student: 'student3',
    class: 'class1',
    date: '2024-10-01',
    status: 'late',
    timeIn: '09:00',
    reason: 'Traffic',
    markedBy: 'teacher1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockStats: AttendanceStats = {
    totalDays: 20,
    presentDays: 18,
    absentDays: 1,
    lateDays: 1,
    excusedDays: 0,
    attendanceRate: 90,
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
    it('should have empty attendances array', () => {
      const store = useAttendanceStore();
      expect(store.attendances).toEqual([]);
    });

    it('should have null currentAttendance', () => {
      const store = useAttendanceStore();
      expect(store.currentAttendance).toBeNull();
    });

    it('should have null stats', () => {
      const store = useAttendanceStore();
      expect(store.stats).toBeNull();
    });

    it('should not be loading', () => {
      const store = useAttendanceStore();
      expect(store.loading).toBe(false);
    });

    it('should have no error', () => {
      const store = useAttendanceStore();
      expect(store.error).toBeNull();
    });
  });

  describe('Getters', () => {
    beforeEach(() => {
      const store = useAttendanceStore();
      store.attendances = [mockAttendance1, mockAttendance2, mockAttendance3];
    });

    it('should filter present attendances', () => {
      const store = useAttendanceStore();
      expect(store.presentAttendances).toHaveLength(1);
      expect(store.presentAttendances[0]).toEqual(mockAttendance1);
    });

    it('should filter absent attendances', () => {
      const store = useAttendanceStore();
      expect(store.absentAttendances).toHaveLength(1);
      expect(store.absentAttendances[0]).toEqual(mockAttendance2);
    });

    it('should filter late attendances', () => {
      const store = useAttendanceStore();
      expect(store.lateAttendances).toHaveLength(1);
      expect(store.lateAttendances[0]).toEqual(mockAttendance3);
    });

    it('should count total attendances', () => {
      const store = useAttendanceStore();
      expect(store.totalAttendances).toBe(3);
    });

    it('should calculate attendance rate', () => {
      const store = useAttendanceStore();
      expect(store.attendanceRate).toBeCloseTo(33.33, 2); // 1 present out of 3 = 33.33%
    });

    it('should return 0 for attendance rate when no attendances', () => {
      const store = useAttendanceStore();
      store.attendances = [];
      expect(store.attendanceRate).toBe(0);
    });
  });

  describe('Fetch Attendances', () => {
    it('should fetch attendances successfully', async () => {
      const store = useAttendanceStore();
      vi.mocked(api.getAttendances).mockResolvedValue({
        data: {
          attendances: [mockAttendance1, mockAttendance2],
          pagination: mockPagination,
        },
      });

      await store.fetchAttendances();

      expect(store.loading).toBe(false);
      expect(store.attendances).toHaveLength(2);
      expect(store.attendances[0]._id).toBe(mockAttendance1._id);
      expect(store.pagination).toEqual(mockPagination);
      expect(store.error).toBeNull();
    });

    it('should handle fetch attendances error', async () => {
      const store = useAttendanceStore();
      const errorMessage = 'Network error';
      vi.mocked(api.getAttendances).mockResolvedValue({
        error: errorMessage,
      });

      await store.fetchAttendances();

      expect(store.loading).toBe(false);
      expect(store.attendances).toHaveLength(0);
      expect(store.error).toBe(errorMessage);
    });

    it('should fetch attendances with filters', async () => {
      const store = useAttendanceStore();
      const params = { class: 'class1', date: '2024-10-01' };
      vi.mocked(api.getAttendances).mockResolvedValue({
        data: {
          attendances: [mockAttendance1],
          pagination: mockPagination,
        },
      });

      await store.fetchAttendances(params);

      expect(api.getAttendances).toHaveBeenCalledWith(params);
      expect(store.attendances).toHaveLength(1);
    });
  });

  describe('Fetch Attendance By ID', () => {
    it('should fetch attendance by id successfully', async () => {
      const store = useAttendanceStore();
      vi.mocked(api.getAttendance).mockResolvedValue({
        data: { attendance: mockAttendance1 },
      });

      await store.fetchAttendanceById('attendance1');

      expect(store.loading).toBe(false);
      expect(store.currentAttendance).toEqual(mockAttendance1);
      expect(store.error).toBeNull();
    });

    it('should handle fetch attendance by id error', async () => {
      const store = useAttendanceStore();
      const errorMessage = 'Attendance not found';
      vi.mocked(api.getAttendance).mockResolvedValue({
        error: errorMessage,
      });

      await store.fetchAttendanceById('invalid-id');

      expect(store.loading).toBe(false);
      expect(store.currentAttendance).toBeNull();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Fetch Student Attendance Stats', () => {
    it('should fetch student attendance stats successfully', async () => {
      const store = useAttendanceStore();
      vi.mocked(api.getStudentAttendanceStats).mockResolvedValue({
        data: mockStats,
      });

      await store.fetchStudentAttendanceStats('student1');

      expect(store.loading).toBe(false);
      expect(store.stats).toEqual(mockStats);
      expect(store.error).toBeNull();
    });

    it('should handle fetch stats error', async () => {
      const store = useAttendanceStore();
      const errorMessage = 'Failed to fetch stats';
      vi.mocked(api.getStudentAttendanceStats).mockResolvedValue({
        error: errorMessage,
      });

      await store.fetchStudentAttendanceStats('student1');

      expect(store.loading).toBe(false);
      expect(store.stats).toBeNull();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Fetch Class Attendance For Date', () => {
    it('should fetch class attendance for date successfully', async () => {
      const store = useAttendanceStore();
      vi.mocked(api.getClassAttendanceForDate).mockResolvedValue({
        data: { attendances: [mockAttendance1, mockAttendance2, mockAttendance3] },
      });

      await store.fetchClassAttendanceForDate('class1', '2024-10-01');

      expect(store.loading).toBe(false);
      expect(store.attendances).toHaveLength(3);
      expect(store.error).toBeNull();
    });

    it('should handle fetch class attendance error', async () => {
      const store = useAttendanceStore();
      const errorMessage = 'Failed to fetch class attendance';
      vi.mocked(api.getClassAttendanceForDate).mockResolvedValue({
        error: errorMessage,
      });

      await store.fetchClassAttendanceForDate('class1', '2024-10-01');

      expect(store.loading).toBe(false);
      expect(store.attendances).toHaveLength(0);
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Create Attendance', () => {
    it('should create attendance successfully', async () => {
      const store = useAttendanceStore();
      const newAttendanceData: AttendanceFormData = {
        student: 'student4',
        class: 'class1',
        date: '2024-10-02',
        status: 'present',
        timeIn: '08:00',
        timeOut: '15:00',
      };

      const createdAttendance: Attendance = {
        _id: 'attendance4',
        ...newAttendanceData,
        markedBy: 'teacher1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(api.createAttendance).mockResolvedValue({
        data: { attendance: createdAttendance },
      });

      const result = await store.createAttendance(newAttendanceData);

      expect(store.loading).toBe(false);
      expect(store.attendances).toHaveLength(1);
      expect(store.attendances[0]._id).toBe(createdAttendance._id);
      expect(result).toEqual(createdAttendance);
      expect(store.error).toBeNull();
    });

    it('should handle create attendance error', async () => {
      const store = useAttendanceStore();
      const errorMessage = 'Validation failed';
      vi.mocked(api.createAttendance).mockResolvedValue({
        error: errorMessage,
      });

      const invalidData: AttendanceFormData = {
        student: '',
        class: '',
        date: '',
        status: 'present',
      };

      await expect(store.createAttendance(invalidData)).rejects.toThrow();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Update Attendance', () => {
    it('should update attendance successfully', async () => {
      const store = useAttendanceStore();
      store.attendances = [mockAttendance1, mockAttendance2];
      
      const updatedAttendance = { ...mockAttendance1, status: 'late' as const };
      vi.mocked(api.updateAttendance).mockResolvedValue({
        data: { attendance: updatedAttendance },
      });

      await store.updateAttendance('attendance1', { status: 'late' });

      expect(store.loading).toBe(false);
      expect(store.attendances[0].status).toBe('late');
      expect(store.error).toBeNull();
    });

    it('should update currentAttendance if it matches', async () => {
      const store = useAttendanceStore();
      store.currentAttendance = mockAttendance1;
      
      const updatedAttendance = { ...mockAttendance1, status: 'late' as const };
      vi.mocked(api.updateAttendance).mockResolvedValue({
        data: { attendance: updatedAttendance },
      });

      await store.updateAttendance('attendance1', { status: 'late' });

      expect(store.currentAttendance?.status).toBe('late');
    });

    it('should handle update attendance error', async () => {
      const store = useAttendanceStore();
      const errorMessage = 'Update failed';
      vi.mocked(api.updateAttendance).mockResolvedValue({
        error: errorMessage,
      });

      await expect(store.updateAttendance('attendance1', { status: 'late' })).rejects.toThrow();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Delete Attendance', () => {
    it('should delete attendance successfully', async () => {
      const store = useAttendanceStore();
      store.attendances = [mockAttendance1, mockAttendance2];
      
      vi.mocked(api.deleteAttendance).mockResolvedValue({
        data: { message: 'Attendance deleted' },
      });

      await store.deleteAttendance('attendance1');

      expect(store.loading).toBe(false);
      expect(store.attendances).toHaveLength(1);
      expect(store.attendances[0]._id).toBe(mockAttendance2._id);
      expect(store.error).toBeNull();
    });

    it('should clear currentAttendance if deleted', async () => {
      const store = useAttendanceStore();
      store.currentAttendance = mockAttendance1;
      store.attendances = [mockAttendance1];
      
      vi.mocked(api.deleteAttendance).mockResolvedValue({
        data: { message: 'Attendance deleted' },
      });

      await store.deleteAttendance('attendance1');

      expect(store.currentAttendance).toBeNull();
    });

    it('should handle delete attendance error', async () => {
      const store = useAttendanceStore();
      const errorMessage = 'Delete failed';
      vi.mocked(api.deleteAttendance).mockResolvedValue({
        error: errorMessage,
      });

      await expect(store.deleteAttendance('attendance1')).rejects.toThrow();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Utility Actions', () => {
    it('should clear error', () => {
      const store = useAttendanceStore();
      store.error = 'Some error';
      
      store.clearError();
      
      expect(store.error).toBeNull();
    });

    it('should clear current attendance', () => {
      const store = useAttendanceStore();
      store.currentAttendance = mockAttendance1;
      
      store.clearCurrentAttendance();
      
      expect(store.currentAttendance).toBeNull();
    });

    it('should clear stats', () => {
      const store = useAttendanceStore();
      store.stats = mockStats;
      
      store.clearStats();
      
      expect(store.stats).toBeNull();
    });
  });
});
