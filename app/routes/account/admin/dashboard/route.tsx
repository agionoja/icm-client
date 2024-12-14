import type { Route } from "./+types/route";
import { getUserDataCookie } from "~/cookies/user-cookie";
import { Outlet } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserDataCookie(request);

  return { user };
}
export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const user = loaderData.user;
  return (
    <>
      <h1>{user?.firstname} Dashboard</h1>
      <Outlet />
    </>
  );
}
