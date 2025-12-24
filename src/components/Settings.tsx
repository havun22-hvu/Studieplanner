import { useState, useEffect } from 'react';
import type { Settings as SettingsType } from '../types';
import { usePWA } from '../contexts/PWAContext';
import { useNotifications } from '../hooks/useNotifications';
import { api } from '../services/api';

const APP_VERSION = '2.8.2';

interface Props {
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
  onClose: () => void;
}

export function Settings({ settings, onSave, onClose }: Props) {
  const { canInstall, isInstalled, install, checkForUpdate, lastUpdateCheck } = usePWA();
  const { permission, requestPermission, isSupported } = useNotifications(settings);

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [mentors, setMentors] = useState<Array<{ id: number; name: string }>>([]);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    loadMentors();
  }, []);

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

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateMessage(null);
    try {
      await checkForUpdate();
      setUpdateMessage(`Je hebt de laatste versie (${APP_VERSION})`);
      setTimeout(() => setUpdateMessage(null), 5000);
    } finally {
      setIsCheckingUpdate(false);
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

          {isSupported && permission === 'granted' && (
            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.reminderEnabled ?? false}
                  onChange={e => onSave({ ...settings, reminderEnabled: e.target.checked })}
                />
                <span>Dagelijkse herinnering</span>
              </label>
              {settings.reminderEnabled && (
                <input
                  type="time"
                  value={settings.reminderTime ?? '16:00'}
                  onChange={e => onSave({ ...settings, reminderTime: e.target.value })}
                  className="time-input"
                />
              )}
            </div>
          )}

          {isSupported && permission === 'denied' && (
            <p className="error-text">Notificaties geblokkeerd in browser</p>
          )}
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
              onClick={handleCheckUpdate}
              className="btn-secondary"
              disabled={isCheckingUpdate}
            >
              {isCheckingUpdate ? 'Controleren...' : 'Updates'}
            </button>
          </div>
          {lastUpdateCheck && (
            <p className="muted-text">Laatst gecontroleerd: {lastUpdateCheck.toLocaleTimeString()}</p>
          )}
          {updateMessage && (
            <p className="success-text">{updateMessage}</p>
          )}
        </div>

        {/* Schoolsysteem - onderaan, nog niet actief */}
        <div className="settings-section settings-disabled">
          <h3>Schoolsysteem</h3>
          <p className="muted-text">SOMtoday en Magister koppeling komt binnenkort.</p>
        </div>
      </div>
    </div>
  );
}
