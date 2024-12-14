import type { Route } from "./+types/route";
import { data, Outlet, useSubmit } from "react-router";
import { getNestjsSessionMaxAge, requireUser } from "~/session";
import { useSessionTimeout } from "~/hooks/use-session-timeout";
import { SESSION_TIMEOUT_KEY } from "~/toast/timeout-toast";
import { setUserCookie } from "~/cookies/user-cookie";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const userCookie = await setUserCookie(user, request);

  const redirectTo = new URLSearchParams([
    ["redirect", new URL(request.url).pathname],
  ]).toString();

  return data(
    {
      sessionMaxAge: await getNestjsSessionMaxAge(request),
      sessionTimeoutKey: SESSION_TIMEOUT_KEY,
      redirectTo,
    },
    {
      headers: {
        "Set-Cookie": userCookie,
      },
    },
  );
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
