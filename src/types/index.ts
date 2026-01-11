// User types
export interface User {
  id: number;
  name: string;
  role: 'student' | 'mentor';
  studentCode?: string;
  isPremium: boolean;
  premiumUntil?: string;
}

// Subject & Task types
export interface Subject {
  id: string;
  name: string;
  color: string;
  examDate: string;
  tasks: StudyTask[];
}

export interface StudyTask {
  id: string;
  subjectId: string;
  description: string;
  estimatedMinutes: number;
  plannedAmount: number;
  unit: TaskUnit;
  completed: boolean;
}

export type TaskUnit = 'blz' | 'opdrachten' | 'min video';

// Session types
export interface PlannedSession {
  id: string;
  date: string;
  hour: number | null;
  subjectId: string;
  taskId: string;
  minutesPlanned: number;
  minutesActual?: number;
  amountPlanned: number;
  amountActual?: number;
  unit: TaskUnit;
  completed: boolean;
  knowledgeRating?: number;
  startedAt?: string;
  stoppedAt?: string;
}

// Timer types
export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  sessionId: string | null;
  startTime: number | null;
  pausedAt: number | null;
  totalPausedMs: number;
}

// Settings types
export interface NotificationSettings {
  alarmSound: string | null;
  vibrate: boolean;
  reminderEnabled: boolean;
  reminderMinutes: number;
  dailySummary: boolean;
  dailySummaryTime: string;
}

// Mentor types
export interface MentorStudent {
  id: number;
  name: string;
  studentCode: string;
  isStudying: boolean;
  lastActivity?: string;
}

export interface InviteCode {
  code: string;
  expiresAt: string;
}

// Stats types (Premium)
export interface StudyStats {
  totalHours: {
    week: number;
    month: number;
  };
  bySubject: SubjectStats[];
  completionRate: number;
  trend: DayStats[];
}

export interface SubjectStats {
  subjectId: string;
  name: string;
  color: string;
  hours: number;
}

export interface DayStats {
  date: string;
  hours: number;
}

export interface LearningSpeed {
  subjectId: string;
  subjectName: string;
  pagesPerHour?: number;
  exercisesPerHour?: number;
}

// App State
export interface AppState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  subjects: Subject[];
  sessions: PlannedSession[];
  timer: TimerState;
  activeSession: PlannedSession | null;
  settings: {
    dailyStudyMinutes: number;
    weekendsOff: boolean;
    notifications: NotificationSettings;
  };
  selectedWeek: string;
  isPremium: boolean;
}

// Storage keys
export const STORAGE_KEYS = {
  USER: '@studieplanner/user',
  TOKEN: '@studieplanner/token',
  SUBJECTS: '@studieplanner/subjects',
  SESSIONS: '@studieplanner/sessions',
  SETTINGS: '@studieplanner/settings',
  TIMER_STATE: '@studieplanner/timer',
} as const;

// Subject colors
export const SUBJECT_COLORS = [
  '#4f46e5', // Indigo
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#64748b', // Slate
] as const;
