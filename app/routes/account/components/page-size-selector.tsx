import { useFetcher, useSearchParams } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useRef } from "react";

export const PageSizeSelector = ({
  step = [10, 20, 30, 50],
  defaultValue = 10,
}: {
  step?: number[];
  defaultValue?: number;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();

  // Ref to track hover timer
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePrefetch = (limit: string) => {
    // Only prefetch if hovering for more than 500ms
    hoverTimerRef.current = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("limit", limit);
      newParams.set("page", "1");

      fetcher.load(`?${newParams.toString()}`);
    }, 100);
  };

  const handleCancelPrefetch = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  };

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
          <SelectItem
            className={"hover:bg-sidebar-accent"}
            key={option}
            value={String(option)}
            onMouseEnter={() => handlePrefetch(String(option))}
            onMouseLeave={handleCancelPrefetch}
          >
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
