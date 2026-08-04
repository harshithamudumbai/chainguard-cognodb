import { env } from '../config/env';

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
  } | null;
}

export class ApiError extends Error {
  public code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${env.API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(id);

    const json = await response.json() as ApiResponse<T>;

    if (!response.ok || json.error) {
      throw new ApiError(
        json.error?.message || 'An unexpected error occurred',
        json.error?.code || 'UNKNOWN_ERROR'
      );
    }

    return json.data;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timed out', 'TIMEOUT');
      }
      throw new ApiError(error.message, 'NETWORK_ERROR');
    }
    throw new ApiError('An unknown error occurred', 'UNKNOWN_ERROR');
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, data: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
};
