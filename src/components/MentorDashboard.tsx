import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Subject, PlannedSession } from '../types';
import { AgendaView } from './AgendaView';
import { StatsView } from './StatsView';
import './MentorDashboard.css';

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
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'agenda' | 'stats'>('agenda');

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
          tasks: s.tasks.map(t => ({
            ...t,
            id: String(t.id),
          })),
        })),
        sessions: data.sessions.map(s => ({
          ...s,
          id: String(s.id),
          taskId: String(s.taskId),
          subjectId: String(s.subjectId),
        })),
      });
    } catch (err) {
      console.error('Failed to load student data:', err);
    }
  };

  const generateInvite = async () => {
    try {
      const result = await api.generateMentorInvite();
      setInviteCode(result.invite_code);
    } catch (err) {
      console.error('Failed to generate invite:', err);
    }
  };

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      alert('Code gekopieerd!');
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
        <button onClick={logout} className="btn-logout">Uitloggen</button>
      </header>

      <div className="mentor-content">
        {/* Sidebar met leerlingen */}
        <aside className="mentor-sidebar">
          <div className="sidebar-section">
            <h3>Mijn Leerlingen</h3>
            {students.length === 0 ? (
              <p className="no-students">Nog geen leerlingen gekoppeld.</p>
            ) : (
              <ul className="student-list">
                {students.map(student => (
                  <li
                    key={student.id}
                    className={`student-item ${selectedStudent?.id === student.id ? 'active' : ''}`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <span className="student-name">{student.name}</span>
                    <button
                      className="btn-remove-student"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStudent(student.id);
                      }}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="sidebar-section">
            <h3>Leerling Toevoegen</h3>
            {inviteCode ? (
              <div className="invite-code-box">
                <p>Deel deze code met de leerling:</p>
                <div className="invite-code">{inviteCode}</div>
                <button onClick={copyInviteCode} className="btn-copy-code">
                  Kopieer
                </button>
                <button onClick={() => setInviteCode(null)} className="btn-new-code">
                  Nieuwe code
                </button>
              </div>
            ) : (
              <button onClick={generateInvite} className="btn-generate-invite">
                Genereer uitnodigingscode
              </button>
            )}
          </div>
        </aside>

        {/* Main content - student view */}
        <main className="mentor-main">
          {selectedStudent && studentData ? (
            <>
              <div className="student-header">
                <h2>{studentData.student.name}</h2>
                <nav className="student-nav">
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
