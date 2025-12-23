import type { StudyTask } from '../types';

interface Props {
  task: StudyTask;
  dailyMinutes: number;
  onAutoSplit: () => void;
  onOpenSettings: () => void;
  onEditTask: () => void;
}

export function TaskSplitDialog({ task, dailyMinutes, onAutoSplit, onOpenSettings, onEditTask }: Props) {
  const parts = Math.ceil(task.estimatedMinutes / dailyMinutes);
  const lastPart = task.estimatedMinutes % dailyMinutes || dailyMinutes;
  const firstParts = dailyMinutes;

  // Build split description like "90 + 30 min" or "90 + 90 + 30 min"
  const splitDesc = parts === 2
    ? `${firstParts} + ${lastPart} min`
    : `${Array(parts - 1).fill(firstParts).join(' + ')} + ${lastPart} min`;

  return (
    <div className="modal-overlay">
      <div className="modal-content split-dialog">
        <h2>Taak past niet in 1 studiedag</h2>

        <div className="split-info">
          <p>
            Je taak <strong>"{task.description}"</strong> duurt <strong>{task.estimatedMinutes} minuten</strong>.
          </p>
          <p>
            Je dagelijkse studietijd is <strong>{dailyMinutes} minuten</strong>.
          </p>
        </div>

        <p className="split-question">Wat wil je doen?</p>

        <div className="split-options">
          <button onClick={onAutoSplit} className="split-option">
            <span className="option-icon">✂️</span>
            <span className="option-title">Automatisch verdelen</span>
            <span className="option-desc">Splitst in {splitDesc}</span>
          </button>

          <button onClick={onOpenSettings} className="split-option">
            <span className="option-icon">⚙️</span>
            <span className="option-title">Studietijd verhogen</span>
            <span className="option-desc">Pas je dagelijkse tijd aan</span>
          </button>

          <button onClick={onEditTask} className="split-option">
            <span className="option-icon">✏️</span>
            <span className="option-title">Zelf aanpassen</span>
            <span className="option-desc">Terug naar bewerken</span>
          </button>
        </div>
      </div>
    </div>
  );
}
