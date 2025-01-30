import { type IUser, Role } from "icm-shared";
import {
  fetchClient,
  type Paginated,
  type ResponseKey,
} from "~/fetch/fetch-client.server";
import type { UserColumn } from "~/routes/account/admin/users/columns";
import { z } from "zod";
import { baseSchemaFactory, parseQueryParams } from "~/utils/query";

const usersQuerySchema = baseSchemaFactory<IUser>({
  sortDefault: ["firstname"],
}).extend({
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

export async function getUsers(request: Request, token?: string) {
  const { limit, page, search, role, active, sort } = parseQueryParams(
    request,
    usersQuerySchema,
  );

  return await fetchClient<UserColumn, ResponseKey<"users">, IUser, Paginated>(
    "/users",
    {
      responseKey: "users",
      token,
      query: {
        sort: [...sort],
        paginate: {
          limit,
          page,
        },
        filter: {
          isActive: active,
          role: role,
        },
        search: search
          ? {
              firstname: search,
              email: search,
              lastname: search,
              role: search as Role,
            }
          : undefined,
        countFilter:
          active !== undefined
            ? { isActive: active }
            : { isActive: { exists: true } },
        ignoreFilterFlags: ["isActive"],
        select: [
          "+isActive",
          "email",
          "firstname",
          "lastname",
          "role",
          "phone",
          "createdAt",
        ],
      },
    },
  );
}
