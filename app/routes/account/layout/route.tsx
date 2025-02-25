import type { Route } from "./+types/route";
import {
  href,
  Outlet,
  redirect,
  useFetcher,
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
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import React from "react";
import { AppSidebar } from "~/routes/account/components/app-sidebar";
import { cn } from "~/lib/utils";
import { getCookieByName } from "~/cookies/get-cookie-by-name";
import {
  cacheClientLoader,
  CacheProvider,
  type MutableRevalidate,
} from "~/lib/cache";
import { Loading } from "~/components/loading";

// TODO: implement server toast that will run on the root account layout. since it uses swr, it might just work

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
  const url = new URL(request.url);
  return {
    defaultOpen: defaultOpen ?? true,
    sessionTimeout: await getJwtMaxAgeInMs(request),
    redirectTo:
      href("/auth/login") + `?redirect=${url.pathname + url.search + url.hash}`,
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
    key: "_accountLayout",
    revalidate: mutableRevalidate.revalidate,
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
      action: href("/auth/logout"),
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
      <AppSidebar
        className={"z-50"}
        user={loaderData.user}
        collapsible="icon"
      />

      <Loading
        loading={state === "loading" || state === "submitting"}
        variant="page"
        className="fixed z-[1000]"
      />

      <main className={cn("relative flex w-full flex-col md:gap-4")}>
        <div
          className={"fixed top-0 z-50 w-full min-w-full bg-sidebar px-4 py-4"}
        >
          <SidebarTrigger
            color={"white"}
            variant={"link"}
            className={"ml-auto text-white"}
          />
        </div>
        <div className={cn("mt-12 w-full md:mt-20 md:px-5")}>
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}

export default function AccountLayout({ loaderData }: Route.ComponentProps) {
  return (
    <CacheProvider
      mutableRevalidate={mutableRevalidate}
      loaderData={loaderData}
      focusEnabled={false}
    >
      {(cacheData) => <AccountLayoutContent loaderData={cacheData} />}
    </CacheProvider>
  );
}
