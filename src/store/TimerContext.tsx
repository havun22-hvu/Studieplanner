import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { api } from '@/services/api';
import { storage } from '@/services/storage';
import { useAuth } from './AuthContext';
import { useSessions } from './SessionsContext';
import type { TimerState, PlannedSession } from '@/types';

interface TimerContextType {
  timerState: TimerState;
  activeSession: PlannedSession | null;
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  startTimer: (session: PlannedSession) => Promise<void>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => Promise<{
    minutesActual: number;
    session: PlannedSession;
  }>;
  resetTimer: () => void;
}

const initialTimerState: TimerState = {
  isRunning: false,
  isPaused: false,
  sessionId: null,
  startTime: null,
  pausedAt: null,
  totalPausedMs: 0,
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { sessions, updateSession } = useSessions();
  const [timerState, setTimerState] = useState<TimerState>(initialTimerState);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get active session from sessions list
  const activeSession = timerState.sessionId
    ? sessions.find(s => s.id === timerState.sessionId) || null
    : null;

  // Load timer state on mount
  useEffect(() => {
    async function loadTimerState() {
      const savedState = await storage.getTimerState();
      if (savedState && savedState.isRunning) {
        setTimerState(savedState);
      }
    }
    loadTimerState();
  }, []);

  // Calculate elapsed time
  const calculateElapsed = useCallback(() => {
    if (!timerState.startTime) return 0;

    const now = timerState.isPaused && timerState.pausedAt
      ? timerState.pausedAt
      : Date.now();

    const elapsed = now - timerState.startTime - timerState.totalPausedMs;
    return Math.floor(elapsed / 1000);
  }, [timerState]);

  // Update elapsed seconds every second when running
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      setElapsedSeconds(calculateElapsed());

      intervalRef.current = setInterval(() => {
        setElapsedSeconds(calculateElapsed());
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setElapsedSeconds(calculateElapsed());
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.isPaused, calculateElapsed]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && timerState.isRunning) {
        // Recalculate elapsed time when app comes back to foreground
        setElapsedSeconds(calculateElapsed());
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [timerState.isRunning, calculateElapsed]);

  // Save timer state changes
  useEffect(() => {
    if (timerState.isRunning) {
      storage.setTimerState(timerState);
    } else {
      storage.removeTimerState();
    }
  }, [timerState]);

  const startTimer = useCallback(async (session: PlannedSession) => {
    const newState: TimerState = {
      isRunning: true,
      isPaused: false,
      sessionId: session.id,
      startTime: Date.now(),
      pausedAt: null,
      totalPausedMs: 0,
    };

    setTimerState(newState);

    // Notify server
    if (isAuthenticated) {
      try {
        await api.startSession(session.id);
      } catch (error) {
        console.error('Error starting session on server:', error);
      }
    }

    // Update session with startedAt
    await updateSession(session.id, { startedAt: new Date().toISOString() });
  }, [isAuthenticated, updateSession]);

  const pauseTimer = useCallback(() => {
    if (!timerState.isRunning || timerState.isPaused) return;

    setTimerState(prev => ({
      ...prev,
      isPaused: true,
      pausedAt: Date.now(),
    }));
  }, [timerState.isRunning, timerState.isPaused]);

  const resumeTimer = useCallback(() => {
    if (!timerState.isRunning || !timerState.isPaused || !timerState.pausedAt) return;

    const pauseDuration = Date.now() - timerState.pausedAt;

    setTimerState(prev => ({
      ...prev,
      isPaused: false,
      pausedAt: null,
      totalPausedMs: prev.totalPausedMs + pauseDuration,
    }));
  }, [timerState.isRunning, timerState.isPaused, timerState.pausedAt]);

  const stopTimer = useCallback(async (): Promise<{
    minutesActual: number;
    session: PlannedSession;
  }> => {
    const minutesActual = Math.ceil(elapsedSeconds / 60);
    const session = activeSession!;

    // Reset timer state
    setTimerState(initialTimerState);
    setElapsedSeconds(0);

    // Update session with stoppedAt
    await updateSession(session.id, { stoppedAt: new Date().toISOString() });

    return { minutesActual, session };
  }, [elapsedSeconds, activeSession, updateSession]);

  const resetTimer = useCallback(() => {
    setTimerState(initialTimerState);
    setElapsedSeconds(0);
  }, []);

  return (
    <TimerContext.Provider
      value={{
        timerState,
        activeSession,
        elapsedSeconds,
        isRunning: timerState.isRunning,
        isPaused: timerState.isPaused,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        resetTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
