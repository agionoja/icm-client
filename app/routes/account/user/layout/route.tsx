import type { Route } from "./+types/route";
import { requireUser } from "~/sessions/auth-session";
import { Outlet } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);

  return Response.json(user);
}

export default function DashboardLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
