import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';
import Toast from 'react-native-toast-message';
import { API_CONFIG } from '../api/config';
import { getToken } from '../utils/tokenStorage';

export type NotificationMessage = {
  title: string;
  message: string;
  systemId?: number | string;
};

let connection: HubConnection | null = null;
let isConnecting = false;

function createConnection(): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(API_CONFIG.HUB_URL, {
      accessTokenFactory: () => getToken().then((t) => t ?? ''),
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();
}

export async function startNotificationConnection(): Promise<void> {
  if (isConnecting || (connection && connection.state !== 'Disconnected')) {
    return;
  }

  isConnecting = true;
  connection = createConnection();

  connection.on('ReceiveNotification', (payload: NotificationMessage) => {
    Toast.show({
      type: 'info',
      text1: payload.title,
      text2: payload.message,
      position: 'top',
      visibilityTime: 5000,
    });
  });

  try {
    await connection.start();
  } catch (err) {
    console.warn('[SignalR] Failed to connect:', err);
  } finally {
    isConnecting = false;
  }
}

export async function stopNotificationConnection(): Promise<void> {
  if (!connection) {
    isConnecting = false;
    return;
  }

  try {
    await connection.stop();
  } catch (err) {
    console.warn('[SignalR] Failed to stop connection:', err);
  } finally {
    connection = null;
    isConnecting = false;
  }
}
