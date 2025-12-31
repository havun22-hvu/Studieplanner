import { useEffect, useRef, useState, useCallback } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher globally available for Laravel Echo
// @ts-expect-error Pusher needs to be globally available
window.Pusher = Pusher;

interface SessionEvent {
  type: 'started' | 'stopped' | 'completed';
  student_id: number;
  student_name: string;
  subject_name: string | null;
  task_description: string | null;
  minutes_planned: number | null;
  minutes_actual: number | null;
  started_at: string | null;
  stopped_at: string | null;
  timestamp: string;
}

interface LiveSessionData {
  id: string;
  subjectName: string;
  taskDescription: string;
  startedAt: string;
  minutesPlanned: number;
}

interface UseLiveSessionOptions {
  studentIds: number[];
  onSessionStart?: (event: SessionEvent) => void;
  onSessionStop?: (event: SessionEvent) => void;
  enabled?: boolean;
}

const HAVUNCORE_URL = import.meta.env.VITE_HAVUNCORE_URL || 'http://localhost:8080';
const REVERB_APP_KEY = import.meta.env.VITE_REVERB_APP_KEY || 'studieplanner';

export function useLiveSession({
  studentIds,
  onSessionStart,
  onSessionStop,
  enabled = true,
}: UseLiveSessionOptions) {
  const echoRef = useRef<Echo | null>(null);
  const [connected, setConnected] = useState(false);
  const [activeSession, setActiveSession] = useState<LiveSessionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize Echo connection
  const initializeEcho = useCallback(() => {
    if (echoRef.current) return;

    try {
      // Parse host and port from URL
      const url = new URL(HAVUNCORE_URL);

      echoRef.current = new Echo({
        broadcaster: 'reverb',
        key: REVERB_APP_KEY,
        wsHost: url.hostname,
        wsPort: url.port || (url.protocol === 'https:' ? 443 : 80),
        wssPort: url.port || (url.protocol === 'https:' ? 443 : 80),
        forceTLS: url.protocol === 'https:',
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
      });

      echoRef.current.connector.pusher.connection.bind('connected', () => {
        console.log('[LiveSession] WebSocket connected');
        setConnected(true);
        setError(null);
      });

      echoRef.current.connector.pusher.connection.bind('disconnected', () => {
        console.log('[LiveSession] WebSocket disconnected');
        setConnected(false);
      });

      echoRef.current.connector.pusher.connection.bind('error', (err: unknown) => {
        console.error('[LiveSession] WebSocket error:', err);
        setError('Verbindingsfout');
      });

    } catch (err) {
      console.error('[LiveSession] Failed to initialize Echo:', err);
      setError('Kon geen verbinding maken');
    }
  }, []);

  // Subscribe to student channels
  useEffect(() => {
    if (!enabled || studentIds.length === 0) return;

    initializeEcho();

    if (!echoRef.current) return;

    const subscriptions: string[] = [];

    studentIds.forEach(studentId => {
      const channelName = `student.${studentId}`;

      echoRef.current!
        .private(channelName)
        .listen('.session.updated', (event: SessionEvent) => {
          console.log('[LiveSession] Event received:', event);

          if (event.type === 'started') {
            setActiveSession({
              id: `${event.student_id}-${event.timestamp}`,
              subjectName: event.subject_name || 'Onbekend',
              taskDescription: event.task_description || '',
              startedAt: event.started_at || event.timestamp,
              minutesPlanned: event.minutes_planned || 0,
            });
            onSessionStart?.(event);
          } else if (event.type === 'stopped' || event.type === 'completed') {
            setActiveSession(null);
            onSessionStop?.(event);
          }
        });

      subscriptions.push(channelName);
    });

    return () => {
      // Unsubscribe from all channels
      subscriptions.forEach(channel => {
        echoRef.current?.leave(channel);
      });
    };
  }, [enabled, studentIds, initializeEcho, onSessionStart, onSessionStop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (echoRef.current) {
        echoRef.current.disconnect();
        echoRef.current = null;
      }
    };
  }, []);

  return {
    connected,
    activeSession,
    error,
  };
}
