# Data Types

> TypeScript interfaces en database schema

## TypeScript Interfaces

### User
```typescript
interface User {
  id: number;
  name: string;
  role: 'student' | 'mentor';
  studentCode?: string;      // Only for students
  isPremium: boolean;
  premiumUntil?: string;     // ISO date string
}
```

### Subject (Vak)
```typescript
interface Subject {
  id: string;                // UUID for local, number from API
  name: string;
  color: string;             // Hex color (#4f46e5)
  examDate: string;          // YYYY-MM-DD
  tasks: StudyTask[];
}
```

### StudyTask (Taak)
```typescript
interface StudyTask {
  id: string;
  subjectId: string;
  description: string;
  estimatedMinutes: number;
  plannedAmount: number;
  unit: TaskUnit;
  completed: boolean;
}

type TaskUnit = 'blz' | 'opdrachten' | 'min video';
```

### PlannedSession (Studieblok)
```typescript
interface PlannedSession {
  id: string;
  date: string;              // YYYY-MM-DD
  hour: number | null;       // 0-23, null = op plank
  subjectId: string;
  taskId: string;
  minutesPlanned: number;
  minutesActual?: number;
  amountPlanned: number;
  amountActual?: number;
  unit: TaskUnit;
  completed: boolean;
  knowledgeRating?: number;  // 1-10
  startedAt?: string;        // ISO timestamp
  stoppedAt?: string;
}
```

### Timer State
```typescript
interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  sessionId: string | null;
  startTime: number | null;  // Unix timestamp ms
  pausedAt: number | null;   // Unix timestamp ms
  totalPausedMs: number;     // Accumulated pause time
}
```

### Notification Settings
```typescript
interface NotificationSettings {
  alarmSound: string | null; // System sound name or null (off)
  vibrate: boolean;
  reminderEnabled: boolean;  // Premium
  reminderMinutes: number;   // Minutes before session
  dailySummary: boolean;     // Premium
  dailySummaryTime: string;  // HH:MM
}
```

### Mentor Student
```typescript
interface MentorStudent {
  id: number;
  name: string;
  studentCode: string;
  isStudying: boolean;
  lastActivity?: string;
}
```

### Invite Code
```typescript
interface InviteCode {
  code: string;              // 6 characters
  expiresAt: string;         // ISO timestamp
}
```

### Stats (Premium)
```typescript
interface StudyStats {
  totalHours: {
    week: number;
    month: number;
  };
  bySubject: SubjectStats[];
  completionRate: number;    // 0-1
  trend: DayStats[];
}

interface SubjectStats {
  subjectId: string;
  name: string;
  color: string;
  hours: number;
}

interface DayStats {
  date: string;
  hours: number;
}

interface LearningSpeed {
  subjectId: string;
  subjectName: string;
  pagesPerHour?: number;
  exercisesPerHour?: number;
}
```

---

## App State

### Global State
```typescript
interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Data
  subjects: Subject[];
  sessions: PlannedSession[];

  // Timer
  timer: TimerState;
  activeSession: PlannedSession | null;

  // Settings
  settings: {
    dailyStudyMinutes: number;
    weekendsOff: boolean;
    notifications: NotificationSettings;
  };

  // UI
  selectedWeek: string;      // YYYY-MM-DD (Monday)

  // Premium
  isPremium: boolean;
}
```

### AsyncStorage Keys
```typescript
const STORAGE_KEYS = {
  USER: '@studieplanner/user',
  TOKEN: '@studieplanner/token',
  SUBJECTS: '@studieplanner/subjects',
  SESSIONS: '@studieplanner/sessions',
  SETTINGS: '@studieplanner/settings',
  TIMER_STATE: '@studieplanner/timer',
} as const;
```

---

## Database Schema (Laravel)

### users
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  pincode VARCHAR(4) NOT NULL,
  role ENUM('student', 'mentor') DEFAULT 'student',
  student_code VARCHAR(12) UNIQUE,  -- Only for students
  is_premium BOOLEAN DEFAULT FALSE,
  premium_until DATETIME NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### mentor_students (pivot)
```sql
CREATE TABLE mentor_students (
  mentor_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  student_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP,
  PRIMARY KEY (mentor_id, student_id)
);
```

### invite_codes
```sql
CREATE TABLE invite_codes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP
);
```

### subjects
```sql
CREATE TABLE subjects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL,  -- #RRGGBB
  exam_date DATE NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### tasks
```sql
CREATE TABLE tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  estimated_minutes INT NOT NULL,
  planned_amount INT NOT NULL,
  unit ENUM('blz', 'opdrachten', 'min video') NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### planned_sessions
```sql
CREATE TABLE planned_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
  task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hour TINYINT NULL,  -- 0-23, NULL = on shelf
  minutes_planned INT NOT NULL,
  minutes_actual INT NULL,
  amount_planned INT NOT NULL,
  amount_actual INT NULL,
  completed BOOLEAN DEFAULT FALSE,
  knowledge_rating TINYINT NULL,  -- 1-10
  started_at DATETIME NULL,
  stopped_at DATETIME NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,

  INDEX idx_user_date (user_id, date)
);
```

---

## Kleuren Preset

Beschikbare kleuren voor vakken:

```typescript
const SUBJECT_COLORS = [
  '#4f46e5', // Indigo (primary)
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#64748b', // Slate
] as const;
```
