import { type ComponentProps, forwardRef, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Input } from "~/components/ui/input";
import { X } from "lucide-react";
import { cn } from "~/lib/utils";

interface TableSearchProps extends ComponentProps<"input"> {
  delay?: number;
  onSearch?: (searchTerm: string) => void;
}

export const Search = forwardRef<HTMLInputElement, TableSearchProps>(
  function Search({ delay = 300, className, onSearch, ...props }, ref) {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchParam = searchParams.get("search") || "";
    const [search, setSearch] = useState(searchParam);

    // Debounced search update
    useEffect(() => {
      const timeout = setTimeout(() => {
        const trimmedSearch = search.trim();

        if (trimmedSearch !== searchParam) {
          // Minimum search length check
          if (trimmedSearch.length >= 3) {
            setSearchParams((prev) => {
              const newParams = new URLSearchParams(prev);
              newParams.set("search", trimmedSearch);
              newParams.set("page", "1");
              return newParams;
            });

            // Optional callback for additional search handling
            onSearch?.(trimmedSearch);
          } else {
            // Clear search if below minimum length
            setSearchParams(
              (prev) => {
                const newParams = new URLSearchParams(prev);
                newParams.delete("search");
                newParams.set("page", "1");
                return newParams;
              },
              { replace: true },
            );
          }
        }
      }, delay);

      return () => clearTimeout(timeout);
    }, [search, delay, searchParam, setSearchParams, onSearch]);

    // Clear search handler
    const handleClear = () => {
      setSearch("");
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.delete("search");
          newParams.set("page", "1");
          return newParams;
        },
        { replace: true },
      );
    };

    return (
      <div className="relative w-fit">
        <Input
          ref={ref}
          name="search"
          type="search"
          value={search}
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "pr-10",
            "[&::-webkit-search-cancel-button]:hidden",
            className,
          )}
          aria-label="Search input"
          {...props}
        />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="ring-offset-background focus:ring-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Clear search"
            tabIndex={0}
          >
            <X className="text-muted-foreground h-4 w-4" />
          </button>
        )}
      </div>
    );
  },
);
