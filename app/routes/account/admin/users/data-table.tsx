import { type ColumnDef, getCoreRowModel } from "@tanstack/table-core";
import { flexRender, useReactTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { NoResultIcon } from "~/components/icons";
import type { PaginationMetadata } from "icm-shared";
import { FormattedCount } from "~/routes/account/components/format-count";
import { TableSearch } from "~/routes/account/components/table-search";
import { PageSizeSelector } from "~/routes/account/components/page-size-selector";
import { PaginationControls } from "~/routes/account/components/pagination-controls";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  metadata?: PaginationMetadata;
  tableId: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  metadata,
  tableId,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="sticky top-[3.78rem] z-20 bg-white p-4">
        {/* Your future search/filter components will go here */}
        <div className="h-12 w-full rounded-lg">
          <TableSearch className={"w-52"} />
          {/* Placeholder for search/filter UI */}
        </div>
      </div>

      {/* Table Container with Scroll */}
      <div className="flex-1 overflow-auto">
        <Table className="relative w-full caption-top border-collapse">
          <TableCaption className="sr-only bg-white px-4 text-left md:px-6">
            Users
          </TableCaption>

          <TableHeader className="sticky top-0 z-[100] bg-white shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className="px-4 py-4 text-left text-xs text-gray-400 md:px-6 md:text-md"
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
                      className="px-4 text-left text-xs md:px-6 md:text-md"
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-[50vh]">
                  <NoResult />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sticky Footer */}
      {metadata && (
        <div className="sticky bottom-0 z-10 border-t bg-white shadow-sm">
          <div className="flex flex-row-reverse justify-center gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-muted-foreground text-sm">Showing</span>
              <PageSizeSelector
                step={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
              />
              <span className="text-muted-foreground text-sm">
                of <FormattedCount value={metadata.totalDocuments} />
              </span>
            </div>
            <PaginationControls maxVisiblePages={5} metadata={metadata} />
          </div>
        </div>
      )}
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
