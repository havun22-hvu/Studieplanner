import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { SubjectsProvider, useSubjects } from './SubjectsContext';
import { SessionsProvider, useSessions } from './SessionsContext';
import { TimerProvider, useTimer } from './TimerContext';

// Re-export hooks
export { useAuth, useSubjects, useSessions, useTimer };

// Combined provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SubjectsProvider>
        <SessionsProvider>
          <TimerProvider>
            {children}
          </TimerProvider>
        </SessionsProvider>
      </SubjectsProvider>
    </AuthProvider>
  );
}
