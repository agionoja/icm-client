import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      className={`rounded-x w-full items-center rounded-lg border px-4 py-2 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function BlueButton({ children, className, ...rest }: ButtonProps) {
  return (
    <Button
      className={`border-primary bg-primary text-white ${className}`}
      {...rest}
    >
      {children}
    </Button>
  );
}

export function SilverBorderButton({ className, ...rest }: ButtonProps) {
  return (
    <Button
      className={`border-2 border-gray-200 ${className}`}
      {...rest}
    ></Button>
  );
}
