import type { Route } from "./+types/route";
import { fetchClient, type Paginated } from "~/fetch/fetch-client.server";
import { getToken, restrictTo } from "~/session";
import { Role, type UserUnion } from "icm-shared";
import { DataTable } from "~/routes/account/admin/users/components/data-table";
import { columns } from "~/routes/account/admin/users/columns";
import { data } from "react-router";
import { toast } from "react-toastify";
import { useEffect } from "react";

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
  await restrictTo(request, Role.ADMIN);
  const token = await getToken(request);
  const response = await fetchClient<UserUnion, "users", UserUnion, Paginated>(
    "/users",
    {
      responseKey: "users",
      token,
      query: {
        paginate: { limit: 100, page: 1 },
        ignoreFilterFlags: ["isActive"],
        countFilter: { isActive: { exists: true } },
        select: ["+isActive", "email", "firstname", "lastname", "role"],
        sort: ["role", "createdAt", "updatedAt", "firstname", "lastname"],
        // filter: {
        //   role: Role.USER,
        // },
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
  console.log(response.metadata);

  return {
    data: {
      users: response.data.users,
      metadata: response.metadata,
    },
    error: null,
  };
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  const data = loaderData.data?.users || [];
  const error = loaderData.error;

  useEffect(() => {
    if (error) {
      toast(error.message, { type: "error" });
    }
  }, [error]);

  return (
    <>
      <div className={"container mx-auto py-10"}>
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
}
