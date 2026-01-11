import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/types';
import type { User, Subject, PlannedSession, TimerState, NotificationSettings } from '@/types';

// Generic storage functions
async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
  }
}

// User storage
export async function getUser(): Promise<User | null> {
  return getItem<User>(STORAGE_KEYS.USER);
}

export async function setUser(user: User): Promise<void> {
  return setItem(STORAGE_KEYS.USER, user);
}

export async function removeUser(): Promise<void> {
  return removeItem(STORAGE_KEYS.USER);
}

// Token storage
export async function getToken(): Promise<string | null> {
  return getItem<string>(STORAGE_KEYS.TOKEN);
}

export async function setToken(token: string): Promise<void> {
  return setItem(STORAGE_KEYS.TOKEN, token);
}

export async function removeToken(): Promise<void> {
  return removeItem(STORAGE_KEYS.TOKEN);
}

// Subjects storage
export async function getSubjects(): Promise<Subject[]> {
  const subjects = await getItem<Subject[]>(STORAGE_KEYS.SUBJECTS);
  return subjects || [];
}

export async function setSubjects(subjects: Subject[]): Promise<void> {
  return setItem(STORAGE_KEYS.SUBJECTS, subjects);
}

// Sessions storage
export async function getSessions(): Promise<PlannedSession[]> {
  const sessions = await getItem<PlannedSession[]>(STORAGE_KEYS.SESSIONS);
  return sessions || [];
}

export async function setSessions(sessions: PlannedSession[]): Promise<void> {
  return setItem(STORAGE_KEYS.SESSIONS, sessions);
}

// Timer state storage
export async function getTimerState(): Promise<TimerState | null> {
  return getItem<TimerState>(STORAGE_KEYS.TIMER_STATE);
}

export async function setTimerState(state: TimerState): Promise<void> {
  return setItem(STORAGE_KEYS.TIMER_STATE, state);
}

export async function removeTimerState(): Promise<void> {
  return removeItem(STORAGE_KEYS.TIMER_STATE);
}

// Settings storage
interface Settings {
  dailyStudyMinutes: number;
  weekendsOff: boolean;
  notifications: NotificationSettings;
}

const defaultSettings: Settings = {
  dailyStudyMinutes: 60,
  weekendsOff: true,
  notifications: {
    alarmSound: 'default',
    vibrate: true,
    reminderEnabled: false,
    reminderMinutes: 15,
    dailySummary: false,
    dailySummaryTime: '20:00',
  },
};

export async function getSettings(): Promise<Settings> {
  const settings = await getItem<Settings>(STORAGE_KEYS.SETTINGS);
  return settings || defaultSettings;
}

export async function setSettings(settings: Settings): Promise<void> {
  return setItem(STORAGE_KEYS.SETTINGS, settings);
}

// Clear all storage
export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

// Storage service object
export const storage = {
  getUser,
  setUser,
  removeUser,
  getToken,
  setToken,
  removeToken,
  getSubjects,
  setSubjects,
  getSessions,
  setSessions,
  getTimerState,
  setTimerState,
  removeTimerState,
  getSettings,
  setSettings,
  clearAll,
};
