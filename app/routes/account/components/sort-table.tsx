// import { useCallback, useMemo, useEffect, useRef } from "react";
// import { useFetcher, useSearchParams } from "react-router";
// import { Button } from "~/components/ui/button";
// import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
// import type { SortKey } from "icm-shared";
// import { cn } from "~/lib/utils";
//
// interface SortTableProps<T> {
//   field: SortKey<T>;
//   label: string;
//   className?: string;
// }
//
// export function SortTable<T>({ field, label, className }: SortTableProps<T>) {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const fetcher = useFetcher();
//   const timeoutRef = useRef<NodeJS.Timeout>();
//
//   const [currentSort, currentFieldSort] = useMemo(() => {
//     const sorts = searchParams.getAll("sort");
//     const fieldSort = sorts.find((s) => s === field || s === `-${field}`);
//     return [sorts, fieldSort] as const;
//   }, [searchParams, field]);
//
//   // Cleanup timeout on component unmount
//   useEffect(() => {
//     return () => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     };
//   }, []);
//
//   const sortIcon = useMemo(() => {
//     if (!currentFieldSort) {
//       return (
//         <ArrowUpDown
//           className="text-muted-foreground ml-2 h-4 w-4"
//           aria-hidden="true"
//         />
//       );
//     }
//     return currentFieldSort.startsWith("-") ? (
//       <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
//     ) : (
//       <ArrowUp className="ml-2 h-4 w-4" aria-hidden="true" />
//     );
//   }, [currentFieldSort]);
//
//   const handlePrefetch = useCallback(() => {
//     // Clear any existing pending request
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }
//
//     // Set up new debounced request
//     timeoutRef.current = setTimeout(() => {
//       const otherSorts = currentSort.filter(
//         (s) => s !== field && s !== `-${field}`,
//       );
//
//       // Determine next potential state
//       let newSorts: string[];
//       if (!currentFieldSort) {
//         newSorts = [...otherSorts, field];
//       } else if (currentFieldSort === field) {
//         newSorts = [...otherSorts, `-${field}`];
//       } else {
//         newSorts = otherSorts;
//       }
//
//       // Create params for prefetch state
//       const newParams = new URLSearchParams(searchParams);
//       newParams.delete("sort");
//       newSorts.forEach((s) => newParams.append("sort", s));
//
//       // Execute the fetch
//       fetcher.load(`?${newParams.toString()}`);
//     }, 200); // 300ms debounce delay
//   }, [currentSort, currentFieldSort, searchParams, field, fetcher]);
//
//   const toggleSort = useCallback(() => {
//     // Clear any pending prefetch requests
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }
//
//     const otherSorts = currentSort.filter(
//       (s) => s !== field && s !== `-${field}`,
//     );
//
//     // Determine new sort state for this click
//     let newFieldSort: string;
//     if (!currentFieldSort) {
//       newFieldSort = field;
//     } else if (currentFieldSort === field) {
//       newFieldSort = `-${field}`;
//     } else {
//       newFieldSort = "";
//     }
//
//     // Update to new sort state
//     const newSort = newFieldSort ? [...otherSorts, newFieldSort] : otherSorts;
//     const newParams = new URLSearchParams(searchParams);
//     newParams.delete("sort");
//     newSort.forEach((s) => newParams.append("sort", s));
//     setSearchParams(newParams);
//
//     // Immediately prefetch next potential state
//     const nextSortState = !newFieldSort
//       ? field
//       : newFieldSort === field
//         ? `-${field}`
//         : "";
//
//     const prefetchParams = new URLSearchParams(newParams);
//     prefetchParams.delete("sort");
//
//     const nextSorts = nextSortState
//       ? [...otherSorts, nextSortState]
//       : otherSorts;
//
//     nextSorts.forEach((s) => prefetchParams.append("sort", s));
//     fetcher.load(`?${prefetchParams.toString()}`);
//   }, [
//     currentSort,
//     currentFieldSort,
//     searchParams,
//     setSearchParams,
//     field,
//     fetcher,
//   ]);
//
//   const ariaSort = useMemo(() => {
//     if (!currentFieldSort) return undefined;
//     return currentFieldSort.startsWith("-") ? "descending" : "ascending";
//   }, [currentFieldSort]);
//
//   return (
//     <Button
//       variant="ghost"
//       onClick={toggleSort}
//       onMouseEnter={handlePrefetch}
//       onFocus={handlePrefetch}
//       className={cn(
//         "flex items-center justify-between hover:bg-transparent",
//         className,
//       )}
//       aria-label={`Sort by ${label}`}
//       aria-sort={ariaSort}
//     >
//       {label}
//       {sortIcon}
//     </Button>
//   );
// }

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

export function SortTable<T>({ field, label, className }: SortHeaderProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();

  const currentSortDirection = useMemo(() => {
    const value = searchParams.get(`sort[${field}]`);
    return value || null;
  }, [searchParams, field]);

  const sortIcon = useMemo(() => {
    if (!currentSortDirection) {
      return (
        <ArrowUpDown
          className="text-muted-foreground ml-2 h-4 w-4"
          aria-hidden="true"
        />
      );
    }
    return currentSortDirection === "desc" ? (
      <ArrowDown className="ml-2 h-4 w-4" aria-hidden="true" />
    ) : (
      <ArrowUp className="ml-2 h-4 w-4" aria-hidden="true" />
    );
  }, [currentSortDirection]);

  const handlePrefetch = useCallback(() => {
    const nextSortDirection = !currentSortDirection
      ? "asc"
      : currentSortDirection === "asc"
        ? "desc"
        : "";

    const newParams = new URLSearchParams(searchParams);
    if (nextSortDirection) {
      newParams.set(`sort[${field}]`, nextSortDirection);
    } else {
      newParams.delete(`sort[${field}]`);
    }

    fetcher.load(`?${newParams.toString()}`);
  }, [currentSortDirection, searchParams, field, fetcher]);

  const toggleSort = useCallback(() => {
    const nextSortDirection = !currentSortDirection
      ? "asc"
      : currentSortDirection === "asc"
        ? "desc"
        : "";

    const newParams = new URLSearchParams(searchParams);
    if (nextSortDirection) {
      newParams.set(`sort[${field}]`, nextSortDirection);
    } else {
      newParams.delete(`sort[${field}]`);
    }
    setSearchParams(newParams);

    // Prefetch the next potential state for a smoother UX
    const nextPrefetchDirection =
      nextSortDirection === "asc"
        ? "desc"
        : nextSortDirection === "desc"
          ? ""
          : "asc";

    const prefetchParams = new URLSearchParams(newParams);
    if (nextPrefetchDirection) {
      prefetchParams.set(`sort[${field}]`, nextPrefetchDirection);
    } else {
      prefetchParams.delete(`sort[${field}]`);
    }

    fetcher.load(`?${prefetchParams.toString()}`);
  }, [currentSortDirection, searchParams, setSearchParams, field, fetcher]);

  const ariaSort = useMemo(() => {
    if (!currentSortDirection) return undefined;
    return currentSortDirection === "desc" ? "descending" : "ascending";
  }, [currentSortDirection]);

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
