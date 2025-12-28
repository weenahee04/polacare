/**
 * Mock AuthContext - สำหรับใช้ Frontend แบบ Standalone (ไม่ต้องใช้ Backend)
 * เก็บข้อมูลใน localStorage เท่านั้น
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserProfile } from '../types';

// Storage keys
const TOKEN_KEY = 'polacare_token';
const USER_KEY = 'polacare_user';

// Context interface
interface AuthContextType {
  currentUser: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  requestOTP: (phoneNumber: string) => Promise<{ success: boolean; message?: string }>;
  verifyOTP: (phoneNumber: string, code: string) => Promise<{ success: boolean; message?: string }>;
  login: (phoneNumber: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Mock Register - เก็บข้อมูลใน localStorage
  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // ตรวจสอบว่ามีเบอร์นี้แล้วหรือยัง
      const existingUsers = JSON.parse(localStorage.getItem('polacare_users') || '[]');
      const userExists = existingUsers.some((u: any) => u.phoneNumber === data.phoneNumber);

      if (userExists) {
        setError('เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว');
        setIsLoading(false);
        return { success: false, message: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' };
      }

      // สร้าง user ใหม่
      const heightM = data.height / 100;
      const bmi = data.weight / (heightM * heightM);
      const hn = `HN-${Math.floor(Math.random() * 1000000)}`;

      const newUser: UserProfile = {
        name: `${data.firstName} ${data.lastName}`,
        hn: hn,
        phoneNumber: data.phoneNumber,
        avatarUrl: data.avatarUrl,
        gender: data.gender as 'Male' | 'Female' | 'Other',
        dateOfBirth: data.dateOfBirth,
        weight: data.weight,
        height: data.height,
        bmi: parseFloat(bmi.toFixed(2)),
      };

      // เก็บ user ใน list
      const updatedUsers = [...existingUsers, { ...newUser, password: data.password }];
      localStorage.setItem('polacare_users', JSON.stringify(updatedUsers));

      // สร้าง mock token
      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // เก็บ token และ user
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));

      setToken(mockToken);
      setCurrentUser(newUser);

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'การลงทะเบียนล้มเหลว';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Mock OTP Request - แค่ return success
  const requestOTP = useCallback(async (phoneNumber: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // เก็บ OTP ใน localStorage (สำหรับ demo)
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      localStorage.setItem(`otp_${phoneNumber}`, otp);
      localStorage.setItem(`otp_time_${phoneNumber}`, Date.now().toString());

      console.log('Mock OTP:', otp); // แสดงใน console สำหรับ demo

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ไม่สามารถส่ง OTP ได้';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Mock OTP Verify
  const verifyOTP = useCallback(async (phoneNumber: string, code: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const storedOTP = localStorage.getItem(`otp_${phoneNumber}`);
      const otpTime = localStorage.getItem(`otp_time_${phoneNumber}`);

      if (!storedOTP || !otpTime) {
        setError('กรุณาขอ OTP ใหม่');
        setIsLoading(false);
        return { success: false, message: 'กรุณาขอ OTP ใหม่' };
      }

      // ตรวจสอบว่า OTP หมดอายุหรือยัง (5 นาที)
      const timeDiff = Date.now() - parseInt(otpTime);
      if (timeDiff > 5 * 60 * 1000) {
        setError('OTP หมดอายุแล้ว กรุณาขอใหม่');
        setIsLoading(false);
        return { success: false, message: 'OTP หมดอายุแล้ว กรุณาขอใหม่' };
      }

      if (storedOTP !== code) {
        setError('รหัส OTP ไม่ถูกต้อง');
        setIsLoading(false);
        return { success: false, message: 'รหัส OTP ไม่ถูกต้อง' };
      }

      // หา user จาก localStorage
      const users = JSON.parse(localStorage.getItem('polacare_users') || '[]');
      let user = users.find((u: any) => u.phoneNumber === phoneNumber);

      // ถ้าไม่มี user → สร้างใหม่ (เหมือน verifyOTPAndLogin)
      if (!user) {
        const hn = `HN-${Math.floor(Math.random() * 1000000)}`;
        user = {
          name: 'User',
          hn: hn,
          phoneNumber: phoneNumber,
          gender: 'Other',
          dateOfBirth: '1990-01-01',
          weight: 0,
          height: 0,
          bmi: 0,
        };
        users.push({ ...user, password: 'temp' });
        localStorage.setItem('polacare_users', JSON.stringify(users));
      }

      // สร้าง mock token
      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      // ลบ OTP
      localStorage.removeItem(`otp_${phoneNumber}`);
      localStorage.removeItem(`otp_time_${phoneNumber}`);

      setToken(mockToken);
      setCurrentUser(user);

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'การยืนยัน OTP ล้มเหลว';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Mock Login
  const login = useCallback(async (phoneNumber: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const users = JSON.parse(localStorage.getItem('polacare_users') || '[]');
      const user = users.find((u: any) => u.phoneNumber === phoneNumber && u.password === password);

      if (!user) {
        setError('เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง');
        setIsLoading(false);
        return { success: false, message: 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง' };
      }

      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      setToken(mockToken);
      setCurrentUser(user);

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'การเข้าสู่ระบบล้มเหลว';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, message: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setCurrentUser(null);
    setError(null);
  }, []);

  const isAuthenticated = !!token && !!currentUser;

  const value: AuthContextType = {
    currentUser,
    token,
    isLoading,
    isAuthenticated,
    error,
    register,
    requestOTP,
    verifyOTP,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

