import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Subject, PlannedSession, Settings as SettingsType } from './types';
import { SubjectForm } from './components/SubjectForm';
import { SubjectCard } from './components/SubjectCard';
import { PlanningView } from './components/PlanningView';
import { Settings } from './components/Settings';
import { autoPlanningSessions } from './utils/planning';
import './App.css';

type View = 'subjects' | 'planning';

const DEFAULT_SETTINGS: SettingsType = {
  dailyStudyMinutes: 90,
  breakDays: [0], // Sunday off
};

function App() {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('studieplanner-subjects', []);
  const [sessions, setSessions] = useLocalStorage<PlannedSession[]>('studieplanner-sessions', []);
  const [settings, setSettings] = useLocalStorage<SettingsType>('studieplanner-settings', DEFAULT_SETTINGS);

  const [view, setView] = useState<View>('subjects');
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>();

  // Subject CRUD
  const saveSubject = (subject: Subject) => {
    const existing = subjects.find(s => s.id === subject.id);
    if (existing) {
      setSubjects(subjects.map(s => s.id === subject.id ? subject : s));
    } else {
      setSubjects([...subjects, subject]);
    }
    setShowForm(false);
    setEditingSubject(undefined);
    regeneratePlanning([...subjects.filter(s => s.id !== subject.id), subject]);
  };

  const deleteSubject = (id: string) => {
    if (confirm('Weet je zeker dat je dit vak wilt verwijderen?')) {
      const newSubjects = subjects.filter(s => s.id !== id);
      setSubjects(newSubjects);
      regeneratePlanning(newSubjects);
    }
  };

  const editSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setShowForm(true);
  };

  // Toggle task completion
  const toggleTask = (subjectId: string, taskId: string) => {
    setSubjects(subjects.map(subject => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        tasks: subject.tasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
      };
    }));
  };

  // Toggle session completion
  const toggleSession = (sessionId: string) => {
    setSessions(sessions.map(session =>
      session.id === sessionId ? { ...session, completed: !session.completed } : session
    ));
  };

  // Regenerate planning
  const regeneratePlanning = (subjectList: Subject[] = subjects) => {
    const newSessions = autoPlanningSessions(subjectList, settings);
    setSessions(newSessions);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 StudiePlanner</h1>
        <button onClick={() => setShowSettings(true)} className="btn-icon">⚙️</button>
      </header>

      <nav className="app-nav">
        <button
          className={view === 'subjects' ? 'active' : ''}
          onClick={() => setView('subjects')}
        >
          📖 Vakken
        </button>
        <button
          className={view === 'planning' ? 'active' : ''}
          onClick={() => setView('planning')}
        >
          📅 Planning
        </button>
      </nav>

      <main className="app-main">
        {view === 'subjects' && !showForm && (
          <>
            {subjects.length === 0 ? (
              <div className="empty-state">
                <p>Nog geen vakken toegevoegd.</p>
                <p>Voeg je eerste vak toe om te beginnen!</p>
              </div>
            ) : (
              <div className="subjects-list">
                {subjects
                  .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
                  .map(subject => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      onEdit={editSubject}
                      onDelete={deleteSubject}
                      onToggleTask={toggleTask}
                    />
                  ))}
              </div>
            )}
            <button className="fab" onClick={() => setShowForm(true)}>+</button>
          </>
        )}

        {view === 'subjects' && showForm && (
          <SubjectForm
            onSave={saveSubject}
            onCancel={() => { setShowForm(false); setEditingSubject(undefined); }}
            editSubject={editingSubject}
          />
        )}

        {view === 'planning' && (
          <>
            <PlanningView
              subjects={subjects}
              sessions={sessions}
              onToggleSession={toggleSession}
            />
            {subjects.length > 0 && (
              <button
                className="btn-regenerate"
                onClick={() => regeneratePlanning()}
              >
                🔄 Herplan
              </button>
            )}
          </>
        )}
      </main>

      {showSettings && (
        <Settings
          settings={settings}
          onSave={(newSettings) => {
            setSettings(newSettings);
            regeneratePlanning();
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
