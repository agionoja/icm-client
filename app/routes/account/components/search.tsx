import { type ComponentProps, forwardRef, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Input } from "~/components/ui/input";
import { X } from "lucide-react";
import { cn } from "~/lib/utils";

interface TableSearchProps extends ComponentProps<"input"> {
  delay?: number;
}

export const Search = forwardRef<HTMLInputElement, TableSearchProps>(
  function Search({ delay = 1000, className, ...props }, ref) {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchParam = searchParams.get("search") || "";
    const [search, setSearch] = useState(searchParam);
    const [historyStack, setHistoryStack] = useState<string[]>([searchParam]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Handle browser navigation (Ctrl+Z/Ctrl+Y)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "z") {
          e.preventDefault();
          setHistoryIndex((prev) => Math.max(0, prev - 1));
        } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
          e.preventDefault();
          setHistoryIndex((prev) =>
            Math.min(historyStack.length - 1, prev + 1),
          );
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [historyStack.length]);

    // Update search state when history index changes
    useEffect(() => {
      setSearch(historyStack[historyIndex]);
    }, [historyIndex, historyStack]);

    // Clear search handler
    const handleClear = () => {
      // Add to history before clearing
      setHistoryStack((prev) => [...prev.slice(0, historyIndex + 1), ""]);
      setHistoryIndex((prev) => prev + 1);

      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("search");
        newParams.set("page", "1");
        return newParams;
      });
    };

    // Debounced search update
    useEffect(() => {
      const timeout = setTimeout(() => {
        const trimmedSearch = search.trim();

        if (trimmedSearch !== searchParam) {
          // Update history stack
          setHistoryStack((prev) => [
            ...prev.slice(0, historyIndex + 1),
            trimmedSearch,
          ]);
          setHistoryIndex((prev) => prev + 1);

          setSearchParams(
            (prev) => {
              const newParams = new URLSearchParams(prev);
              trimmedSearch.length >= 3
                ? newParams.set("search", trimmedSearch)
                : newParams.delete("search");
              newParams.set("page", "1");
              return newParams;
            },
            { replace: true },
          );
        }
      }, delay);

      return () => clearTimeout(timeout);
    }, [search, delay, searchParam, historyIndex]);

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
