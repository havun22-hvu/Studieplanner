import { Subject, PlannedSession, Settings, StudyTask } from '../types';

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
