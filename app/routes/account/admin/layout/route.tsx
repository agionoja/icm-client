import type { Route } from "./+types/route";
import { restrictTo } from "~/session";
import { Outlet } from "react-router";
import { getUserDataCookie } from "~/cookies/user-cookie";
import { type IIcmUser, type IQueryBuilder, Role } from "icm-shared";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserDataCookie(request);
  if (!user) return { user };
  await restrictTo(user, Role.ADMIN, Role.USER);

  const queryBuilder: IQueryBuilder<IIcmUser> = {
    filter: {
      emailChangedAt: { gt: new Date() },
      role: Role.USER,
      _id: "",
      isVerified: { exists: true },
      updatedAt: { gt: new Date() },
      createdAt: { lt: new Date() },
    },
    search: {
      role: Role.SUER_ADMIN,
      lastname: "Divine",
      firstname: "Paul",
    },
    paginate: {
      page: 10,
      limit: 5,
    },
    select: ["email", "+password", "_id"],
    sort: ["firstname", "lastname"],
  };
  console.dir(queryBuilder, { depth: null });
  return { user };
}

export default function DashboardLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
