import type { Route } from "./+types/route";
import { Outlet, useSubmit } from "react-router";
import { getNestjsSessionMaxAge } from "~/sessions/auth-session";
import { SESSION_TIMEOUT } from "~/sessions/auth-timeout-session";
import { useSessionTimeout } from "~/hooks/use-session-timeout";

export async function loader({ request }: Route.LoaderArgs) {
  const redirectTo = new URLSearchParams([
    ["redirect", new URL(request.url).pathname],
  ]).toString();

  return {
    sessionMaxAge: await getNestjsSessionMaxAge(request),
    sessionTimeoutKey: SESSION_TIMEOUT,
    redirectTo,
  };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { sessionMaxAge, sessionTimeoutKey, redirectTo } = loaderData;
  const submit = useSubmit();

  useSessionTimeout(sessionMaxAge, () => {
    return submit(
      { [sessionTimeoutKey]: sessionTimeoutKey, redirectTo },
      { method: "POST", action: "/auth/logout" },
    );
  });

  return (
    <>
      <Outlet />
    </>
  );
}
