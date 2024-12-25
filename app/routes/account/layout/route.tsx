import type { Route } from "./+types/route";
import { Role } from "icm-shared";
import { Outlet, redirect, useSubmit } from "react-router";
import { getJwtMaxAgeInMs, requireUser } from "~/session";
import { useSessionTimeout } from "~/hooks/use-session-timeout";
import { SESSION_TIMEOUT_KEY } from "~/toast/timeout-toast";
import { getUserDataCookie, setUserDataCookie } from "~/cookies/user-cookie";
import { authRouteConfig } from "~/routes.config";
import { AdminSidebar } from "~/routes/account/components/admin-sidebar";
import { UserSidebar } from "~/routes/account/components/user-sidebar";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import React from "react";
import { AppSidebar } from "~/routes/account/components/app-sidebar";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const cookieUser = await getUserDataCookie(request);
  const isModified = !(JSON.stringify(user) === JSON.stringify(cookieUser));

  if (!cookieUser || isModified) {
    const cookie = await setUserDataCookie(user, request);
    throw redirect(request.url, { headers: { "Set-Cookie": cookie } });
  }

  const sessionTimeout = await getJwtMaxAgeInMs(request);

  return {
    sessionTimeout,
    pathname: new URL(request.url).pathname,
    sessionTimeoutKey: SESSION_TIMEOUT_KEY,
    user: { firstname: user.firstname, role: user.role },
  };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { sessionTimeout, sessionTimeoutKey, pathname, user } = loaderData;
  const submit = useSubmit();

  useSessionTimeout(sessionTimeout, () => {
    return submit(
      {
        [sessionTimeoutKey]: sessionTimeoutKey,
        redirectTo: authRouteConfig.login.generate({}, { redirect: pathname }),
      },
      { method: "POST", action: authRouteConfig.logout.getPath },
    );
  });

  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "20rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar role={user.role} collapsible={"icon"} />
        <main className={"bg-account-bg w-full"}>
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
    </>
  );
}
