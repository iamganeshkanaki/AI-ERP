import { environment } from '../config/environment';
import { tokenStorage } from './tokenStorage';

export interface ApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string[]>;
  raw?: any;
}

export class AppApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'AppApiError';
    this.status = error.status;
    this.fieldErrors = error.fieldErrors;
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = environment.apiBaseUrl.replace(/\/$/, '');
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const accessToken = tokenStorage.getAccessToken();
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Set timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401 && !options.headers?.toString().includes('retry')) {
      // Handle automatic token refresh
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        tokenStorage.clearTokens();
        throw new AppApiError({
          status: 401,
          message: 'Session expired. Please log in again.',
        });
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return apiRequest<T>(endpoint, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${tokenStorage.getAccessToken()}`,
            },
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${baseUrl}${environment.endpoints.auth.refresh}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Refresh token invalid');
        }

        const data = await refreshResponse.json();
        tokenStorage.setTokens({
          access: data.access,
          refresh: data.refresh || refreshToken,
        });

        processQueue(null, data.access);

        return apiRequest<T>(endpoint, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${data.access}`,
          },
        });
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        tokenStorage.clearTokens();
        throw new AppApiError({
          status: 401,
          message: 'Your session has expired. Please sign in again.',
        });
      } finally {
        isRefreshing = false;
      }
    }

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }

      const status = response.status;
      let message = 'An unexpected error occurred.';

      if (status === 400) {
        message = errorData.detail || 'Invalid request parameters.';
      } else if (status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        message = 'Requested resource not found.';
      } else if (status === 409) {
        message = errorData.detail || 'Conflict detected with existing record.';
      } else if (status === 422) {
        message = errorData.detail || 'Unprocessable entity. Validation failed.';
      } else if (status === 429) {
        message = 'Rate limit exceeded. Please wait a moment and retry.';
      } else if (status >= 500) {
        message = 'ERP backend service error. Please contact your system administrator.';
      }

      throw new AppApiError({
        status,
        message,
        fieldErrors: typeof errorData === 'object' && !errorData.detail ? errorData : undefined,
        raw: errorData,
      });
    }

    // 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof AppApiError) {
      throw err;
    }

    if (err.name === 'AbortError') {
      throw new AppApiError({
        status: 408,
        message: 'Request timed out while connecting to Django ERP backend.',
      });
    }

    throw new AppApiError({
      status: 0,
      message: 'Unable to reach Django backend server. Check network connection or API URL in settings.',
      raw: err,
    });
  }
}

export const apiClient = {
  request: apiRequest,
  get: <T = any>(endpoint: string, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T = any>(endpoint: string, body?: any, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = any>(endpoint: string, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
  healthCheck: async () => {
    return apiRequest<{ status: string }>('/health/');
  },
};

