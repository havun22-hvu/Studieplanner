import type { Subject, PlannedSession } from '../types';
import { getDaysUntil, getTotalMinutes, getRemainingMinutes, formatMinutes, formatDate } from '../utils/planning';

interface Props {
  subject: Subject;
  sessions: PlannedSession[];
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
  onToggleTask: (subjectId: string, taskId: string) => void;
}

export function SubjectCard({ subject, sessions, onEdit, onDelete, onToggleTask }: Props) {
  const daysLeft = getDaysUntil(subject.examDate);
  const totalMin = getTotalMinutes(subject);
  const remainingMin = getRemainingMinutes(subject);
  const progress = totalMin > 0 ? ((totalMin - remainingMin) / totalMin) * 100 : 0;

  const completedTasks = subject.tasks.filter(t => t.completed).length;

  // Get session stats per task
  const getTaskSessions = (taskId: string) => {
    const taskSessions = sessions.filter(s => s.taskId === taskId);
    const completed = taskSessions.filter(s => s.completed).length;
    return { total: taskSessions.length, completed };
  };

  return (
    <div className="subject-card" style={{ borderLeftColor: subject.color }}>
      <div className="card-header">
        <h3 style={{ color: subject.color }}>{subject.name}</h3>
        <div className="card-actions">
          <button onClick={() => onEdit(subject)} className="btn-icon">✏️</button>
          <button onClick={() => onDelete(subject.id)} className="btn-icon">🗑️</button>
        </div>
      </div>

      <div className="card-meta">
        <span className={`days-left ${daysLeft <= 3 ? 'urgent' : ''}`}>
          {daysLeft <= 0 ? 'Vandaag!' : `${daysLeft} dagen`}
        </span>
        <span className="exam-date">{formatDate(subject.examDate)}</span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: subject.color }} />
      </div>
      <p className="progress-text">{completedTasks}/{subject.tasks.length} taken • {formatMinutes(remainingMin)} over</p>

      <div className="task-list-header">
        <span>Studietaken</span>
        <span className="task-list-hint">Vink af als je klaar bent (ook zonder timer)</span>
      </div>

      <ul className="task-checklist">
        {subject.tasks.map(task => {
          const sessionStats = getTaskSessions(task.id);
          return (
            <li key={task.id} className={task.completed ? 'completed' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(subject.id, task.id)}
                />
                <div className="task-info">
                  <span className="task-description">{task.description}</span>
                  <div className="task-meta">
                    <small className="task-time">{formatMinutes(task.estimatedMinutes)}</small>
                    {sessionStats.total > 0 && (
                      <small className="task-sessions">
                        {sessionStats.completed}/{sessionStats.total} sessies gedaan
                      </small>
                    )}
                  </div>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
