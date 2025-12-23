const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw data;
    }
    return data;
  }

  // Auth: naam + pincode (vereenvoudigd)
  async register(name: string, pincode: string) {
    return this.request<{ token: string; user: { id: number; name: string } }>('/register', {
      method: 'POST',
      body: JSON.stringify({ name, pincode }),
    });
  }

  async login(name: string, pincode: string) {
    return this.request<{ token: string; user: { id: number; name: string } }>('/login', {
      method: 'POST',
      body: JSON.stringify({ name, pincode }),
    });
  }

  async logout() {
    const result = await this.request('/logout', { method: 'POST' });
    this.setToken(null);
    return result;
  }

  async getUser() {
    return this.request<{ id: number; name: string }>('/user');
  }

  // Study sessions
  async startSession(data: {
    session_id: string;
    subject_name: string;
    task_description: string;
    minutes_planned?: number;
    amount_planned?: number;
    unit?: string;
  }) {
    return this.request<{ message: string; session: unknown }>('/session/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async stopSession(data: {
    session_id: string;
    minutes_actual?: number;
    amount_actual?: number;
    status?: 'completed' | 'cancelled';
  }) {
    return this.request<{ message: string; session: unknown }>('/session/stop', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getActiveSessions() {
    return this.request<unknown[]>('/session/active');
  }

  async getSessionHistory() {
    return this.request<unknown[]>('/session/history');
  }
}

export const api = new ApiService();
