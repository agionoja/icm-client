import type { Route } from "./+types/route";
import { restrictTo } from "~/session";
import { Outlet } from "react-router";
import { getUserCookie } from "~/cookies/user-cookie";
import assert from "node:assert";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserCookie(request);
  assert(user, "There is no user in the cookie");
  await restrictTo(user, "ADMIN");

  return { user };
}
export default function DashboardLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
