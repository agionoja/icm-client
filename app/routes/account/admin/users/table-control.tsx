import React from "react";
import { useSearchParams } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { PaginationMetadata } from "icm-shared";

// Types
interface TableControlsProps {
  metadata: PaginationMetadata;
  onSearch?: (value: string) => void;
  filters?: Array<{
    label: string;
    value: string;
    options: Array<{ label: string; value: string }>;
  }>;
}

interface PaginationControlsProps {
  metadata: PaginationMetadata;
}

export const TableControls = ({
  metadata,
  onSearch,
  filters,
}: TableControlsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      searchParams.set("search", value);
    } else {
      searchParams.delete("search");
    }
    searchParams.set("page", "1"); // Reset to first page on search
    setSearchParams(searchParams);
    onSearch?.(value);
  };

  const handleFilterChange = (filterName: string, value: string) => {
    if (value === "all") {
      searchParams.delete(filterName);
    } else {
      searchParams.set(filterName, value);
    }
    searchParams.set("page", "1"); // Reset to first page on filter change
    setSearchParams(searchParams);
  };

  const handleLimitChange = (value: string) => {
    searchParams.set("limit", value);
    searchParams.set("page", "1"); // Reset to first page on limit change
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <div className="min-w-[200px] flex-1">
          <Input
            placeholder="Search..."
            value={searchParams.get("search") || ""}
            onChange={handleSearch}
            className="w-full"
          />
        </div>

        {/* Filters */}
        {filters?.map((filter) => (
          <Select
            key={filter.value}
            value={searchParams.get(filter.value) || "all"}
            onValueChange={(value) => handleFilterChange(filter.value, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent className={"bg-sidebar text-white"}>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Items per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Show</span>
          <Select
            value={searchParams.get("limit") || "10"}
            onValueChange={handleLimitChange}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <PaginationControls metadata={metadata} />
    </div>
  );
};

const PaginationControls = ({ metadata }: PaginationControlsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (page: number) => {
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
  };

  const pages = Array.from({ length: metadata.pageCount }, (_, i) => i + 1);
  const currentPage = metadata.currentPage;

  // Show 5 pages around current page
  const visiblePages = pages.filter(
    (page) =>
      page === 1 ||
      page === metadata.pageCount ||
      Math.abs(page - currentPage) <= 2,
  );

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Showing {metadata.totalDocuments} results
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!metadata.previous}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {visiblePages.map((page, index) => {
          const isGap = index > 0 && page - visiblePages[index - 1] > 1;

          return (
            <React.Fragment key={page}>
              {isGap && <span className="px-2">...</span>}
              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            </React.Fragment>
          );
        })}

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!metadata.next}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(metadata.pageCount)}
          disabled={currentPage === metadata.pageCount}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
