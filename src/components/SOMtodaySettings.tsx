import { useState, useEffect } from 'react';
import { somtoday } from '../services/somtoday';
import type { SOMtodaySchool, SOMtodayStatus } from '../services/somtoday';

interface Props {
  onImportTests: (tests: { vak: string; datum: string; omschrijving: string }[]) => void;
  onImportHomework: (homework: { vak: string; omschrijving: string }[]) => void;
}

export function SOMtodaySettings({ onImportTests, onImportHomework }: Props) {
  const [status, setStatus] = useState<SOMtodayStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // Login form state
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schools, setSchools] = useState<SOMtodaySchool[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SOMtodaySchool | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Import state
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    const s = await somtoday.getStatus();
    setStatus(s);
    setLoading(false);
  };

  const searchSchools = async () => {
    if (schoolSearch.length < 2) return;
    try {
      const results = await somtoday.searchSchools(schoolSearch);
      setSchools(results);
    } catch {
      setSchools([]);
    }
  };

  const handleLogin = async () => {
    if (!selectedSchool) return;

    setLoginLoading(true);
    setLoginError('');

    const result = await somtoday.login(selectedSchool.uuid, username, password);

    if (result.success) {
      await checkStatus();
      setShowLogin(false);
      resetLoginForm();
    } else {
      setLoginError(result.error || 'Inloggen mislukt');
    }

    setLoginLoading(false);
  };

  const handleDisconnect = () => {
    somtoday.disconnect();
    setStatus({ connected: false });
  };

  const resetLoginForm = () => {
    setSchoolSearch('');
    setSchools([]);
    setSelectedSchool(null);
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  const handleImportTests = async () => {
    setImporting(true);
    try {
      const tests = await somtoday.getTests();
      onImportTests(tests.map(t => ({
        vak: t.vak,
        datum: t.datum,
        omschrijving: t.omschrijving,
      })));
    } catch (e) {
      console.error('Failed to import tests:', e);
    }
    setImporting(false);
  };

  const handleImportHomework = async () => {
    setImporting(true);
    try {
      const homework = await somtoday.getHomework();
      onImportHomework(homework.filter(h => !h.afgerond).map(h => ({
        vak: h.vak,
        omschrijving: h.omschrijving,
      })));
    } catch (e) {
      console.error('Failed to import homework:', e);
    }
    setImporting(false);
  };

  if (loading) {
    return <div className="somtoday-loading">Laden...</div>;
  }

  return (
    <div className="somtoday-settings">
      <h3>📚 SOMtoday Koppeling</h3>

      {status.connected ? (
        <div className="somtoday-connected">
          <div className="somtoday-status">
            <span className="status-dot connected"></span>
            <div>
              <strong>{status.studentName}</strong>
              <p>{status.school}</p>
              {status.lastSync && (
                <small>Laatste sync: {new Date(status.lastSync).toLocaleString('nl-NL')}</small>
              )}
            </div>
          </div>

          <div className="somtoday-actions">
            <button
              className="btn-secondary btn-small"
              onClick={handleImportTests}
              disabled={importing}
            >
              📝 Toetsen importeren
            </button>
            <button
              className="btn-secondary btn-small"
              onClick={handleImportHomework}
              disabled={importing}
            >
              📖 Huiswerk importeren
            </button>
            <button
              className="btn-danger btn-small"
              onClick={handleDisconnect}
            >
              Ontkoppelen
            </button>
          </div>
        </div>
      ) : (
        <>
          {!showLogin ? (
            <div className="somtoday-disconnected">
              <p>Koppel je SOMtoday account om toetsen en huiswerk automatisch te importeren.</p>
              <button className="btn-primary" onClick={() => setShowLogin(true)}>
                Koppelen met SOMtoday
              </button>
            </div>
          ) : (
            <div className="somtoday-login">
              {!selectedSchool ? (
                <>
                  <label>Zoek je school:</label>
                  <div className="school-search">
                    <input
                      type="text"
                      value={schoolSearch}
                      onChange={(e) => setSchoolSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchSchools()}
                      placeholder="Bijv. Erasmus College"
                    />
                    <button onClick={searchSchools} className="btn-secondary btn-small">
                      Zoeken
                    </button>
                  </div>

                  {schools.length > 0 && (
                    <div className="school-list">
                      {schools.map(school => (
                        <button
                          key={school.uuid}
                          className="school-item"
                          onClick={() => setSelectedSchool(school)}
                        >
                          <strong>{school.naam}</strong>
                          <span>{school.plaats}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="selected-school">
                    <strong>{selectedSchool.naam}</strong>
                    <button onClick={() => setSelectedSchool(null)}>Wijzigen</button>
                  </div>

                  <label>Gebruikersnaam:</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Je SOMtoday gebruikersnaam"
                  />

                  <label>Wachtwoord:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Je SOMtoday wachtwoord"
                  />

                  {loginError && <p className="error">{loginError}</p>}

                  <div className="login-buttons">
                    <button
                      className="btn-secondary"
                      onClick={() => { setShowLogin(false); resetLoginForm(); }}
                    >
                      Annuleren
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handleLogin}
                      disabled={loginLoading || !username || !password}
                    >
                      {loginLoading ? 'Bezig...' : 'Inloggen'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
