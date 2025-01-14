import type { Route } from "./+types/route";
import { Outlet, redirect, useNavigation, useSubmit } from "react-router";
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
import {
  cacheClientLoader,
  CacheProvider,
  memoryAdapter,
  type MutableRevalidate,
} from "~/lib/cache";

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

const mutableRevalidate: MutableRevalidate = { revalidate: false };
export async function clientLoader(args: Route.ClientLoaderArgs) {
  return cacheClientLoader(args, {
    type: "swr",
    // maxAge: 60,
    key: routesConfig.account.layout.getFile,
    revalidate: mutableRevalidate.revalidate,
    adapter: memoryAdapter,
  });
}

clientLoader.hydrate = true as const;

function AccountLayoutContent({
  loaderData,
}: Pick<Route.ComponentProps, "loaderData">) {
  const { state } = useNavigation();

  const submit = useSubmit();

  useSessionTimeout(loaderData.sessionTimeout, () => {
    const formData = new FormData();
    formData.append("_action", loaderData.sessionTimeoutKey);
    formData.append("redirectTo", loaderData.redirectTo);

    return submit(formData, {
      method: "POST",
      action: authRouteConfig.logout.getPath,
    });
  });

  return (
    <SidebarProvider
      defaultOpen={loaderData.defaultOpen}
      style={
        {
          "--sidebar-width": "18rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={loaderData.user} collapsible="icon" />
      <main
        className={cn(
          "w-full px-5 md:px-8",
          state === "loading" ? "animate-pulse opacity-80" : "",
        )}
      >
        <SidebarTrigger variant="link" className={"p-0"} />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

export default function AccountLayout({ loaderData }: Route.ComponentProps) {
  return (
    <CacheProvider
      mutableRevalidate={mutableRevalidate}
      loaderData={loaderData}
      interval={60 * 4}
      focusEnabled={false}
    >
      {(cacheData) => <AccountLayoutContent loaderData={cacheData} />}
    </CacheProvider>
  );
}
