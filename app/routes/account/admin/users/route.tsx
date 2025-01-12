import type { Route } from "./+types/route";
import {
  fetchClient,
  type Paginated,
  type ResponseKey,
} from "~/fetch/fetch-client.server";
import { getToken, restrictTo } from "~/session";
import {
  type FilterQuery,
  type IQueryBuilder,
  type IUser,
  Role,
  type SearchableFields,
} from "icm-shared";
import { DataTable } from "~/routes/account/admin/users/data-table";
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
import { throttleNetwork } from "~/utils/throttle-network";
import { z } from "zod";

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

// Helper function to extract typed query parameters
export function getQueryParams(request: Request) {
  const url = new URL(request.url);
  const rawParams = Object.fromEntries(url.searchParams.entries());
  return querySchema.safeParse(rawParams);
}
// Zod schema for query parameters
const querySchema = z.object({
  limit: z.coerce.number().min(1).max(10000).default(10),
  page: z.coerce.number().min(1).default(1),
  search: z.string().default(""),
  role: z.nativeEnum(Role).optional(),
  active: z
    .enum(["true", "false", ""])
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    })
    .optional(),
});

type QuerySchema = z.infer<typeof querySchema>;

export async function loader({ request }: Route.LoaderArgs) {
  await throttleNetwork(0.5);
  await restrictTo(request, Role.ADMIN, Role.SUPER_ADMIN);

  const token = await getToken(request);
  if (token) {
    await storeToken(token);
  }

  const url = new URL(request.url);

  // Parse and validate query parameters
  const rawParams = Object.fromEntries(url.searchParams.entries());
  const { limit, page, search, role, active } = querySchema.parse(rawParams);

  // Build the filter query
  const filter: FilterQuery<IUser> = {};

  if (role && Role[role]) {
    filter.role = role;
  }

  if (active !== undefined) {
    filter.isActive = active;
  }

  const searchQuery: SearchableFields<IUser> = {
    firstname: search,
    lastname: search,
    email: search,
    ...(search ? { role: search.toUpperCase() as Role } : {}),
  };

  const response = await fetchClient<
    UserColumn,
    ResponseKey<"users">,
    IUser,
    Paginated
  >("/users", {
    responseKey: "users",
    token,
    query: {
      search: searchQuery,
      filter,
      paginate: { limit, page },
      ignoreFilterFlags: ["isActive"],
      countFilter:
        active !== undefined
          ? { isActive: active }
          : { isActive: { exists: true } },
      select: [
        "+isActive",
        "email",
        "firstname",
        "lastname",
        "role",
        "createdAt",
      ],
      sort: ["role", "createdAt", "updatedAt", "firstname", "lastname"],
    } satisfies IQueryBuilder<IUser>,
  });

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
    maxAge: Infinity,
    // adapter: memoryAdapter,
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
    <div className="mx-auto w-full">
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
