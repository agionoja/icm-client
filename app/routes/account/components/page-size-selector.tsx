import { useSearchParams } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const PageSizeSelector = ({
  step = [10, 20, 30, 50],
  defaultValue = 10,
}: {
  step?: number[];
  defaultValue?: number;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

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
          >
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
