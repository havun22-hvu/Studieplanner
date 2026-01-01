import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

type PushStatus = 'unsupported' | 'denied' | 'prompt' | 'subscribed' | 'error';

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('prompt');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if push is supported
  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

  // Check current permission and subscription status
  useEffect(() => {
    if (!isSupported) {
      setStatus('unsupported');
      return;
    }

    const checkStatus = async () => {
      const permission = Notification.permission;

      if (permission === 'denied') {
        setStatus('denied');
        return;
      }

      if (permission === 'granted') {
        // Check if we have an active subscription
        try {
          const registration = await navigator.serviceWorker.getRegistration('/push-sw.js');
          if (registration) {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
              setStatus('subscribed');
              return;
            }
          }
        } catch (e) {
          console.log('Error checking subscription:', e);
        }
      }

      setStatus('prompt');
    };

    checkStatus();
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications worden niet ondersteund op dit apparaat');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission === 'denied') {
        setStatus('denied');
        setError('Notificaties zijn geblokkeerd. Schakel ze in via je browserinstellingen.');
        return false;
      }

      if (permission !== 'granted') {
        setError('Notificatie toestemming is vereist');
        return false;
      }

      // Register the push service worker
      const registration = await navigator.serviceWorker.register('/push-sw.js', {
        scope: '/'
      });

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;

      // Get VAPID public key from server
      const { publicKey } = await api.getVapidPublicKey();

      // Convert VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Send subscription to server
      const subscriptionJson = subscription.toJSON();
      await api.subscribePush(subscriptionJson);

      setStatus('subscribed');
      return true;
    } catch (e) {
      console.error('Push subscription error:', e);
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Kon push notificaties niet inschakelen');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.getRegistration('/push-sw.js');
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          // Unsubscribe from push manager
          await subscription.unsubscribe();

          // Remove from server
          await api.unsubscribePush(subscription.endpoint);
        }
      }

      setStatus('prompt');
      return true;
    } catch (e) {
      console.error('Push unsubscribe error:', e);
      setError(e instanceof Error ? e.message : 'Kon push notificaties niet uitschakelen');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    status,
    isSupported,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  };
}

// Helper function to convert VAPID key to ArrayBuffer for PushManager
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray.buffer;
}
