import { useState, useEffect } from 'react';
import type { Settings as SettingsType, Subject, PlannedSession } from '../types';
import { usePWA } from '../contexts/PWAContext';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface Props {
  settings: SettingsType;
  subjects: Subject[];
  sessions: PlannedSession[];
  onSave: (settings: SettingsType) => void;
  onClose: () => void;
  onRestore: (subjects: Subject[], sessions: PlannedSession[]) => void;
}

export function Settings({ settings, subjects, sessions, onSave, onClose, onRestore }: Props) {
  const { canInstall, isInstalled, install } = usePWA();
  const { permission, requestPermission, isSupported } = useNotifications(settings);
  const { logout } = useAuth();

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [mentors, setMentors] = useState<Array<{ id: number; name: string }>>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [alarmMinutes, setAlarmMinutes] = useState(settings.alarmMinutesBefore ?? 10);
  const [alarmSaved, setAlarmSaved] = useState(false);

  useEffect(() => {
    loadMentors();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      // First sync subjects to create ID mappings in backend cache
      await api.syncSubjects(subjects);
      // Then sync sessions using those mappings
      await api.syncSessions(sessions);
      setSyncMessage('Data gesynchroniseerd!');
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (err) {
      setSyncMessage('Sync mislukt, probeer opnieuw');
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestore = async () => {
    if (!confirm('Weet je zeker dat je je planning wilt herstellen vanaf de server? Dit overschrijft je huidige lokale data.')) {
      return;
    }
    setIsRestoring(true);
    setSyncMessage(null);
    try {
      const [subjectsData, sessionsData] = await Promise.all([
        api.getSubjects(),
        api.getSessions()
      ]);

      // Convert backend format to frontend format
      const restoredSubjects = subjectsData.map(s => ({
        id: s.id,
        name: s.name,
        color: s.color,
        examDate: s.examDate,
        tasks: s.tasks.map(t => ({
          id: t.id,
          subjectId: s.id,
          description: t.description,
          estimatedMinutes: t.estimatedMinutes,
          plannedAmount: t.plannedAmount,
          unit: t.unit as 'blz' | 'opdrachten' | 'min video',
          completed: t.completed,
        }))
      }));

      const restoredSessions = sessionsData.map(s => ({
        id: s.id,
        date: s.date,
        taskId: s.taskId,
        subjectId: s.subjectId,
        hour: s.hour ?? undefined,
        minutesPlanned: s.minutesPlanned,
        minutesActual: s.minutesActual ?? undefined,
        amountPlanned: s.amountPlanned,
        amountActual: s.amountActual ?? undefined,
        unit: s.unit,
        completed: s.completed,
        knowledgeRating: s.knowledgeRating ?? undefined,
      }));

      onRestore(restoredSubjects, restoredSessions);
      setSyncMessage(`Hersteld: ${restoredSubjects.length} vakken, ${restoredSessions.length} sessies`);
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (err) {
      setSyncMessage('Herstel mislukt, probeer opnieuw');
      console.error('Restore failed:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  const loadMentors = async () => {
    try {
      const data = await api.getStudentMentors();
      setMentors(data);
    } catch (err) {
      console.error('Failed to load mentors:', err);
    }
  };

  const generateInvite = async () => {
    try {
      const result = await api.generateStudentInvite();
      setInviteCode(result.invite_code);
    } catch (err) {
      console.error('Failed to generate invite:', err);
    }
  };

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    }
  };

  return (
    <div className="settings-modal">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Instellingen</h2>
          <button onClick={onClose} className="close-btn" aria-label="Sluiten">&times;</button>
        </div>

        {/* Timer & Herinneringen */}
        <div className="settings-section">
          <h3>Timer & Herinneringen</h3>

          <div className="form-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.pomodoroEnabled ?? false}
                onChange={e => onSave({ ...settings, pomodoroEnabled: e.target.checked })}
              />
              <span>Pomodoro modus (werken in blokken)</span>
            </label>
          </div>

          {settings.pomodoroEnabled && (
            <div className="form-row pomodoro-settings">
              <div className="form-group">
                <label>Werktijd</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={settings.pomodoroWorkMinutes ?? 25}
                    onChange={e => onSave({ ...settings, pomodoroWorkMinutes: parseInt(e.target.value) || 25 })}
                    min="5"
                    max="60"
                    step="5"
                  />
                  <span>min</span>
                </div>
              </div>
              <div className="form-group">
                <label>Pauze</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={settings.pomodoroBreakMinutes ?? 5}
                    onChange={e => onSave({ ...settings, pomodoroBreakMinutes: parseInt(e.target.value) || 5 })}
                    min="1"
                    max="30"
                  />
                  <span>min</span>
                </div>
              </div>
            </div>
          )}

          {isSupported && permission !== 'granted' && (
            <button onClick={requestPermission} className="btn-secondary btn-full">
              Notificaties inschakelen
            </button>
          )}

          {isSupported && permission === 'denied' && (
            <p className="error-text">Notificaties geblokkeerd in browser</p>
          )}

          <div className="form-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.alarmEnabled ?? false}
                onChange={e => {
                  onSave({ ...settings, alarmEnabled: e.target.checked });
                  setAlarmSaved(false);
                }}
              />
              <span>Alarm voor geplande taken</span>
            </label>
            {settings.alarmEnabled && (
              <div className="alarm-minutes-setting">
                <input
                  type="number"
                  value={alarmMinutes}
                  onChange={e => {
                    setAlarmMinutes(parseInt(e.target.value) || 10);
                    setAlarmSaved(false);
                  }}
                  min="1"
                  max="60"
                  className="alarm-minutes-input"
                />
                <span>min van tevoren</span>
                <button
                  onClick={async () => {
                    onSave({ ...settings, alarmMinutesBefore: alarmMinutes });
                    try {
                      await api.syncSettings({ alarmEnabled: true, alarmMinutesBefore: alarmMinutes });
                      setAlarmSaved(true);
                      setTimeout(() => setAlarmSaved(false), 2000);
                    } catch (err) {
                      console.error('Failed to sync settings:', err);
                    }
                  }}
                  className="btn-alarm-save"
                >
                  OK
                </button>
                {alarmSaved && <span className="saved-indicator">✓ Opgeslagen</span>}
              </div>
            )}
          </div>
        </div>

        {/* Mentoren */}
        <div className="settings-section">
          <h3>Mentoren</h3>
          {mentors.length > 0 && (
            <div className="mentor-list">
              {mentors.map(m => (
                <span key={m.id} className="mentor-tag">{m.name}</span>
              ))}
            </div>
          )}
          {inviteCode ? (
            <div className="invite-box">
              <span className="invite-label">Code:</span>
              <code className="invite-code">{inviteCode}</code>
              <button onClick={copyInviteCode} className="btn-small">
                {inviteCopied ? 'Gekopieerd!' : 'Kopieer'}
              </button>
              <p className="invite-hint">Laat je mentor deze code binnen 24 uur invoeren. Voor een extra mentor maak je een nieuwe code aan.</p>
            </div>
          ) : (
            <button onClick={generateInvite} className="btn-secondary">
              + Mentor uitnodigen
            </button>
          )}
        </div>

        {/* App */}
        <div className="settings-section">
          <h3>App</h3>
          <div className="button-row">
            {canInstall && (
              <button onClick={install} className="btn-primary">
                Installeren
              </button>
            )}
            {isInstalled && <span className="status-badge">Geïnstalleerd</span>}
            <button
              onClick={handleSync}
              className="btn-secondary"
              disabled={isSyncing || isRestoring}
            >
              {isSyncing ? 'Syncen...' : 'Sync'}
            </button>
            <button
              onClick={handleRestore}
              className="btn-secondary"
              disabled={isSyncing || isRestoring}
            >
              {isRestoring ? 'Herstellen...' : 'Herstel'}
            </button>
          </div>
          {syncMessage && (
            <p className="success-text">{syncMessage}</p>
          )}
        </div>

        {/* Schoolsysteem - onderaan, nog niet actief */}
        <div className="settings-section settings-disabled">
          <h3>Schoolsysteem</h3>
          <p className="muted-text">SOMtoday en Magister koppeling komt binnenkort.</p>
        </div>

        {/* Uitloggen */}
        <div className="settings-section">
          <button onClick={logout} className="btn-logout-full">
            Uitloggen
          </button>
        </div>
      </div>
    </div>
  );
}
