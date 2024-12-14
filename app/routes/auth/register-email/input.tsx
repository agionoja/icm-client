import React, { forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-lg border border-gray-200 px-2 py-2 focus:outline-primary ${className || ""}`}
      type="text"
      {...rest}
    />
  );
});
