import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks } from 'date-fns';
import { api } from '@/services/api';
import { storage } from '@/services/storage';
import { useAuth } from './AuthContext';
import type { PlannedSession } from '@/types';

interface SessionsContextType {
  sessions: PlannedSession[];
  selectedWeek: Date;
  isLoading: boolean;
  addSession: (data: Omit<PlannedSession, 'id' | 'completed'>) => Promise<PlannedSession>;
  updateSession: (id: string, data: Partial<PlannedSession>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  moveSession: (id: string, date: string, hour: number | null) => Promise<void>;
  getSessionsForWeek: (weekStart: Date) => PlannedSession[];
  getShelfSessions: () => PlannedSession[];
  setSelectedWeek: (date: Date) => void;
  nextWeek: () => void;
  prevWeek: () => void;
  refreshSessions: () => Promise<void>;
}

const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

export function SessionsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<PlannedSession[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions on mount
  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true);
      try {
        const localSessions = await storage.getSessions();
        if (localSessions.length > 0) {
          setSessions(localSessions);
        }

        if (isAuthenticated) {
          try {
            const serverSessions = await api.getSessions();
            setSessions(serverSessions);
            await storage.setSessions(serverSessions);
          } catch (error) {
            console.error('Error fetching sessions from server:', error);
          }
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSessions();
  }, [isAuthenticated]);

  const saveSessions = useCallback(async (newSessions: PlannedSession[]) => {
    setSessions(newSessions);
    await storage.setSessions(newSessions);
  }, []);

  const addSession = useCallback(async (
    data: Omit<PlannedSession, 'id' | 'completed'>
  ): Promise<PlannedSession> => {
    const newSession: PlannedSession = {
      ...data,
      id: uuidv4(),
      completed: false,
    };

    const newSessions = [...sessions, newSession];
    await saveSessions(newSessions);

    if (isAuthenticated) {
      try {
        const serverSession = await api.createSession(data);
        const updatedSessions = newSessions.map(s =>
          s.id === newSession.id ? { ...s, id: serverSession.id } : s
        );
        await saveSessions(updatedSessions);
        return serverSession;
      } catch (error) {
        console.error('Error creating session on server:', error);
      }
    }

    return newSession;
  }, [sessions, isAuthenticated, saveSessions]);

  const updateSession = useCallback(async (id: string, data: Partial<PlannedSession>) => {
    const newSessions = sessions.map(s =>
      s.id === id ? { ...s, ...data } : s
    );
    await saveSessions(newSessions);

    if (isAuthenticated) {
      try {
        await api.updateSession(id, data);
      } catch (error) {
        console.error('Error updating session on server:', error);
      }
    }
  }, [sessions, isAuthenticated, saveSessions]);

  const deleteSession = useCallback(async (id: string) => {
    const newSessions = sessions.filter(s => s.id !== id);
    await saveSessions(newSessions);

    if (isAuthenticated) {
      try {
        await api.deleteSession(id);
      } catch (error) {
        console.error('Error deleting session on server:', error);
      }
    }
  }, [sessions, isAuthenticated, saveSessions]);

  const moveSession = useCallback(async (id: string, date: string, hour: number | null) => {
    await updateSession(id, { date, hour });
  }, [updateSession]);

  const getSessionsForWeek = useCallback((weekStart: Date): PlannedSession[] => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const startStr = format(weekStart, 'yyyy-MM-dd');
    const endStr = format(weekEnd, 'yyyy-MM-dd');

    return sessions.filter(s =>
      s.date >= startStr && s.date <= endStr && s.hour !== null
    );
  }, [sessions]);

  const getShelfSessions = useCallback((): PlannedSession[] => {
    return sessions.filter(s => s.hour === null);
  }, [sessions]);

  const nextWeek = useCallback(() => {
    setSelectedWeek(prev => addWeeks(prev, 1));
  }, []);

  const prevWeek = useCallback(() => {
    setSelectedWeek(prev => subWeeks(prev, 1));
  }, []);

  const refreshSessions = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const serverSessions = await api.getSessions();
      await saveSessions(serverSessions);
    } catch (error) {
      console.error('Error refreshing sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, saveSessions]);

  return (
    <SessionsContext.Provider
      value={{
        sessions,
        selectedWeek,
        isLoading,
        addSession,
        updateSession,
        deleteSession,
        moveSession,
        getSessionsForWeek,
        getShelfSessions,
        setSelectedWeek,
        nextWeek,
        prevWeek,
        refreshSessions,
      }}
    >
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const context = useContext(SessionsContext);
  if (context === undefined) {
    throw new Error('useSessions must be used within a SessionsProvider');
  }
  return context;
}
