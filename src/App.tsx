import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Subject, PlannedSession, Settings as SettingsType, StudyTask } from './types';
import { SubjectForm } from './components/SubjectForm';
import { SubjectCard } from './components/SubjectCard';
import { AgendaView } from './components/AgendaView';
import { Settings } from './components/Settings';
import { StudyTimer } from './components/StudyTimer';
import { SessionResultModal } from './components/SessionResultModal';
import type { SessionResultData } from './components/SessionResultModal';
import { MentorView } from './components/MentorView';
import { MentorDashboard } from './components/MentorDashboard';
import { StatsView } from './components/StatsView';
import { SharePage } from './components/SharePage';
import { autoPlanningSessions, generateId, rescheduleMissedSessions, calculateCatchUpNeeded } from './utils/planning';
import type { CatchUpSuggestion } from './utils/planning';
import { CatchUpModal } from './components/CatchUpModal';
import { AuthScreen } from './components/AuthScreen';
import { useAuth } from './contexts/AuthContext';
import { usePWA } from './contexts/PWAContext';
import { api } from './services/api';
import './App.css';

type View = 'subjects' | 'planning' | 'stats';

const DEFAULT_SETTINGS: SettingsType = {
  dailyStudyMinutes: 90,
  breakDays: [0], // Sunday off
  studentName: '',
  mentors: [],
};

