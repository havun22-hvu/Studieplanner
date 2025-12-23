import { useState } from 'react';
import type { Subject, PlannedSession, StudyTask } from '../types';
import { TASK_UNITS } from '../types';
import { getDaysUntil, getTotalMinutes, getRemainingMinutes, formatMinutes, formatDate, generateId } from '../utils/planning';

interface Props {
  subject: Subject;
  sessions: PlannedSession[];
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
  onToggleTask: (subjectId: string, taskId: string) => void;
  onAddTask: (subjectId: string, task: StudyTask) => void;
}

export function SubjectCard({ subject, sessions, onEdit, onDelete, onToggleTask, onAddTask }: Props) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAmount, setTaskAmount] = useState('');
  const [taskUnit, setTaskUnit] = useState<string>(TASK_UNITS[0]);
  const [taskMinutes, setTaskMinutes] = useState('');

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

  const handleAddTask = () => {
    if (!taskDesc || !taskAmount || !taskMinutes) return;

    const newTask: StudyTask = {
      id: generateId(),
      subjectId: subject.id,
      description: taskDesc,
      plannedAmount: parseInt(taskAmount),
      unit: taskUnit,
      estimatedMinutes: parseInt(taskMinutes),
      completed: false,
    };

    onAddTask(subject.id, newTask);

    // Reset form
    setTaskDesc('');
    setTaskAmount('');
    setTaskMinutes('');
    // Keep form open for adding more tasks
  };

  const handleCloseForm = () => {
    setShowAddTask(false);
    setTaskDesc('');
    setTaskAmount('');
    setTaskMinutes('');
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
        <button
          className="btn-add-inline"
          onClick={() => setShowAddTask(!showAddTask)}
          title="Taak toevoegen"
        >
          {showAddTask ? '−' : '+'}
        </button>
      </div>

      {showAddTask && (
        <div className="quick-task-form">
          <input
            type="text"
            value={taskDesc}
            onChange={e => setTaskDesc(e.target.value)}
            placeholder="Taak (bijv. H3, Par. 2.1)"
            className="quick-task-desc"
            autoFocus
          />
          <div className="quick-task-row">
            <input
              type="number"
              value={taskAmount}
              onChange={e => setTaskAmount(e.target.value)}
              placeholder="Aantal"
              min="1"
              className="quick-task-amount"
            />
            <select
              value={taskUnit}
              onChange={e => setTaskUnit(e.target.value)}
              className="quick-task-unit"
            >
              {TASK_UNITS.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <input
              type="number"
              value={taskMinutes}
              onChange={e => setTaskMinutes(e.target.value)}
              placeholder="Min"
              min="1"
              className="quick-task-time"
            />
            <button
              type="button"
              onClick={handleAddTask}
              className="btn-quick-add"
              disabled={!taskDesc || !taskAmount || !taskMinutes}
            >
              +
            </button>
          </div>
          <button onClick={handleCloseForm} className="btn-close-form">Klaar</button>
        </div>
      )}

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
                    <small className="task-amount-info">{task.plannedAmount} {task.unit}</small>
                    <small className="task-time">{formatMinutes(task.estimatedMinutes)}</small>
                    {sessionStats.total > 0 && (
                      <small className="task-sessions">
                        {sessionStats.completed}/{sessionStats.total} sessies
                      </small>
                    )}
                  </div>
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      {subject.tasks.length === 0 && (
        <p className="no-tasks-hint">Nog geen taken. Klik + om taken toe te voegen.</p>
      )}
    </div>
  );
}
