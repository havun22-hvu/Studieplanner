import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAContextType {
  canInstall: boolean;
  isInstalled: boolean;
  install: () => Promise<void>;
  needsUpdate: boolean;
  checkForUpdate: () => Promise<void>;
  updateApp: () => void;
  lastUpdateCheck: Date | null;
}

const PWAContext = createContext<PWAContextType | null>(null);

export function PWAProvider({ children }: { children: ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [lastUpdateCheck, setLastUpdateCheck] = useState<Date | null>(null);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const {
    needRefresh: [needsUpdate],
    updateServiceWorker,
  } = useRegisterSW({
    // Force immediate update on registration
    immediate: true,
    onRegisteredSW(_swUrl, r) {
      if (r) {
        setSwRegistration(r);
        // Check for updates immediately on load
        r.update();
        setLastUpdateCheck(new Date());
        // Then check every 5 minutes
        setInterval(() => {
          r.update();
          setLastUpdateCheck(new Date());
        }, 5 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  // Auto-update: apply update IMMEDIATELY when available (no delay)
  useEffect(() => {
    if (needsUpdate) {
      console.log('Update available, applying immediately...');
      updateServiceWorker(true);
    }
  }, [needsUpdate, updateServiceWorker]);

  // Check for updates when app gets focus (user opens/switches to app)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && swRegistration) {
        console.log('App visible, checking for updates...');
        swRegistration.update();
        setLastUpdateCheck(new Date());
      }
    };

    const handleFocus = () => {
      if (swRegistration) {
        console.log('App focused, checking for updates...');
        swRegistration.update();
        setLastUpdateCheck(new Date());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [swRegistration]);

  // Check if already installed
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  }, [installPrompt]);

  const checkForUpdate = useCallback(async () => {
    if (swRegistration) {
      await swRegistration.update();
      setLastUpdateCheck(new Date());
    }
  }, [swRegistration]);

  const updateApp = useCallback(() => {
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  return (
    <PWAContext.Provider value={{
      canInstall: !!installPrompt && !isInstalled,
      isInstalled,
      install,
      needsUpdate,
      checkForUpdate,
      updateApp,
      lastUpdateCheck,
    }}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
}
