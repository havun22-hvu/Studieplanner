import { useState, useEffect } from 'react';
import { somtoday } from '../services/somtoday';
import { magister } from '../services/magister';
import type { SOMtodaySchool, SOMtodayStatus } from '../services/somtoday';
import type { MagisterSchool, MagisterStatus } from '../services/magister';

type SchoolSystem = 'none' | 'somtoday' | 'magister';

interface Props {
  onImportTests: (tests: { vak: string; datum: string; omschrijving: string }[]) => void;
  onImportHomework: (homework: { vak: string; omschrijving: string }[]) => void;
}

export function SchoolSystemSettings({ onImportTests, onImportHomework }: Props) {
  const [, setActiveSystem] = useState<SchoolSystem>('none');
  const [somtodayStatus, setSomtodayStatus] = useState<SOMtodayStatus>({ connected: false });
  const [magisterStatus, setMagisterStatus] = useState<MagisterStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState<SchoolSystem>('none');

  // Login form state
  const [schoolSearch, setSchoolSearch] = useState('');
  const [somtodaySchools, setSomtodaySchools] = useState<SOMtodaySchool[]>([]);
  const [magisterSchools, setMagisterSchools] = useState<MagisterSchool[]>([]);
  const [selectedSomtodaySchool, setSelectedSomtodaySchool] = useState<SOMtodaySchool | null>(null);
  const [selectedMagisterSchool, setSelectedMagisterSchool] = useState<MagisterSchool | null>(null);
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

    const [somStatus, magStatus] = await Promise.all([
      somtoday.getStatus(),
      magister.getStatus(),
    ]);

    setSomtodayStatus(somStatus);
    setMagisterStatus(magStatus);

    if (somStatus.connected) {
      setActiveSystem('somtoday');
    } else if (magStatus.connected) {
      setActiveSystem('magister');
    }

    setLoading(false);
  };

  const searchSchools = async (system: SchoolSystem) => {
    if (schoolSearch.length < 2) return;

    try {
      if (system === 'somtoday') {
        const results = await somtoday.searchSchools(schoolSearch);
        setSomtodaySchools(results);
      } else if (system === 'magister') {
        const results = await magister.searchSchools(schoolSearch);
        setMagisterSchools(results);
      }
    } catch {
      setSomtodaySchools([]);
      setMagisterSchools([]);
    }
  };

  const handleSomtodayLogin = async () => {
    if (!selectedSomtodaySchool) return;

    setLoginLoading(true);
    setLoginError('');

    const result = await somtoday.login(selectedSomtodaySchool.uuid, username, password);

    if (result.success) {
      await checkStatus();
      setShowLogin('none');
      resetLoginForm();
    } else {
      setLoginError(result.error || 'Inloggen mislukt');
    }

    setLoginLoading(false);
  };

  const handleMagisterLogin = async () => {
    if (!selectedMagisterSchool) return;

    setLoginLoading(true);
    setLoginError('');

    const result = await magister.login(selectedMagisterSchool.url, username, password);

    if (result.success) {
      await checkStatus();
      setShowLogin('none');
      resetLoginForm();
    } else {
      setLoginError(result.error || 'Inloggen mislukt');
    }

    setLoginLoading(false);
  };

  const handleDisconnect = (system: SchoolSystem) => {
    if (system === 'somtoday') {
      somtoday.disconnect();
      setSomtodayStatus({ connected: false });
    } else if (system === 'magister') {
      magister.disconnect();
      setMagisterStatus({ connected: false });
    }
    setActiveSystem('none');
  };

  const resetLoginForm = () => {
    setSchoolSearch('');
    setSomtodaySchools([]);
    setMagisterSchools([]);
    setSelectedSomtodaySchool(null);
    setSelectedMagisterSchool(null);
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  const handleImportTests = async (system: SchoolSystem) => {
    setImporting(true);
    try {
      const tests = system === 'somtoday'
        ? await somtoday.getTests()
        : await magister.getTests();

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

  const handleImportHomework = async (system: SchoolSystem) => {
    setImporting(true);
    try {
      const homework = system === 'somtoday'
        ? await somtoday.getHomework()
        : await magister.getHomework();

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
    return <div className="school-system-loading">Laden...</div>;
  }

  // Connected state
  if (somtodayStatus.connected || magisterStatus.connected) {
    const isS = somtodayStatus.connected;
    const status = isS ? somtodayStatus : magisterStatus;
    const system: SchoolSystem = isS ? 'somtoday' : 'magister';

    return (
      <div className="school-system-settings">
        <h3>📚 Schoolsysteem Koppeling</h3>

        <div className="system-connected">
          <div className="system-badge" data-system={system}>
            {isS ? 'SOMtoday' : 'Magister'}
          </div>

          <div className="system-status">
            <span className="status-dot connected"></span>
            <div>
              <strong>{status.studentName}</strong>
              <p>{status.school}</p>
              {status.lastSync && (
                <small>Laatste sync: {new Date(status.lastSync).toLocaleString('nl-NL')}</small>
              )}
            </div>
          </div>

          <div className="system-actions">
            <button
              className="btn-secondary btn-small"
              onClick={() => handleImportTests(system)}
              disabled={importing}
            >
              📝 Toetsen importeren
            </button>
            <button
              className="btn-secondary btn-small"
              onClick={() => handleImportHomework(system)}
              disabled={importing}
            >
              📖 Huiswerk importeren
            </button>
            <button
              className="btn-danger btn-small"
              onClick={() => handleDisconnect(system)}
            >
              Ontkoppelen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login flow
  if (showLogin !== 'none') {
    const isS = showLogin === 'somtoday';

    return (
      <div className="school-system-settings">
        <h3>📚 {isS ? 'SOMtoday' : 'Magister'} Koppelen</h3>

        <div className="system-login">
          {(isS ? !selectedSomtodaySchool : !selectedMagisterSchool) ? (
            <>
              <label>Zoek je school:</label>
              <div className="school-search">
                <input
                  type="text"
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchSchools(showLogin)}
                  placeholder={isS ? "Bijv. Erasmus College" : "Bijv. Het Lyceum"}
                />
                <button onClick={() => searchSchools(showLogin)} className="btn-secondary btn-small">
                  Zoeken
                </button>
              </div>

              {isS && somtodaySchools.length > 0 && (
                <div className="school-list">
                  {somtodaySchools.map(school => (
                    <button
                      key={school.uuid}
                      className="school-item"
                      onClick={() => setSelectedSomtodaySchool(school)}
                    >
                      <strong>{school.naam}</strong>
                      <span>{school.plaats}</span>
                    </button>
                  ))}
                </div>
              )}

              {!isS && magisterSchools.length > 0 && (
                <div className="school-list">
                  {magisterSchools.map(school => (
                    <button
                      key={school.id}
                      className="school-item"
                      onClick={() => setSelectedMagisterSchool(school)}
                    >
                      <strong>{school.naam}</strong>
                      <span>{school.url}</span>
                    </button>
                  ))}
                </div>
              )}

              <button
                className="btn-secondary"
                onClick={() => { setShowLogin('none'); resetLoginForm(); }}
              >
                ← Terug
              </button>
            </>
          ) : (
            <>
              <div className="selected-school">
                <strong>{isS ? selectedSomtodaySchool?.naam : selectedMagisterSchool?.naam}</strong>
                <button onClick={() => isS ? setSelectedSomtodaySchool(null) : setSelectedMagisterSchool(null)}>
                  Wijzigen
                </button>
              </div>

              <label>Gebruikersnaam:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isS ? "Je SOMtoday gebruikersnaam" : "Je Magister gebruikersnaam"}
              />

              <label>Wachtwoord:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isS ? "Je SOMtoday wachtwoord" : "Je Magister wachtwoord"}
              />

              {loginError && <p className="error">{loginError}</p>}

              <div className="login-buttons">
                <button
                  className="btn-secondary"
                  onClick={() => { setShowLogin('none'); resetLoginForm(); }}
                >
                  Annuleren
                </button>
                <button
                  className="btn-primary"
                  onClick={isS ? handleSomtodayLogin : handleMagisterLogin}
                  disabled={loginLoading || !username || !password}
                >
                  {loginLoading ? 'Bezig...' : 'Inloggen'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // System selection
  return (
    <div className="school-system-settings">
      <h3>📚 Schoolsysteem Koppeling</h3>
      <p className="section-info">
        Koppel je schoolsysteem om toetsen en huiswerk automatisch te importeren.
      </p>

      <div className="system-options">
        <button
          className="system-option"
          onClick={() => setShowLogin('somtoday')}
        >
          <div className="system-logo somtoday">S</div>
          <div className="system-info">
            <strong>SOMtoday</strong>
            <span>Voor scholen met SOMtoday</span>
          </div>
        </button>

        <button
          className="system-option"
          onClick={() => setShowLogin('magister')}
        >
          <div className="system-logo magister">M</div>
          <div className="system-info">
            <strong>Magister</strong>
            <span>Voor scholen met Magister</span>
          </div>
        </button>
      </div>

      <p className="system-hint">
        💡 Weet je niet welk systeem je school gebruikt? Vraag het aan je docent of kijk op de website van je school.
      </p>

      <p className="system-optional">
        Dit is optioneel - je kunt de app ook zonder koppeling gebruiken en zelf je vakken en taken invoeren.
      </p>
    </div>
  );
}
