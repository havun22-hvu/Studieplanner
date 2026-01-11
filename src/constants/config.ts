// Environment configuration
// In production, these would come from environment variables

const DEV_API_URL = 'http://localhost:8000';
const PROD_API_URL = 'https://api.studieplanner.havun.nl';

const DEV_WS_URL = 'ws://localhost:8080';
const PROD_WS_URL = 'wss://ws.studieplanner.havun.nl';

// Use __DEV__ flag provided by React Native
const isDev = __DEV__;

export const config = {
  apiUrl: isDev ? DEV_API_URL : PROD_API_URL,
  wsUrl: isDev ? DEV_WS_URL : PROD_WS_URL,
  isDev,
};

// API endpoints
export const endpoints = {
  // Auth
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  user: '/api/auth/user',

  // Subjects
  subjects: '/api/subjects',
  subject: (id: string) => `/api/subjects/${id}`,

  // Tasks
  tasks: (subjectId: string) => `/api/subjects/${subjectId}/tasks`,
  task: (id: string) => `/api/tasks/${id}`,

  // Sessions
  sessions: '/api/sessions',
  session: (id: string) => `/api/sessions/${id}`,
  sessionStart: '/api/session/start',
  sessionStop: '/api/session/stop',
  sessionActive: '/api/session/active',

  // Mentor
  mentorStudents: '/api/mentor/students',
  mentorStudent: (id: number) => `/api/mentor/student/${id}`,
  mentorAccept: '/api/mentor/accept-student',

  // Student
  studentInvite: '/api/student/invite',
  studentMentors: '/api/student/mentors',
  studentMentor: (id: number) => `/api/student/mentor/${id}`,

  // Sync
  syncSubjects: '/api/student/subjects/sync',
  syncSessions: '/api/student/sessions/sync',

  // Premium
  premiumStatus: '/api/premium/status',
  premiumStats: '/api/premium/stats',
  premiumLearningSpeed: '/api/premium/learning-speed',
};
