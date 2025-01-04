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
  ClientCacheProvider,
  memoryAdapter,
  useCacheState,
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
    envConfig(process.env).NODE_ENV === "development" ? 0 : 0,
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

  const response = await fetchClient<
    User,
    ResponseKey<"users">,
    IUser,
    Paginated
  >("/users", {
    responseKey: "users",
    token,
    query: {
      paginate: { limit: 100, page: 50 },
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

const mutableRevalidate = { revalidate: false };

export async function clientLoader(args: Route.ClientLoaderArgs) {
  return cacheClientLoader(args, {
    type: "normal",
    revalidate: mutableRevalidate.revalidate,
    maxAge: 20,
    adapter: memoryAdapter,
  });
}

clientLoader.hydrate = true as const;

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  const state = useCacheState();
  console.log(state);
  let error = loaderData.error;

  useEffect(() => {
    if (error) {
      toast(error.message, { type: "error" });
    }
  }, [error]);

  return (
    <ClientCacheProvider
      interval={60_000}
      mutableRevalidate={mutableRevalidate}
      loaderData={loaderData}
    >
      {({ data, error: err }) => {
        error = err;
        const tableData = data?.users || [];
        return (
          <div className="container mx-auto py-10">
            <DataTable columns={columns} data={tableData} />
            {state.state === "loading" && <span>Refreshing...</span>}
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
    </ClientCacheProvider>
  );
}
