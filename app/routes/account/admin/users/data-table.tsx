import { type ColumnDef, getCoreRowModel } from "@tanstack/table-core";
import { flexRender, useReactTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { NoResultIcon } from "~/components/icons";
import type { PaginationMetadata } from "icm-shared";
import {
  PageSizeSelector,
  PaginationControls,
} from "~/routes/account/admin/users/tableControl";
import { useIsMobile } from "~/hooks/use-mobile";
import React from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  metadata?: PaginationMetadata;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  metadata,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const isMobile = useIsMobile();

  return (
    <div className={"rounded-lg border bg-white py-10"}>
      <Table className={"caption-top border-collapse"}>
        <TableCaption className={"px-4 text-left md:px-6"}>Users</TableCaption>
        <TableHeader className={""}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  className={
                    "px-4 py-4 text-left text-xs text-gray-400 md:px-6 md:text-md"
                  }
                  key={header.id}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    className={"px-4 text-left text-xs md:px-6 md:text-md"}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className={"h-[50vh]"}>
                <NoResult />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {metadata && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="flex flex-col gap-4 px-4 pt-4 md:flex-row md:items-center md:justify-between md:px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">Show</span>
                    <PageSizeSelector
                      step={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                    />
                    <span className="text-muted-foreground text-sm">
                      of {metadata.totalDocuments}
                    </span>
                  </div>

                  <PaginationControls maxVisiblePages={5} metadata={metadata} />
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}

function NoResult() {
  return (
    <div className={"flex flex-col items-center justify-center text-center"}>
      <NoResultIcon />
      <span>Sorry no results.</span>
    </div>
  );
}
