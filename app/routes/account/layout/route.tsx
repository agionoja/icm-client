import type { Route } from "./+types/route";
import { Outlet, useSubmit } from "react-router";
import { getNestjsSessionMaxAgeInMs, requireUser } from "~/session";
import { useSessionTimeout } from "~/hooks/use-session-timeout";
import { SESSION_TIMEOUT_KEY } from "~/toast/timeout-toast";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);
  const sessionMaxAge = await getNestjsSessionMaxAgeInMs(request);

  const redirectTo = new URLSearchParams([
    ["redirect", new URL(request.url).pathname],
  ]).toString();

  return {
    sessionMaxAge,
    redirectTo,
    sessionTimeoutKey: SESSION_TIMEOUT_KEY,
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
