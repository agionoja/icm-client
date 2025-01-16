import React, { useCallback } from "react";
import { useSearchParams } from "react-router";
import debounce from "lodash/debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { PaginationMetadata } from "icm-shared";

interface TableControlsProps {
  metadata: PaginationMetadata;
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  maxVisiblePages?: number;
  filters?: React.ReactNode;
}

// Debounced Search Component
const TableSearch = ({
  onSearch,
  placeholder = "Search...",
}: {
  onSearch?: (term: string) => void;
  placeholder?: string;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (term) {
        newParams.set("search", term);
      } else {
        newParams.delete("search");
      }
      setSearchParams(newParams);
      onSearch?.(term);
    }, 300),
    [searchParams, setSearchParams, onSearch],
  );

  return (
    <div className="relative w-full max-w-sm">
      <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
      <Input
        placeholder={placeholder}
        onChange={(e) => debouncedSearch(e.target.value)}
        defaultValue={searchParams.get("search") || ""}
        className="pl-8"
      />
    </div>
  );
};

// Page Size Selector Component
export const PageSizeSelector = ({
  step = [10, 20, 30, 50],
  defaultValue = 10,
}: {
  step?: number[];
  defaultValue?: number;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Select
      defaultValue={searchParams.get("limit") || String(defaultValue)}
      onValueChange={(value) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("limit", value);
        newParams.set("page", "1"); // Reset to first page when changing limit
        setSearchParams(newParams);
      }}
    >
      <SelectTrigger className="w-[100px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={"bg-sidebar text-white"}>
        {step.map((option) => (
          <SelectItem key={option} value={String(option)}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const PaginationControls = ({
  metadata,
  maxVisiblePages = 5,
}: {
  metadata: PaginationMetadata;
  maxVisiblePages?: number;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getVisiblePages = () => {
    const currentPage = metadata.currentPage;
    const totalPages = metadata.pageCount;
    const pages = [];

    // Always include first page
    pages.push({ number: 1, type: "edge" });

    // Calculate the range of pages to show
    const start = Math.max(
      2,
      currentPage - Math.floor((maxVisiblePages - 2) / 2),
    );
    const end = Math.min(totalPages - 1, start + maxVisiblePages - 3);

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push({ number: i, type: "middle" });
    }

    // Add last page if there is more than one page
    if (totalPages > 1) {
      pages.push({ number: totalPages, type: "edge" });
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(page));
    setSearchParams(newParams);
  };

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        disabled={!metadata.previous}
        onClick={() =>
          metadata.previous && handlePageChange(metadata.previous.page)
        }
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getVisiblePages().map((page, index) => (
        <Button
          key={index}
          variant={metadata.currentPage === page.number ? "default" : "ghost"}
          size="sm"
          className={`h-8 px-3 text-sm font-medium tabular-nums ${
            page.type === "edge"
              ? "border-2 border-transparent hover:border-gray-200"
              : ""
          }`}
          onClick={() => handlePageChange(page.number)}
        >
          {page.number}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        disabled={!metadata.next}
        onClick={() => metadata.next && handlePageChange(metadata.next.page)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Main Table Controls Component
const TableControls = ({
  metadata,
  onSearch,
  searchPlaceholder,
  pageSizeOptions,
  defaultPageSize,
  maxVisiblePages,
  filters,
}: TableControlsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <TableSearch onSearch={onSearch} placeholder={searchPlaceholder} />
        {filters}
      </div>

      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Show</span>
          <PageSizeSelector
            step={pageSizeOptions}
            defaultValue={defaultPageSize}
          />
          <span className="text-muted-foreground text-sm">
            of {metadata.totalDocuments} items
          </span>
        </div>

        <PaginationControls
          metadata={metadata}
          maxVisiblePages={maxVisiblePages}
        />
      </div>
    </div>
  );
};

export default TableControls;
