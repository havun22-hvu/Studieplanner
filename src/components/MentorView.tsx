import { useState } from 'react';
import type { Subject, PlannedSession } from '../types';

interface Props {
  studentName: string;
  subjects: Subject[];
  sessions: PlannedSession[];
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const HOUR_HEIGHT = 60;
const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;

export function MentorView({ studentName, subjects, sessions }: Props) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const formatDate = (date: Date) => {
    const days = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
    return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeekStart(newDate);
  };

  const getSessionsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(s => s.date === dateStr && s.hour !== undefined);
  };

  const getSubject = (subjectId: string) => subjects.find(s => s.id === subjectId);
  const getTask = (subjectId: string, taskId: string) => {
    const subject = getSubject(subjectId);
    return subject?.tasks.find(t => t.id === taskId);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Calculate stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.completed).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todayCompleted = todaySessions.filter(s => s.completed).length;

  // Calculate study speed per subject
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

  return (
    <div className="mentor-view">
      <header className="mentor-header">
        <h1>Agenda van {studentName || 'Leerling'}</h1>
        <span className="mentor-badge">Mentor weergave</span>
      </header>

      <div className="mentor-stats">
        <div className="stat-card">
          <span className="stat-value">{completedSessions}/{totalSessions}</span>
          <span className="stat-label">Sessies voltooid</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{todayCompleted}/{todaySessions.length}</span>
          <span className="stat-label">Vandaag</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{subjects.length}</span>
          <span className="stat-label">Vakken</span>
        </div>
      </div>

      <div className="week-nav">
        <button onClick={() => navigateWeek(-1)} className="btn-icon">&lt;</button>
        <span className="week-label">
          {weekDays[0].getDate()}/{weekDays[0].getMonth() + 1} - {weekDays[6].getDate()}/{weekDays[6].getMonth() + 1}
        </span>
        <button onClick={() => navigateWeek(1)} className="btn-icon">&gt;</button>
      </div>

      <div className="agenda-grid mentor-agenda">
        <div className="time-column">
          <div className="time-header"></div>
          {HOURS.map(hour => (
            <div key={hour} className="time-slot" style={{ height: HOUR_HEIGHT }}>
              {hour}:00
            </div>
          ))}
        </div>

        {weekDays.map(date => {
          const daySessions = getSessionsForDay(date);
          const dateStr = date.toISOString().split('T')[0];

          return (
            <div key={dateStr} className={`day-column ${isToday(date) ? 'today' : ''}`}>
              <div className="day-header">
                <span className="day-name">{formatDate(date)}</span>
              </div>
              <div className="day-slots">
                {HOURS.map(hour => (
                  <div key={hour} className="hour-slot" style={{ height: HOUR_HEIGHT }} />
                ))}
                {daySessions.map(session => {
                  const subject = getSubject(session.subjectId);
                  const task = getTask(session.subjectId, session.taskId);
                  const top = ((session.hour! - 8) * 60) * PIXELS_PER_MINUTE;
                  const height = session.minutesPlanned * PIXELS_PER_MINUTE;

                  return (
                    <div
                      key={session.id}
                      className={`session-block ${session.completed ? 'completed' : ''}`}
                      style={{
                        top,
                        height: Math.max(height, 30),
                        backgroundColor: subject?.color || '#ccc',
                      }}
                    >
                      <span className="session-subject">{subject?.name}</span>
                      <span className="session-task">{task?.description}</span>
                      <span className="session-time">{session.minutesPlanned}m</span>
                      {session.completed && <span className="completed-badge">Gedaan</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mentor-sessions">
        <h2>Recente Studiesessies</h2>
        {sessions
          .filter(s => s.completed)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10)
          .map(session => {
            const subject = getSubject(session.subjectId);
            const task = getTask(session.subjectId, session.taskId);
            const sessionDate = new Date(session.date);
            const startTime = session.hour !== undefined ? `${session.hour}:00` : '-';
            const endHour = session.hour !== undefined && session.minutesActual
              ? session.hour + Math.floor(session.minutesActual / 60)
              : undefined;
            const endMin = session.minutesActual ? session.minutesActual % 60 : 0;
            const endTime = endHour !== undefined ? `${endHour}:${endMin.toString().padStart(2, '0')}` : '-';

            return (
              <div key={session.id} className="session-result-card" style={{ borderLeftColor: subject?.color || '#ccc' }}>
                <div className="session-result-header">
                  <span className="session-subject-name" style={{ color: subject?.color }}>{subject?.name}</span>
                  <span className="session-date">{sessionDate.toLocaleDateString('nl-NL')}</span>
                </div>
                <p className="session-task-name">{task?.description}</p>
                <div className="session-result-details">
                  <span>Tijd: {startTime} - {endTime}</span>
                  <span>Gepland: {session.amountPlanned} {session.unit}</span>
                  <span>Gedaan: {session.amountActual ?? session.amountPlanned} {session.unit}</span>
                </div>
              </div>
            );
          })}
        {sessions.filter(s => s.completed).length === 0 && (
          <p className="no-sessions">Nog geen voltooide sessies.</p>
        )}
      </div>

      <div className="mentor-subjects">
        <h2>Vakken & Voortgang</h2>
        {subjects.map(subject => {
          const completedTasks = subject.tasks.filter(t => t.completed).length;
          const totalTasks = subject.tasks.length;
          const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
          // Bereken totale studietijd voor dit vak
          const subjectSessions = sessions.filter(s => s.subjectId === subject.id && s.completed);
          const totalMinutes = subjectSessions.reduce((sum, s) => sum + (s.minutesActual || s.minutesPlanned), 0);
          const hours = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;

          return (
            <div key={subject.id} className="mentor-subject-card" style={{ borderLeftColor: subject.color }}>
              <div className="subject-header">
                <h3 style={{ color: subject.color }}>{subject.name}</h3>
                <span className="exam-date">Toets: {new Date(subject.examDate).toLocaleDateString('nl-NL')}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: subject.color }} />
              </div>
              <p className="progress-text">{completedTasks}/{totalTasks} taken voltooid</p>
              <p className="study-time-text">Totaal gestudeerd: {hours}u {mins}m</p>
            </div>
          );
        })}
      </div>

      <div className="mentor-speed">
        <h2>Studiesnelheid</h2>
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
    </div>
  );
}
