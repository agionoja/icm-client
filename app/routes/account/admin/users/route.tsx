import type { Route } from "./+types/route";
import { getToken, restrictTo } from "~/session";
import { Role } from "icm-shared";
import { DataTable } from "~/routes/account/admin/users/data-table";
import { columns } from "~/routes/account/admin/users/columns";
import { data } from "react-router";
import { toast } from "react-toastify";
import { useEffect } from "react";
import {
  cacheClientLoader,
  CacheProvider,
  type MutableRevalidate,
} from "~/lib/cache";
import { storeToken } from "../../../../../tokenManager";
import { getUsers } from "~/routes/account/admin/users/queries";

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
  await restrictTo(request, Role.ADMIN, Role.SUPER_ADMIN);

  const token = await getToken(request);
  if (token) {
    await storeToken(token);
  }

  const response = await getUsers(request, token);

  if (response.exception) {
    console.error(response.exception);
    return data(response, { status: response.exception.statusCode });
  }

  return response;
}

const mutableRevalidate: MutableRevalidate = { revalidate: false };

export async function clientLoader(args: Route.ClientLoaderArgs) {
  return cacheClientLoader(args, {
    type: "normal",
    revalidate: mutableRevalidate.revalidate,
    maxAge: 60 * 4,
  });
}

clientLoader.hydrate = true as const;

function AdminUsersContent({
  loaderData,
}: Pick<Route.ComponentProps, "loaderData">) {
  const error = loaderData?.exception;
  const tableData = loaderData?.data?.users || [];

  useEffect(() => {
    if (error) {
      toast(error.message, { type: "error" });
    }
  }, [error]);

  return (
    // <div className="mx-auto w-full">
    <DataTable
      metadata={"metadata" in loaderData ? loaderData.metadata : undefined}
      columns={columns}
      data={tableData}
    />
    // </div>
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
