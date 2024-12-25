import React from "react";

export const Table = React.forwardRef<
  HTMLTableElement,
  React.ComponentProps<"table">
>(function Table({ ...props }, ref) {
  return <table ref={ref} {...props}></table>;
});
