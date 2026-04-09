import * as signalR from "@microsoft/signalr";
import { API_CONFIG } from "../api/config";
import { getToken } from "../utils/tokenStorage";

let connection: signalR.HubConnection | null = null;

export const startSignalRConnection = async (
  onReceive: (data: any) => void,
) => {
  if (connection) return;

  const token = await getToken();

  if (!token) {
    console.log("No token found");
    return;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(API_CONFIG.WEBSOCKET_URL, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .build();

  // Listen to backend event
  connection.on("ReceiveNotification", (message) => {
    console.log("Notification received:", message);
    onReceive(message);
  });

  try {
    await connection.start();
    console.log("SignalR Connected");
  } catch (err) {
    console.log("SignalR Connection Error:", err);
  }
};

export const stopSignalRConnection = async () => {
  if (connection) {
    await connection.stop();
    connection = null;
  }
};
