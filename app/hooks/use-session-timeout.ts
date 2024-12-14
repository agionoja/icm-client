import { useEffect } from "react";

export function useSessionTimeout(
  sessionMaxAge: number,
  onTimeout: () => void,
) {
  useEffect(() => {
    const timeoutId = setTimeout(onTimeout, sessionMaxAge);
    return () => clearTimeout(timeoutId);
  }, [sessionMaxAge, onTimeout]);
}
