import type { Route } from "./+types/route";
import { Outlet } from "react-router";
import {
  cacheClientLoader,
  CacheProvider,
  type MutableRevalidate,
} from "~/lib/cache";
import { getUserDataCookie } from "~/cookies/user-cookie";
import { restrictTo } from "~/session";
import { Role } from "icm-shared";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Admin - Dashboard" },
    {
      name: "description",
      content:
        "Admin Dashboard: Get an overview of key metrics, recent transactions, and user activity to manage and monitor system performance effectively.",
    },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserDataCookie(request);

  await restrictTo(request, Role.ADMIN);
  return { user };
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
  return (
    <CacheProvider loaderData={loaderData} mutableRevalidate={mutableValidate}>
      {() => {
        return (
          <>
            <Outlet />
          </>
        );
      }}
    </CacheProvider>
  );
}
