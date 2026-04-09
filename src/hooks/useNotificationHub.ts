import { useEffect, useRef } from 'react';
import { getToken } from '../utils/tokenStorage';
import {
  startNotificationConnection,
  stopNotificationConnection,
} from '../realtime/notificationClient';

/**
 * Hook that manages the SignalR notification hub lifecycle.
 *
 * Call this once at the root of the application. It starts the connection
 * when the component mounts (if a JWT is present) and stops it on unmount
 * or when the token is removed. Subsequent renders that find the connection
 * already running are ignored, preventing duplicate connections.
 */
export function useNotificationHub() {
  const connected = useRef(false);

  useEffect(() => {
    let stopped = false;

    async function connect() {
      const token = await getToken();
      if (!token || stopped) {
        return;
      }
      try {
        await startNotificationConnection();
        if (!stopped) {
          connected.current = true;
        }
      } catch {
        // connection failure is logged inside startNotificationConnection
      }
    }

    connect();

    return () => {
      stopped = true;
      if (connected.current) {
        connected.current = false;
        stopNotificationConnection();
      }
    };
  }, []);
}
