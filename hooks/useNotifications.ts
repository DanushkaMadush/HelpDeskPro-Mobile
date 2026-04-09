import {
    startSignalRConnection,
    stopSignalRConnection,
} from "@/src/services/signalrServices";
import { useEffect } from "react";
import Toast from "react-native-toast-message";

export const useNotifications = () => {
  useEffect(() => {
    startSignalRConnection((notification) => {
      Toast.show({
        type: "success",
        text1: notification.title || "New Notification",
        text2: notification.message || "",
      });
    });

    return () => {
      stopSignalRConnection();
    };
  }, []);
};
