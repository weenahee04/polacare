/**
 * AuthContext - Authentication State Management
 * 
 * Provides:
 * - currentUser: The logged-in user's profile
 * - token: JWT token (stored in localStorage)
 * - isLoading: Loading state for auth operations
 * - isAuthenticated: Boolean for auth status
 * - login/logout: Auth functions
 * - loadProfile: Fetch profile from API
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '../services/apiService';
import { UserProfile } from '../types';

// Storage keys
const TOKEN_KEY = 'polacare_token';
const USER_KEY = 'polacare_user';

// API User to UserProfile conversion
interface ApiUser {
  id: string;
  name: string;
  hn: string;
  phoneNumber: string;
  avatarUrl?: string;
  gender: string;
  dateOfBirth: string;
  weight: number;
  height: number;
  bmi: number;
  role?: string;
}

function apiUserToProfile(user: ApiUser): UserProfile {
  return {
    name: user.name,
    hn: user.hn,
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    gender: user.gender as 'Male' | 'Female' | 'Other',
    dateOfBirth: user.dateOfBirth,
    weight: user.weight,
    height: user.height,
    bmi: user.bmi,
  };
}

// Context interface
interface AuthContextType {
  currentUser: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Auth actions
  requestOTP: (phoneNumber: string) => Promise<{ success: boolean; message?: string }>;
  verifyOTP: (phoneNumber: string, code: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loadProfile: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  weight: number;
  height: number;
  avatarUrl?: string;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        
        if (storedToken) {
          setToken(storedToken);
          
          // Try to load fresh profile from API
          try {
            const response = await apiService.getProfile(storedToken);
            if (response.user) {
              const profile = apiUserToProfile(response.user);
              setCurrentUser(profile);
              localStorage.setItem(USER_KEY, JSON.stringify(profile));
            }
          } catch (err) {
            // If API fails, use cached user
            if (storedUser) {
              setCurrentUser(JSON.parse(storedUser));
            } else {
              // Token invalid, clear auth
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              setToken(null);
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Request OTP
  const requestOTP = useCallback(async (phoneNumber: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Format phone number
      const formattedPhone = formatPhoneNumber(phoneNumber);
      await apiService.requestOTP(formattedPhone);
      return { success: true, message: 'OTP sent successfully' };
    } catch (err: any) {
      const message = err.message || 'Failed to send OTP';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify OTP and login
  const verifyOTP = useCallback(async (phoneNumber: string, code: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const response = await apiService.verifyOTP(formattedPhone, code);
      
      if (response.token && response.user) {
        // Save token
        localStorage.setItem(TOKEN_KEY, response.token);
        setToken(response.token);
        
        // Save user profile
        const profile = apiUserToProfile(response.user);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
        setCurrentUser(profile);
        
        return { success: true };
      }
      
      return { success: false, message: 'Invalid response from server' };
    } catch (err: any) {
      const message = err.message || 'Failed to verify OTP';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register new user
  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formattedPhone = formatPhoneNumber(data.phoneNumber);
      const response = await apiService.register({
        ...data,
        phoneNumber: formattedPhone,
      });
      
      if (response.token && response.user) {
        // Save token
        localStorage.setItem(TOKEN_KEY, response.token);
        setToken(response.token);
        
        // Save user profile
        const profile = apiUserToProfile(response.user);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
        setCurrentUser(profile);
        
        return { success: true };
      }
      
      return { success: false, message: 'Invalid response from server' };
    } catch (err: any) {
      const message = err.message || 'Failed to register';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout - invalidate token on backend
  const logout = useCallback(async () => {
    // Call backend to invalidate token
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        // Logout should succeed even if API call fails
        console.warn('Logout API call failed:', err);
      }
    }
    
    // Clear local storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setCurrentUser(null);
    setError(null);
  }, []);

  // Load profile from API
  const loadProfile = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.getProfile(token);
      if (response.user) {
        const profile = apiUserToProfile(response.user);
        setCurrentUser(profile);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      // If unauthorized, logout
      if (err.message?.includes('401') || err.message?.includes('unauthorized')) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    currentUser,
    token,
    isLoading,
    isAuthenticated: !!token && !!currentUser,
    error,
    requestOTP,
    verifyOTP,
    register,
    logout,
    loadProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper to format phone number
function formatPhoneNumber(phone: string): string {
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 0, convert to +66
  if (digits.startsWith('0')) {
    return '+66' + digits.slice(1);
  }
  
  // If starts with 66, add +
  if (digits.startsWith('66')) {
    return '+' + digits;
  }
  
  // If already has +, return as-is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Default: assume Thai number, add +66
  return '+66' + digits;
}

// Export storage keys for external use
export { TOKEN_KEY, USER_KEY };

