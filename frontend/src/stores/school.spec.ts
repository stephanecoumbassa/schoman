import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSchoolStore } from './school';
import schoolService, { type School, type SchoolStats } from '@/services/schoolService';

// Mock the school service
vi.mock('@/services/schoolService', () => ({
  default: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getStats: vi.fn(),
  },
}));

describe('School Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const mockSchool1: School = {
    _id: 'school1',
    name: 'Test School 1',
    code: 'TS001',
    address: '123 Main St',
    phone: '555-0001',
    email: 'school1@test.com',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockSchool2: School = {
    _id: 'school2',
    name: 'Test School 2',
    code: 'TS002',
    address: '456 Oak Ave',
    phone: '555-0002',
    email: 'school2@test.com',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockInactiveSchool: School = {
    _id: 'school3',
    name: 'Inactive School',
    code: 'TS003',
    address: '789 Pine St',
    phone: '555-0003',
    email: 'school3@test.com',
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockStats: SchoolStats = {
    totalStudents: 150,
    totalTeachers: 20,
    totalClasses: 10,
    totalRevenue: 50000,
  };

  describe('Initialization', () => {
    it('initializes with empty state', () => {
      const store = useSchoolStore();
      expect(store.schools).toEqual([]);
      expect(store.currentSchool).toBeNull();
      expect(store.selectedSchoolId).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('initializes selectedSchoolId from localStorage if present', () => {
      localStorage.setItem('selectedSchoolId', 'school1');
      const store = useSchoolStore();
      expect(store.selectedSchoolId).toBe('school1');
    });
  });

  describe('Getters', () => {
    it('activeSchools filters only active schools', () => {
      const store = useSchoolStore();
      store.schools = [mockSchool1, mockSchool2, mockInactiveSchool];
      
      expect(store.activeSchools).toHaveLength(2);
      expect(store.activeSchools).toEqual([mockSchool1, mockSchool2]);
    });

    it('selectedSchool returns the school matching selectedSchoolId', () => {
      const store = useSchoolStore();
      store.schools = [mockSchool1, mockSchool2];
      store.selectedSchoolId = 'school2';
      
      expect(store.selectedSchool).toEqual(mockSchool2);
    });

    it('selectedSchool returns null when selectedSchoolId is null', () => {
      const store = useSchoolStore();
      store.schools = [mockSchool1, mockSchool2];
      store.selectedSchoolId = null;
      
      expect(store.selectedSchool).toBeNull();
    });

    it('selectedSchool returns null when school not found', () => {
      const store = useSchoolStore();
      store.schools = [mockSchool1, mockSchool2];
      store.selectedSchoolId = 'nonexistent';
      
      expect(store.selectedSchool).toBeNull();
    });

    it('hasMultipleSchools returns true when more than one school', () => {
      const store = useSchoolStore();
      store.schools = [mockSchool1, mockSchool2];
      
      expect(store.hasMultipleSchools).toBe(true);
    });

    it('hasMultipleSchools returns false when one or zero schools', () => {
      const store = useSchoolStore();
      store.schools = [mockSchool1];
      
      expect(store.hasMultipleSchools).toBe(false);
      
      store.schools = [];
      expect(store.hasMultipleSchools).toBe(false);
    });
  });

  describe('Fetch Schools', () => {
    it('successfully fetches schools', async () => {
      const store = useSchoolStore();
      vi.mocked(schoolService.getAll).mockResolvedValue([mockSchool1, mockSchool2]);

      await store.fetchSchools();

      expect(store.schools).toEqual([mockSchool1, mockSchool2]);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(schoolService.getAll).toHaveBeenCalledWith(undefined);
    });

    it('fetches schools with parameters', async () => {
      const store = useSchoolStore();
      const params = { isActive: true, search: 'test' };
      vi.mocked(schoolService.getAll).mockResolvedValue([mockSchool1]);

      await store.fetchSchools(params);

      expect(schoolService.getAll).toHaveBeenCalledWith(params);
      expect(store.schools).toEqual([mockSchool1]);
    });

    it('auto-selects first school if none selected', async () => {
      const store = useSchoolStore();
      store.selectedSchoolId = null;
      vi.mocked(schoolService.getAll).mockResolvedValue([mockSchool1, mockSchool2]);

      await store.fetchSchools();

      expect(store.selectedSchoolId).toBe('school1');
      expect(localStorage.getItem('selectedSchoolId')).toBe('school1');
    });

    it('does not change selection if already set', async () => {
      const store = useSchoolStore();
      store.selectedSchoolId = 'school2';
      vi.mocked(schoolService.getAll).mockResolvedValue([mockSchool1, mockSchool2]);

      await store.fetchSchools();

      expect(store.selectedSchoolId).toBe('school2');
    });

    it('handles fetch error correctly', async () => {
      const store = useSchoolStore();
      const errorMessage = 'Network error';
      vi.mocked(schoolService.getAll).mockRejectedValue(new Error(errorMessage));

      await store.fetchSchools();

      expect(store.schools).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(errorMessage);
    });

    it('sets loading state during fetch', async () => {
      const store = useSchoolStore();
      let loadingDuringCall = false;

      vi.mocked(schoolService.getAll).mockImplementation(async () => {
        loadingDuringCall = store.loading;
        return [mockSchool1];
      });

      await store.fetchSchools();

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });
  });

  describe('Fetch School By ID', () => {
    it('successfully fetches a single school', async () => {
      const store = useSchoolStore();
      vi.mocked(schoolService.getById).mockResolvedValue(mockSchool1);

      await store.fetchSchoolById('school1');

      expect(store.currentSchool).toEqual(mockSchool1);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(schoolService.getById).toHaveBeenCalledWith('school1');
    });

    it('handles fetch by id error correctly', async () => {
      const store = useSchoolStore();
      const errorMessage = 'School not found';
      vi.mocked(schoolService.getById).mockRejectedValue(new Error(errorMessage));

      await store.fetchSchoolById('nonexistent');

      expect(store.currentSchool).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Create School', () => {
    it('successfully creates a new school', async () => {
      const store = useSchoolStore();
      const newSchoolData = {
        name: 'New School',
        code: 'NS001',
        address: '999 New St',
        phone: '555-9999',
        email: 'new@test.com',
      };
      const createdSchool = { ...mockSchool1, ...newSchoolData };

      vi.mocked(schoolService.create).mockResolvedValue(createdSchool);

      const result = await store.createSchool(newSchoolData);

      expect(result).toEqual(createdSchool);
      expect(store.schools).toHaveLength(1);
      expect(store.schools[0]).toEqual(createdSchool);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(schoolService.create).toHaveBeenCalledWith(newSchoolData);
    });

    it('handles create error correctly', async () => {
      const store = useSchoolStore();
      const errorMessage = 'Validation failed';
      vi.mocked(schoolService.create).mockRejectedValue(new Error(errorMessage));

      await expect(store.createSchool({ name: 'Test' })).rejects.toThrow();

      expect(store.loading).toBe(false);
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Update School', () => {
    it('successfully updates a school', async () => {
      const store = useSchoolStore();
      store.schools = [mockSchool1, mockSchool2];
      
      const updates = { name: 'Updated School 1' };
      const updatedSchool = { ...mockSchool1, ...updates };

      vi.mocked(schoolService.update).mockResolvedValue(updatedSchool);

      const result = await store.updateSchool('school1', updates);

      expect(result).toEqual(updatedSchool);
      expect(store.schools[0]).toEqual(updatedSchool);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(schoolService.update).toHaveBeenCalledWith('school1', updates);
    });

    it('updates currentSchool if it matches the updated school', async () => {
      const store = useSchoolStore();
      store.currentSchool = mockSchool1;
      
      const updates = { name: 'Updated School 1' };
      const updatedSchool = { ...mockSchool1, ...updates };

      vi.mocked(schoolService.update).mockResolvedValue(updatedSchool);

      await store.updateSchool('school1', updates);

      expect(store.currentSchool).toEqual(updatedSchool);
    });

    it('handles update error correctly', async () => {
      const store = useSchoolStore();
      store.schools = [mockSchool1];
      const errorMessage = 'Update failed';
      vi.mocked(schoolService.update).mockRejectedValue(new Error(errorMessage));

      await expect(store.updateSchool('school1', { name: 'Test' })).rejects.toThrow();

      expect(store.loading).toBe(false);
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Delete School', () => {
    it('successfully deletes a school', async () => {
      const store = useSchoolStore();
      store.schools = [mockSchool1, mockSchool2];
      vi.mocked(schoolService.delete).mockResolvedValue(undefined);

      await store.deleteSchool('school1');

      expect(store.schools).toEqual([mockSchool2]);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(schoolService.delete).toHaveBeenCalledWith('school1');
    });

    it('clears currentSchool if it matches deleted school', async () => {
      const store = useSchoolStore();
      store.schools = [mockSchool1, mockSchool2];
      store.currentSchool = mockSchool1;
      vi.mocked(schoolService.delete).mockResolvedValue(undefined);

      await store.deleteSchool('school1');

      expect(store.currentSchool).toBeNull();
    });

    it('clears selectedSchoolId if it matches deleted school', async () => {
      const store = useSchoolStore();
      store.schools = [mockSchool1, mockSchool2];
      store.selectedSchoolId = 'school1';
      localStorage.setItem('selectedSchoolId', 'school1');
      vi.mocked(schoolService.delete).mockResolvedValue(undefined);

      await store.deleteSchool('school1');

      expect(store.selectedSchoolId).toBeNull();
      expect(localStorage.getItem('selectedSchoolId')).toBeNull();
    });

    it('handles delete error correctly', async () => {
      const store = useSchoolStore();
      store.schools = [mockSchool1];
      const errorMessage = 'Delete failed';
      vi.mocked(schoolService.delete).mockRejectedValue(new Error(errorMessage));

      await expect(store.deleteSchool('school1')).rejects.toThrow();

      expect(store.schools).toHaveLength(1);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Get School Stats', () => {
    it('successfully fetches school statistics', async () => {
      const store = useSchoolStore();
      vi.mocked(schoolService.getStats).mockResolvedValue(mockStats);

      const result = await store.getSchoolStats('school1');

      expect(result).toEqual(mockStats);
      expect(schoolService.getStats).toHaveBeenCalledWith('school1');
    });

    it('handles stats fetch error and returns null', async () => {
      const store = useSchoolStore();
      const errorMessage = 'Stats fetch failed';
      vi.mocked(schoolService.getStats).mockRejectedValue(new Error(errorMessage));

      const result = await store.getSchoolStats('school1');

      expect(result).toBeNull();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Select School', () => {
    it('sets selectedSchoolId and updates localStorage', () => {
      const store = useSchoolStore();
      
      store.selectSchool('school1');

      expect(store.selectedSchoolId).toBe('school1');
      expect(localStorage.getItem('selectedSchoolId')).toBe('school1');
    });

    it('can change selected school', () => {
      const store = useSchoolStore();
      store.selectSchool('school1');
      
      store.selectSchool('school2');

      expect(store.selectedSchoolId).toBe('school2');
      expect(localStorage.getItem('selectedSchoolId')).toBe('school2');
    });
  });

  describe('Clear Selected School', () => {
    it('clears selectedSchoolId and localStorage', () => {
      const store = useSchoolStore();
      store.selectedSchoolId = 'school1';
      localStorage.setItem('selectedSchoolId', 'school1');

      store.clearSelectedSchool();

      expect(store.selectedSchoolId).toBeNull();
      expect(localStorage.getItem('selectedSchoolId')).toBeNull();
    });
  });

  describe('Clear Error', () => {
    it('clears error state', () => {
      const store = useSchoolStore();
      store.error = 'Some error';

      store.clearError();

      expect(store.error).toBeNull();
    });
  });
});
