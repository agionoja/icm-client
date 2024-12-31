import type { Route } from "./+types/route";
import {
  Outlet,
  redirect,
  useLocation,
  useNavigation,
  useSubmit,
} from "react-router";
import {
  commitSession,
  getJwtMaxAgeInMs,
  getRole,
  getToken,
  getUserSession,
  requireUser,
} from "~/session";
import { useSessionTimeout } from "~/hooks/use-session-timeout";
import { SESSION_TIMEOUT_KEY } from "~/toast/timeout-toast";
import { getUserDataCookie, setUserDataCookie } from "~/cookies/user-cookie";
import { authRouteConfig, routesConfig } from "~/routes.config";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import React from "react";
import { AppSidebar } from "~/routes/account/components/app-sidebar";
import { cn } from "~/lib/utils";
import { getCookieByName } from "~/cookies/get-cookie-by-name";
import { cacheClientLoader, invalidateCache } from "~/lib/cache";
import { SkeletonCard } from "~/routes/account/admin/users/route";

export async function loader({ request }: Route.LoaderArgs) {
  // Retrieve both current backend user state and stored cookie state
  // to detect any discrepancies
  const user = await requireUser(request);
  const cookieUser = await getUserDataCookie(request);

  // Compare user states to identify if any attributes have changed,
  // with special attention to role changes that affect permissions
  const isModified = !(JSON.stringify(user) === JSON.stringify(cookieUser));
  const isRoleModified = !(user.role === (await getRole(request)));

  // Role changes require immediate session updates to maintain
  // proper access control and security
  if (isRoleModified) {
    console.info("User Role Changed");
    const token = await getToken(request);
    const userSession = await getUserSession(request);

    userSession.set("role", user.role);
    userSession.set("token", String(token));

    // Force a refresh to ensure all client-side data reflects
    // the new role permissions
    throw redirect(request.url, {
      headers: {
        "Set-Cookie": await commitSession(userSession),
      },
    });
  }

  // Keep cookie data in sync with the backend state to prevent
  // stale user information
  if (!cookieUser || isModified) {
    const cookie = await setUserDataCookie(user, request);
    throw redirect(request.url, { headers: { "Set-Cookie": cookie } });
  }

  const sidebarCookie = request.headers.get("Cookie");
  const defaultOpen = getCookieByName(sidebarCookie, "sidebar:state", true);

  return {
    defaultOpen: defaultOpen ?? true,
    sessionTimeout: await getJwtMaxAgeInMs(request),
    redirectTo: authRouteConfig.login.generate(
      {},
      { redirect: new URL(request.url).pathname },
    ),
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

export async function clientLoader(args: Route.ClientLoaderArgs) {
  return await cacheClientLoader(args, {
    type: "normal",
    key: routesConfig.account.layout.getFile,
    maxAge: 10,
  });
}

//
// clientLoader.hydrate = true as const;
//
// export function HydrateFallback() {
//   return <SkeletonCard />;
// }

export default function AccountLayout({ loaderData }: Route.ComponentProps) {
  const { state } = useNavigation();
  const { sessionTimeout, sessionTimeoutKey, redirectTo, user, defaultOpen } =
    "serverData" in loaderData ? loaderData.serverData : loaderData;

  const submit = useSubmit();
  useSessionTimeout(sessionTimeout, () => {
    const formData = new FormData();
    formData.append("_action", sessionTimeoutKey);
    formData.append("redirectTo", redirectTo);

    return submit(formData, {
      method: "POST",
      action: authRouteConfig.logout.getPath,
    });
  });

  return (
    <>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "18rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar user={user} collapsible={"icon"} />
        <main
          className={cn(
            "w-full",
            state === "loading" ? "animate-pulse opacity-80" : "",
          )}
        >
          <SidebarTrigger variant={"link"} />
          <Outlet />
        </main>
      </SidebarProvider>
    </>
  );
}
