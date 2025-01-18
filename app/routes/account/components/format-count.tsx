import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface FormattedCountProps {
  value: number;
  className?: string;
}

export const FormattedCount = ({
  value,
  className = "",
}: FormattedCountProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const exactNumber = value.toLocaleString();
  const shortNumber = formatNumber(value);

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger className={className}>
        <span>{shortNumber}</span>
      </TooltipTrigger>
      <TooltipContent className={"bg-sidebar text-white"}>
        <p>{exactNumber}</p>
      </TooltipContent>
    </Tooltip>
  );
};
