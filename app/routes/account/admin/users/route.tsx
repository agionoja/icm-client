import type { Route } from "./+types/route";
import { fetchClient, type Paginated } from "~/fetch/fetch-client.server";
import { getToken, restrictTo } from "~/session";
import { Role, type UserUnion } from "icm-shared";
import { DataTable } from "~/routes/account/admin/users/components/data-table";
import { columns } from "~/routes/account/admin/users/columns";
import { Await, data, useLocation } from "react-router";
import { toast } from "react-toastify";
import { Suspense, useEffect } from "react";
import { throttleNetwork } from "~/utils/throttle-network";
import {
  cacheClientLoader,
  useCachedLoaderData,
  useCacheInvalidator,
} from "~/lib/cache";
import { envConfig } from "~/env-config.server";
import { Skeleton } from "~/components/ui/skeleton";
import {
  useRevalidateOnFocus,
  useRevalidateOnInterval,
} from "~/hooks/revalidate";

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
  await throttleNetwork(
    envConfig(process.env).NODE_ENV === "development" ? 1 : 0,
  );
  const token = await getToken(request);

  const userPromise = fetchClient<UserUnion, "user">(
    "/users/6767d2de99ab57b2ce115c96",
    {
      responseKey: "user",
      token,
      query: {
        ignoreFilterFlags: ["isActive"],
      },
    },
  );

  const response = await fetchClient<UserUnion, "users", UserUnion, Paginated>(
    "/users",
    {
      responseKey: "users",
      token,
      query: {
        paginate: { limit: 20, page: 1 },
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
    },
  );

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

export async function clientLoader(args: Route.ClientLoaderArgs) {
  return cacheClientLoader(args, { type: "normal", maxAge: 60 });
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  return <SkeletonCard />;
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3 px-4 md:px-8">
      <Skeleton className="h-[80vh] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  const { invalidateCache } = useCacheInvalidator();
  const location = useLocation();
  useRevalidateOnInterval({
    enabled: true,
    interval: 600_000,
    onRevalidate: () => invalidateCache(location.pathname),
  });

  // useRevalidateOnFocus();
  const cachedLoaderData = useCachedLoaderData(loaderData);
  const data = loaderData.data?.users || [];
  const userPromise = cachedLoaderData.data?.userPromise;
  const error = cachedLoaderData.error;

  useEffect(() => {
    if (error) {
      toast(error.message, { type: "error" });
    }
  }, [error]);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
      <Suspense fallback={<div>Loading non-critical value...</div>}>
        <Await resolve={userPromise}>
          {(data) => {
            return <h3>Non-critical value: {data?.data?.user.firstname}</h3>;
          }}
        </Await>
      </Suspense>
    </div>
  );
}
