import type { Route } from "./+types/route";
// import { getUserDataCookie } from "~/cookies/user-cookie";
import { Outlet } from "react-router";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Admin - Cable Management" },
    {
      name: "description",
      content:
        "Admin Dashboard: Get an overview of key metrics, recent transactions, and user activity to manage and monitor system performance effectively.",
    },
  ];
};

// export async function loader({ request }: Route.LoaderArgs) {
//   const user = await getUserDataCookie(request);
//
//   return { user };
// }

// export async function clientLoader({ request }: Route.ClientLoaderArgs) {
//   return;
// }

export default function AdminCable() {
  return (
    <>
      <Outlet />
    </>
  );
}
