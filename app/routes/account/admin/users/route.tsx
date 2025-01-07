import type { Route } from "./+types/route";
import {
  fetchClient,
  type Paginated,
  type ResponseKey,
} from "~/fetch/fetch-client.server";
import { getToken, restrictTo } from "~/session";
import { type IUser, Role } from "icm-shared";
import { DataTable } from "~/routes/account/admin/users/components/data-table";
import { columns, type UserColumn } from "~/routes/account/admin/users/columns";
import { data } from "react-router";
import { toast } from "react-toastify";
import { useEffect } from "react";

import {
  cacheClientLoader,
  CacheProvider,
  memoryAdapter,
  type MutableRevalidate,
} from "~/lib/cache";

import { storeToken } from "../../../../../tokenManager";
import { TableControls } from "~/routes/account/admin/users/table-control";
import qs from "qs";

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

  const url = new URL(request.url); // Parse the full URL
  const searchParams = new URLSearchParams(url.search); // Extract query string

  const limit = parseInt(searchParams.get("limit") || "10", 10); // Parse limit
  const page = parseInt(searchParams.get("page") || "1", 10); // Parse limit
  const search = searchParams.get("search") || "";
  const query = qs.parse(searchParams.toString());

  console.log({ query });

  const response = await fetchClient<
    UserColumn,
    ResponseKey<"users">,
    IUser,
    Paginated
  >("/users", {
    responseKey: "users",
    token,
    query: {
      search: {
        firstname: search,
        lastname: search,
        email: search,
        role: search.toUpperCase() as Role,
      },
      paginate: { limit, page },
      ignoreFilterFlags: ["isActive"],
      countFilter: { isActive: { exists: true } },
      select: [
        "+isActive",
        "email",
        "firstname",
        "lastname",
        "role",
        "createdAt",
      ],
      sort: ["role", "createdAt", "updatedAt", "firstname", "lastname"],
      filter: {
        isSuspended: false,
      },
    },
  });

  if (response.exception) {
    console.log(response.exception);
    return data(response, { status: response.exception.statusCode });
  }

  return response;
}

const mutableRevalidate: MutableRevalidate = { revalidate: false };

export async function clientLoader(args: Route.ClientLoaderArgs) {
  return cacheClientLoader(args, {
    type: "normal",
    revalidate: mutableRevalidate.revalidate,
    maxAge: 90,
    adapter: memoryAdapter,
    // key: "wow",
  });
}

clientLoader.hydrate = true as const;

function AdminUsersContent({
  loaderData,
}: Pick<Route.ComponentProps, "loaderData">) {
  console.log(loaderData.data?.users);
  const error = loaderData?.exception;
  const tableData = loaderData?.data?.users || [];

  useEffect(() => {
    if (error) {
      toast(error.message, { type: "error" });
    }
  }, [error]);

  const filters = [
    {
      label: "Status",
      value: "active",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
    {
      label: "Role",
      value: "role",
      options: [
        { label: "Admin", value: Role.ADMIN },
        { label: "User", value: Role.USER },
      ],
    },
  ];

  return (
    <div className="container mx-auto py-10">
      {"metadata" in loaderData && (
        <TableControls metadata={loaderData.metadata} filters={filters} />
      )}
      <DataTable columns={columns} data={tableData} />
    </div>
  );
}

export default function AdminUsers({ loaderData }: Route.ComponentProps) {
  return (
    <CacheProvider
      interval={60}
      mutableRevalidate={mutableRevalidate}
      loaderData={loaderData}
    >
      {(cachedData) => <AdminUsersContent loaderData={cachedData} />}
    </CacheProvider>
  );
}
