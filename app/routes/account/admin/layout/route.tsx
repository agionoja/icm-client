import type { Route } from "./+types/route";
import { getToken, restrictTo } from "~/session";
import { Outlet } from "react-router";
import { getUserDataCookie } from "~/cookies/user-cookie";
import { Role, type SerializedUser } from "icm-shared";
import { fetchClient, type Paginated } from "~/fetch/fetch-client.server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserDataCookie(request);
  const token = await getToken(request);
  if (!user) return { user };
  await restrictTo(user, Role.ADMIN, Role.SUER_ADMIN);

  const response = await fetchClient<
    SerializedUser,
    "users",
    SerializedUser,
    Paginated
  >("/users/icm", {
    responseKey: "users",
    token,
    query: {
      paginate: { limit: 1, page: 1 },
      countFilter: { isActive: true, isVerified: true },
      filter: {
        isVerified: true,
        isActive: true,
      },
    },
  });

  console.log(response);
  return { user };
}

export default function DashboardLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
