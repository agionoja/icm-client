import type { Route } from "./+types/route";
import { getUserDataCookie } from "~/cookies/user-cookie";
import { Outlet } from "react-router";

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
export default function Dashboard() {
  return (
    <>
      <Outlet />
    </>
  );
}
