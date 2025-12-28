/**
 * useRequireAuth Hook
 * 
 * Ensures user is authenticated before accessing a route/component.
 * Returns auth state and loading indicator.
 */

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.mock';

interface UseRequireAuthOptions {
  onUnauthenticated?: () => void;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { isAuthenticated, isLoading, currentUser, token } = useAuth();

  useEffect(() => {
    // Only trigger callback when we know auth state (not loading)
    if (!isLoading && !isAuthenticated && options.onUnauthenticated) {
      options.onUnauthenticated();
    }
  }, [isLoading, isAuthenticated, options]);

  return {
    isAuthenticated,
    isLoading,
    currentUser,
    token,
    // Helper to check if we should render protected content
    canRender: !isLoading && isAuthenticated,
  };
}

export default useRequireAuth;



