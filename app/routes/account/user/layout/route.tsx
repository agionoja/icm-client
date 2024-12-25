import type { Route } from "./+types/route";
import { restrictTo } from "~/session";
import { type MetaFunction, Outlet } from "react-router";
import { getUserDataCookie } from "~/cookies/user-cookie";
import { Role } from "icm-shared";

export const meta: MetaFunction = () => {
  return [{ title: "ICM Tech User Dashboard" }];
};
export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserDataCookie(request);
  if (!user) return { user };

  await restrictTo(user, Role.USER);

  return { user };
}
export default function Layout() {
  return (
    <>
      <Outlet />
    </>
  );
}
