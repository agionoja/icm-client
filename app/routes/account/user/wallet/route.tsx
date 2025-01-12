import type { Route } from "./+types/route";
import { Outlet } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {}

export default function RouteComponent() {
  return (
    <>
      <Outlet />
    </>
  );
}
