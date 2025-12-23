import { useState, useEffect, useRef, useCallback } from 'react';
import type { PlannedSession, Subject, StudyTask } from '../types';

interface Props {
  session: PlannedSession;
  subject: Subject | undefined;
  task: StudyTask | undefined;
  onComplete: (minutesSpent: number) => void;
  onCancel: () => void;
}

const STORAGE_KEY = 'studieplanner-active-timer';
const CHECK_INTERVAL_MINUTES = 15;

interface TimerState {
  sessionId: string;
  startTime: number;
  pausedAt: number | null;
  totalPausedMs: number;
  lastCheckMinute: number;
}

// Play a notification sound
function playSound(type: 'beep' | 'complete' = 'beep') {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'complete') {
      // Longer, more noticeable sound for completion
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => {
        oscillator.frequency.value = 1100;
      }, 150);
      setTimeout(() => {
        oscillator.frequency.value = 1320;
      }, 300);
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 500);
    } else {
      // Short beep for check-in
      oscillator.frequency.value = 660;
      gainNode.gain.value = 0.2;
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 150);
    }
  } catch (e) {
    console.log('Audio not available:', e);
  }
}

export function StudyTimer({ session, subject, task, onComplete, onCancel }: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [timeUpNotified, setTimeUpNotified] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalPausedMsRef = useRef<number>(0);
  const lastCheckMinuteRef = useRef<number>(0);

  const plannedSeconds = session.minutesPlanned * 60;
  const progress = Math.min((elapsedSeconds / plannedSeconds) * 100, 100);

  // Save timer state to localStorage
  const saveTimerState = useCallback((pausedAt: number | null = null) => {
    const state: TimerState = {
      sessionId: session.id,
      startTime: startTimeRef.current,
      pausedAt,
      totalPausedMs: totalPausedMsRef.current,
      lastCheckMinute: lastCheckMinuteRef.current,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [session.id]);

  // Clear timer state from localStorage
  const clearTimerState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Restore timer state on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const state: TimerState = JSON.parse(savedState);
        if (state.sessionId === session.id) {
          startTimeRef.current = state.startTime;
          totalPausedMsRef.current = state.totalPausedMs;
          lastCheckMinuteRef.current = state.lastCheckMinute;

          if (state.pausedAt) {
            // Was paused - calculate elapsed up to pause
            const elapsed = Math.floor((state.pausedAt - state.startTime - state.totalPausedMs) / 1000);
            setElapsedSeconds(elapsed);
            setIsPaused(true);
            setIsRunning(true);
          } else {
            // Was running - calculate current elapsed
            const now = Date.now();
            const elapsed = Math.floor((now - state.startTime - state.totalPausedMs) / 1000);
            setElapsedSeconds(elapsed);
            setIsRunning(true);

            // Restart the interval
            intervalRef.current = window.setInterval(() => {
              const newElapsed = Math.floor((Date.now() - startTimeRef.current - totalPausedMsRef.current) / 1000);
              setElapsedSeconds(newElapsed);
            }, 1000);
          }
        }
      } catch (e) {
        console.log('Failed to restore timer state:', e);
        clearTimerState();
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session.id, clearTimerState]);

  // Handle visibility change (app goes to background/foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning && !isPaused) {
        // Recalculate elapsed time when coming back
        const elapsed = Math.floor((Date.now() - startTimeRef.current - totalPausedMsRef.current) / 1000);
        setElapsedSeconds(elapsed);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, isPaused]);

  // Check for 15-minute intervals and time-up notification
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const currentMinute = Math.floor(elapsedSeconds / 60);

    // Check every 15 minutes
    if (currentMinute > 0 &&
        currentMinute % CHECK_INTERVAL_MINUTES === 0 &&
        currentMinute !== lastCheckMinuteRef.current) {
      lastCheckMinuteRef.current = currentMinute;
      saveTimerState();
      playSound('beep');
      setShowCheckIn(true);
    }

    // Notify when time is up
    if (elapsedSeconds >= plannedSeconds && !timeUpNotified) {
      setTimeUpNotified(true);
      playSound('complete');

      // Show browser notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Tijd is om!', {
          body: `${subject?.name}: ${task?.description} - Je geplande tijd is voorbij`,
          icon: '/icon-192.png',
        });
      }
    }
  }, [elapsedSeconds, isRunning, isPaused, plannedSeconds, timeUpNotified, subject, task, saveTimerState]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    totalPausedMsRef.current = 0;
    lastCheckMinuteRef.current = 0;

    saveTimerState();

    intervalRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current - totalPausedMsRef.current) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);
  };

  const handlePause = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    saveTimerState(Date.now());
  };

  const handleResume = () => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const state: TimerState = JSON.parse(savedState);
      if (state.pausedAt) {
        totalPausedMsRef.current += Date.now() - state.pausedAt;
      }
    }

    setIsPaused(false);
    saveTimerState();

    intervalRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current - totalPausedMsRef.current) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);
  };

  const handleStop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    clearTimerState();

    const minutesSpent = Math.ceil(elapsedSeconds / 60);
    onComplete(minutesSpent);
  };

  const handleCheckInConfirm = () => {
    setShowCheckIn(false);
  };

  const handleCancel = () => {
    clearTimerState();
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPlannedTime = (minutes: number) => {
    if (minutes >= 60) {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hrs}u ${mins}m` : `${hrs} uur`;
    }
    return `${minutes} min`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content timer-modal">
        <div className="timer-header" style={{ borderColor: subject?.color }}>
          <h2>{subject?.name}</h2>
          <p>{task?.description}</p>
          <span className="timer-planned">Gepland: {formatPlannedTime(session.minutesPlanned)}</span>
        </div>

        <div className="timer-display">
          <svg className="timer-circle" viewBox="0 0 100 100">
            <circle
              className="timer-bg"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
            />
            <circle
              className="timer-progress"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={subject?.color || '#4f46e5'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.83} 283`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="timer-time">
            <span className="timer-elapsed">{formatTime(elapsedSeconds)}</span>
            {elapsedSeconds > plannedSeconds && (
              <span className="timer-overtime">+{formatTime(elapsedSeconds - plannedSeconds)}</span>
            )}
          </div>
        </div>

        <div className="timer-controls">
          {!isRunning ? (
            <>
              <button className="btn-secondary" onClick={handleCancel}>
                Annuleren
              </button>
              <button className="btn-start" onClick={handleStart}>
                ▶ Start
              </button>
            </>
          ) : (
            <>
              {isPaused ? (
                <button className="btn-resume" onClick={handleResume}>
                  ▶ Hervat
                </button>
              ) : (
                <button className="btn-pause" onClick={handlePause}>
                  ⏸ Pauze
                </button>
              )}
              <button className="btn-stop" onClick={handleStop}>
                ⏹ Stop
              </button>
            </>
          )}
        </div>

        {isRunning && !showCheckIn && (
          <p className="timer-tip">
            Blijf gefocust! Je kunt de app minimaliseren - de timer loopt door.
          </p>
        )}

        {elapsedSeconds >= plannedSeconds && (
          <p className="timer-overtime-notice">
            Je geplande tijd is voorbij! Neem gerust de tijd om af te ronden.
          </p>
        )}
      </div>

      {/* Check-in modal */}
      {showCheckIn && (
        <div className="checkin-overlay">
          <div className="checkin-modal">
            <h3>Studeer je nog?</h3>
            <p>Je bent al {Math.floor(elapsedSeconds / 60)} minuten bezig.</p>
            <button className="btn-primary" onClick={handleCheckInConfirm}>
              Ja, ik studeer nog!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
