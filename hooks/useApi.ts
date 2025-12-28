/**
 * useApi Hook
 * 
 * Custom hook for making authenticated API calls.
 * Automatically includes the auth token from context.
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService, ApiError } from '../services/apiService';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const { token } = useAuth();
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async <R = T>(
      apiCall: (token?: string) => Promise<R>
    ): Promise<R | null> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await apiCall(token || undefined);
        setState({ data: result as any, isLoading: false, error: null });
        options.onSuccess?.(result);
        return result;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : 'An unknown error occurred';

        setState(prev => ({ ...prev, isLoading: false, error: message }));
        options.onError?.(message);
        return null;
      }
    },
    [token, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Convenience hooks for common API operations

export function useCases() {
  const api = useApi<{ cases: any[] }>();

  const fetchCases = useCallback(() => {
    return api.execute((token) => apiService.getCases(token));
  }, [api]);

  const fetchCaseById = useCallback(
    (id: string) => {
      return api.execute((token) => apiService.getCaseById(id, token));
    },
    [api]
  );

  return {
    cases: api.data?.cases || [],
    isLoading: api.isLoading,
    error: api.error,
    fetchCases,
    fetchCaseById,
    reset: api.reset,
  };
}

export function useMedications() {
  const api = useApi<{ medications: any[] }>();

  const fetchMedications = useCallback(() => {
    return api.execute((token) => apiService.getMedications(token));
  }, [api]);

  const createMedication = useCallback(
    (data: any) => {
      return api.execute((token) => apiService.createMedication(data, token));
    },
    [api]
  );

  const logMedicationTaken = useCallback(
    (id: string, data?: any) => {
      return api.execute((token) =>
        apiService.logMedicationTaken(id, data, token)
      );
    },
    [api]
  );

  return {
    medications: api.data?.medications || [],
    isLoading: api.isLoading,
    error: api.error,
    fetchMedications,
    createMedication,
    logMedicationTaken,
    reset: api.reset,
  };
}

export function useVisionTests() {
  const api = useApi<{ tests: any[] }>();

  const fetchVisionTests = useCallback(() => {
    return api.execute((token) => apiService.getVisionTests(token));
  }, [api]);

  const createVisionTest = useCallback(
    (data: any) => {
      return api.execute((token) => apiService.createVisionTest(data, token));
    },
    [api]
  );

  return {
    tests: api.data?.tests || [],
    isLoading: api.isLoading,
    error: api.error,
    fetchVisionTests,
    createVisionTest,
    reset: api.reset,
  };
}

export function useArticles() {
  const api = useApi<{ articles: any[] }>();

  const fetchArticles = useCallback(
    (category?: string) => {
      return api.execute(() => apiService.getArticles(category));
    },
    [api]
  );

  const fetchPopularArticles = useCallback(
    (limit?: number) => {
      return api.execute(() => apiService.getPopularArticles(limit));
    },
    [api]
  );

  return {
    articles: api.data?.articles || [],
    isLoading: api.isLoading,
    error: api.error,
    fetchArticles,
    fetchPopularArticles,
    reset: api.reset,
  };
}

export default useApi;

