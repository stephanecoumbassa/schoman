import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useApi, useGet, usePost, usePut, useDelete, useApiMultiple, usePagination } from './useApi';
import api from '@/services/api';

// Mock the API service
vi.mock('@/services/api', () => ({
  default: {
    request: vi.fn(),
  },
}));

describe('useApi Composables', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useApi', () => {
    it('should initialize with default values', () => {
      const mockApiCall = vi.fn();
      const { data, loading, error, isSuccess } = useApi(mockApiCall);

      expect(data.value).toBeNull();
      expect(loading.value).toBe(false);
      expect(error.value).toBeNull();
      expect(isSuccess.value).toBe(false);
    });

    it('should execute API call successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockApiCall = vi.fn().mockResolvedValue({ data: mockData });
      
      const { data, loading, error, isSuccess, execute } = useApi(mockApiCall);

      const result = await execute();

      expect(loading.value).toBe(false);
      expect(data.value).toEqual(mockData);
      expect(error.value).toBeNull();
      expect(isSuccess.value).toBe(true);
      expect(result).toEqual({ data: mockData, error: null });
    });

    it('should handle API call error', async () => {
      const errorMessage = 'API Error';
      const mockApiCall = vi.fn().mockResolvedValue({ error: errorMessage });
      
      const { data, loading, error, isSuccess, execute } = useApi(mockApiCall);

      const result = await execute();

      expect(loading.value).toBe(false);
      expect(data.value).toBeNull();
      expect(error.value).toBe(errorMessage);
      expect(isSuccess.value).toBe(false);
      expect(result).toEqual({ data: null, error: errorMessage });
    });

    it('should handle exception during API call', async () => {
      const mockApiCall = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const { error, execute } = useApi(mockApiCall);

      await execute();

      expect(error.value).toBe('Network error');
    });

    it('should call onSuccess callback', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockApiCall = vi.fn().mockResolvedValue({ data: mockData });
      const onSuccess = vi.fn();
      
      const { execute } = useApi(mockApiCall, { onSuccess });

      await execute();

      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });

    it('should call onError callback', async () => {
      const errorMessage = 'API Error';
      const mockApiCall = vi.fn().mockResolvedValue({ error: errorMessage });
      const onError = vi.fn();
      
      const { execute } = useApi(mockApiCall, { onError });

      await execute();

      expect(onError).toHaveBeenCalledWith(errorMessage);
    });

    it('should execute immediately if specified', () => {
      const mockApiCall = vi.fn().mockResolvedValue({ data: {} });
      
      useApi(mockApiCall, { immediate: true });

      expect(mockApiCall).toHaveBeenCalled();
    });

    it('should reset state', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockApiCall = vi.fn().mockResolvedValue({ data: mockData });
      
      const { data, error, isSuccess, execute, reset } = useApi(mockApiCall);

      await execute();
      expect(data.value).toEqual(mockData);
      expect(isSuccess.value).toBe(true);

      reset();

      expect(data.value).toBeNull();
      expect(error.value).toBeNull();
      expect(isSuccess.value).toBe(false);
    });

    it('should pass arguments to API call', async () => {
      const mockApiCall = vi.fn().mockResolvedValue({ data: {} });
      
      const { execute } = useApi(mockApiCall);

      await execute('arg1', 'arg2', 'arg3');

      expect(mockApiCall).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });

  describe('useGet', () => {
    it('should make GET request', async () => {
      const mockData = { users: [] };
      vi.mocked(api.request).mockResolvedValue({ data: mockData });
      
      const { data, execute } = useGet('/users');

      await execute();

      expect(api.request).toHaveBeenCalledWith('/users');
      expect(data.value).toEqual(mockData);
    });
  });

  describe('usePost', () => {
    it('should make POST request with body', async () => {
      const mockData = { id: 1, name: 'New User' };
      const postBody = { name: 'New User', email: 'test@test.com' };
      vi.mocked(api.request).mockResolvedValue({ data: mockData });
      
      const { data, execute } = usePost('/users');

      await execute(postBody);

      expect(api.request).toHaveBeenCalledWith('/users', {
        method: 'POST',
        body: JSON.stringify(postBody),
      });
      expect(data.value).toEqual(mockData);
    });
  });

  describe('usePut', () => {
    it('should make PUT request with body', async () => {
      const mockData = { id: 1, name: 'Updated User' };
      const putBody = { name: 'Updated User' };
      vi.mocked(api.request).mockResolvedValue({ data: mockData });
      
      const { data, execute } = usePut('/users/1');

      await execute(putBody);

      expect(api.request).toHaveBeenCalledWith('/users/1', {
        method: 'PUT',
        body: JSON.stringify(putBody),
      });
      expect(data.value).toEqual(mockData);
    });
  });

  describe('useDelete', () => {
    it('should make DELETE request', async () => {
      const mockData = { message: 'Deleted' };
      vi.mocked(api.request).mockResolvedValue({ data: mockData });
      
      const { data, execute } = useDelete('/users/1');

      await execute();

      expect(api.request).toHaveBeenCalledWith('/users/1', { method: 'DELETE' });
      expect(data.value).toEqual(mockData);
    });
  });

  describe('useApiMultiple', () => {
    it('should execute multiple API calls', async () => {
      const mockCall1 = vi.fn().mockResolvedValue({ data: { id: 1 } });
      const mockCall2 = vi.fn().mockResolvedValue({ data: { id: 2 } });
      const mockCall3 = vi.fn().mockResolvedValue({ data: { id: 3 } });
      
      const { results, executeAll } = useApiMultiple();

      await executeAll([mockCall1, mockCall2, mockCall3]);

      expect(results.value).toHaveLength(3);
      expect(results.value[0].data).toEqual({ id: 1 });
      expect(results.value[1].data).toEqual({ id: 2 });
      expect(results.value[2].data).toEqual({ id: 3 });
    });

    it('should handle errors in multiple calls', async () => {
      const mockCall1 = vi.fn().mockResolvedValue({ data: { id: 1 } });
      const mockCall2 = vi.fn().mockResolvedValue({ error: 'Error in call 2' });
      const mockCall3 = vi.fn().mockResolvedValue({ data: { id: 3 } });
      
      const { error, executeAll } = useApiMultiple();

      await executeAll([mockCall1, mockCall2, mockCall3]);

      expect(error.value).toBe('Error in call 2');
    });

    it('should handle exceptions in multiple calls', async () => {
      const mockCall1 = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const { error, executeAll } = useApiMultiple();

      await executeAll([mockCall1]);

      expect(error.value).toBe('Network error');
    });
  });

  describe('usePagination', () => {
    const mockPaginatedResponse = {
      data: {
        items: [{ id: 1 }, { id: 2 }],
        pagination: {
          currentPage: 1,
          totalPages: 5,
          totalItems: 50,
          hasNextPage: true,
          hasPrevPage: false,
        },
      },
    };

    it('should fetch first page', async () => {
      const fetchFn = vi.fn().mockResolvedValue(mockPaginatedResponse);
      
      const { data, currentPage, totalPages, fetchPage } = usePagination(fetchFn);

      await fetchPage(1);

      expect(fetchFn).toHaveBeenCalledWith(1, 10);
      expect(data.value).toHaveLength(2);
      expect(currentPage.value).toBe(1);
      expect(totalPages.value).toBe(5);
    });

    it('should navigate to next page', async () => {
      const fetchFn = vi.fn().mockResolvedValue(mockPaginatedResponse);
      
      const { fetchPage, nextPage } = usePagination(fetchFn);

      await fetchPage(1);
      await nextPage();

      expect(fetchFn).toHaveBeenCalledWith(2, 10);
    });

    it('should navigate to previous page', async () => {
      const fetchFn = vi.fn()
        .mockResolvedValueOnce({
          data: {
            items: [],
            pagination: {
              currentPage: 2,
              totalPages: 5,
              totalItems: 50,
              hasNextPage: true,
              hasPrevPage: true,
            },
          },
        })
        .mockResolvedValueOnce(mockPaginatedResponse);
      
      const { fetchPage, prevPage } = usePagination(fetchFn);

      await fetchPage(2);
      await prevPage();

      expect(fetchFn).toHaveBeenCalledWith(1, 10);
    });

    it('should not navigate beyond limits', async () => {
      const fetchFn = vi.fn().mockResolvedValue({
        data: {
          items: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 5,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      });
      
      const { fetchPage, nextPage, prevPage } = usePagination(fetchFn);

      await fetchPage(1);
      
      const callCountAfterFetch = fetchFn.mock.calls.length;
      
      await nextPage();
      await prevPage();

      // Should not make additional calls
      expect(fetchFn.mock.calls.length).toBe(callCountAfterFetch);
    });

    it('should go to specific page', async () => {
      const fetchFn = vi.fn().mockResolvedValue(mockPaginatedResponse);
      
      const { fetchPage, goToPage } = usePagination(fetchFn);

      // First fetch to set totalPages
      await fetchPage(1);
      await goToPage(3);

      expect(fetchFn).toHaveBeenCalledWith(3, 10);
    });

    it('should refresh current page', async () => {
      const fetchFn = vi.fn().mockResolvedValue(mockPaginatedResponse);
      
      const { fetchPage, refresh } = usePagination(fetchFn);

      await fetchPage(2);
      await refresh();

      expect(fetchFn).toHaveBeenCalledWith(2, 10);
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('should handle errors', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ error: 'Failed to fetch' });
      
      const { error, fetchPage } = usePagination(fetchFn);

      await fetchPage(1);

      expect(error.value).toBe('Failed to fetch');
    });
  });
});
