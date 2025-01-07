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
import { Button } from "~/components/ui/button";
import { formatDate } from "~/utils/format-date";
import { useNavigate } from "react-router";
import { adminRouteConfig } from "~/routes.config";

export type UserColumn = Pick<
  IUser,
  "isActive" | "role" | "lastname" | "firstname" | "email" | "_id" | "createdAt"
>;

export const columns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "firstname",
    header: "Firstname",
  },
  {
    accessorKey: "lastname",
    header: "Lastname",
  },
  {
    accessorKey: "role",
    header: () => <div>Role</div>,
    cell: ({ row }) => (
      <span className={"capitalize"}>
        {String(row.getValue("role")).toLowerCase()}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: () => "Status",
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
        <Button variant="ghost" className="h-8 w-8 pt-0">
          <span className="sr-only">Open Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-sidebar text-white" align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(original._id)}
        >
          Copy user ID
        </DropdownMenuItem>
        <DropdownMenuItem>
          <button
            onClick={() =>
              navigate(adminRouteConfig.user.generate({ id: original._id }))
            }
          >
            View User
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem>View payment details</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
