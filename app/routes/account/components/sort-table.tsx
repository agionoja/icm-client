import { useCallback, useMemo } from "react";
import { useFetcher, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { SortKey } from "icm-shared";
import { cn } from "~/lib/utils";

interface SortHeaderProps<T> {
  field: SortKey<T>;
  label: string;
  className?: string;
}

export function SortHeader<T>({ field, label, className }: SortHeaderProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();

  const [currentSort, currentFieldSort] = useMemo(() => {
    const sorts = searchParams.getAll("sort");
    const fieldSort = sorts.find((s) => s === field || s === `-${field}`);
    return [sorts, fieldSort] as const;
  }, [searchParams, field]);

  const sortIcon = useMemo(() => {
    if (!currentFieldSort) {
      return (
        <ArrowUpDown
          className="text-muted-foreground ml-2 h-4 w-4"
          aria-hidden="true"
        />
      );
    }
    return currentFieldSort.startsWith("-") ? (
      <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
    ) : (
      <ArrowUp className="ml-2 h-4 w-4" aria-hidden="true" />
    );
  }, [currentFieldSort]);

  const handlePrefetch = useCallback(() => {
    const otherSorts = currentSort.filter(
      (s) => s !== field && s !== `-${field}`,
    );

    // Determine next potential state
    let newSorts: string[];
    if (!currentFieldSort) {
      // No sort → prefetch ascending
      newSorts = [...otherSorts, field];
    } else if (currentFieldSort === field) {
      // Ascending → prefetch descending
      newSorts = [...otherSorts, `-${field}`];
    } else {
      // Descending → prefetch NO SORT (remove entirely)
      newSorts = otherSorts;
    }

    // Create params for prefetch state
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("sort");
    newSorts.forEach((s) => newParams.append("sort", s));

    // Prefetch this potential state
    fetcher.load(`?${newParams.toString()}`);
  }, [currentSort, currentFieldSort, searchParams, field, fetcher]);

  const toggleSort = useCallback(() => {
    const otherSorts = currentSort.filter(
      (s) => s !== field && s !== `-${field}`,
    );

    // Determine new sort state for this click
    let newFieldSort: string;
    if (!currentFieldSort) {
      newFieldSort = field;
    } else if (currentFieldSort === field) {
      newFieldSort = `-${field}`;
    } else {
      newFieldSort = "";
    }

    // Update to new sort state
    const newSort = newFieldSort ? [...otherSorts, newFieldSort] : otherSorts;
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("sort");
    newSort.forEach((s) => newParams.append("sort", s));
    setSearchParams(newParams);

    // Immediately prefetch next potential state
    const nextSortState = !newFieldSort
      ? field // No sort → prefetch asc
      : newFieldSort === field
        ? `-${field}` // Asc → prefetch desc
        : ""; // Desc → prefetch no sort

    const prefetchParams = new URLSearchParams(newParams);
    prefetchParams.delete("sort");

    // Maintain other sorts while updating this field's state
    const nextSorts = nextSortState
      ? [...otherSorts, nextSortState]
      : otherSorts;

    nextSorts.forEach((s) => prefetchParams.append("sort", s));
    fetcher.load(`?${prefetchParams.toString()}`);
  }, [
    currentSort,
    currentFieldSort,
    searchParams,
    setSearchParams,
    field,
    fetcher,
  ]);

  const ariaSort = useMemo(() => {
    if (!currentFieldSort) return undefined;
    return currentFieldSort.startsWith("-") ? "descending" : "ascending";
  }, [currentFieldSort]);

  return (
    <Button
      variant="ghost"
      onClick={toggleSort}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      className={cn(
        "flex items-center justify-between hover:bg-transparent",
        className,
      )}
      aria-label={`Sort by ${label}`}
      aria-sort={ariaSort}
    >
      {label}
      {sortIcon}
    </Button>
  );
}
