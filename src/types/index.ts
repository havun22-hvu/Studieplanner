// User types
export interface User {
  id: number;
  name: string;
  email: string;
  is_verified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Study task types
export interface StudyTask {
  id: string;
  subjectId: string;
  description: string;
  plannedAmount: number; // hoeveel blz/opdrachten/etc gepland
  unit: string; // 'blz', 'opdrachten', 'paragrafen', etc.
  estimatedMinutes: number;
  completed: boolean;
}

// Subject/Exam types
export interface Subject {
  id: string;
  name: string;
  color: string;
  examDate: string; // ISO date string
  tasks: StudyTask[];
}

// Alarm settings for a session
export interface SessionAlarm {
  enabled: boolean;
  minutesBefore: number; // minutes before session to alert
  sound: boolean;
}

// Planned study session
export interface PlannedSession {
  id: string;
  date: string; // ISO date string
  taskId: string;
  subjectId: string;
  minutesPlanned: number;
  minutesActual?: number; // actual time spent (filled after completion)
  amountPlanned: number; // hoeveel blz/opdrachten gepland voor deze sessie
  amountActual?: number; // hoeveel werkelijk gedaan
  unit: string; // eenheid (blz, opdrachten, etc.)
  completed: boolean;
  hour?: number; // Start hour (8-20), undefined = not yet scheduled to specific time
  alarm?: SessionAlarm;
}

// Result of a completed session
export interface SessionResult {
  sessionId: string;
  minutesSpent: number;
  amountCompleted: number; // hoeveel blz/opdrachten gedaan
  notes?: string;
}

// App state
export interface AppState {
  subjects: Subject[];
  sessions: PlannedSession[];
  settings: Settings;
}

// User settings
export interface Settings {
  dailyStudyMinutes: number; // how many minutes per day available
  breakDays: number[]; // 0 = Sunday, 6 = Saturday
  studentName: string;
  mentors: Mentor[];
  shareCode?: string; // unique code for sharing agenda with mentors
}

// Mentor/Parent info
export interface Mentor {
  id: string;
  name: string;
  email: string;
  notifyOnStart: boolean;
  notifyOnComplete: boolean;
}

// Common units for tasks (alleen meetbare eenheden)
export const TASK_UNITS = ['blz', 'opdrachten'] as const;

// Preset colors for subjects (12 colors)
export const SUBJECT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#ec4899', // pink
] as const;
