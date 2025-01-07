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
import { Await, data } from "react-router";
import { toast } from "react-toastify";
import { Suspense, useEffect } from "react";

import {
  cacheClientLoader,
  CacheProvider,
  memoryAdapter,
  type MutableRevalidate,
  useCacheState,
  useRouteKey,
} from "~/lib/cache";

import { storeToken } from "../../../../../tokenManager";

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

  const userPromise = fetchClient<IUser, ResponseKey<"user">>(
    "/users/6767d2de99ab57b2ce115c96",
    {
      responseKey: "user",
      token,
      query: {
        ignoreFilterFlags: ["isActive"],
      },
    },
  );

  const url = new URL(request.url); // Parse the full URL
  const searchParams = new URLSearchParams(url.search); // Extract query string

  const limit = parseInt(searchParams.get("limit") || "100", 10); // Parse limit
  const page = parseInt(searchParams.get("page") || "1", 10); // Parse limit
  const search = searchParams.get("search");

  const response = await fetchClient<
    UserColumn,
    ResponseKey<"users">,
    IUser,
    Paginated
  >("/users", {
    responseKey: "users",
    token,
    query: {
      search: { firstname: search?.toString() },
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
        isVerified: true,
        role: Role.USER,
      },
    },
  });

  if (response.exception) {
    console.log(response.exception);
    return data(
      {
        error: {
          message: response.exception.message,
          status: response.exception.status,
        },
        data: null,
      },
      { status: response.exception.statusCode },
    );
  }

  return {
    data: {
      users: response.data.users,
      metadata: response.metadata,
      userPromise,
    },
    error: null,
  };
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
  const routeKey = useRouteKey();
  const state = useCacheState(routeKey);
  console.log(state);
  console.log(loaderData.data?.metadata);
  const error = loaderData.error;
  const tableData = loaderData?.data?.users || [];

  useEffect(() => {
    if (error) {
      toast(error.message, { type: "error" });
    }
  }, [error]);

  return (
    <div className="container mx-auto py-10">
      {state.state === "loading" && <span>Refreshing...</span>}
      <DataTable columns={columns} data={tableData} />
      <Suspense fallback={<div>Loading non-critical value...</div>}>
        <Await resolve={loaderData?.data?.userPromise}>
          {(data) => {
            return <h3>Streamed user: {data?.data?.user.firstname}</h3>;
          }}
        </Await>
      </Suspense>
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
