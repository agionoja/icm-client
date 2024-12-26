import type { Route } from "./+types/route";
import { getToken, restrictTo } from "~/session";
import { type MetaFunction, Outlet } from "react-router";
import { getUserDataCookie } from "~/cookies/user-cookie";
import { type IIcmUser, type IUser, Role, UserDiscriminator } from "icm-shared";
import { fetchClient, type Paginated } from "~/fetch/fetch-client.server";

export const meta: MetaFunction = () => {
  return [{ title: "ICM Tech Admin Dashboard" }];
};

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserDataCookie(request);
  const token = await getToken(request);
  if (!user) return { user };
  await restrictTo(user, Role.ADMIN, Role.SUER_ADMIN);
  // console.log(user);
  const response = await fetchClient<IUser, "users", IIcmUser, Paginated>(
    "/users",
    {
      responseKey: "users",
      token,
      query: {
        paginate: {
          limit: 100,
          page: 1,
        },
        countFilter: {
          isActive: {
            exists: true,
          },
        },

        filter: {
          __t: UserDiscriminator.ICM,
          role: Role.USER,
        },

        ignoreFilterFlags: ["isActive"],
        // search: { firstname: "hoe" },
      },
    },
  );

  if (!response.exception) {
    const users = response.data.users;
    const meta = response.metadata;
    console.log(meta, users.length, users[0]);
  }

  // console.log(response.exception);
  return { user };
}

export default function AdminLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
