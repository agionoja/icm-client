import type { Route } from "./+types/route";
import { getToken, restrictTo } from "~/session";
import { Role } from "icm-shared";
import { DataTable } from "~/routes/account/admin/users/data-table";
import { columns } from "~/routes/account/admin/users/columns";
import { data } from "react-router";
import {
  cacheClientLoader,
  CacheProvider,
  type MutableRevalidate,
} from "~/lib/cache";

import { getUsers } from "~/routes/account/admin/users/queries";
import { useRouteComponentErrorToast } from "~/hooks/useRouteComponentErrorToast";
import { getToast } from "remix-toast";
import { useServerToast } from "~/hooks/useServerToast";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Admin - User Management" },
    {
      name: "description",
      content:
        "View and manage user accounts, including updates, role assignments, and account statuses.",
    },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const { toast, headers } = await getToast(request);
  await restrictTo(request, Role.ADMIN, Role.SUPER_ADMIN);

  const token = await getToken(request);

  if (import.meta.env.DEV) {
    try {
      const { storeToken } = await import("../../../../../tokenManager");
      if (token) {
        await storeToken(token);
      }
    } catch (error) {
      console.error("Failed to load or use tokenManager module:", error);
    }
  }
  const response = await getUsers(request, token);

  if (response.exception) {
    console.error(response.exception);
    return data({ response, toast }, { status: response.exception.statusCode });
  }

  return data({ response, toast }, { headers });
}

const mutableRevalidate: MutableRevalidate = { revalidate: false };

export async function clientLoader(args: Route.ClientLoaderArgs) {
  return cacheClientLoader(args, {
    type: "normal",
    revalidate: mutableRevalidate.revalidate,
    maxAge: 60 * 4, // 4 minutes,
  });
}

clientLoader.hydrate = true as const;

function AdminUsersContent({
  loaderData: { response, toast },
}: Pick<Route.ComponentProps, "loaderData">) {
  useRouteComponentErrorToast(response.exception);
  useServerToast(toast);

  return (
    <DataTable
      metadata={"metadata" in response ? response.metadata : undefined}
      columns={columns}
      data={response.data?.users}
    />
  );
}

export default function AdminUsers({ loaderData }: Route.ComponentProps) {
  return (
    <CacheProvider
      intervalEnabled={false}
      focusEnabled={false}
      mutableRevalidate={mutableRevalidate}
      loaderData={loaderData}
    >
      {(cachedData) => <AdminUsersContent loaderData={cachedData} />}
    </CacheProvider>
  );
}
