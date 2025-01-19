import {
  type FilterQuery,
  type IQueryBuilder,
  type IUser,
  Role,
  type SearchableFields,
  type SortKey,
} from "icm-shared";
import {
  fetchClient,
  type Paginated,
  type ResponseKey,
} from "~/fetch/fetch-client.server";
import type { UserColumn } from "~/routes/account/admin/users/columns";
import { z } from "zod";

const sortSchema = z
  .array(z.custom<SortKey<IUser>>())
  .default(["-isActive", "role", "-email"]);

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
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
  sort: sortSchema,
});

export async function getUsers(request: Request, token?: string) {
  const url = new URL(request.url);
  const rawParams = {
    ...Object.fromEntries(url.searchParams.entries()),
    sort: url.searchParams.getAll("sort"),
  };

  const { limit, page, search, role, active, sort } =
    querySchema.parse(rawParams);

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

  return await fetchClient<UserColumn, ResponseKey<"users">, IUser, Paginated>(
    "/users",
    {
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
          "phone",
          "createdAt",
        ],
        sort,
      } satisfies IQueryBuilder<IUser>,
    },
  );
}
