import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { usePWA } from '../contexts/PWAContext';
import type { Subject, PlannedSession } from '../types';
import { AgendaView } from './AgendaView';
import { StatsView } from './StatsView';
import './MentorDashboard.css';

const APP_VERSION = '2.8.3';

interface Student {
  id: number;
  name: string;
  student_code: string;
}

interface StudentData {
  student: { id: number; name: string };
  subjects: Subject[];
  sessions: PlannedSession[];
}

export function MentorDashboard() {
  const { user, logout } = useAuth();
  const { checkForUpdate, lastUpdateCheck } = usePWA();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [studentCode, setStudentCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'vakken' | 'agenda' | 'stats'>('vakken');
  const [showSettings, setShowSettings] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateMessage(null);
    try {
      await checkForUpdate();
      // Force reload to get latest version
      setUpdateMessage('App wordt herladen...');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      setIsCheckingUpdate(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentData(selectedStudent.id);
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    try {
      const data = await api.getMentorStudents();
      setStudents(data);
      if (data.length > 0 && !selectedStudent) {
        setSelectedStudent(data[0]);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = async (studentId: number) => {
    try {
      const data = await api.getStudentData(studentId);
      // Convert API response to match frontend types
      setStudentData({
        student: data.student,
        subjects: data.subjects.map(s => ({
          ...s,
          id: String(s.id),
          examDate: s.examDate,
          tasks: s.tasks.map(t => ({
            ...t,
            id: String(t.id),
            subjectId: String(s.id),
          })),
        })),
        sessions: data.sessions.map(s => ({
          ...s,
          id: String(s.id),
          taskId: String(s.taskId),
          subjectId: String(s.subjectId),
          minutesActual: s.minutesActual ?? undefined,
          amountActual: s.amountActual ?? undefined,
          hour: s.hour ?? undefined,
        })),
      });
    } catch (err) {
      console.error('Failed to load student data:', err);
    }
  };

  const handleAcceptStudent = async () => {
    if (!studentCode.trim()) {
      setCodeError('Voer een code in');
      return;
    }

    setCodeError('');
    setCodeSuccess('');

    try {
      const result = await api.acceptStudentInvite(studentCode.trim());
      setCodeSuccess(`${result.student.name} toegevoegd!`);
      setStudentCode('');
      loadStudents();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setCodeError(error.message || 'Ongeldige of verlopen code');
    }
  };

  const removeStudent = async (studentId: number) => {
    if (!confirm('Weet je zeker dat je deze leerling wilt verwijderen?')) return;

    try {
      await api.removeStudent(studentId);
      setStudents(students.filter(s => s.id !== studentId));
      if (selectedStudent?.id === studentId) {
        setSelectedStudent(students.find(s => s.id !== studentId) || null);
        setStudentData(null);
      }
    } catch (err) {
      console.error('Failed to remove student:', err);
    }
  };

  if (loading) {
    return <div className="mentor-loading">Laden...</div>;
  }

  return (
    <div className="mentor-dashboard">
      <header className="mentor-header">
        <div className="mentor-header-left">
          <h1>Mentor Dashboard</h1>
          <span className="mentor-name">{user?.name}</span>
        </div>
        <div className="settings-wrapper" ref={settingsRef}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-settings"
            title="Instellingen"
          >
            ⚙️
          </button>
          {showSettings && (
            <div className="settings-dropdown">
              <div className="dropdown-section">
                <h4>Leerling Toevoegen</h4>
                <p className="section-hint">Vraag de leerling om een code te genereren.</p>
                <div className="student-code-input">
                  <input
                    type="text"
                    value={studentCode}
                    onChange={e => setStudentCode(e.target.value.toUpperCase())}
                    placeholder="Voer code in"
                    maxLength={10}
                  />
                  <button onClick={handleAcceptStudent} className="btn-add-student">
                    Toevoegen
                  </button>
                </div>
                {codeError && <p className="error-message">{codeError}</p>}
                {codeSuccess && <p className="success-message">{codeSuccess}</p>}
              </div>

              <div className="dropdown-section dropdown-about">
                <h4>Over StudiePlanner</h4>
                <p className="app-version">Versie {APP_VERSION}</p>
                <button
                  onClick={handleCheckUpdate}
                  className="btn-check-update"
                  disabled={isCheckingUpdate}
                >
                  {isCheckingUpdate ? 'Controleren...' : 'Controleer op updates'}
                </button>
                {updateMessage && <p className="success-message">{updateMessage}</p>}
                {lastUpdateCheck && (
                  <p className="muted-text">Laatst: {lastUpdateCheck.toLocaleTimeString()}</p>
                )}
                <p className="copyright">© {new Date().getFullYear()} Havun</p>
              </div>

              <div className="dropdown-section dropdown-logout">
                <button onClick={logout} className="btn-logout-dropdown">
                  Uitloggen
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Leerlingen tabs */}
      <div className="student-tabs">
        {students.length === 0 ? (
          <p className="no-students">Nog geen leerlingen gekoppeld. Klik op ⚙️ om een leerling toe te voegen.</p>
        ) : (
          students.map(student => (
            <div
              key={student.id}
              className={`student-tab ${selectedStudent?.id === student.id ? 'active' : ''}`}
              onClick={() => setSelectedStudent(student)}
            >
              <span>{student.name}</span>
              <button
                className="btn-remove-student"
                onClick={(e) => {
                  e.stopPropagation();
                  removeStudent(student.id);
                }}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mentor-content">
        {/* Main content - student view */}
        <main className="mentor-main">
          {selectedStudent && studentData ? (
            <>
              <div className="student-header">
                <h2>{studentData.student.name}</h2>
                <nav className="student-nav">
                  <button
                    className={view === 'vakken' ? 'active' : ''}
                    onClick={() => setView('vakken')}
                  >
                    Vakken
                  </button>
                  <button
                    className={view === 'agenda' ? 'active' : ''}
                    onClick={() => setView('agenda')}
                  >
                    Agenda
                  </button>
                  <button
                    className={view === 'stats' ? 'active' : ''}
                    onClick={() => setView('stats')}
                  >
                    Stats
                  </button>
                </nav>
              </div>

              {view === 'agenda' && (
                <AgendaView
                  subjects={studentData.subjects}
                  sessions={studentData.sessions}
                  onUpdateSession={() => {}}
                  onCreateSession={() => {}}
                  onSessionClick={() => {}}
                  onToggleAlarm={() => {}}
                  readOnly={true}
                />
              )}

              {view === 'vakken' && (
                <div className="subjects-view">
                  {studentData.subjects.length === 0 ? (
                    <p className="no-data">Geen vakken gevonden.</p>
                  ) : (
                    studentData.subjects.map(subject => {
                      const subjectSessions = studentData.sessions.filter(s => s.subjectId === subject.id);
                      const completedSessions = subjectSessions.filter(s => s.completed);
                      const totalPlanned = subjectSessions.reduce((sum, s) => sum + s.minutesPlanned, 0);
                      const totalActual = completedSessions.reduce((sum, s) => sum + (s.minutesActual || 0), 0);
                      const avgRating = completedSessions.length > 0
                        ? completedSessions.reduce((sum, s) => sum + (s.knowledgeRating || 0), 0) / completedSessions.filter(s => s.knowledgeRating).length
                        : null;

                      // Format time: show minutes if < 60, otherwise hours
                      const formatTime = (mins: number) => mins < 60 ? `${mins}min` : `${Math.round(mins / 60)}uur`;

                      return (
                        <div key={subject.id} className="subject-card-mentor" style={{ borderLeftColor: subject.color }}>
                          <div className="subject-header-mentor">
                            <h3>{subject.name}</h3>
                            <span className="exam-date">{new Date(subject.examDate).toLocaleDateString('nl-NL')}</span>
                          </div>

                          <div className="subject-stats-row">
                            <span className="stat-item">
                              <strong>{completedSessions.length}</strong>/{subjectSessions.length} klaar
                            </span>
                            <span className="stat-item">
                              <strong>{formatTime(totalActual)}</strong> van {formatTime(totalPlanned)}
                            </span>
                            {avgRating && (
                              <span className={`stat-item rating-${avgRating >= 7 ? 'good' : avgRating >= 5 ? 'ok' : 'low'}`}>
                                ⭐ {avgRating.toFixed(1)}
                              </span>
                            )}
                          </div>

                          <div className="tasks-list-compact">
                            {subject.tasks.map(task => (
                              <span key={task.id} className="task-tag">{task.description}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {view === 'stats' && (
                <StatsView
                  subjects={studentData.subjects}
                  sessions={studentData.sessions}
                />
              )}
            </>
          ) : (
            <div className="no-student-selected">
              <p>Selecteer een leerling of voeg er een toe.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
