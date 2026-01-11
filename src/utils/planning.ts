import { addDays, differenceInDays, format, parseISO, isWeekend } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { Subject, StudyTask, PlannedSession, TaskUnit } from '@/types';

interface PlanningOptions {
  dailyMinutes: number;
  skipWeekends: boolean;
}

/**
 * Calculate how many study days are available between today and exam date
 */
export function getAvailableDays(
  examDate: string,
  skipWeekends: boolean
): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exam = parseISO(examDate);
  const days: Date[] = [];

  let current = addDays(today, 1); // Start from tomorrow
  while (current < exam) {
    if (!skipWeekends || !isWeekend(current)) {
      days.push(new Date(current));
    }
    current = addDays(current, 1);
  }

  return days;
}

/**
 * Calculate estimated time per page/exercise based on subject history
 */
export function estimateTimePerUnit(
  sessions: PlannedSession[],
  unit: TaskUnit
): number {
  const relevantSessions = sessions.filter(
    s => s.unit === unit && s.minutesActual && s.amountActual
  );

  if (relevantSessions.length === 0) {
    // Default estimates
    switch (unit) {
      case 'blz':
        return 3; // 3 minutes per page
      case 'opdrachten':
        return 5; // 5 minutes per exercise
      case 'min video':
        return 1.5; // 1.5x video duration
      default:
        return 3;
    }
  }

  const totalMinutes = relevantSessions.reduce((sum, s) => sum + (s.minutesActual || 0), 0);
  const totalAmount = relevantSessions.reduce((sum, s) => sum + (s.amountActual || 0), 0);

  return totalMinutes / totalAmount;
}

/**
 * Generate study sessions for a task, distributed over available days
 */
export function generateSessionsForTask(
  task: StudyTask,
  subjectId: string,
  availableDays: Date[],
  dailyMinutes: number
): PlannedSession[] {
  if (availableDays.length === 0) return [];

  const totalMinutes = task.estimatedMinutes;
  const sessionsNeeded = Math.ceil(totalMinutes / dailyMinutes);
  const daysPerSession = Math.max(1, Math.floor(availableDays.length / sessionsNeeded));

  const sessions: PlannedSession[] = [];
  let remainingMinutes = totalMinutes;
  let remainingAmount = task.plannedAmount;

  for (let i = 0; i < sessionsNeeded && remainingMinutes > 0; i++) {
    const dayIndex = Math.min(i * daysPerSession, availableDays.length - 1);
    const date = availableDays[dayIndex];

    const sessionMinutes = Math.min(dailyMinutes, remainingMinutes);
    const sessionAmount = Math.round(
      (sessionMinutes / totalMinutes) * task.plannedAmount
    );

    sessions.push({
      id: uuidv4(),
      date: format(date, 'yyyy-MM-dd'),
      hour: null, // On shelf initially
      subjectId,
      taskId: task.id,
      minutesPlanned: sessionMinutes,
      amountPlanned: sessionAmount,
      unit: task.unit,
      completed: false,
    });

    remainingMinutes -= sessionMinutes;
    remainingAmount -= sessionAmount;
  }

  return sessions;
}

/**
 * Auto-plan all incomplete tasks for a subject
 */
export function autoPlanSubject(
  subject: Subject,
  existingSessions: PlannedSession[],
  options: PlanningOptions
): PlannedSession[] {
  const availableDays = getAvailableDays(subject.examDate, options.skipWeekends);

  if (availableDays.length === 0) {
    return [];
  }

  const incompleteTasks = subject.tasks.filter(t => !t.completed);
  const newSessions: PlannedSession[] = [];

  // Get existing session task IDs to avoid duplicates
  const plannedTaskIds = new Set(
    existingSessions
      .filter(s => s.subjectId === subject.id)
      .map(s => s.taskId)
  );

  for (const task of incompleteTasks) {
    if (plannedTaskIds.has(task.id)) continue;

    const taskSessions = generateSessionsForTask(
      task,
      subject.id,
      availableDays,
      options.dailyMinutes
    );
    newSessions.push(...taskSessions);
  }

  return newSessions;
}

/**
 * Calculate completion statistics for a subject
 */
export function calculateSubjectStats(
  subject: Subject,
  sessions: PlannedSession[]
): {
  completedTasks: number;
  totalTasks: number;
  completedSessions: number;
  totalSessions: number;
  totalMinutesStudied: number;
  progress: number;
} {
  const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
  const completedSessions = subjectSessions.filter(s => s.completed);
  const completedTasks = subject.tasks.filter(t => t.completed).length;

  const totalMinutesStudied = completedSessions.reduce(
    (sum, s) => sum + (s.minutesActual || 0),
    0
  );

  const totalTasks = subject.tasks.length;
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

  return {
    completedTasks,
    totalTasks,
    completedSessions: completedSessions.length,
    totalSessions: subjectSessions.length,
    totalMinutesStudied,
    progress,
  };
}

/**
 * Get sessions that need to be caught up (past date, not completed)
 */
export function getOverdueSessions(sessions: PlannedSession[]): PlannedSession[] {
  const today = format(new Date(), 'yyyy-MM-dd');

  return sessions.filter(
    s => s.date < today && !s.completed && s.hour !== null
  );
}

/**
 * Get sessions for today
 */
export function getTodaySessions(sessions: PlannedSession[]): PlannedSession[] {
  const today = format(new Date(), 'yyyy-MM-dd');

  return sessions.filter(s => s.date === today);
}
