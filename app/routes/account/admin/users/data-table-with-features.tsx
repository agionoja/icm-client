import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { NoResultIcon } from "~/components/icons";
import type { PaginationMetadata } from "icm-shared";
import { FormattedCount } from "~/routes/account/components/format-count";
import { PaginationControls } from "~/routes/account/components/pagination-controls";
import { PageSizeSelector } from "~/routes/account/components/page-size-selector";
import { Search, type SearchProps } from "~/routes/account/components/search";
import React from "react";
import { useIsMobile } from "~/hooks/use-mobile";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  caption?: string;
}

export function DataTable<TData, TValue>({
  data = [],
  columns,
  caption,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex-1 overflow-auto">
      <Table className="relative w-full caption-top border-collapse">
        {caption && <caption className="sr-only">{caption}</caption>}

        <TableHeader className="sticky top-0 bg-white shadow-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  className="px-4 py-0 text-left text-xs text-gray-400 md:px-6 md:text-md"
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <NoResults colSpan={columns.length} />
          )}
        </TableBody>
      </Table>
    </div>
  );
}

interface NoResultsProps {
  colSpan: number;
}

export function NoResults({ colSpan }: NoResultsProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-[50vh]">
        <div className="flex flex-col items-center justify-center text-center">
          <NoResultIcon />
          <span>Sorry no results.</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface DataTablePaginationProps {
  metadata?: PaginationMetadata;
  pageSizeOptions?: number[];
  maxVisiblePages?: number;
  maxVisiblePagesMobile?: number;
}

export function DataTablePagination({
  metadata,
  pageSizeOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  maxVisiblePages = 5,
  maxVisiblePagesMobile = 3,
}: DataTablePaginationProps) {
  const isMobile = useIsMobile();
  if (!metadata) return null;

  return (
    <div className="sticky bottom-0 z-10 border-t bg-white shadow-sm">
      <div className="flex flex-row-reverse justify-center gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground hidden text-sm md:inline">
            Showing
          </span>
          <PageSizeSelector step={pageSizeOptions} />
          <span className="text-muted-foreground text-sm">
            <span className={"hidden md:inline"}>of</span>{" "}
            <FormattedCount value={metadata.totalDocuments} />
          </span>
        </div>
        <PaginationControls
          maxVisiblePages={isMobile ? maxVisiblePagesMobile : maxVisiblePages}
          metadata={metadata}
        />
      </div>
    </div>
  );
}

interface DataTableToolbarProps {
  children?: React.ReactNode;
  searchProps?: SearchProps;
}

export function DataTableToolbar({
  children,
  searchProps,
}: DataTableToolbarProps) {
  return (
    <div className="sticky top-[3.78rem] z-30 bg-white p-4">
      <Search className="w-52" {...searchProps} />
      {children}
    </div>
  );
}

interface DataTableWithFeaturesProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  metadata?: PaginationMetadata;
  caption?: string;
  children?: React.ReactNode;
}

export function DataTableWithFeatures<TData, TValue>({
  columns,
  data = [],
  metadata,
  caption,
  children,
}: DataTableWithFeaturesProps<TData, TValue>) {
  return (
    <div className="mx-auto mt-14 flex w-full flex-col bg-white md:mt-20">
      <DataTableToolbar>{children}</DataTableToolbar>
      <DataTable data={data} columns={columns} caption={caption} />
      <DataTablePagination metadata={metadata} />
    </div>
  );
}
