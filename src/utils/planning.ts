import type { Subject, PlannedSession, Settings, StudyTask } from '../types';

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get days until exam
export function getDaysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Get available study days between now and exam
export function getAvailableDays(examDate: string, breakDays: number[]): string[] {
  const days: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(examDate);
  target.setHours(0, 0, 0, 0);

  const current = new Date(today);
  while (current < target) {
    if (!breakDays.includes(current.getDay())) {
      days.push(current.toISOString().split('T')[0]);
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}

// Calculate total study time needed for a subject
export function getTotalMinutes(subject: Subject): number {
  return subject.tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
}

// Calculate remaining study time (not completed)
export function getRemainingMinutes(subject: Subject): number {
  return subject.tasks
    .filter(task => !task.completed)
    .reduce((sum, task) => sum + task.estimatedMinutes, 0);
}

// Auto-plan sessions across available days
export function autoPlanningSessions(
  subjects: Subject[],
  settings: Settings
): PlannedSession[] {
  const sessions: PlannedSession[] = [];

  // Get all incomplete tasks with their subjects
  const allTasks: { task: StudyTask; subject: Subject }[] = [];
  subjects.forEach(subject => {
    subject.tasks
      .filter(t => !t.completed)
      .forEach(task => allTasks.push({ task, subject }));
  });

  if (allTasks.length === 0) return sessions;

  // Sort by exam date (most urgent first)
  allTasks.sort((a, b) =>
    new Date(a.subject.examDate).getTime() - new Date(b.subject.examDate).getTime()
  );

  // Get all available days across all subjects
  const allDays = new Set<string>();
  subjects.forEach(subject => {
    getAvailableDays(subject.examDate, settings.breakDays).forEach(d => allDays.add(d));
  });
  const sortedDays = Array.from(allDays).sort();

  // Track minutes used per day
  const dayMinutes: Record<string, number> = {};
  sortedDays.forEach(d => dayMinutes[d] = 0);

  // Assign tasks to days
  for (const { task, subject } of allTasks) {
    const examDays = getAvailableDays(subject.examDate, settings.breakDays);
    let remainingMinutes = task.estimatedMinutes;

    for (const day of examDays) {
      if (remainingMinutes <= 0) break;

      const available = settings.dailyStudyMinutes - (dayMinutes[day] || 0);
      if (available <= 0) continue;

      const toAllocate = Math.min(available, remainingMinutes);

      sessions.push({
        id: generateId(),
        date: day,
        taskId: task.id,
        subjectId: subject.id,
        minutesPlanned: toAllocate,
        amountPlanned: task.plannedAmount,
        unit: task.unit,
        completed: false,
      });

      dayMinutes[day] = (dayMinutes[day] || 0) + toAllocate;
      remainingMinutes -= toAllocate;
    }
  }

  return sessions;
}

// Format minutes to readable string
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}u ${mins}m` : `${hours} uur`;
}

// Format date to Dutch readable
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const days = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
  const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

// Reschedule missed sessions to today or next available day
export function rescheduleMissedSessions(
  sessions: PlannedSession[],
  subjects: Subject[],
  settings: Settings
): { updated: PlannedSession[]; rescheduledCount: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  // Find missed sessions (past date, not completed, was scheduled on agenda)
  const missedSessions = sessions.filter(s => {
    if (s.completed) return false;
    if (s.hour === undefined) return false; // On the shelf, not scheduled
    const sessionDate = new Date(s.date);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate < today;
  });

  if (missedSessions.length === 0) {
    return { updated: sessions, rescheduledCount: 0 };
  }

  // Get minutes already planned per day (only for today and future)
  const dayMinutes: Record<string, number> = {};
  sessions.forEach(s => {
    if (s.date >= todayStr && !missedSessions.includes(s)) {
      dayMinutes[s.date] = (dayMinutes[s.date] || 0) + s.minutesPlanned;
    }
  });

  // Get available days for next 30 days
  const availableDays: string[] = [];
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 30);

  const current = new Date(today);
  while (current <= endDate) {
    if (!settings.breakDays.includes(current.getDay())) {
      availableDays.push(current.toISOString().split('T')[0]);
    }
    current.setDate(current.getDate() + 1);
  }

  // Reschedule each missed session
  const updatedSessions = sessions.map(session => {
    if (!missedSessions.includes(session)) return session;

    // Find subject to check exam date
    const subject = subjects.find(s => s.id === session.subjectId);
    const examDate = subject?.examDate || endDate.toISOString().split('T')[0];

    // Find first available day with enough space
    for (const day of availableDays) {
      if (day > examDate) break; // Don't schedule after exam

      const used = dayMinutes[day] || 0;
      const available = settings.dailyStudyMinutes - used;

      if (available >= session.minutesPlanned) {
        dayMinutes[day] = used + session.minutesPlanned;
        return {
          ...session,
          date: day,
          hour: undefined, // Put on shelf, user can reschedule to specific time
        };
      }
    }

    // If no day with full space, put on today's shelf anyway
    return {
      ...session,
      date: todayStr,
      hour: undefined,
    };
  });

  return { updated: updatedSessions, rescheduledCount: missedSessions.length };
}

// Calculate if student is behind schedule and suggest catch-up sessions
export interface CatchUpSuggestion {
  subjectId: string;
  subjectName: string;
  examDate: string;
  minutesBehind: number;
  suggestedDays: { date: string; minutes: number }[];
}

export function calculateCatchUpNeeded(
  subjects: Subject[],
  sessions: PlannedSession[],
  settings: Settings
): CatchUpSuggestion[] {
  const suggestions: CatchUpSuggestion[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  for (const subject of subjects) {
    // Calculate total minutes needed for incomplete tasks
    const incompleteTasks = subject.tasks.filter(t => !t.completed);
    const totalMinutesNeeded = incompleteTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

    if (totalMinutesNeeded === 0) continue;

    // Calculate minutes already planned (future sessions for this subject)
    const plannedMinutes = sessions
      .filter(s => s.subjectId === subject.id && !s.completed && s.date >= todayStr)
      .reduce((sum, s) => sum + s.minutesPlanned, 0);

    // Get available study days until exam (excluding break days)
    const availableDays = getAvailableDays(subject.examDate, settings.breakDays);
    const availableCapacity = availableDays.length * settings.dailyStudyMinutes;

    // Calculate how much is behind
    const minutesBehind = totalMinutesNeeded - plannedMinutes;

    // If behind and not enough regular capacity, suggest catch-up
    if (minutesBehind > 0 && minutesBehind > availableCapacity * 0.3) {
      // Find break days that could be used for catch-up
      const breakDaySuggestions: { date: string; minutes: number }[] = [];
      const examDate = new Date(subject.examDate);

      const current = new Date(today);
      while (current < examDate && breakDaySuggestions.length < 3) {
        if (settings.breakDays.includes(current.getDay())) {
          breakDaySuggestions.push({
            date: current.toISOString().split('T')[0],
            minutes: Math.min(60, Math.ceil(minutesBehind / 3)), // Suggest 1 hour max per day
          });
        }
        current.setDate(current.getDate() + 1);
      }

      if (breakDaySuggestions.length > 0) {
        suggestions.push({
          subjectId: subject.id,
          subjectName: subject.name,
          examDate: subject.examDate,
          minutesBehind,
          suggestedDays: breakDaySuggestions,
        });
      }
    }
  }

  return suggestions;
}
