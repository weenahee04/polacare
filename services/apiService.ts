/**
 * API Service for Frontend
 * 
 * Handles all API requests with:
 * - Automatic token management
 * - Error handling
 * - Request/Response interceptors
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Storage key for token
const TOKEN_KEY = 'polacare_token';

// Get token from storage
function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// API Error class
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  body?: any;
  skipAuth?: boolean;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { token, skipAuth, body, ...fetchOptions } = options;
    
    // Build headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    // Add auth token (from param, or storage, unless skipped)
    const authToken = token || (!skipAuth ? getStoredToken() : null);
    if (authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      // Parse response
      const data = await response.json().catch(() => ({}));

      // Handle errors
      if (!response.ok) {
        const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
        throw new ApiError(errorMessage, response.status, data);
      }

      return data as T;
    } catch (error) {
      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Wrap other errors
      console.error('API request failed:', error);
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        0
      );
    }
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  async requestOTP(phoneNumber: string): Promise<{ message: string; phoneNumber: string }> {
    return this.request('/auth/otp/request', {
      method: 'POST',
      body: { phoneNumber },
      skipAuth: true,
    });
  }

  async verifyOTP(phoneNumber: string, code: string): Promise<{ token: string; user: any }> {
    return this.request('/auth/otp/verify', {
      method: 'POST',
      body: { phoneNumber, code },
      skipAuth: true,
    });
  }

  async register(data: {
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    weight: number;
    height: number;
    avatarUrl?: string;
  }): Promise<{ token: string; user: any }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: data,
      skipAuth: true,
    });
  }

  async getProfile(token?: string): Promise<{ user: any }> {
    return this.request('/auth/profile', {
      method: 'GET',
      token,
    });
  }

  async updateProfile(data: any, token?: string): Promise<{ user: any; message: string }> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: data,
      token,
    });
  }

  async logout(token?: string): Promise<{ message: string }> {
    return this.request('/auth/logout', {
      method: 'POST',
      token,
    });
  }

  async changePassword(currentPassword: string, newPassword: string, token?: string): Promise<{ message: string; requireReAuth: boolean }> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
      token,
    });
  }

  // ============================================
  // CASES ENDPOINTS
  // ============================================

  async getCases(token?: string): Promise<{ cases: any[] }> {
    return this.request('/cases', {
      method: 'GET',
      token,
    });
  }

  async getCaseById(id: string, token?: string): Promise<{ case: any }> {
    return this.request(`/cases/${id}`, {
      method: 'GET',
      token,
    });
  }

  async createCase(data: any, token?: string): Promise<{ case: any }> {
    return this.request('/cases', {
      method: 'POST',
      body: data,
      token,
    });
  }

  // ============================================
  // MEDICATIONS ENDPOINTS
  // ============================================

  async getMedications(token?: string, active?: boolean): Promise<{ medications: any[] }> {
    const endpoint = active !== undefined ? `/medications?active=${active}` : '/medications';
    return this.request(endpoint, {
      method: 'GET',
      token,
    });
  }

  async getMedicationsWithStatus(token?: string): Promise<{ medications: any[] }> {
    return this.request('/medications/status', {
      method: 'GET',
      token,
    });
  }

  async createMedication(data: {
    medicineName: string;
    type?: 'drop' | 'pill' | 'other';
    frequency?: string;
    nextTime: string;
    dosage?: string;
    startDate?: string;
    endDate?: string;
  }, token?: string): Promise<{ medication: any }> {
    return this.request('/medications', {
      method: 'POST',
      body: data,
      token,
    });
  }

  async updateMedication(id: string, data: any, token?: string): Promise<{ medication: any }> {
    return this.request(`/medications/${id}`, {
      method: 'PUT',
      body: data,
      token,
    });
  }

  async deleteMedication(id: string, token?: string): Promise<{ message: string }> {
    return this.request(`/medications/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  async logMedicationTaken(id: string, data?: { scheduledTime?: string; notes?: string }, token?: string): Promise<{ log: any }> {
    return this.request(`/medications/${id}/log`, {
      method: 'POST',
      body: data || {},
      token,
    });
  }

  async getMedicationLogs(id: string, params?: { startDate?: string; endDate?: string; page?: number; limit?: number }, token?: string): Promise<{ logs: any[]; pagination: any }> {
    let endpoint = `/medications/${id}/logs`;
    if (params) {
      const query = new URLSearchParams();
      if (params.startDate) query.set('startDate', params.startDate);
      if (params.endDate) query.set('endDate', params.endDate);
      if (params.page) query.set('page', params.page.toString());
      if (params.limit) query.set('limit', params.limit.toString());
      if (query.toString()) endpoint += `?${query.toString()}`;
    }
    return this.request(endpoint, {
      method: 'GET',
      token,
    });
  }

  async getMedicationHistory(params?: { days?: number; page?: number; limit?: number }, token?: string): Promise<{ logs: any[]; pagination: any }> {
    let endpoint = '/medications/history';
    if (params) {
      const query = new URLSearchParams();
      if (params.days) query.set('days', params.days.toString());
      if (params.page) query.set('page', params.page.toString());
      if (params.limit) query.set('limit', params.limit.toString());
      if (query.toString()) endpoint += `?${query.toString()}`;
    }
    return this.request(endpoint, {
      method: 'GET',
      token,
    });
  }

  async getMedicationAdherence(days?: number, token?: string): Promise<{ adherence: { rate: number; totalScheduled: number; totalTaken: number; periodDays: number } }> {
    const endpoint = days ? `/medications/adherence/rate?days=${days}` : '/medications/adherence/rate';
    return this.request(endpoint, {
      method: 'GET',
      token,
    });
  }

  // ============================================
  // CONSENT ENDPOINTS
  // ============================================

  async getConsents(token?: string): Promise<{ consents: any[] }> {
    return this.request('/consents', {
      method: 'GET',
      token,
    });
  }

  async checkConsent(type: string = 'terms', token?: string): Promise<{ hasConsent: boolean; currentVersion: string; consentedAt: string | null }> {
    return this.request(`/consents/check?type=${type}`, {
      method: 'GET',
      token,
    });
  }

  async createConsent(consentType: string, version?: string, token?: string): Promise<{ consent: any }> {
    return this.request('/consents', {
      method: 'POST',
      body: { consentType, version },
      token,
    });
  }

  async getConsentVersions(token?: string): Promise<{ terms: string; privacy: string }> {
    return this.request('/consents/versions', {
      method: 'GET',
      token,
    });
  }

  async revokeConsent(type: string, token?: string): Promise<{ message: string }> {
    return this.request(`/consents/${type}`, {
      method: 'DELETE',
      token,
    });
  }

  // ============================================
  // VISION TESTS ENDPOINTS
  // ============================================

  async getVisionTests(token?: string): Promise<{ tests: any[] }> {
    return this.request('/vision-tests', {
      method: 'GET',
      token,
    });
  }

  async createVisionTest(data: any, token?: string): Promise<{ test: any }> {
    return this.request('/vision-tests', {
      method: 'POST',
      body: data,
      token,
    });
  }

  async deleteVisionTest(id: string, token?: string): Promise<{ message: string }> {
    return this.request(`/vision-tests/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  // ============================================
  // ARTICLES ENDPOINTS (Public)
  // ============================================

  async getArticles(category?: string): Promise<{ articles: any[]; pagination?: any }> {
    const endpoint = category ? `/articles?category=${encodeURIComponent(category)}` : '/articles';
    return this.request(endpoint, {
      method: 'GET',
      skipAuth: true,
    });
  }

  async getArticleById(id: string): Promise<{ article: any }> {
    return this.request(`/articles/${id}`, {
      method: 'GET',
      skipAuth: true,
    });
  }

  async getArticleCategories(): Promise<{ categories: string[] }> {
    return this.request('/articles/categories', {
      method: 'GET',
      skipAuth: true,
    });
  }

  async getPopularArticles(limit?: number): Promise<{ articles: any[] }> {
    const endpoint = limit ? `/articles/popular?limit=${limit}` : '/articles/popular';
    return this.request(endpoint, {
      method: 'GET',
      skipAuth: true,
    });
  }

  // ============================================
  // AI ENDPOINTS
  // ============================================

  async analyzeImage(file: File, token?: string): Promise<any> {
    const authToken = token || getStoredToken();
    
    const formData = new FormData();
    formData.append('image', file);

    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/ai/analyze-image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(error.error || 'Image analysis failed', response.status, error);
    }

    return response.json();
  }

  async analyzeRetinalAge(file: File, actualAge: number, token?: string): Promise<any> {
    const authToken = token || getStoredToken();
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('actualAge', actualAge.toString());

    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/ai/retinal-age`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(error.error || 'Retinal age analysis failed', response.status, error);
    }

    return response.json();
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  // Check if API is reachable
  async healthCheck(): Promise<{ status: string; services: any }> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
      return response.json();
    } catch (error) {
      throw new ApiError('API server is not reachable', 0);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export for testing
export { API_BASE_URL };