// Main App with routing
function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="auth-loading">Laden...</div>;
  }

  // Determine where to redirect based on role
  const getHomeRoute = () => {
    if (!isAuthenticated || !user) return '/';
    if (user.role === 'mentor') return '/mentor';
    return `/student/${user.student_code}`;
  };

  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated && user
          ? <Navigate to={getHomeRoute()} replace />
          : <AuthScreen />
      } />
      <Route path="/student/:studentCode" element={
        isAuthenticated && user?.role === 'student' ? <StudentApp /> : <Navigate to="/" replace />
      } />
      <Route path="/student/:studentCode/mentor" element={<MentorRoute />} />
      <Route path="/mentor" element={
        isAuthenticated && user?.role === 'mentor' ? <MentorDashboard /> : <Navigate to="/" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Mentor view route component
function MentorRoute() {
  useParams(); // studentCode from URL (for future API use)
  const [searchParams] = useSearchParams();
  const shareCode = searchParams.get('code');

  // Load student data from localStorage (for demo) - in production this would be from API
  const [settings] = useLocalStorage<SettingsType>('studieplanner-settings', DEFAULT_SETTINGS);
  const [subjects] = useLocalStorage<Subject[]>('studieplanner-subjects', []);
  const [sessions] = useLocalStorage<PlannedSession[]>('studieplanner-sessions', []);

  // Validate share code
  if (!shareCode || shareCode !== settings.shareCode) {
    return (
      <div className="app">
        <div className="invalid-code">
          <h1>Ongeldige link</h1>
          <p>Deze mentor-link is ongeldig of verlopen.</p>
          <a href="/">Terug naar de app</a>
        </div>
      </div>
    );
  }

  return (
    <MentorView
      studentName={settings.studentName}
      subjects={subjects}
      sessions={sessions}
    />
  );
}

// Student app component
function StudentApp() {
  const { user } = useAuth();
  const { studentCode } = useParams();
  const navigate = useNavigate();
  const { checkForUpdate, lastUpdateCheck } = usePWA();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // Verify user matches route
  useEffect(() => {
    if (user?.student_code && user.student_code !== studentCode) {
      navigate(`/student/${user.student_code}`, { replace: true });
    }
  }, [user, studentCode, navigate]);

  const [subjects, setSubjects] = useLocalStorage<Subject[]>('studieplanner-subjects', []);
  const [sessions, setSessions] = useLocalStorage<PlannedSession[]>('studieplanner-sessions', []);
  const [settings, setSettings] = useLocalStorage<SettingsType>('studieplanner-settings', DEFAULT_SETTINGS);

  // Sync subjects and sessions to backend when they change
  // Sessions sync MUST wait for subjects sync to complete (for ID mappings)
  useEffect(() => {
    const syncToBackend = async () => {
      try {
        if (subjects.length > 0) {
          await api.syncSubjects(subjects);
        }
        if (sessions.length > 0) {
          await api.syncSessions(sessions);
        }
      } catch (err) {
        console.error('Failed to sync:', err);
      }
    };
    syncToBackend();
  }, [subjects, sessions]);

  const [view, setView] = useState<View>('subjects');
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(() => {
    const shouldShow = localStorage.getItem('showAboutAfterUpdate') === 'true';
    if (shouldShow) {
      localStorage.removeItem('showAboutAfterUpdate');
    }
    return shouldShow;
  });
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>();
  const [selectedSession, setSelectedSession] = useState<PlannedSession | null>(null);
  const [timerSession, setTimerSession] = useState<PlannedSession | null>(null);
  const [timerMinutes, setTimerMinutes] = useState<number>(0);

  // Alarm check effect - uses global settings
  useEffect(() => {
    if (!settings.alarmEnabled) return;

    const checkAlarms = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const todayStr = now.toISOString().split('T')[0];
      const minutesBefore = settings.alarmMinutesBefore || 10;

      sessions.forEach(session => {
        if (session.completed || session.hour === undefined) return;
        if (session.date !== todayStr) return;

        const sessionMinutes = session.hour * 60;
        const currentMinutes = currentHour * 60 + currentMinute;

        // Check if we're exactly at the alarm time (within this minute)
        const alarmTime = sessionMinutes - minutesBefore;
        if (currentMinutes === alarmTime) {
          const subject = subjects.find(s => s.id === session.subjectId);
          const task = subject?.tasks.find(t => t.id === session.taskId);

          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Studietijd over ${minutesBefore} minuten!`, {
              body: `${subject?.name}: ${task?.description}`,
              icon: '/icon-192.png',
            });
          }

          // Play sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {});
        }
      });
    };

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check immediately and then every minute
    checkAlarms();
    const interval = setInterval(checkAlarms, 60000);
    return () => clearInterval(interval);
  }, [sessions, subjects, settings.alarmEnabled, settings.alarmMinutesBefore]);

  // Reschedule missed sessions on app load
  const [rescheduledNotice, setRescheduledNotice] = useState<string | null>(null);

  useEffect(() => {
    const lastCheck = localStorage.getItem('studieplanner-last-reschedule');
    const today = new Date().toISOString().split('T')[0];

    // Only check once per day
    if (lastCheck === today) return;

    const { updated, rescheduledCount } = rescheduleMissedSessions(sessions, subjects, settings);

    if (rescheduledCount > 0) {
      setSessions(updated);
      localStorage.setItem('studieplanner-last-reschedule', today);
      setRescheduledNotice(
        rescheduledCount === 1
          ? '1 gemiste sessie is doorgeschoven naar vandaag'
          : `${rescheduledCount} gemiste sessies zijn doorgeschoven`
      );

      // Auto-hide after 5 seconds
      setTimeout(() => setRescheduledNotice(null), 5000);
    } else {
      localStorage.setItem('studieplanner-last-reschedule', today);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Check for catch-up suggestions
  const [catchUpSuggestions, setCatchUpSuggestions] = useState<CatchUpSuggestion[]>([]);

  useEffect(() => {
    const lastCheck = localStorage.getItem('studieplanner-last-catchup-check');
    const today = new Date().toISOString().split('T')[0];

    // Only check once per day
    if (lastCheck === today) return;

    const suggestions = calculateCatchUpNeeded(subjects, sessions, settings);
    if (suggestions.length > 0) {
      setCatchUpSuggestions(suggestions);
    }
    localStorage.setItem('studieplanner-last-catchup-check', today);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateMessage(null);
    try {
      await checkForUpdate();
      setUpdateMessage('App wordt herladen...');
      localStorage.setItem('showAboutAfterUpdate', 'true');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      setIsCheckingUpdate(false);
    }
  };

  const handleAcceptCatchUp = (subjectId: string, extraSessions: { date: string; minutes: number }[]) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    // Find the first incomplete task for this subject
    const task = subject.tasks.find(t => !t.completed);
    if (!task) return;

    // Create new sessions
    const newSessions = extraSessions.map(({ date, minutes }) => ({
      id: generateId(),
      date,
      taskId: task.id,
      subjectId,
      minutesPlanned: minutes,
      amountPlanned: task.plannedAmount,
      unit: task.unit,
      completed: false,
    }));

    setSessions([...sessions, ...newSessions]);

    // Remove this subject from suggestions
    setCatchUpSuggestions(prev => prev.filter(s => s.subjectId !== subjectId));
  };

  // SOMtoday import handlers (voor later als schoolsysteem koppeling actief is)
  const _handleImportTests = (tests: { vak: string; datum: string; omschrijving: string }[]) => {
    let imported = 0;
    for (const test of tests) {
      // Check if subject already exists
      const existing = subjects.find(s => s.name.toLowerCase() === test.vak.toLowerCase());

      if (existing) {
        // Update exam date if needed
        if (!existing.examDate || test.datum < existing.examDate) {
          setSubjects(subjects.map(s =>
            s.id === existing.id ? { ...s, examDate: test.datum } : s
          ));
        }
      } else {
        // Create new subject with test as task
        const subjectId = generateId();
        const newSubject: Subject = {
          id: subjectId,
          name: test.vak,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
          examDate: test.datum,
          tasks: [{
            id: generateId(),
            subjectId,
            description: test.omschrijving || 'Voorbereiden toets',
            estimatedMinutes: 60,
            plannedAmount: 1,
            unit: 'uur',
            completed: false,
          }],
        };
        setSubjects(prev => [...prev, newSubject]);
        imported++;
      }
    }
    if (imported > 0) {
      alert(`${imported} toets(en) geïmporteerd van SOMtoday`);
    }
  };

  const _handleImportHomework = (homework: { vak: string; omschrijving: string }[]) => {
    let imported = 0;
    for (const hw of homework) {
      const existing = subjects.find(s => s.name.toLowerCase() === hw.vak.toLowerCase());

      if (existing) {
        // Add task to existing subject
        const newTask: StudyTask = {
          id: generateId(),
          subjectId: existing.id,
          description: hw.omschrijving,
          estimatedMinutes: 30,
          plannedAmount: 1,
          unit: 'opdracht',
          completed: false,
        };
        setSubjects(subjects.map(s =>
          s.id === existing.id
            ? { ...s, tasks: [...s.tasks, newTask] }
            : s
        ));
        imported++;
      }
    }
    if (imported > 0) {
      alert(`${imported} huiswerk item(s) geïmporteerd van SOMtoday`);
    }
  };
  // Void om TypeScript errors te voorkomen (functies voor later)
  void _handleImportTests;
  void _handleImportHomework;

  // Subject CRUD
  const saveSubject = (subject: Subject) => {
    // Waarschuwing bij taken > 90 minuten
    const longTasks = subject.tasks.filter(t => t.estimatedMinutes > 90);
    if (longTasks.length > 0) {
      const names = longTasks.map(t => `- ${t.description} (${t.estimatedMinutes} min)`).join('\n');
      alert(`Let op: Na 1,5 uur studeren is een pauze van 30 min aan te raden!\n\nDeze taken zijn langer:\n${names}`);
    }

    const existing = subjects.find(s => s.id === subject.id);

    if (existing) {
      const newTaskIds = new Set(subject.tasks.map(t => t.id));
      const cleanedSessions = sessions.filter(s => {
        if (s.subjectId !== subject.id) return true;
        return newTaskIds.has(s.taskId);
      });
      setSessions(cleanedSessions);
      setSubjects(subjects.map(s => s.id === subject.id ? subject : s));
    } else {
      setSubjects([...subjects, subject]);
      // Maak sessies voor elke taak - leerling plant zelf
      const newSessions = subject.tasks.map(task => ({
        id: generateId(),
        date: subject.examDate,
        taskId: task.id,
        subjectId: subject.id,
        minutesPlanned: task.estimatedMinutes,
        amountPlanned: task.plannedAmount,
        unit: task.unit,
        completed: false,
      }));
      setSessions([...sessions, ...newSessions]);
    }

    setShowForm(false);
    setEditingSubject(undefined);
  };


  const deleteSubject = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    if (!subject) return;

    const taskCount = subject.tasks.length;
    const sessionCount = sessions.filter(s => s.subjectId === id).length;

    const message = `Weet je zeker dat je "${subject.name}" wilt verwijderen?\n\n` +
      `Dit verwijdert ook:\n` +
      `• ${taskCount} studietaak${taskCount !== 1 ? 'en' : ''}\n` +
      `• ${sessionCount} geplande sessie${sessionCount !== 1 ? 's' : ''} uit de agenda\n\n` +
      `Deze actie kan niet ongedaan worden gemaakt.`;

    if (confirm(message)) {
      setSubjects(subjects.filter(s => s.id !== id));
      setSessions(sessions.filter(s => s.subjectId !== id));
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

  // Add task to existing subject
  const addTaskToSubject = (subjectId: string, task: StudyTask) => {
    setSubjects(subjects.map(subject => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        tasks: [...subject.tasks, task],
      };
    }));
    // Regenerate planning to include new task
    regeneratePlanning();
  };

  // Delete task from subject
  const deleteTask = (subjectId: string, taskId: string) => {
    // Also remove sessions for this task
    setSessions(sessions.filter(s => s.taskId !== taskId));
    setSubjects(subjects.map(subject => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        tasks: subject.tasks.filter(task => task.id !== taskId),
      };
    }));
    // Regenerate planning after delete
    setTimeout(() => regeneratePlanning(), 100);
  };

  // Edit task in subject
  const editTask = (subjectId: string, taskId: string, updates: Partial<StudyTask>) => {
    setSubjects(subjects.map(subject => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        tasks: subject.tasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      };
    }));
    // Regenerate planning after edit
    setTimeout(() => regeneratePlanning(), 100);
  };

  // Update session date and hour (for drag & drop)
  const updateSession = (sessionId: string, newDate: string, newHour: number | undefined) => {
    setSessions(sessions.map(session =>
      session.id === sessionId ? { ...session, date: newDate, hour: newHour } : session
    ));
  };

  // Toggle alarm for session
  const toggleAlarm = (sessionId: string) => {
    setSessions(sessions.map(session => {
      if (session.id !== sessionId) return session;
      const currentAlarm = session.alarm || { enabled: false, minutesBefore: 5, sound: true };
      return {
        ...session,
        alarm: { ...currentAlarm, enabled: !currentAlarm.enabled },
      };
    }));
  };

  // Handle session click - open timer
  const handleSessionClick = (session: PlannedSession) => {
    if (session.completed) {
      // Already completed, show info
      alert('Deze sessie is al afgerond!');
      return;
    }
    // Open timer
    setTimerSession(session);

    // Notify mentors on start
    notifyMentors('start', session);
  };

  // Handle timer complete - open result modal
  const handleTimerComplete = (minutesSpent: number) => {
    setTimerMinutes(minutesSpent);
    setSelectedSession(timerSession);
    setTimerSession(null);
  };

  // Notify mentors (placeholder - needs backend for real implementation)
  const notifyMentors = (type: 'start' | 'complete', session: PlannedSession, result?: SessionResultData) => {
    const subject = subjects.find(s => s.id === session.subjectId);
    const task = subject?.tasks.find(t => t.id === session.taskId);
    const studentName = settings.studentName || 'De leerling';

    settings.mentors?.forEach(mentor => {
      const shouldNotify = type === 'start' ? mentor.notifyOnStart : mentor.notifyOnComplete;
      if (!shouldNotify) return;

      // For now, show a console log (replace with actual notification service later)
      if (type === 'start') {
        console.log(`[Mentor melding voor ${mentor.name}]: ${studentName} is begonnen met ${subject?.name}: ${task?.description}`);
      } else {
        const done = result?.amountCompleted || 0;
        const planned = session.amountPlanned;
        console.log(`[Mentor melding voor ${mentor.name}]: ${studentName} is klaar met ${subject?.name}: ${task?.description} (${done}/${planned} ${session.unit})`);
      }

      // Show browser notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        const title = type === 'start'
          ? `${studentName} begint met studeren`
          : `${studentName} is klaar`;
        const body = type === 'start'
          ? `${subject?.name}: ${task?.description}`
          : `${subject?.name}: ${task?.description} - ${result?.amountCompleted}/${session.amountPlanned} ${session.unit}`;

        new Notification(title, { body });
      }
    });
  };

  // Handle session result submission
  const handleSessionResult = (result: SessionResultData) => {
    const session = sessions.find(s => s.id === result.sessionId);
    if (!session) return;

    // Only mark as completed if the full amount was done
    const isFullyCompleted = result.amountCompleted >= session.amountPlanned;

    // Update session with actual minutes, amount, and knowledge rating
    setSessions(sessions.map(s => {
      if (s.id !== result.sessionId) return s;
      return {
        ...s,
        completed: isFullyCompleted,
        minutesActual: result.minutesSpent,
        amountActual: result.amountCompleted,
        knowledgeRating: result.knowledgeRating,
      };
    }));

    // Notify mentors on complete
    notifyMentors('complete', session, result);

    // If task wasn't fully completed, show message (session stays open for retry)
    if (!isFullyCompleted) {
      alert(`Nog ${result.remainingAmount} ${session.unit} te doen.\n\nJe kunt dit blok later opnieuw starten.`);
    }

    setSelectedSession(null);
    setTimerMinutes(0);
  };

  // Regenerate planning
  const regeneratePlanning = (subjectList: Subject[] = subjects) => {
    const newSessions = autoPlanningSessions(subjectList, settings);
    setSessions(newSessions);
  };

  // Get subject and task for selected session
  const getSessionSubject = (session: PlannedSession | null) => {
    if (!session) return undefined;
    return subjects.find(s => s.id === session.subjectId);
  };

  const getSessionTask = (session: PlannedSession | null) => {
    if (!session) return undefined;
    const subject = getSessionSubject(session);
    return subject?.tasks.find(t => t.id === session.taskId);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>StudiePlanner</h1>
        <div className="header-menu-wrapper">
          <button onClick={() => setShowMenu(!showMenu)} className="btn-icon">⚙️</button>
          {showMenu && (
            <div className="header-dropdown">
              <button onClick={() => { setShowMenu(false); setShowSettings(true); }}>
                ⚙️ Instellingen
              </button>
              <button onClick={() => { setShowMenu(false); setShowHelp(true); }}>
                ❓ Help
              </button>
              <button onClick={() => { setShowMenu(false); setShowAbout(true); }}>
                ℹ️ Over
              </button>
            </div>
          )}
        </div>
      </header>

      {rescheduledNotice && (
        <div className="reschedule-notice" onClick={() => setRescheduledNotice(null)}>
          📅 {rescheduledNotice}
        </div>
      )}

      <nav className="app-nav">
        <button
          className={view === 'subjects' ? 'active' : ''}
          onClick={() => setView('subjects')}
        >
          Vakken
        </button>
        <button
          className={view === 'planning' ? 'active' : ''}
          onClick={() => setView('planning')}
        >
          Planning
        </button>
        <button
          className={view === 'stats' ? 'active' : ''}
          onClick={() => setView('stats')}
        >
          Stats
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
                      sessions={sessions.filter(s => s.subjectId === subject.id)}
                      onEdit={editSubject}
                      onDelete={deleteSubject}
                      onToggleTask={toggleTask}
                      onAddTask={addTaskToSubject}
                      onDeleteTask={deleteTask}
                      onEditTask={editTask}
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
            <AgendaView
              subjects={subjects}
              sessions={sessions}
              onUpdateSession={updateSession}
              onCreateSession={(session) => setSessions([...sessions, session])}
              onSessionClick={handleSessionClick}
              onToggleAlarm={toggleAlarm}
            />
            {subjects.length > 0 && (
              <button
                className="btn-regenerate"
                onClick={() => regeneratePlanning()}
              >
                Herplan
              </button>
            )}
          </>
        )}

        {view === 'stats' && (
          <StatsView subjects={subjects} sessions={sessions} />
        )}
      </main>

      {showSettings && (
        <Settings
          settings={settings}
          subjects={subjects}
          sessions={sessions}
          onSave={(newSettings) => {
            setSettings(newSettings);
            regeneratePlanning();
          }}
          onClose={() => setShowSettings(false)}
          onRestore={(restoredSubjects, restoredSessions) => {
            setSubjects(restoredSubjects);
            setSessions(restoredSessions);
          }}
        />
      )}

      {showShare && (
        <SharePage onClose={() => setShowShare(false)} />
      )}

      {catchUpSuggestions.length > 0 && (
        <CatchUpModal
          suggestions={catchUpSuggestions}
          onAccept={handleAcceptCatchUp}
          onDismiss={() => setCatchUpSuggestions([])}
        />
      )}

      {timerSession && (
        <StudyTimer
          session={timerSession}
          subject={getSessionSubject(timerSession)}
          task={getSessionTask(timerSession)}
          settings={settings}
          onComplete={handleTimerComplete}
          onCancel={() => setTimerSession(null)}
        />
      )}

      {selectedSession && (
        <SessionResultModal
          session={selectedSession}
          subject={getSessionSubject(selectedSession)}
          task={getSessionTask(selectedSession)}
          initialMinutes={timerMinutes}
          onSave={handleSessionResult}
          onCancel={() => { setSelectedSession(null); setTimerMinutes(0); }}
        />
      )}

      {showHelp && (
        <div className="modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="modal-content help-modal" onClick={e => e.stopPropagation()}>
            <h2>❓ Help</h2>
            <div className="help-content">
              <h3>Hoe werkt StudiePlanner?</h3>
              <p><strong>1. Vakken toevoegen</strong><br/>Voeg je vakken toe met de toetsdatum. De app plant automatisch studietijd in.</p>
              <p><strong>2. Taken maken</strong><br/>Maak per vak studietaken aan (bijv. "Hoofdstuk 3 leren", "50 blz lezen").</p>
              <p><strong>3. Planning bekijken</strong><br/>Bekijk je weekplanning en sleep taken naar andere tijden indien nodig.</p>
              <p><strong>4. Timer starten</strong><br/>Tik op een taak om de studietimer te starten. Na afloop vul je in hoeveel je hebt gedaan.</p>
              <p><strong>5. Mentor koppelen</strong><br/>Genereer een code in Instellingen om je mentor/ouder toegang te geven.</p>
              <h3>Tips</h3>
              <ul>
                <li>Zet Pomodoro aan voor betere focus (25 min werk, 5 min pauze)</li>
                <li>Stel een dagelijkse herinnering in</li>
                <li>Koppel je schoolsysteem voor automatische toetsimport</li>
              </ul>
            </div>
            <button onClick={() => setShowHelp(false)} className="btn-primary">Sluiten</button>
          </div>
        </div>
      )}

      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal-content about-modal" onClick={e => e.stopPropagation()}>
            <h2>Over StudiePlanner</h2>
            <div className="about-content">
              <p className="app-name"><strong>StudiePlanner</strong></p>
              <p className="app-tagline">Plan je studie slim en haal je deadlines</p>
              <p className="app-version">Versie 2.9.6</p>
              <div className="about-features">
                <p>✓ Automatische studieplanning</p>
                <p>✓ Pomodoro timer</p>
                <p>✓ Voortgang bijhouden</p>
                <p>✓ Mentor koppeling</p>
              </div>
              <button
                onClick={handleCheckUpdate}
                className="btn-check-update"
                disabled={isCheckingUpdate}
              >
                {isCheckingUpdate ? 'Controleren...' : 'Controleer op updates'}
              </button>
              {updateMessage && <p className="success-text">{updateMessage}</p>}
              {lastUpdateCheck && (
                <p className="muted-text">Laatst: {lastUpdateCheck.toLocaleTimeString()}</p>
              )}
              <p className="copyright">© 2025 Havun</p>
            </div>
            <div className="about-actions">
              <button onClick={() => { setShowAbout(false); setShowShare(true); }} className="btn-secondary">
                App delen
              </button>
              <button onClick={() => setShowAbout(false)} className="btn-primary">Sluiten</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
