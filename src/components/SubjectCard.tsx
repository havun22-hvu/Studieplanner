import { Subject } from '../types';
import { getDaysUntil, getTotalMinutes, getRemainingMinutes, formatMinutes, formatDate } from '../utils/planning';

interface Props {
  subject: Subject;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
  onToggleTask: (subjectId: string, taskId: string) => void;
}

export function SubjectCard({ subject, onEdit, onDelete, onToggleTask }: Props) {
  const daysLeft = getDaysUntil(subject.examDate);
  const totalMin = getTotalMinutes(subject);
  const remainingMin = getRemainingMinutes(subject);
  const progress = totalMin > 0 ? ((totalMin - remainingMin) / totalMin) * 100 : 0;

  const completedTasks = subject.tasks.filter(t => t.completed).length;

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

      <ul className="task-checklist">
        {subject.tasks.map(task => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <label>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask(subject.id, task.id)}
              />
              <span>{task.description}</span>
              <small>{formatMinutes(task.estimatedMinutes)}</small>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
