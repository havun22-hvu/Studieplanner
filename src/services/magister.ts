// Magister API integration
// Uses unofficial API via backend proxy to avoid CORS issues

const API_BASE = import.meta.env.VITE_API_URL || 'https://studieplanner-api.havun.nl/api';

export interface MagisterSchool {
  id: string;
  naam: string;
  url: string;
}

export interface MagisterTest {
  id: string;
  vak: string;
  omschrijving: string;
  datum: string;
}

export interface MagisterHomework {
  id: string;
  vak: string;
  omschrijving: string;
  inleverDatum?: string;
  afgerond: boolean;
}

export interface MagisterGrade {
  vak: string;
  cijfer: number;
  weging: number;
  omschrijving: string;
  datum: string;
}

export interface MagisterScheduleItem {
  start: string;
  eind: string;
  vak: string;
  lokaal?: string;
  docent?: string;
}

export interface MagisterStatus {
  connected: boolean;
  studentName?: string;
  school?: string;
  lastSync?: string;
}

class MagisterService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('magister_token');
  }

  async searchSchools(query: string): Promise<MagisterSchool[]> {
    const response = await fetch(`${API_BASE}/magister/schools?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search schools');
    return response.json();
  }

  async login(schoolUrl: string, username: string, password: string): Promise<{ success: boolean; error?: string }> {
    const response = await fetch(`${API_BASE}/magister/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ school_url: schoolUrl, username, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (data.success && data.token) {
      this.token = data.token;
      localStorage.setItem('magister_token', data.token);
      return { success: true };
    }

    return { success: false, error: data.error || 'Login failed' };
  }

  async getStatus(): Promise<MagisterStatus> {
    if (!this.token) {
      return { connected: false };
    }

    try {
      const response = await fetch(`${API_BASE}/magister/status`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (!response.ok) {
        this.disconnect();
        return { connected: false };
      }

      return await response.json();
    } catch {
      return { connected: false };
    }
  }

  async getTests(): Promise<MagisterTest[]> {
    if (!this.token) return [];

    const response = await fetch(`${API_BASE}/magister/tests`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!response.ok) return [];
    return response.json();
  }

  async getHomework(): Promise<MagisterHomework[]> {
    if (!this.token) return [];

    const response = await fetch(`${API_BASE}/magister/homework`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!response.ok) return [];
    return response.json();
  }

  async getGrades(): Promise<MagisterGrade[]> {
    if (!this.token) return [];

    const response = await fetch(`${API_BASE}/magister/grades`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!response.ok) return [];
    return response.json();
  }

  async getSchedule(date: string): Promise<MagisterScheduleItem[]> {
    if (!this.token) return [];

    const response = await fetch(`${API_BASE}/magister/schedule?date=${date}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!response.ok) return [];
    return response.json();
  }

  disconnect(): void {
    this.token = null;
    localStorage.removeItem('magister_token');
  }

  isConnected(): boolean {
    return this.token !== null;
  }
}

export const magister = new MagisterService();
