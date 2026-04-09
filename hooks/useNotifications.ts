import {
  startSignalRConnection,
  stopSignalRConnection,
} from "@/src/services/signalrServices";
import { useCallback, useEffect } from "react";
import Toast from "react-native-toast-message";

export const useNotifications = () => {
  const handleNotification = useCallback((notification: any) => {
    console.log("Toast trigger:", notification);

    Toast.show({
      type: "success",
      text1: notification.title || "New Notification",
      text2: notification.message || "",
    });
  }, []);

  useEffect(() => {
    startSignalRConnection(handleNotification);

    return () => {
      stopSignalRConnection();
    };
  }, [handleNotification]);
};
