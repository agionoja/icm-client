import { Button } from "~/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useSearchParams } from "react-router";
import type { SortKey } from "icm-shared";
import { cn } from "~/lib/utils";

interface SortHeaderProps<T> {
  field: SortKey<T>;
  label: string;
  className?: string;
}

export function SortHeader<T>({ field, label, className }: SortHeaderProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current sort parameters as array
  const currentSort = searchParams.getAll("sort");

  // Determine if this field is currently being sorted
  const currentFieldSort = currentSort.find(
    (sort) => sort === field || sort === `-${field}`,
  );

  const getSortIcon = () => {
    if (!currentFieldSort)
      return <ArrowUpDown className="text-muted-foreground ml-2 h-4 w-4" />;
    return currentFieldSort.startsWith("-") ? (
      <ArrowDown className="ml-2 h-4 w-4" />
    ) : (
      <ArrowUp className="ml-2 h-4 w-4" />
    );
  };

  const toggleSort = () => {
    // Remove current field from sort if it exists
    const otherSorts = currentSort.filter(
      (sort) => sort !== field && sort !== `-${field}`,
    );

    // Determine new sort direction
    let newFieldSort: string;
    if (!currentFieldSort) {
      newFieldSort = field;
    } else if (currentFieldSort === field) {
      newFieldSort = `-${field}`;
    } else {
      // If it was descending, remove it entirely
      newFieldSort = "";
    }

    // Construct new sort parameter array
    const newSort = newFieldSort ? [...otherSorts, newFieldSort] : otherSorts;

    // Update URL search params
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("sort");
    newSort.forEach((sort) => newParams.append("sort", sort));
    setSearchParams(newParams);
  };

  return (
    <Button
      variant="ghost"
      onClick={toggleSort}
      className={cn(
        "flex items-center justify-between hover:bg-transparent",
        className,
      )}
    >
      {label}
      {getSortIcon()}
    </Button>
  );
}
