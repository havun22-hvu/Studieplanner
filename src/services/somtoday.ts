// SOMtoday API integration
// Uses unofficial API via backend proxy to avoid CORS issues

const API_BASE = import.meta.env.VITE_API_URL || 'https://studieplanner-api.havun.nl/api';

export interface SOMtodaySchool {
  uuid: string;
  naam: string;
  plaats: string;
}

export interface SOMtodayTest {
  id: string;
  vak: string;
  omschrijving: string;
  datum: string;
  weging?: number;
}

export interface SOMtodayHomework {
  id: string;
  vak: string;
  omschrijving: string;
  inleverDatum?: string;
  afgerond: boolean;
}

export interface SOMtodayGrade {
  vak: string;
  cijfer: number;
  weging: number;
  omschrijving: string;
  datum: string;
}

export interface SOMtodayScheduleItem {
  start: string;
  eind: string;
  vak: string;
  lokaal?: string;
  docent?: string;
}

export interface SOMtodayStatus {
  connected: boolean;
  studentName?: string;
  school?: string;
  lastSync?: string;
}

class SOMtodayService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('somtoday_token');
  }

  async searchSchools(query: string): Promise<SOMtodaySchool[]> {
    const response = await fetch(`${API_BASE}/somtoday/schools?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search schools');
    return response.json();
  }

  async login(schoolUuid: string, username: string, password: string): Promise<{ success: boolean; error?: string }> {
    const response = await fetch(`${API_BASE}/somtoday/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ school_uuid: schoolUuid, username, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (data.success && data.token) {
      this.token = data.token;
      localStorage.setItem('somtoday_token', data.token);
      return { success: true };
    }

    return { success: false, error: data.error || 'Login failed' };
  }

  async getStatus(): Promise<SOMtodayStatus> {
    if (!this.token) {
      return { connected: false };
    }

    try {
      const response = await fetch(`${API_BASE}/somtoday/status`, {
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

  async getTests(): Promise<SOMtodayTest[]> {
    if (!this.token) return [];

    const response = await fetch(`${API_BASE}/somtoday/tests`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!response.ok) return [];
    return response.json();
  }

  async getHomework(): Promise<SOMtodayHomework[]> {
    if (!this.token) return [];

    const response = await fetch(`${API_BASE}/somtoday/homework`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!response.ok) return [];
    return response.json();
  }

  async getGrades(): Promise<SOMtodayGrade[]> {
    if (!this.token) return [];

    const response = await fetch(`${API_BASE}/somtoday/grades`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!response.ok) return [];
    return response.json();
  }

  async getSchedule(date: string): Promise<SOMtodayScheduleItem[]> {
    if (!this.token) return [];

    const response = await fetch(`${API_BASE}/somtoday/schedule?date=${date}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!response.ok) return [];
    return response.json();
  }

  disconnect(): void {
    this.token = null;
    localStorage.removeItem('somtoday_token');
  }

  isConnected(): boolean {
    return this.token !== null;
  }
}

export const somtoday = new SOMtodayService();
