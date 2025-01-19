import { type ComponentProps, forwardRef, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Input } from "~/components/ui/input";

interface TableSearchProps extends ComponentProps<"input"> {
  onSearch?: (search: string) => void;
  search?: string;
  delay?: number;
}

export const Search = forwardRef<HTMLInputElement, TableSearchProps>(
  function Search({ onSearch, search, delay = 1000, ...props }, ref) {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchParam = search || searchParams.get("search") || "";
    const [_search, set_search] = useState(searchParam);

    useEffect(() => {
      const timeout = setTimeout(() => {
        if (_search !== searchParam) {
          // Only update if value has changed
          setSearchParams(
            (prev) => {
              const newParams = new URLSearchParams(prev);
              if (_search) {
                newParams.set("search", _search);
              } else {
                newParams.delete("search");
              }
              // Reset page to 1 whenever search changes
              newParams.set("page", "1");
              return newParams;
            },
            {
              replace: true, // Use replace to avoid adding to history
            },
          );
          onSearch?.(_search);
        }
      }, delay);

      return () => clearTimeout(timeout);
    }, [_search, delay, onSearch, setSearchParams, searchParam]);

    // Sync with URL params when they change externally
    useEffect(() => {
      if (searchParam !== _search) {
        set_search(searchParam);
      }
    }, [searchParam]);

    return (
      <Input
        ref={ref}
        name="search"
        type="search"
        value={_search}
        placeholder="Search..."
        onChange={(e) => set_search(e.target.value)}
        {...props}
      />
    );
  },
);
