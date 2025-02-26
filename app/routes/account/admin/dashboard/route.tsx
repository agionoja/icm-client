import type { Route } from "./+types/route";
import { data, Outlet } from "react-router";
import {
  cacheClientLoader,
  CacheProvider,
  type MutableRevalidate,
} from "~/lib/cache";
import { getUserDataCookie } from "~/cookies/user-cookie";
import { getToken, restrictTo } from "~/session";
import { Role } from "icm-shared";
import { useServerToast } from "~/hooks/useServerToast";
import { getToast } from "remix-toast";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Admin - Dashboard" },
    {
      alt: "description",
      content:
        "Admin Dashboard: Get an overview of key metrics, recent transactions, and user activity to manage and monitor system performance effectively.",
    },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserDataCookie(request);
  const { toast, headers } = await getToast(request);

  const token = await getToken(request);
  if (import.meta.env.DEV) {
    try {
      const { storeToken } = await import("../../../../../tokenManager");
      if (token) {
        await storeToken(token);
      }
    } catch (error) {
      console.error("Failed to load or use tokenManager module:", error);
    }
  }

  await restrictTo(request, Role.ADMIN);
  return data({ user, toast }, { headers });
}

const mutableValidate: MutableRevalidate = { revalidate: false };
export async function clientLoader(args: Route.ClientLoaderArgs) {
  return cacheClientLoader(args, {
    type: "normal",
    revalidate: mutableValidate.revalidate,
  });
}

clientLoader.hydrate = true as const;

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  useServerToast(loaderData.toast);

  return (
    <CacheProvider loaderData={loaderData} mutableRevalidate={mutableValidate}>
      {() => {
        return (
          <>
            <h1>{loaderData.user?.firstname}</h1>
            <Outlet />
          </>
        );
      }}
    </CacheProvider>
  );
}
