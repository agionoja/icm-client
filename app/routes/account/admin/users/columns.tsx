import type { ColumnDef, Row } from "@tanstack/table-core";
import { cn } from "~/lib/utils";
import type { IUser } from "icm-shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { formatDate } from "~/utils/format-date";
import { Form, useNavigate } from "react-router";
import { adminRouteConfig } from "~/routes.config";
import { HorizontalDots } from "~/components/icons";
import { SortTable } from "~/routes/account/components/sort-table";

export type UserColumn = Pick<
  IUser,
  | "isActive"
  | "role"
  | "lastname"
  | "firstname"
  | "email"
  | "_id"
  | "createdAt"
  | "phone"
>;

export const columns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: "createdAt",
    header: () => {
      return <SortTable<UserColumn> label={"Date"} field={"createdAt"} />;
    },
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    accessorKey: "email",

    header: () => {
      return <SortTable<UserColumn> label={"Email"} field={"email"} />;
    },
  },
  {
    accessorKey: "firstname",
    header: () => {
      return <SortTable<UserColumn> label={"Firstname"} field={"firstname"} />;
    },
  },
  {
    accessorKey: "lastname",
    header: () => {
      return <SortTable<UserColumn> label={"Lastname"} field={"lastname"} />;
    },
  },
  {
    accessorKey: "phone",
    header: () => {
      return <SortTable<UserColumn> label={"Phone"} field={"phone"} />;
    },
  },
  // {
  //   accessorKey: "role",
  //   header: () => <div>Role</div>,
  //   cell: ({ row }) => (
  //     <span className={"capitalize"}>
  //       {String(row.getValue("role")).toLowerCase()}
  //     </span>
  //   ),
  // },
  {
    accessorKey: "isActive",
    header: () => {
      return <SortTable<UserColumn> label={"Status"} field={"isActive"} />;
    },
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <div
          className={cn(
            "p-2 text-center font-medium",
            isActive
              ? "bg-green-100 text-green-500"
              : "bg-red-100 text-red-500",
          )}
        >
          {isActive ? "Active" : "Inactive"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
];

function ActionsCell<TData extends UserColumn>({ row }: { row: Row<TData> }) {
  const navigate = useNavigate();
  const original = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <span className="sr-only">Open Menu</span>
          <HorizontalDots size={20} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-sidebar text-white" align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          className={"hover:bg-sidebar-accent"}
          onClick={() => navigator.clipboard.writeText(original._id)}
        >
          Copy user ID
        </DropdownMenuItem>
        <DropdownMenuItem className={"hover:bg-sidebar-accent"}>
          <button
            onClick={() =>
              navigate(adminRouteConfig.user.generate({ id: original._id }))
            }
          >
            View User
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem className={"hover:bg-sidebar-accent"}>
          <Form method={"DELETE"} action={"/resources/users"}>
            <button type={"submit"} name={"_action"} value={"deactivate"}>
              Deactivate user
            </button>
          </Form>
        </DropdownMenuItem>
        <DropdownMenuItem className={"hover:bg-sidebar-accent"}>
          <Form method={"PATCH"} action={"/resources/users"}>
            <button type={"submit"} name={"_action"} value={"deactivate"}>
              Suspend user
            </button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
