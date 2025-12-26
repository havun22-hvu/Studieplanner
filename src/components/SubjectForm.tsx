import { useState } from 'react';
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

  const addTask = () => {
    if (!taskDesc) return;
    if (!taskAmount || parseInt(taskAmount) <= 0) return;
    // Bij video is amount = tijd, anders apart tijd veld vereist
    if (!isVideoUnit && (!taskMinutes || parseInt(taskMinutes) <= 0)) return;

    const newTask: StudyTask = {
      id: generateId(),
      subjectId: editSubject?.id || '',
      description: taskDesc,
      plannedAmount: parseInt(taskAmount),
      unit: taskUnit,
      estimatedMinutes: isVideoUnit ? parseInt(taskAmount) : parseInt(taskMinutes),
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setTaskDesc('');
    setTaskAmount('');
    setTaskMinutes('');
  };


  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !examDate) return;

    const subject: Subject = {
      id: editSubject?.id || generateId(),
      name,
      color,
      examDate,
      tasks: tasks.map(t => ({ ...t, subjectId: editSubject?.id || generateId() })),
    };

    onSave(subject);
  };

  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  return (
    <form onSubmit={handleSubmit} className="subject-form">
      <h2>{editSubject ? 'Vak bewerken' : 'Nieuw vak toevoegen'}</h2>

      <div className="form-group">
        <label>Vaknaam</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Bijv. Wiskunde"
          required
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
        <h3>Studietaken</h3>

        <div className="task-input-form">
          <input
            type="text"
            value={taskDesc}
            onChange={e => setTaskDesc(e.target.value)}
            placeholder="Taak (bijv. H3, Par. 2.1)"
            className="form-task-input"
          />
          <div className="form-input-row">
            <input
              type="number"
              value={taskAmount}
              onChange={e => setTaskAmount(e.target.value)}
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
                  placeholder="Tijd"
                  min="1"
                  className="form-time-input"
                />
                <span className="form-min-label">min.</span>
              </>
            )}
            <button type="button" onClick={addTask} className="btn-add-task">Toevoegen</button>
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
        <button type="button" onClick={onCancel} className="btn-secondary">Annuleren</button>
        <button type="submit" className="btn-primary" disabled={!name || !examDate || tasks.length === 0}>
          Opslaan
        </button>
      </div>
    </form>
  );
}
