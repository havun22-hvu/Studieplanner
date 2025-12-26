import { useState, useRef, useEffect, useCallback } from 'react';
import type { Subject, PlannedSession, StudyTask } from '../types';

interface Props {
  subjects: Subject[];
  sessions: PlannedSession[];
  onUpdateSession: (sessionId: string, newDate: string, newHour: number | undefined) => void;
  onCreateSession: (session: PlannedSession) => void;
  onSessionClick: (session: PlannedSession) => void;
  onToggleAlarm: (sessionId: string) => void;
  readOnly?: boolean;
}

// Time slots 0:00 to 23:00 (full 24 hours)
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // pixels per hour
const DEFAULT_SCROLL_HOUR = 8; // Scroll to 8:00 by default
const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60; // 1 pixel per minute

interface DragItem {
  type: 'session' | 'task';
  session?: PlannedSession;
  task?: StudyTask;
  subject?: Subject;
}

export function AgendaView({ subjects, sessions, onUpdateSession, onCreateSession: _onCreateSession, onSessionClick, onToggleAlarm, readOnly = false }: Props) {
  // Skip drag functionality in readOnly mode (mentor view)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(today);
    start.setDate(diff);
    return start;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const LONG_PRESS_DELAY = 1500; // 1.5 seconds

  // Scroll to default hour (8:00) on mount
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = DEFAULT_SCROLL_HOUR * HOUR_HEIGHT;
    }
  }, []);

  // Get week days
  const getWeekDays = (startDate: Date): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeekStart);
  const today = new Date().toISOString().split('T')[0];

  const getSubject = (id: string) => subjects.find(s => s.id === id);
  const getTask = (subjectId: string, taskId: string) => {
    const subject = getSubject(subjectId);
    return subject?.tasks.find(t => t.id === taskId);
  };

  const formatDay = (date: Date) => {
    const days = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
    return days[date.getDay()];
  };

  const formatDateNum = (date: Date) => date.getDate();

  const formatMonth = (date: Date) => {
    const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    return months[date.getMonth()];
  };

  const prevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const nextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToToday = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now);
    start.setDate(diff);
    setCurrentWeekStart(start);
  };

  const getSessionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(s => s.date === dateStr && s.hour !== undefined && s.hour !== null);
  };

  // Get unscheduled sessions (have date but no hour)
  const getUnscheduledSessions = () => {
    return sessions.filter(s => s.hour === undefined || s.hour === null);
  };

  // Get exams for a specific date
  const getExamsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return subjects.filter(s => s.examDate === dateStr);
  };

  // Cancel long press
  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    longPressTriggered.current = false;
  };

  // Drag start for session chips in agenda (with long press)
  const handleSessionDragStart = (e: React.MouseEvent | React.TouchEvent, session: PlannedSession) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setIsDragging(true);
      setDragItem({ type: 'session', session });
      setDragPosition({ x: clientX, y: clientY });
    }, LONG_PRESS_DELAY);
  };

  // Handle touch/mouse move - cancel long press if moved too much
  const handlePressMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (longPressTimer.current && !longPressTriggered.current) {
      cancelLongPress();
    }
  };

  // Handle touch/mouse end - cancel long press
  const handlePressEnd = () => {
    cancelLongPress();
  };

  // Drag start for task chips in pool (with long press)
  const handleTaskDragStart = (e: React.MouseEvent | React.TouchEvent, session: PlannedSession, subject: Subject) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setIsDragging(true);
      setDragItem({ type: 'session', session, subject });
      setDragPosition({ x: clientX, y: clientY });
    }, LONG_PRESS_DELAY);
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragPosition({ x: clientX, y: clientY });
  }, [isDragging]);

  const handleDragEnd = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragItem) {
      setIsDragging(false);
      setDragItem(null);
      return;
    }

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

    // Check if dropped on task pool (the shelf)
    const taskPool = document.querySelector('.task-pool');
    if (taskPool) {
      const poolRect = taskPool.getBoundingClientRect();
      if (clientX >= poolRect.left && clientX <= poolRect.right &&
          clientY >= poolRect.top && clientY <= poolRect.bottom) {
        // Return to shelf - remove hour
        if (dragItem.session) {
          onUpdateSession(dragItem.session.id, dragItem.session.date, undefined);
        }
        setIsDragging(false);
        setDragItem(null);
        return;
      }
    }

    // Find target day and hour
    const dayColumns = document.querySelectorAll('.agenda-day-column');
    let targetDate: string | null = null;
    let targetHour = 9;

    dayColumns.forEach((col) => {
      const rect = col.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) {
        targetDate = col.getAttribute('data-date');

        const hourSlots = col.querySelectorAll('.hour-slot');
        hourSlots.forEach((slot) => {
          const slotRect = slot.getBoundingClientRect();
          if (clientY >= slotRect.top && clientY <= slotRect.bottom) {
            targetHour = parseInt(slot.getAttribute('data-hour') || '9');
          }
        });
      }
    });

    if (targetDate && dragItem.session) {
      onUpdateSession(dragItem.session.id, targetDate, targetHour);
    }

    setIsDragging(false);
    setDragItem(null);
  }, [isDragging, dragItem, onUpdateSession]);

  useEffect(() => {
    if (isDragging) {
      const moveHandler = (e: MouseEvent | TouchEvent) => handleDragMove(e);
      const endHandler = (e: MouseEvent | TouchEvent) => handleDragEnd(e);

      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', endHandler);
      window.addEventListener('touchmove', moveHandler, { passive: false });
      window.addEventListener('touchend', endHandler);

      return () => {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', endHandler);
        window.removeEventListener('touchmove', moveHandler);
        window.removeEventListener('touchend', endHandler);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  const unscheduledSessions = getUnscheduledSessions();

  // Get drag item display info
  const getDragSubject = () => {
    if (!dragItem) return null;
    if (dragItem.subject) return dragItem.subject;
    if (dragItem.session) return getSubject(dragItem.session.subjectId);
    return null;
  };

  const getDragTask = () => {
    if (!dragItem?.session) return null;
    return getTask(dragItem.session.subjectId, dragItem.session.taskId);
  };

  return (
    <div className="agenda-view">
      {/* Unscheduled sessions pool - always visible for drag back */}
      <div className="task-pool">
        <h3>Te plannen {unscheduledSessions.length > 0 && `(${unscheduledSessions.length})`}</h3>
        <div className="task-chips">
          {unscheduledSessions.length === 0 ? (
            <span className="pool-empty">Sleep taken hierheen om te verwijderen uit agenda</span>
          ) : (
            unscheduledSessions.map((session) => {
              const subject = getSubject(session.subjectId);
              const task = getTask(session.subjectId, session.taskId);
              if (!subject) return null;

              return (
                <div
                  key={session.id}
                  className="task-chip"
                  style={{ backgroundColor: subject.color }}
                  onMouseDown={(e) => !readOnly && handleTaskDragStart(e, session, subject)}
                  onTouchStart={(e) => !readOnly && handleTaskDragStart(e, session, subject)}
                  onMouseUp={handlePressEnd}
                  onTouchEnd={handlePressEnd}
                  onTouchMove={handlePressMove}
                  onMouseLeave={handlePressEnd}
                >
                  <span className="chip-name">{subject.name} ({session.minutesPlanned}m)</span>
                  <span className="chip-task-name">{task?.description}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Week header */}
      <div className="agenda-header">
        <button onClick={prevWeek} className="nav-btn">&lsaquo;</button>
        <div className="week-info">
          <span className="week-month">{formatMonth(weekDays[0])} {weekDays[0].getFullYear()}</span>
          <button onClick={goToToday} className="today-btn">Vandaag</button>
        </div>
        <button onClick={nextWeek} className="nav-btn">&rsaquo;</button>
      </div>

      {/* Day headers */}
      <div className="agenda-days-header">
        <div className="time-gutter"></div>
        {weekDays.map((day) => {
          const dateStr = day.toISOString().split('T')[0];
          const isToday = dateStr === today;
          const exams = getExamsForDate(day);
          const isSelected = selectedDay === dateStr;
          return (
            <div
              key={dateStr}
              className={`day-header-cell ${isToday ? 'today' : ''} ${exams.length > 0 ? 'has-exam' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedDay(isSelected ? null : dateStr)}
            >
              <span className="day-name">{formatDay(day)}</span>
              <span className={`day-num ${isToday ? 'today-num' : ''}`}>{formatDateNum(day)}</span>
              {exams.map(exam => (
                <span key={exam.id} className="exam-badge" style={{ backgroundColor: exam.color }}>
                  {exam.name}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      {/* Agenda grid */}
      <div className="agenda-grid" ref={gridRef}>
        {/* Time column */}
        <div className="time-column">
          {HOURS.map(hour => (
            <div key={hour} className="time-slot">
              <span>{hour}:00</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day) => {
          const dateStr = day.toISOString().split('T')[0];
          const daySessions = getSessionsForDate(day);
          const isToday = dateStr === today;

          return (
            <div
              key={dateStr}
              className={`agenda-day-column ${isToday ? 'today' : ''}`}
              data-date={dateStr}
            >
              {/* Hour grid lines */}
              {HOURS.map(hour => (
                <div key={hour} className="hour-slot" data-hour={hour} />
              ))}

              {/* Session chips positioned absolutely */}
              {daySessions.map(session => {
                const subject = getSubject(session.subjectId);
                const task = getTask(session.subjectId, session.taskId);
                const height = Math.max(20, session.minutesPlanned * PIXELS_PER_MINUTE);
                const showTask = height > 30;
                const showStats = height > 50 && session.completed && session.minutesActual;
                const topOffset = (session.hour ?? 8) * HOUR_HEIGHT;
                const hasAlarm = session.alarm?.enabled;

                // Calculate time difference for completed sessions
                const timeDiffPercent = session.completed && session.minutesActual && session.minutesPlanned > 0
                  ? Math.round(((session.minutesActual - session.minutesPlanned) / session.minutesPlanned) * 100)
                  : 0;

                return (
                  <div
                    key={session.id}
                    className={`session-chip ${session.completed ? 'completed' : ''} ${isDragging && dragItem?.session?.id === session.id ? 'dragging' : ''}`}
                    style={{
                      backgroundColor: subject?.color,
                      height: `${height}px`,
                      top: `${topOffset}px`,
                    }}
                    onMouseDown={(e) => !readOnly && handleSessionDragStart(e, session)}
                    onTouchStart={(e) => !readOnly && handleSessionDragStart(e, session)}
                    onMouseUp={handlePressEnd}
                    onTouchEnd={handlePressEnd}
                    onTouchMove={handlePressMove}
                    onMouseLeave={handlePressEnd}
                    onClick={(e) => {
                      if (!isDragging && !longPressTriggered.current && !readOnly) {
                        e.stopPropagation();
                        onSessionClick(session);
                      }
                    }}
                  >
                    <div className="chip-header">
                      <span className="chip-subject">{subject?.name}</span>
                      {!readOnly && !session.completed && (
                        <button
                          className={`alarm-btn ${hasAlarm ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleAlarm(session.id);
                          }}
                        >
                          {hasAlarm ? '🔔' : '🔕'}
                        </button>
                      )}
                    </div>
                    {showTask && <span className="chip-task">{task?.description}</span>}
                    {showStats && (
                      <div className="chip-stats">
                        <span className={`chip-time-diff ${timeDiffPercent < 0 ? 'faster' : timeDiffPercent > 0 ? 'slower' : ''}`}>
                          {timeDiffPercent !== 0 && (
                            <>{timeDiffPercent < 0 ? '⚡' : '🐢'} {Math.abs(timeDiffPercent)}%</>
                          )}
                        </span>
                        {session.knowledgeRating && (
                          <span className={`chip-rating rating-${session.knowledgeRating >= 7 ? 'good' : session.knowledgeRating >= 5 ? 'ok' : 'low'}`}>
                            {session.knowledgeRating}/10
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Drag ghost */}
      {isDragging && dragItem && (
        <div
          className="drag-ghost"
          style={{
            left: dragPosition.x - 40,
            top: dragPosition.y - 15,
            backgroundColor: getDragSubject()?.color || '#666',
          }}
        >
          <span>{getDragSubject()?.name}</span>
          <small>{getDragTask()?.description}</small>
        </div>
      )}

      {/* Day detail modal */}
      {selectedDay && (
        <div className="day-detail-overlay" onClick={() => setSelectedDay(null)}>
          <div className="day-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="day-detail-header">
              <h3>{new Date(selectedDay).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              <button className="close-btn" onClick={() => setSelectedDay(null)}>&times;</button>
            </div>
            <div className="day-detail-content">
              {getSessionsForDate(new Date(selectedDay)).length === 0 ? (
                <p className="no-sessions">Geen taken gepland voor deze dag.</p>
              ) : (
                getSessionsForDate(new Date(selectedDay))
                  .sort((a, b) => (a.hour || 0) - (b.hour || 0))
                  .map(session => {
                    const subject = getSubject(session.subjectId);
                    const task = getTask(session.subjectId, session.taskId);
                    return (
                      <div
                        key={session.id}
                        className={`day-detail-session ${session.completed ? 'completed' : ''}`}
                        style={{ borderLeftColor: subject?.color }}
                        onClick={() => {
                          if (!readOnly) {
                            setSelectedDay(null);
                            onSessionClick(session);
                          }
                        }}
                      >
                        <div className="session-time">{session.hour}:00</div>
                        <div className="session-info">
                          <span className="session-subject" style={{ color: subject?.color }}>{subject?.name}</span>
                          <span className="session-task">{task?.description}</span>
                          <span className="session-duration">{session.minutesPlanned} min</span>
                        </div>
                        {session.completed && (
                          <span className="session-done">✓</span>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
