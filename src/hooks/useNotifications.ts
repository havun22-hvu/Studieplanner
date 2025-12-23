import { useEffect, useCallback, useState } from 'react';
import type { Settings } from '../types';

const LAST_REMINDER_KEY = 'studieplanner_last_reminder';

export function useNotifications(settings: Settings) {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  // Show notification
  const showNotification = useCallback((title: string, body: string) => {
    if (permission !== 'granted') return;

    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'studieplanner-reminder',
    });
  }, [permission]);

  // Check and show daily reminder
  const checkDailyReminder = useCallback(() => {
    if (!settings.reminderEnabled || !settings.reminderTime) return;
    if (permission !== 'granted') return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const lastReminder = localStorage.getItem(LAST_REMINDER_KEY);

    // Already reminded today
    if (lastReminder === today) return;

    // Check if it's time for reminder
    const [hours, minutes] = settings.reminderTime.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // If current time is past reminder time, show notification
    if (now >= reminderTime) {
      showNotification(
        'Tijd om te studeren! 📚',
        `Hey ${settings.studentName || 'student'}, vergeet niet je studiesessie vandaag!`
      );
      localStorage.setItem(LAST_REMINDER_KEY, today);
    }
  }, [settings, permission, showNotification]);

  // Schedule reminder check
  useEffect(() => {
    if (!settings.reminderEnabled || !settings.reminderTime) return;

    // Check immediately
    checkDailyReminder();

    // Check every minute
    const interval = setInterval(checkDailyReminder, 60000);

    return () => clearInterval(interval);
  }, [settings.reminderEnabled, settings.reminderTime, checkDailyReminder]);

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: 'Notification' in window,
  };
}
