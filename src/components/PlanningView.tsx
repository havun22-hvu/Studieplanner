import type { Subject, PlannedSession } from '../types';
import { formatDate, formatMinutes } from '../utils/planning';

interface Props {
  subjects: Subject[];
  sessions: PlannedSession[];
  onToggleSession: (sessionId: string) => void;
}

export function PlanningView({ subjects, sessions, onToggleSession }: Props) {
  // Group sessions by date
  const sessionsByDate: Record<string, PlannedSession[]> = {};
  sessions.forEach(session => {
    if (!sessionsByDate[session.date]) {
      sessionsByDate[session.date] = [];
    }
    sessionsByDate[session.date].push(session);
  });

  const sortedDates = Object.keys(sessionsByDate).sort();
  const today = new Date().toISOString().split('T')[0];

  const getSubject = (id: string) => subjects.find(s => s.id === id);
  const getTask = (subjectId: string, taskId: string) => {
    const subject = getSubject(subjectId);
    return subject?.tasks.find(t => t.id === taskId);
  };

  if (sessions.length === 0) {
    return (
      <div className="planning-empty">
        <p>📚 Voeg eerst vakken en taken toe om een planning te maken.</p>
      </div>
    );
  }

  return (
    <div className="planning-view">
      <h2>Jouw StudiePlan</h2>

      {sortedDates.map(date => {
        const daySessions = sessionsByDate[date];
        const totalMinutes = daySessions.reduce((sum, s) => sum + s.minutesPlanned, 0);
        const isToday = date === today;
        const isPast = date < today;

        return (
          <div key={date} className={`day-card ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}>
            <div className="day-header">
              <h3>{isToday ? '📍 Vandaag' : formatDate(date)}</h3>
              <span className="day-total">{formatMinutes(totalMinutes)}</span>
            </div>

            <ul className="day-sessions">
              {daySessions.map(session => {
                const subject = getSubject(session.subjectId);
                const task = getTask(session.subjectId, session.taskId);

                return (
                  <li key={session.id} className={session.completed ? 'completed' : ''}>
                    <label>
                      <input
                        type="checkbox"
                        checked={session.completed}
                        onChange={() => onToggleSession(session.id)}
                      />
                      <span
                        className="session-color"
                        style={{ backgroundColor: subject?.color }}
                      />
                      <div className="session-info">
                        <strong>{subject?.name}</strong>
                        <small>{task?.description}</small>
                      </div>
                      <span className="session-time">{formatMinutes(session.minutesPlanned)}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
