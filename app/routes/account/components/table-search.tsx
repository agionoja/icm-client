import { type ComponentProps, forwardRef, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Input } from "~/components/ui/input";

interface TableSearchProps extends ComponentProps<"input"> {
  onSearch?: (search: string) => void;
  search?: string;
  delay?: number;
}

export const TableSearch = forwardRef<HTMLInputElement, TableSearchProps>(
  function TableSearch(
    { onSearch, search: initialSearch = "", delay = 1000, ...props },
    ref,
  ) {
    const [searchParams, setSearchParams] = useSearchParams();
    const _search = initialSearch || searchParams.get("search") || "";
    const [search, setSearch] = useState(_search);

    useEffect(() => {
      const timeout = setTimeout(() => {
        setSearchParams((prev) => {
          if (search) {
            prev.set("search", search);
            // prev.set("page", "1");
            // prev.set("limit", "10");
          } else {
            prev.delete("search");
          }
          return prev;
        });
        onSearch?.(search);
      }, delay);
      return () => clearTimeout(timeout);
    }, [search, delay, onSearch, searchParams, setSearchParams]);

    return (
      <Input
        ref={ref}
        name="search"
        type="search"
        value={search}
        placeholder={"Search..."}
        onChange={(e) => setSearch(e.target.value)}
        {...props}
      />
    );
  },
);
