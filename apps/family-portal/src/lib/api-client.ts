export class ApiClient {
  static getBaseUrl(): string {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const port = hostname === 'localhost' || hostname === '127.0.0.1' ? '3001' : '8081';
      return `${protocol}//${hostname}:${port}/api/v1`;
    }
    return 'http://localhost:3001/api/v1';
  }

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('poco_access_token');
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('poco_refresh_token');
  }

  static setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('poco_access_token', accessToken);
    localStorage.setItem('poco_refresh_token', refreshToken);
  }

  static clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('poco_access_token');
    localStorage.removeItem('poco_refresh_token');
    localStorage.removeItem('poco_user');
    localStorage.removeItem('poco_active_household');
  }

  static async fetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    let response = await fetch(url, { ...options, headers });

    // Handle token refresh if 401 Unauthorized
    if (response.status === 401) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newTokens = refreshData.data || refreshData;
            this.setTokens(newTokens.accessToken, newTokens.refreshToken);

            // Retry original request with new token
            (headers as any)['Authorization'] = `Bearer ${newTokens.accessToken}`;
            response = await fetch(url, { ...options, headers });
          } else {
            this.clearTokens();
          }
        } catch {
          this.clearTokens();
        }
      }
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return (data.data !== undefined ? data.data : data) as T;
  }
}
