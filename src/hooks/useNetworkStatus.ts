import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isReconnecting: boolean;
  wasOffline: boolean;
  lastOnlineAt: Date | null;
  checkConnection: () => Promise<boolean>;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(new Date());

  const checkConnection = async (): Promise<boolean> => {
    setIsReconnecting(true);
    try {
      // Ping health check with short timeout to detect unstable conditions
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch('/health', { 
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const online = res.status === 200;
      setIsOnline(online);
      if (online) {
        setLastOnlineAt(new Date());
      }
      return online;
    } catch {
      setIsOnline(false);
      setWasOffline(true);
      return false;
    } finally {
      setIsReconnecting(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      setLastOnlineAt(new Date());
      // Re-validate with health endpoint
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic heartbeat check for flaky/unstable networks (every 45s)
    const interval = setInterval(() => {
      checkConnection();
    }, 45000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    isReconnecting,
    wasOffline,
    lastOnlineAt,
    checkConnection
  };
}
