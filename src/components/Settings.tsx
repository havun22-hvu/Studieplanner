import { Settings as SettingsType } from '../types';

interface Props {
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
  onClose: () => void;
}

const DAYS = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

export function Settings({ settings, onSave, onClose }: Props) {
  const toggleBreakDay = (day: number) => {
    const breakDays = settings.breakDays.includes(day)
      ? settings.breakDays.filter(d => d !== day)
      : [...settings.breakDays, day];
    onSave({ ...settings, breakDays });
  };

  return (
    <div className="settings-modal">
      <div className="settings-content">
        <h2>⚙️ Instellingen</h2>

        <div className="form-group">
          <label>Studietijd per dag (minuten)</label>
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
          <label>Vrije dagen (geen studie)</label>
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
        </div>

        <button onClick={onClose} className="btn-primary">Sluiten</button>
      </div>
    </div>
  );
}
