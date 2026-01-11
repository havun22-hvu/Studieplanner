import { config, endpoints } from '@/constants/config';
import type { User, Subject, StudyTask, PlannedSession, InviteCode, StudyStats, LearningSpeed } from '@/types';

class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    super(data?.message || 'API Error');
    this.status = status;
    this.data = data;
  }
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${config.apiUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(response.status, data);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  async login(name: string, pincode: string): Promise<{ user: User; token: string }> {
    return this.request(endpoints.login, {
      method: 'POST',
      body: JSON.stringify({ name, pincode }),
    });
  }

  async register(name: string, pincode: string, role: 'student' | 'mentor'): Promise<{ user: User; token: string }> {
    return this.request(endpoints.register, {
      method: 'POST',
      body: JSON.stringify({ name, pincode, role }),
    });
  }

  async logout(): Promise<void> {
    await this.request(endpoints.logout, { method: 'POST' });
    this.token = null;
  }

  async getUser(): Promise<User> {
    return this.request(endpoints.user);
  }

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return this.request(endpoints.subjects);
  }

  async createSubject(data: Omit<Subject, 'id' | 'tasks'>): Promise<Subject> {
    return this.request(endpoints.subjects, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubject(id: string, data: Partial<Subject>): Promise<Subject> {
    return this.request(endpoints.subject(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSubject(id: string): Promise<void> {
    return this.request(endpoints.subject(id), { method: 'DELETE' });
  }

  // Tasks
  async createTask(subjectId: string, data: Omit<StudyTask, 'id' | 'subjectId' | 'completed'>): Promise<StudyTask> {
    return this.request(endpoints.tasks(subjectId), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: Partial<StudyTask>): Promise<StudyTask> {
    return this.request(endpoints.task(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request(endpoints.task(id), { method: 'DELETE' });
  }

  // Sessions
  async getSessions(from?: string, to?: string): Promise<PlannedSession[]> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const query = params.toString();
    return this.request(`${endpoints.sessions}${query ? `?${query}` : ''}`);
  }

  async createSession(data: Omit<PlannedSession, 'id' | 'completed'>): Promise<PlannedSession> {
    return this.request(endpoints.sessions, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSession(id: string, data: Partial<PlannedSession>): Promise<PlannedSession> {
    return this.request(endpoints.session(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSession(id: string): Promise<void> {
    return this.request(endpoints.session(id), { method: 'DELETE' });
  }

  // Timer sessions
  async startSession(sessionId: string): Promise<{ active_session: { id: string; started_at: string } }> {
    return this.request(endpoints.sessionStart, {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  async stopSession(data: {
    session_id: string;
    minutes_actual: number;
    amount_actual: number;
    knowledge_rating?: number;
    completed: boolean;
  }): Promise<{ session: PlannedSession; new_session?: PlannedSession }> {
    return this.request(endpoints.sessionStop, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getActiveSessions(): Promise<{
    active: Array<{
      user_id: number;
      user_name: string;
      session_id: string;
      subject_name: string;
      started_at: string;
      minutes_elapsed: number;
    }>;
  }> {
    return this.request(endpoints.sessionActive);
  }

  // Mentor
  async getMentorStudents(): Promise<Array<{
    id: number;
    name: string;
    student_code: string;
    is_studying: boolean;
    last_activity?: string;
  }>> {
    return this.request(endpoints.mentorStudents);
  }

  async getMentorStudent(id: number): Promise<{
    user: User;
    subjects: Subject[];
    sessions: PlannedSession[];
    stats: { total_hours_week: number; sessions_completed: number };
  }> {
    return this.request(endpoints.mentorStudent(id));
  }

  async acceptStudent(inviteCode: string): Promise<{ student: { id: number; name: string }; message: string }> {
    return this.request(endpoints.mentorAccept, {
      method: 'POST',
      body: JSON.stringify({ invite_code: inviteCode }),
    });
  }

  async removeMentorStudent(id: number): Promise<void> {
    return this.request(endpoints.mentorStudent(id), { method: 'DELETE' });
  }

  // Student
  async generateInviteCode(): Promise<InviteCode> {
    return this.request(endpoints.studentInvite, { method: 'POST' });
  }

  async getStudentMentors(): Promise<Array<{ id: number; name: string }>> {
    return this.request(endpoints.studentMentors);
  }

  async removeStudentMentor(id: number): Promise<void> {
    return this.request(endpoints.studentMentor(id), { method: 'DELETE' });
  }

  // Sync
  async syncSubjects(subjects: Subject[]): Promise<void> {
    return this.request(endpoints.syncSubjects, {
      method: 'POST',
      body: JSON.stringify({ subjects }),
    });
  }

  async syncSessions(sessions: PlannedSession[]): Promise<void> {
    return this.request(endpoints.syncSessions, {
      method: 'POST',
      body: JSON.stringify({ sessions }),
    });
  }

  // Premium
  async getPremiumStatus(): Promise<{ is_premium: boolean; expires_at: string | null }> {
    return this.request(endpoints.premiumStatus);
  }

  async getStats(): Promise<StudyStats> {
    return this.request(endpoints.premiumStats);
  }

  async getLearningSpeed(): Promise<{ speeds: LearningSpeed[] }> {
    return this.request(endpoints.premiumLearningSpeed);
  }
}

export const api = new ApiService();
export { ApiError };
