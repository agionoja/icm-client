import { useFetcher, useSearchParams } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useEffect, useRef } from "react";

export const PageSizeSelector = ({
  step = [10, 20, 30, 50],
  defaultValue = 10,
}: {
  step?: number[];
  defaultValue?: number;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate the valid limit based on current URL and step array
  const limitParam = searchParams.get("limit");
  const parsedLimit = limitParam ? parseInt(limitParam) : defaultValue;
  const initialLimit = isNaN(parsedLimit) ? defaultValue : parsedLimit;

  const findClosestValidLimit = (steps: number[], target: number) => {
    return steps.reduce((prev, curr) =>
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev,
    );
  };

  const closestLimit = findClosestValidLimit(step, initialLimit);
  const validLimit = step.includes(initialLimit) ? initialLimit : closestLimit;

  // Effect to update URL if the current limit is invalid
  useEffect(() => {
    const currentLimitParam = searchParams.get("limit");
    const parsedCurrentLimit = currentLimitParam
      ? parseInt(currentLimitParam)
      : defaultValue;
    const currentLimit = isNaN(parsedCurrentLimit)
      ? defaultValue
      : parsedCurrentLimit;

    if (currentLimit !== validLimit) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("limit", validLimit.toString());
      setSearchParams(newParams);
    }
  }, [validLimit, searchParams, setSearchParams, defaultValue, step]);

  const handlePrefetch = (limit: string) => {
    hoverTimerRef.current = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("limit", limit);
      newParams.set("page", "1");
      fetcher.load(`?${newParams.toString()}`);
    }, 200);
  };

  const handleCancelPrefetch = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  };

  return (
    <Select
      value={String(validLimit)}
      onValueChange={(value) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("limit", value);
        newParams.set("page", "1");
        setSearchParams(newParams);
      }}
    >
      <SelectTrigger className="w-14 p-1.5 md:w-20">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-sidebar text-white">
        {step.map((option) => (
          <SelectItem
            className="hover:bg-sidebar-accent"
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
