import { useState } from 'react';
import { Subject, StudyTask, TIME_ESTIMATES, SUBJECT_COLORS } from '../types';
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
  const [taskType, setTaskType] = useState<'pages' | 'exercises' | 'assignment'>('pages');
  const [taskAmount, setTaskAmount] = useState('');
  const [taskDesc, setTaskDesc] = useState('');

  const addTask = () => {
    if (!taskAmount && taskType !== 'assignment') return;

    const amount = taskType === 'assignment' ? 1 : parseInt(taskAmount) || 0;
    const newTask: StudyTask = {
      id: generateId(),
      subjectId: editSubject?.id || '',
      type: taskType,
      description: taskDesc || getDefaultDesc(taskType, amount),
      amount,
      estimatedMinutes: amount * TIME_ESTIMATES[taskType],
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setTaskAmount('');
    setTaskDesc('');
  };

  const getDefaultDesc = (type: string, amount: number): string => {
    switch (type) {
      case 'pages': return `${amount} pagina's lezen`;
      case 'exercises': return `${amount} opgaven maken`;
      case 'assignment': return 'Opdracht maken';
      default: return '';
    }
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

        <div className="task-input">
          <select value={taskType} onChange={e => setTaskType(e.target.value as any)}>
            <option value="pages">Pagina's</option>
            <option value="exercises">Opgaven</option>
            <option value="assignment">Opdracht</option>
          </select>

          {taskType !== 'assignment' && (
            <input
              type="number"
              value={taskAmount}
              onChange={e => setTaskAmount(e.target.value)}
              placeholder="Aantal"
              min="1"
            />
          )}

          <input
            type="text"
            value={taskDesc}
            onChange={e => setTaskDesc(e.target.value)}
            placeholder="Omschrijving (optioneel)"
          />

          <button type="button" onClick={addTask} className="btn-add">+</button>
        </div>

        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id}>
              <span>{task.description}</span>
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
