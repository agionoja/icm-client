import type { Route } from "./+types/route";
import { Outlet, redirect, useNavigation, useSubmit } from "react-router";
import { getJwtMaxAgeInMs, requireUser } from "~/session";
import { useSessionTimeout } from "~/hooks/use-session-timeout";
import { SESSION_TIMEOUT_KEY } from "~/toast/timeout-toast";
import { getUserDataCookie, setUserDataCookie } from "~/cookies/user-cookie";
import { authRouteConfig } from "~/routes.config";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import React from "react";
import { AppSidebar } from "~/routes/account/components/app-sidebar";
import { cn } from "~/lib/utils";

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
    user: {
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      email: user.email,
      photo: user.photo,
    },
  };
}

export default function AccountLayout({ loaderData }: Route.ComponentProps) {
  const { state } = useNavigation();
  const { sessionTimeout, sessionTimeoutKey, pathname, user } = loaderData;

  const submit = useSubmit();
  useSessionTimeout(sessionTimeout, () => {
    const formData = new FormData();
    formData.append("_action", sessionTimeoutKey);
    formData.append(
      "redirectTo",
      authRouteConfig.login.generate({}, { redirect: pathname }),
    );

    return submit(formData, {
      method: "POST",
      action: authRouteConfig.logout.getPath,
    });
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
        <AppSidebar user={user} collapsible={"icon"} />
        <main
          className={cn(
            "w-full bg-account-bg",
            state === "loading" ? "animate-pulse opacity-30" : "",
          )}
        >
          <SidebarTrigger variant={"link"} />
          <Outlet />
        </main>
      </SidebarProvider>
    </>
  );
}
