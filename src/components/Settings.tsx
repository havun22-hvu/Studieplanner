import { useState } from 'react';
import type { Settings as SettingsType, Subject, PlannedSession } from '../types';

interface Props {
  settings: SettingsType;
  subjects: Subject[];
  sessions: PlannedSession[];
  onSave: (settings: SettingsType) => void;
  onClose: () => void;
}

function generateShareCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

const DAYS = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

export function Settings({ settings, subjects, sessions, onSave, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  // Bereken studiesnelheid per vak
  const getStudyStats = () => {
    const stats: Record<string, { blzTotal: number; blzMinutes: number; opdrTotal: number; opdrMinutes: number; name: string; color: string }> = {};

    sessions.filter(s => s.completed && s.amountActual && s.minutesActual).forEach(session => {
      const subject = subjects.find(sub => sub.id === session.subjectId);
      if (!subject) return;

      if (!stats[session.subjectId]) {
        stats[session.subjectId] = { blzTotal: 0, blzMinutes: 0, opdrTotal: 0, opdrMinutes: 0, name: subject.name, color: subject.color };
      }

      if (session.unit === 'blz') {
        stats[session.subjectId].blzTotal += session.amountActual!;
        stats[session.subjectId].blzMinutes += session.minutesActual!;
      } else if (session.unit === 'opdrachten') {
        stats[session.subjectId].opdrTotal += session.amountActual!;
        stats[session.subjectId].opdrMinutes += session.minutesActual!;
      }
    });

    return stats;
  };

  const studyStats = getStudyStats();

  const shareLink = settings.shareCode
    ? `${window.location.origin}?mentor=${settings.shareCode}`
    : null;

  const createShareLink = () => {
    const code = generateShareCode();
    onSave({ ...settings, shareCode: code });
  };

  const copyShareLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const removeShareLink = () => {
    onSave({ ...settings, shareCode: undefined });
  };

  const toggleBreakDay = (day: number) => {
    const breakDays = settings.breakDays.includes(day)
      ? settings.breakDays.filter(d => d !== day)
      : [...settings.breakDays, day];
    onSave({ ...settings, breakDays });
  };

  return (
    <div className="settings-modal">
      <div className="settings-content">
        <h2>Instellingen</h2>

        <div className="settings-section">
          <h3>Leerling</h3>
          <div className="form-group">
            <label>Naam</label>
            <input
              type="text"
              value={settings.studentName || ''}
              onChange={e => onSave({ ...settings, studentName: e.target.value })}
              placeholder="Jouw naam"
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Studietijd</h3>
          <div className="form-group">
            <label>Minuten per dag</label>
            <input
              type="number"
              value={settings.dailyStudyMinutes}
              onChange={e => onSave({ ...settings, dailyStudyMinutes: parseInt(e.target.value) || 60 })}
              min="15"
              max="480"
              step="15"
            />
            <small>{Math.floor(settings.dailyStudyMinutes / 60)}u {settings.dailyStudyMinutes % 60}m per dag</small>
          </div>

          <div className="form-group">
            <label>Vrije dagen</label>
            <div className="day-picker">
              {DAYS.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  className={`day-btn ${settings.breakDays.includes(index) ? 'active' : ''}`}
                  onClick={() => toggleBreakDay(index)}
                >
                  {day}
                </button>
              ))}
            </div>
            <div className="day-legend">
              <span className="legend-item"><span className="legend-box study"></span> studiedag</span>
              <span className="legend-item"><span className="legend-box free"></span> vrij</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Mentor meekijklink</h3>
          <p className="section-info">
            Deel deze link met mentoren/ouders om live mee te kijken.
          </p>

          {shareLink ? (
            <div className="share-link-box">
              <input type="text" value={shareLink} readOnly className="share-link-input" />
              <button onClick={copyShareLink} className="btn-copy">
                {copied ? 'Gekopieerd!' : 'Kopieer'}
              </button>
              <button onClick={removeShareLink} className="btn-remove-link">Verwijder</button>
            </div>
          ) : (
            <button onClick={createShareLink} className="btn-primary">
              Genereer meekijklink
            </button>
          )}
        </div>

        <div className="settings-section">
          <h3>Mijn studiesnelheid</h3>
          <p className="section-info">
            Gemiddelde snelheid per vak (op basis van voltooide sessies).
          </p>

          {Object.keys(studyStats).length === 0 ? (
            <p className="no-stats">Nog geen voltooide sessies om te analyseren.</p>
          ) : (
            <div className="stats-list">
              {Object.entries(studyStats).map(([subjectId, stat]) => {
                const blzPerHour = stat.blzMinutes > 0 ? Math.round((stat.blzTotal / stat.blzMinutes) * 60) : 0;
                const opdrPerHour = stat.opdrMinutes > 0 ? Math.round((stat.opdrTotal / stat.opdrMinutes) * 60 * 10) / 10 : 0;

                return (
                  <div key={subjectId} className="stat-item" style={{ borderLeftColor: stat.color }}>
                    <strong style={{ color: stat.color }}>{stat.name}</strong>
                    <div className="stat-speeds">
                      {stat.blzTotal > 0 && (
                        <span className="speed-badge">{blzPerHour} blz/uur</span>
                      )}
                      {stat.opdrTotal > 0 && (
                        <span className="speed-badge">{opdrPerHour} opdr/uur</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button onClick={onClose} className="btn-primary">Sluiten</button>
      </div>
    </div>
  );
}
