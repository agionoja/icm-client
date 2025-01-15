import * as React from "react";

import { cn } from "~/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, style, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
        style={
          {
            MozAppearance: "textfield",
            appearance: "textfield",
            "&::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
              margin: 0,
            },
            "&::-webkit-outer-spin-button": {
              WebkitAppearance: "none",
              margin: 0,
            },
            ...style,
          } as React.CSSProperties
        }
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
