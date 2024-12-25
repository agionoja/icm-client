import { useLocation } from "react-router";

export function useIsActive(url: string) {
  const location = useLocation();
  console.log(location, { url });
  return location.pathname === url;
}
