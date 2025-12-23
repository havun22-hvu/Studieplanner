import { useState } from 'react';
import type { CatchUpSuggestion } from '../utils/planning';
import { formatDate, formatMinutes } from '../utils/planning';

interface Props {
  suggestions: CatchUpSuggestion[];
  onAccept: (subjectId: string, sessions: { date: string; minutes: number }[]) => void;
  onDismiss: () => void;
}

export function CatchUpModal({ suggestions, onAccept, onDismiss }: Props) {
  const [selectedSessions, setSelectedSessions] = useState<Record<string, boolean>>({});

  const toggleSession = (key: string) => {
    setSelectedSessions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAccept = (suggestion: CatchUpSuggestion) => {
    const acceptedSessions = suggestion.suggestedDays.filter(
      (_, i) => selectedSessions[`${suggestion.subjectId}-${i}`]
    );
    if (acceptedSessions.length > 0) {
      onAccept(suggestion.subjectId, acceptedSessions);
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content catchup-modal">
        <h2>📚 Inhaal Modus</h2>
        <p className="catchup-intro">
          Je loopt achter op schema voor deze vakken.
          Wil je extra studeren op je vrije dagen?
        </p>

        {suggestions.map(suggestion => (
          <div key={suggestion.subjectId} className="catchup-subject">
            <div className="catchup-header">
              <strong>{suggestion.subjectName}</strong>
              <span className="catchup-behind">
                {formatMinutes(suggestion.minutesBehind)} achter
              </span>
            </div>
            <p className="catchup-exam">Toets: {formatDate(suggestion.examDate)}</p>

            <div className="catchup-days">
              {suggestion.suggestedDays.map((day, i) => {
                const key = `${suggestion.subjectId}-${i}`;
                return (
                  <label key={key} className="catchup-day">
                    <input
                      type="checkbox"
                      checked={selectedSessions[key] || false}
                      onChange={() => toggleSession(key)}
                    />
                    <span>{formatDate(day.date)}</span>
                    <span className="catchup-minutes">{day.minutes} min</span>
                  </label>
                );
              })}
            </div>

            <button
              className="btn-primary btn-small"
              onClick={() => handleAccept(suggestion)}
              disabled={!suggestion.suggestedDays.some((_, i) =>
                selectedSessions[`${suggestion.subjectId}-${i}`]
              )}
            >
              Inplannen
            </button>
          </div>
        ))}

        <button className="btn-secondary" onClick={onDismiss}>
          Later
        </button>
      </div>
    </div>
  );
}
