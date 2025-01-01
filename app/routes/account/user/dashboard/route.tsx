import { Outlet } from "react-router";
import type { Route } from "./+types/route";
import { getUserDataCookie } from "~/cookies/user-cookie";
import { restrictTo } from "~/session";
import { Role } from "icm-shared";
import { cacheClientLoader } from "~/lib/cache/cache";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "User - User Management" },
    {
      name: "description",
      content:
        "View and manage user accounts, including updates, role assignments, and account statuses.",
    },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserDataCookie(request);
  await restrictTo(request, Role.USER);

  return { user };
}

export async function clientLoader(args: Route.ClientLoaderArgs) {
  return cacheClientLoader(args);
}

clientLoader.hydrate = true as const;

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const user = loaderData.user;
  return (
    <>
      <h1>{user?.firstname} Dashboard</h1>
      <Outlet />
    </>
  );
}
