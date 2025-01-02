import type { Route } from "./+types/route";
import { Outlet } from "react-router";
import { cacheClientLoader } from "~/lib/cache/cache";
import { getUserDataCookie } from "~/cookies/user-cookie";

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

  return { user };
}

export async function clientLoader(args: Route.ClientLoaderArgs) {
  return cacheClientLoader(args, { type: "normal" });
}

clientLoader.hydrate = true as const;

export default function AdminDashboard() {
  return (
    <>
      <Outlet />
    </>
  );
}
