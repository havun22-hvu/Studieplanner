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
    return this.request<{ token: string; user: { id: number; name: string; student_code: string; role: 'student' | 'mentor' } }>('/register', {
      method: 'POST',
      body: JSON.stringify({ name, pincode }),
    });
  }

  async registerMentor(name: string, pincode: string) {
    return this.request<{ token: string; user: { id: number; name: string; student_code: string; role: 'student' | 'mentor' } }>('/register/mentor', {
      method: 'POST',
      body: JSON.stringify({ name, pincode }),
    });
  }

  async login(name: string, pincode: string) {
    return this.request<{ token: string; user: { id: number; name: string; student_code: string; role: 'student' | 'mentor' } }>('/login', {
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
    return this.request<{ id: number; name: string; student_code: string; role: 'student' | 'mentor' }>('/user');
  }

  // Mentor endpoints
  async getMentorStudents() {
    return this.request<Array<{ id: number; name: string; student_code: string }>>('/mentor/students');
  }

  async generateMentorInvite() {
    return this.request<{ invite_code: string; message: string }>('/mentor/invite', {
      method: 'POST',
    });
  }

  async getStudentData(studentId: number) {
    return this.request<{
      student: { id: number; name: string };
      subjects: Array<{
        id: string;
        name: string;
        color: string;
        examDate: string;
        tasks: Array<{
          id: string;
          description: string;
          estimatedMinutes: number;
          plannedAmount: number;
          unit: string;
          completed: boolean;
        }>;
      }>;
      sessions: Array<{
        id: string;
        date: string;
        taskId: string;
        subjectId: string;
        hour: number | null;
        minutesPlanned: number;
        minutesActual: number | null;
        amountPlanned: number;
        amountActual: number | null;
        unit: string;
        completed: boolean;
      }>;
    }>(`/mentor/student/${studentId}`);
  }

  async removeStudent(studentId: number) {
    return this.request<{ message: string }>(`/mentor/student/${studentId}`, {
      method: 'DELETE',
    });
  }

  // Student mentor endpoints
  async generateStudentInvite() {
    return this.request<{ invite_code: string; message: string }>('/student/invite', {
      method: 'POST',
    });
  }

  async getStudentMentors() {
    return this.request<Array<{ id: number; name: string }>>('/student/mentors');
  }

  // Mentor accepts student invite
  async acceptStudentInvite(inviteCode: string) {
    return this.request<{ message: string; student: { id: number; name: string } }>('/mentor/accept-student', {
      method: 'POST',
      body: JSON.stringify({ invite_code: inviteCode }),
    });
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

  // Sync subjects to backend
  async syncSubjects(subjects: Array<{
    id: string;
    name: string;
    color: string;
    examDate: string;
    tasks: Array<{
      id: string;
      description: string;
      estimatedMinutes: number;
      plannedAmount: number;
      unit: string;
      completed: boolean;
    }>;
  }>) {
    return this.request<{ message: string }>('/student/subjects/sync', {
      method: 'POST',
      body: JSON.stringify({ subjects }),
    });
  }

  // Sync sessions to backend
  async syncSessions(sessions: Array<{
    id: string;
    date: string;
    taskId: string;
    subjectId: string;
    hour?: number;
    minutesPlanned: number;
    minutesActual?: number;
    amountPlanned: number;
    amountActual?: number;
    unit: string;
    completed: boolean;
    knowledgeRating?: number;
  }>) {
    return this.request<{ message: string }>('/student/sessions/sync', {
      method: 'POST',
      body: JSON.stringify({ sessions }),
    });
  }

  // Restore data from backend
  async getSubjects() {
    return this.request<Array<{
      id: string;
      name: string;
      color: string;
      examDate: string;
      tasks: Array<{
        id: string;
        description: string;
        estimatedMinutes: number;
        plannedAmount: number;
        unit: string;
        completed: boolean;
      }>;
    }>>('/student/subjects');
  }

  async getSessions() {
    return this.request<Array<{
      id: string;
      date: string;
      taskId: string;
      subjectId: string;
      hour: number | null;
      minutesPlanned: number;
      minutesActual: number | null;
      amountPlanned: number;
      amountActual: number | null;
      unit: string;
      completed: boolean;
      knowledgeRating: number | null;
    }>>('/student/sessions');
  }
}

export const api = new ApiService();
