import type { Route } from "./+types/route";
import { Outlet, redirect, useSubmit } from "react-router";
import { getNestjsSessionMaxAgeInMs, requireUser } from "~/session";
import { useSessionTimeout } from "~/hooks/use-session-timeout";
import { SESSION_TIMEOUT_KEY } from "~/toast/timeout-toast";
import { getUserDataCookie, setUserDataCookie } from "~/cookies/user-cookie";
import { authRouteConfig } from "~/routes.config";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);

  if (!(await getUserDataCookie(request))) {
    const cookie = await setUserDataCookie(user, request);
    throw redirect(request.url, { headers: { "Set-Cookie": cookie } });
  }

  const sessionTimeout = await getNestjsSessionMaxAgeInMs(request);

  return {
    sessionTimeout,
    pathname: new URL(request.url).pathname,
    sessionTimeoutKey: SESSION_TIMEOUT_KEY,
  };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { sessionTimeout, sessionTimeoutKey, pathname } = loaderData; // Destructure loader data
  const submit = useSubmit();

  useSessionTimeout(sessionTimeout, () => {
    return submit(
      {
        [sessionTimeoutKey]: sessionTimeoutKey,
        redirectTo: authRouteConfig.login.generate({}, { redirect: pathname }),
      },
      { method: "POST", action: authRouteConfig.logout.generate() },
    );
  });

  return (
    <>
      <Outlet />
    </>
  );
}
