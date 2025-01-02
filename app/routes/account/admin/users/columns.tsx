import type { ColumnDef } from "@tanstack/table-core";
import { cn } from "~/lib/utils";
import type { User } from "~/routes/account/admin/users/route";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "firstname",
    header: "First Name",
  },
  {
    accessorKey: "lastname",
    header: "Last Name",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className={"capitalize"}>
        {String(row.getValue("role")).toLowerCase()}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: () => <div className="text-right">Status</div>,
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
];
