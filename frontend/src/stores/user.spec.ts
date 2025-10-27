import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from './user';
import api from '@/services/api';
import type { User, Pagination } from '@/types';

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    getUsers: vi.fn(),
    getUser: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    updateUserPassword: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockUser1: User = {
    _id: 'user1',
    email: 'admin@test.com',
    firstName: 'John',
    lastName: 'Admin',
    role: 'admin',
    phone: '555-0001',
    address: '123 Admin St',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUser2: User = {
    _id: 'user2',
    email: 'teacher@test.com',
    firstName: 'Jane',
    lastName: 'Teacher',
    role: 'teacher',
    phone: '555-0002',
    address: '456 Teacher Ave',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockInactiveUser: User = {
    _id: 'user3',
    email: 'inactive@test.com',
    firstName: 'Bob',
    lastName: 'Inactive',
    role: 'teacher',
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
    it('should have empty users array', () => {
      const store = useUserStore();
      expect(store.users).toEqual([]);
    });

    it('should have null currentUser', () => {
      const store = useUserStore();
      expect(store.currentUser).toBeNull();
    });

    it('should not be loading', () => {
      const store = useUserStore();
      expect(store.loading).toBe(false);
    });

    it('should have no error', () => {
      const store = useUserStore();
      expect(store.error).toBeNull();
    });
  });

  describe('Getters', () => {
    it('should filter active users', () => {
      const store = useUserStore();
      store.users = [mockUser1, mockUser2, mockInactiveUser];
      expect(store.activeUsers).toHaveLength(2);
      expect(store.activeUsers[0]._id).toBe(mockUser1._id);
      expect(store.activeUsers[1]._id).toBe(mockUser2._id);
    });

    it('should filter inactive users', () => {
      const store = useUserStore();
      store.users = [mockUser1, mockUser2, mockInactiveUser];
      expect(store.inactiveUsers).toHaveLength(1);
      expect(store.inactiveUsers[0]).toEqual(mockInactiveUser);
    });

    it('should filter users by role', () => {
      const store = useUserStore();
      store.users = [mockUser1, mockUser2, mockInactiveUser];
      const admins = store.usersByRole('admin');
      const teachers = store.usersByRole('teacher');
      
      expect(admins).toHaveLength(1);
      expect(admins[0]).toEqual(mockUser1);
      expect(teachers).toHaveLength(2);
    });

    it('should count total users', () => {
      const store = useUserStore();
      store.users = [mockUser1, mockUser2, mockInactiveUser];
      expect(store.totalUsers).toBe(3);
    });
  });

  describe('Fetch Users', () => {
    it('should fetch users successfully', async () => {
      const store = useUserStore();
      vi.mocked(api.getUsers).mockResolvedValue({
        data: {
          users: [mockUser1, mockUser2],
          pagination: mockPagination,
        },
      });

      await store.fetchUsers();

      expect(store.loading).toBe(false);
      expect(store.users).toHaveLength(2);
      expect(store.users[0]._id).toBe(mockUser1._id);
      expect(store.pagination).toEqual(mockPagination);
      expect(store.error).toBeNull();
    });

    it('should handle fetch users error', async () => {
      const store = useUserStore();
      const errorMessage = 'Network error';
      vi.mocked(api.getUsers).mockResolvedValue({
        error: errorMessage,
      });

      await store.fetchUsers();

      expect(store.loading).toBe(false);
      expect(store.users).toHaveLength(0);
      expect(store.error).toBe(errorMessage);
    });

    it('should fetch users with filters', async () => {
      const store = useUserStore();
      const params = { role: 'admin', isActive: true };
      vi.mocked(api.getUsers).mockResolvedValue({
        data: {
          users: [mockUser1],
          pagination: mockPagination,
        },
      });

      await store.fetchUsers(params);

      expect(api.getUsers).toHaveBeenCalledWith(params);
      expect(store.users).toHaveLength(1);
    });
  });

  describe('Fetch User By ID', () => {
    it('should fetch user by id successfully', async () => {
      const store = useUserStore();
      vi.mocked(api.getUser).mockResolvedValue({
        data: { user: mockUser1 },
      });

      await store.fetchUserById('user1');

      expect(store.loading).toBe(false);
      expect(store.currentUser).toEqual(mockUser1);
      expect(store.error).toBeNull();
    });

    it('should handle fetch user by id error', async () => {
      const store = useUserStore();
      const errorMessage = 'User not found';
      vi.mocked(api.getUser).mockResolvedValue({
        error: errorMessage,
      });

      await store.fetchUserById('invalid-id');

      expect(store.loading).toBe(false);
      expect(store.currentUser).toBeNull();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Create User', () => {
    it('should create user successfully', async () => {
      const store = useUserStore();
      const newUserData = {
        email: 'new@test.com',
        firstName: 'New',
        lastName: 'User',
        password: 'password123',
        role: 'teacher' as const,
        isActive: true,
      };

      const createdUser: User = {
        ...newUserData,
        _id: 'user4',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(api.createUser).mockResolvedValue({
        data: { user: createdUser },
      });

      const result = await store.createUser(newUserData);

      expect(store.loading).toBe(false);
      expect(store.users).toHaveLength(1);
      expect(store.users[0]._id).toBe(createdUser._id);
      expect(result).toEqual(createdUser);
      expect(store.error).toBeNull();
    });

    it('should handle create user error', async () => {
      const store = useUserStore();
      const errorMessage = 'Validation failed';
      vi.mocked(api.createUser).mockResolvedValue({
        error: errorMessage,
      });

      await expect(store.createUser({
        email: 'invalid',
        password: '123',
        firstName: '',
        lastName: '',
        role: 'admin',
        isActive: true,
      })).rejects.toThrow();

      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Update User', () => {
    it('should update user successfully', async () => {
      const store = useUserStore();
      store.users = [mockUser1, mockUser2];
      
      const updatedUser = { ...mockUser1, firstName: 'Johnny' };
      vi.mocked(api.updateUser).mockResolvedValue({
        data: { user: updatedUser },
      });

      await store.updateUser('user1', { firstName: 'Johnny' });

      expect(store.loading).toBe(false);
      expect(store.users[0].firstName).toBe('Johnny');
      expect(store.error).toBeNull();
    });

    it('should update currentUser if it matches', async () => {
      const store = useUserStore();
      store.currentUser = mockUser1;
      
      const updatedUser = { ...mockUser1, firstName: 'Johnny' };
      vi.mocked(api.updateUser).mockResolvedValue({
        data: { user: updatedUser },
      });

      await store.updateUser('user1', { firstName: 'Johnny' });

      expect(store.currentUser?.firstName).toBe('Johnny');
    });

    it('should handle update user error', async () => {
      const store = useUserStore();
      const errorMessage = 'Update failed';
      vi.mocked(api.updateUser).mockResolvedValue({
        error: errorMessage,
      });

      await expect(store.updateUser('user1', { firstName: 'Johnny' })).rejects.toThrow();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Update User Password', () => {
    it('should update password successfully', async () => {
      const store = useUserStore();
      vi.mocked(api.updateUserPassword).mockResolvedValue({
        data: { message: 'Password updated' },
      });

      await store.updateUserPassword('user1', 'newpassword123');

      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should handle password update error', async () => {
      const store = useUserStore();
      const errorMessage = 'Password too weak';
      vi.mocked(api.updateUserPassword).mockResolvedValue({
        error: errorMessage,
      });

      await expect(store.updateUserPassword('user1', '123')).rejects.toThrow();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Delete User', () => {
    it('should delete user successfully', async () => {
      const store = useUserStore();
      store.users = [mockUser1, mockUser2];
      
      vi.mocked(api.deleteUser).mockResolvedValue({
        data: { message: 'User deleted' },
      });

      await store.deleteUser('user1');

      expect(store.loading).toBe(false);
      expect(store.users).toHaveLength(1);
      expect(store.users[0]._id).toBe(mockUser2._id);
      expect(store.error).toBeNull();
    });

    it('should clear currentUser if deleted', async () => {
      const store = useUserStore();
      store.currentUser = mockUser1;
      store.users = [mockUser1];
      
      vi.mocked(api.deleteUser).mockResolvedValue({
        data: { message: 'User deleted' },
      });

      await store.deleteUser('user1');

      expect(store.currentUser).toBeNull();
    });

    it('should handle delete user error', async () => {
      const store = useUserStore();
      const errorMessage = 'Delete failed';
      vi.mocked(api.deleteUser).mockResolvedValue({
        error: errorMessage,
      });

      await expect(store.deleteUser('user1')).rejects.toThrow();
      expect(store.error).toBe(errorMessage);
    });
  });

  describe('Utility Actions', () => {
    it('should clear error', () => {
      const store = useUserStore();
      store.error = 'Some error';
      
      store.clearError();
      
      expect(store.error).toBeNull();
    });

    it('should clear current user', () => {
      const store = useUserStore();
      store.currentUser = mockUser1;
      
      store.clearCurrentUser();
      
      expect(store.currentUser).toBeNull();
    });
  });
});
