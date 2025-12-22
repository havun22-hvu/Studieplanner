// Study task types
export interface StudyTask {
  id: string;
  subjectId: string;
  type: 'pages' | 'exercises' | 'assignment';
  description: string;
  amount: number; // number of pages, exercises, or 1 for assignment
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

// Planned study session
export interface PlannedSession {
  id: string;
  date: string; // ISO date string
  taskId: string;
  subjectId: string;
  minutesPlanned: number;
  completed: boolean;
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
}

// Time estimation defaults (minutes per unit)
export const TIME_ESTIMATES = {
  pages: 5, // 5 minutes per page
  exercises: 8, // 8 minutes per exercise
  assignment: 60, // 60 minutes default for assignment
} as const;

// Preset colors for subjects
export const SUBJECT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
] as const;
