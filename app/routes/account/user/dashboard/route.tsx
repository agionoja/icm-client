import { Outlet } from "react-router";
import type { Route } from "./+types/route";
import { getUserCookie } from "~/cookies/user-cookie";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserCookie(request);

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
