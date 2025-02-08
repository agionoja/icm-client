import { type IUser, Role } from "icm-shared";
import {
  fetchClient,
  type Paginated,
  type ResponseKey,
} from "~/fetch/fetch-client.server";
import type { UserColumn } from "~/routes/account/admin/users/columns";
import { z } from "zod";
import { parseQueryParams, schemaFactory } from "~/utils/query";

const usersQuerySchema = schemaFactory<IUser>().merge(
  z.object({
    filter: z
      .object({
        role: z.nativeEnum(Role).optional(),
        isActive: z
          .enum(["true", "false", ""])
          .transform((val) => {
            if (val === "true") return true;
            if (val === "false") return false;
            return undefined;
          })
          .optional(),
      })
      .optional(),
  }),
);

export async function getUsers(request: Request, token?: string) {
  const { limit, page, search, filter, sort } = parseQueryParams(
    request,
    usersQuerySchema,
  );

  return await fetchClient<UserColumn, ResponseKey<"users">, IUser, Paginated>(
    "/users",
    {
      responseKey: "users",
      token,
      query: {
        sort,
        filter,
        paginate: {
          limit,
          page,
        },
        search: {
          firstname: search,
          email: search,
          lastname: search,
          role: search as Role,
          phone: search,
        },
        countFilter:
          filter?.isActive !== undefined
            ? { isActive: filter.isActive }
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
