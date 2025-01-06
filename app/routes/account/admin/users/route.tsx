import type { Route } from "./+types/route";
import {
  fetchClient,
  type Paginated,
  type ResponseKey,
} from "~/fetch/fetch-client.server";
import { getToken, restrictTo } from "~/session";
import { type IUser, Role } from "icm-shared";
import { DataTable } from "~/routes/account/admin/users/components/data-table";
import { columns } from "~/routes/account/admin/users/columns";
import { Await, data } from "react-router";
import { toast } from "react-toastify";
import { Suspense, useEffect } from "react";
import { throttleNetwork } from "~/utils/throttle-network";
import { envConfig } from "~/env-config.server";

import {
  cacheClientLoader,
  CacheProvider,
  memoryAdapter,
  type MutableRevalidate,
  useCacheState,
  useRevalidateOnFocus,
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

export type User = Pick<
  IUser,
  "isActive" | "role" | "lastname" | "firstname" | "email"
>;

export async function loader({ request }: Route.LoaderArgs) {
  await restrictTo(request, Role.ADMIN, Role.SUPER_ADMIN);
  await throttleNetwork(
    envConfig(process.env).NODE_ENV === "development" ? 2 : 0,
  );

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

  const limit = parseInt(searchParams.get("limit") || "20", 10); // Parse limit

  const response = await fetchClient<
    User,
    ResponseKey<"users">,
    IUser,
    Paginated
  >("/users", {
    responseKey: "users",
    token,
    query: {
      paginate: { limit: limit, page: 50 },
      ignoreFilterFlags: ["isActive"],
      countFilter: { isActive: { exists: true } },
      select: ["+isActive", "email", "firstname", "lastname", "role"],
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
    type: "swr",
    revalidate: mutableRevalidate.revalidate,
    maxAge: 90,
    adapter: memoryAdapter,
    // key: "wow",
  });
}

clientLoader.hydrate = true as const;

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  const routeKey = useRouteKey();
  const state = useCacheState(routeKey);
  console.log(state);
  let error = loaderData.error;

  useEffect(() => {
    if (error) {
      toast(error.message, { type: "error" });
    }
  }, [error]);

  useRevalidateOnFocus({
    enabled: true,
    onRevalidate: () => (mutableRevalidate.revalidate = true),
    onCleanup: () => (mutableRevalidate.revalidate = false),
  });

  return (
    <CacheProvider
      interval={60}
      mutableRevalidate={mutableRevalidate}
      loaderData={loaderData}
      focusEnabled={false}
    >
      {({ data, error: err }) => {
        error = err;
        const tableData = data?.users || [];
        return (
          <div className="container mx-auto py-10">
            {state.state === "loading" && <span>Refreshing...</span>}
            <DataTable columns={columns} data={tableData} />
            <Suspense fallback={<div>Loading non-critical value...</div>}>
              <Await resolve={data?.userPromise}>
                {(data) => {
                  console.log(data);
                  return <h3>Streamed user: {data?.data?.user.firstname}</h3>;
                }}
              </Await>
            </Suspense>
          </div>
        );
      }}
    </CacheProvider>
  );
}
