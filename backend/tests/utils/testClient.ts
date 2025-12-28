/**
 * Test HTTP Client
 * 
 * Utility for making API requests in tests
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  token?: string;
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  status: number;
  data: T;
  headers: Headers;
  ok: boolean;
}

class TestClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', body, token, headers = {} } = options;

    const requestHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data: T;
    try {
      data = await response.json();
    } catch {
      data = {} as T;
    }

    return {
      status: response.status,
      data,
      headers: response.headers,
      ok: response.ok,
    };
  }

  // Convenience methods
  async get<T = any>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', token });
  }

  async post<T = any>(endpoint: string, body: any, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, token });
  }

  async put<T = any>(endpoint: string, body: any, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, token });
  }

  async delete<T = any>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }
}

// Singleton instance
export const testClient = new TestClient();

// Factory for custom base URLs
export const createTestClient = (baseUrl: string) => new TestClient(baseUrl);

export default testClient;

