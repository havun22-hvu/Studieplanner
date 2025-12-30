import { useState } from 'react';
import type { PlannedSession, Subject, StudyTask } from '../types';

interface Props {
  session: PlannedSession;
  subject: Subject | undefined;
  task: StudyTask | undefined;
  initialMinutes?: number;
  onSave: (result: SessionResultData) => void;
  onCancel: () => void;
}

export type IncompleteAction = 'reschedule' | 'extend';

export interface SessionResultData {
  sessionId: string;
  minutesSpent: number;
  amountCompleted: number;
  needsMoreTime: boolean;
  remainingAmount: number; // hoeveel nog te doen
  knowledgeRating?: number; // 1-10 geschatte kennisopname
  incompleteAction?: IncompleteAction; // what to do with remaining
  extraMinutes?: number; // if extending, how many extra minutes
}

export function SessionResultModal({ session, subject, task, initialMinutes, onSave, onCancel }: Props) {
  const [minutesSpent, setMinutesSpent] = useState(initialMinutes || session.minutesPlanned);
  const [amountCompleted, setAmountCompleted] = useState(session.amountPlanned);
  const [knowledgeRating, setKnowledgeRating] = useState<number>(7);
  const [incompleteAction, setIncompleteAction] = useState<IncompleteAction>('reschedule');
  const [extraMinutes, setExtraMinutes] = useState(30);

  const remainingAmount = Math.max(0, session.amountPlanned - amountCompleted);
  const completedAll = amountCompleted >= session.amountPlanned;
  const completedMore = amountCompleted > session.amountPlanned;

  // Calculate time difference percentage
  const timeDiffPercent = session.minutesPlanned > 0
    ? Math.round(((minutesSpent - session.minutesPlanned) / session.minutesPlanned) * 100)
    : 0;
  const isFaster = timeDiffPercent < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      sessionId: session.id,
      minutesSpent,
      amountCompleted,
      needsMoreTime: !completedAll,
      remainingAmount,
      knowledgeRating,
      incompleteAction: !completedAll ? incompleteAction : undefined,
      extraMinutes: !completedAll && incompleteAction === 'extend' ? extraMinutes : undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content result-modal" onClick={e => e.stopPropagation()}>
        <h2>Studieresultaat</h2>

        <div className="result-info">
          <div className="result-subject" style={{ borderLeftColor: subject?.color }}>
            <strong>{subject?.name}</strong>
            <span>{task?.description}</span>
          </div>
          <div className="result-planned">
            <div>Gepland: <strong>{session.amountPlanned} {session.unit}</strong></div>
            <div>Tijd: <strong>{session.minutesPlanned} min</strong></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Hoeveel minuten heb je gestudeerd?</label>
            <input
              type="number"
              value={minutesSpent}
              onChange={e => setMinutesSpent(parseInt(e.target.value) || 0)}
              min="0"
              max="480"
            />
          </div>

          <div className="form-group">
            <label>Hoeveel {session.unit} heb je gedaan?</label>
            <input
              type="number"
              value={amountCompleted}
              onChange={e => setAmountCompleted(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>

          {/* Vergelijking tonen */}
          <div className={`result-comparison ${completedAll ? 'success' : 'warning'}`}>
            <div className="comparison-header">
              {completedMore && '🎉 Meer gedaan dan gepland!'}
              {completedAll && !completedMore && '✅ Taak voltooid!'}
              {!completedAll && '⚠️ Nog niet alles af'}
            </div>
            <div className="comparison-details">
              <span>Gepland: {session.amountPlanned} {session.unit}</span>
              <span>Gedaan: {amountCompleted} {session.unit}</span>
              {!completedAll && <span>Nog te doen: {remainingAmount} {session.unit}</span>}
            </div>
          </div>

          {!completedAll && (
            <div className="incomplete-options">
              <p className="incomplete-label">
                Nog <strong>{remainingAmount} {session.unit}</strong> te doen. Wat wil je doen?
              </p>
              <div className="option-buttons">
                <button
                  type="button"
                  className={`option-btn ${incompleteAction === 'reschedule' ? 'active' : ''}`}
                  onClick={() => setIncompleteAction('reschedule')}
                >
                  <span className="option-icon">📋</span>
                  <span className="option-text">
                    <strong>Nieuw blok</strong>
                    <small>Plan restant later in</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={`option-btn ${incompleteAction === 'extend' ? 'active' : ''}`}
                  onClick={() => setIncompleteAction('extend')}
                >
                  <span className="option-icon">⏰</span>
                  <span className="option-text">
                    <strong>Verlengen</strong>
                    <small>Nu meer tijd toevoegen</small>
                  </span>
                </button>
              </div>
              {incompleteAction === 'extend' && (
                <div className="extend-options">
                  <label>Hoeveel minuten extra?</label>
                  <div className="extend-buttons">
                    {[15, 30, 45, 60].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        className={`extend-btn ${extraMinutes === mins ? 'active' : ''}`}
                        onClick={() => setExtraMinutes(mins)}
                      >
                        +{mins}m
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {completedMore && (
            <div className="success-box">
              <span className="success-icon">⚡</span>
              <div className="success-content">
                <strong>Goed bezig!</strong>
                <p>Je hebt {amountCompleted - session.amountPlanned} {session.unit} extra gedaan!</p>
              </div>
            </div>
          )}

          {/* Time comparison */}
          {timeDiffPercent !== 0 && (
            <div className={`time-comparison ${isFaster ? 'faster' : 'slower'}`}>
              <span className="time-icon">{isFaster ? '⚡' : '🐢'}</span>
              <span>
                {Math.abs(timeDiffPercent)}% {isFaster ? 'sneller' : 'langzamer'} dan gepland
              </span>
            </div>
          )}

          {/* Knowledge rating */}
          <div className="form-group knowledge-rating-group">
            <label>Hoe goed heb je de stof begrepen? (1-10)</label>
            <div className="rating-slider">
              <input
                type="range"
                min="1"
                max="10"
                value={knowledgeRating}
                onChange={e => setKnowledgeRating(parseInt(e.target.value))}
                className="knowledge-slider"
              />
              <span className={`rating-value rating-${knowledgeRating >= 7 ? 'good' : knowledgeRating >= 5 ? 'ok' : 'low'}`}>
                {knowledgeRating}
              </span>
            </div>
            <div className="rating-labels">
              <span>Slecht</span>
              <span>Uitstekend</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Annuleren
            </button>
            <button type="submit" className="btn-primary">
              Opslaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
