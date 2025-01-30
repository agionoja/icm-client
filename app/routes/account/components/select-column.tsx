import React from "react";

export const SelectColumn = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(function TableSelect({ className, ...props }, ref) {
  return <select name="" id=""></select>;
});
