import { useState, useEffect, useCallback } from 'react';
import type { Subject, StudyTask } from '../types';
import { SUBJECT_COLORS, TASK_UNITS } from '../types';
import { generateId } from '../utils/planning';

interface Props {
  onSave: (subject: Subject) => void;
  onCancel: () => void;
  editSubject?: Subject;
}

export function SubjectForm({ onSave, onCancel, editSubject }: Props) {
  const [name, setName] = useState(editSubject?.name || '');
  const [examDate, setExamDate] = useState(editSubject?.examDate || '');
  const [color, setColor] = useState(editSubject?.color || SUBJECT_COLORS[0]);
  const [tasks, setTasks] = useState<StudyTask[]>(editSubject?.tasks || []);

  // Task input state
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAmount, setTaskAmount] = useState('');
  const [taskUnit, setTaskUnit] = useState<string>(TASK_UNITS[0]);
  const [taskMinutes, setTaskMinutes] = useState('');

  const isVideoUnit = taskUnit === 'min video';

  // Check if form has valid data to save
  const canSave = name.trim() && examDate;
  const hasChanges = name.trim() || examDate || tasks.length > 0;

  const addTask = useCallback(() => {
    if (!taskDesc.trim()) return;
    if (!taskAmount || parseInt(taskAmount) <= 0) return;
    // Bij video is amount = tijd, anders apart tijd veld vereist
    if (!isVideoUnit && (!taskMinutes || parseInt(taskMinutes) <= 0)) return;

    const newTask: StudyTask = {
      id: generateId(),
      subjectId: editSubject?.id || '',
      description: taskDesc.trim(),
      plannedAmount: parseInt(taskAmount),
      unit: taskUnit,
      estimatedMinutes: isVideoUnit ? parseInt(taskAmount) : parseInt(taskMinutes),
      completed: false,
    };

    setTasks(prev => [...prev, newTask]);
    setTaskDesc('');
    setTaskAmount('');
    setTaskMinutes('');
  }, [taskDesc, taskAmount, taskUnit, taskMinutes, isVideoUnit, editSubject?.id]);

  // Handle Enter key in task inputs
  const handleTaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Build subject object
  const buildSubject = useCallback((): Subject => {
    const subjectId = editSubject?.id || generateId();
    return {
      id: subjectId,
      name: name.trim(),
      color,
      examDate,
      tasks: tasks.map(t => ({ ...t, subjectId })),
    };
  }, [editSubject?.id, name, color, examDate, tasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    onSave(buildSubject());
  };

  // Auto-save on close if there's valid data
  const handleClose = () => {
    if (canSave && hasChanges) {
      onSave(buildSubject());
    } else {
      onCancel();
    }
  };

  // Auto-save when component unmounts with valid data
  useEffect(() => {
    return () => {
      // This runs on unmount - but we can't call onSave here reliably
      // So we rely on handleClose being called
    };
  }, []);

  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  return (
    <form onSubmit={handleSubmit} className="subject-form">
      <h2>
        {editSubject ? 'Vak bewerken' : 'Nieuw vak'}
        <button type="button" className="form-close-btn" onClick={handleClose}>&times;</button>
      </h2>

      <div className="form-body">
      <div className="form-group">
        <label>Vaknaam</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Bijv. Wiskunde"
          required
          autoFocus
        />
      </div>

      <div className="form-group">
        <label>Toetsdatum</label>
        <input
          type="date"
          value={examDate}
          onChange={e => setExamDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div className="form-group">
        <label>Kleur</label>
        <div className="color-picker">
          {SUBJECT_COLORS.map(c => (
            <button
              key={c}
              type="button"
              className={`color-btn ${color === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      <div className="tasks-section">
        <h3>Studietaken {tasks.length > 0 && `(${tasks.length})`}</h3>

        <div className="task-input-form">
          <input
            type="text"
            value={taskDesc}
            onChange={e => setTaskDesc(e.target.value)}
            onKeyDown={handleTaskKeyDown}
            placeholder="Taak (bijv. H3, Par. 2.1)"
            className="form-task-input"
          />
          <div className="form-input-row">
            <input
              type="number"
              value={taskAmount}
              onChange={e => setTaskAmount(e.target.value)}
              onKeyDown={handleTaskKeyDown}
              placeholder="Aantal"
              min="1"
              className="form-amount-input"
            />
            <select
              value={taskUnit}
              onChange={e => setTaskUnit(e.target.value)}
              className="form-unit-select"
            >
              {TASK_UNITS.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
          <div className="form-input-row">
            {!isVideoUnit && (
              <>
                <input
                  type="number"
                  value={taskMinutes}
                  onChange={e => setTaskMinutes(e.target.value)}
                  onKeyDown={handleTaskKeyDown}
                  placeholder="Tijd"
                  min="1"
                  className="form-time-input"
                />
                <span className="form-min-label">min.</span>
              </>
            )}
            <button type="button" onClick={addTask} className="btn-add-task">+ Taak</button>
          </div>
        </div>

        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id}>
              <span>{task.description}</span>
              <span className="task-amount">{task.plannedAmount} {task.unit}</span>
              <span className="task-time">{task.estimatedMinutes} min</span>
              <button type="button" onClick={() => removeTask(task.id)} className="btn-remove">×</button>
            </li>
          ))}
        </ul>

        {tasks.length > 0 && (
          <p className="total-time">Totale studietijd: <strong>{Math.floor(totalMinutes / 60)}u {totalMinutes % 60}m</strong></p>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary btn-full" disabled={!canSave}>
          {canSave ? 'Opslaan' : 'Vul naam en datum in'}
        </button>
      </div>
      </div>
    </form>
  );
}
