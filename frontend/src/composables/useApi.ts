import { ref } from 'vue';
import api from '@/services/api';

export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Composable for making API calls with loading and error handling
 * Provides convenient wrapper around API service with reactive state
 */
export function useApi<T = any>(
  apiCall: (...args: any[]) => Promise<any>,
  options: UseApiOptions = {}
) {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isSuccess = ref(false);

  const execute = async (...args: any[]) => {
    loading.value = true;
    error.value = null;
    isSuccess.value = false;

    try {
      const response = await apiCall(...args);
      
      if (response.error) {
        error.value = response.error;
        options.onError?.(response.error);
        return { data: null, error: response.error };
      }

      data.value = response.data;
      isSuccess.value = true;
      options.onSuccess?.(response.data);
      return { data: response.data, error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      error.value = errorMessage;
      options.onError?.(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    data.value = null;
    loading.value = false;
    error.value = null;
    isSuccess.value = false;
  };

  // Execute immediately if specified
  if (options.immediate) {
    execute();
  }

  return {
    data,
    loading,
    error,
    isSuccess,
    execute,
    reset,
  };
}

/**
 * Composable for GET requests
 */
export function useGet<T = any>(endpoint: string, options: UseApiOptions = {}) {
  return useApi<T>(() => api.request<T>(endpoint), options);
}

/**
 * Composable for POST requests
 */
export function usePost<T = any>(endpoint: string, options: UseApiOptions = {}) {
  return useApi<T>(
    (body: any) => api.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    options
  );
}

/**
 * Composable for PUT requests
 */
export function usePut<T = any>(endpoint: string, options: UseApiOptions = {}) {
  return useApi<T>(
    (body: any) => api.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
    options
  );
}

/**
 * Composable for DELETE requests
 */
export function useDelete<T = any>(endpoint: string, options: UseApiOptions = {}) {
  return useApi<T>(() => api.request<T>(endpoint, { method: 'DELETE' }), options);
}

/**
 * Composable for handling multiple API calls
 */
export function useApiMultiple() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const results = ref<any[]>([]);

  const executeAll = async (calls: Array<() => Promise<any>>) => {
    loading.value = true;
    error.value = null;
    results.value = [];

    try {
      const responses = await Promise.all(calls.map(call => call()));
      
      const hasError = responses.some(res => res.error);
      if (hasError) {
        const errors = responses
          .filter(res => res.error)
          .map(res => res.error)
          .join(', ');
        error.value = errors;
      }

      results.value = responses;
      return responses;
    } catch (err: any) {
      error.value = err.message || 'An error occurred';
      return [];
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    results,
    executeAll,
  };
}

/**
 * Composable for paginated API calls
 */
export function usePagination<T = any>(
  fetchFn: (page: number, limit: number) => Promise<any>,
  initialLimit = 10
) {
  const data = ref<T[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalItems = ref(0);
  const hasNextPage = ref(false);
  const hasPrevPage = ref(false);

  const fetchPage = async (page: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetchFn(page, initialLimit);
      
      if (response.error) {
        error.value = response.error;
        return;
      }

      if (response.data) {
        data.value = response.data.items || response.data;
        
        if (response.data.pagination) {
          currentPage.value = response.data.pagination.currentPage;
          totalPages.value = response.data.pagination.totalPages;
          totalItems.value = response.data.pagination.totalItems;
          hasNextPage.value = response.data.pagination.hasNextPage;
          hasPrevPage.value = response.data.pagination.hasPrevPage;
        }
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred';
    } finally {
      loading.value = false;
    }
  };

  const nextPage = async () => {
    if (hasNextPage.value) {
      await fetchPage(currentPage.value + 1);
    }
  };

  const prevPage = async () => {
    if (hasPrevPage.value) {
      await fetchPage(currentPage.value - 1);
    }
  };

  const goToPage = async (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      await fetchPage(page);
    }
  };

  const refresh = async () => {
    await fetchPage(currentPage.value);
  };

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPrevPage,
    fetchPage,
    nextPage,
    prevPage,
    goToPage,
    refresh,
  };
}
