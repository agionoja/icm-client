import { useEffect } from "react";

export function useSessionTimeout(
  sessionMaxAge: number,
  onTimeout: () => void,
) {
  useEffect(() => {
    if (sessionMaxAge > 0) {
      const timeoutId = setTimeout(onTimeout, sessionMaxAge);
      return () => clearTimeout(timeoutId);
    }
  }, [sessionMaxAge, onTimeout]);
}
