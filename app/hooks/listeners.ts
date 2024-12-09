import { useEffect, useState } from "react";

type ListenerArgs = {
  cb?: (isOnline: boolean) => void;
};

export function useOnline({ cb }: ListenerArgs = {}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = (status: boolean) => {
      setIsOnline(status);
      if (cb) cb(status);
    };

    const handleOnline = () => updateOnlineStatus(true);
    const handleOffline = () => updateOnlineStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [cb]);

  return { isOnline };
}
