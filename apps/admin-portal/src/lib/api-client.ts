export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    const message =
      typeof data?.message === 'string'
        ? data.message
        : Array.isArray(data?.message)
        ? data.message.join(', ')
        : `API error ${status}: ${statusText}`;
    super(message);
    this.name = 'ApiClientError';
  }
}

class ApiClient {
  private token: string | null = null;
  private onUnauthorizedCallback?: () => void;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('poco_staff_token');
    }
    return null;
  }

  onUnauthorized(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const token = this.getToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        if (this.onUnauthorizedCallback) {
          this.onUnauthorizedCallback();
        }
      }

      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: res.statusText };
      }

      throw new ApiClientError(res.status, res.statusText, errorData);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>
  ): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
