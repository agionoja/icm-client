// components/ui/loading.tsx
import { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const loadingVariants = cva("flex items-center justify-center", {
  variants: {
    variant: {
      page: "fixed inset-0 bg-primary/10 backdrop-blur-sm z-[999]",
      overlay: "absolute inset-0 bg-background/50 z-[100]",
      inline: "p-2",
    } as const,
  },
  defaultVariants: {
    variant: "inline",
  },
});

type LoadingVariantProps = VariantProps<typeof loadingVariants>;

interface LoadingProps extends LoadingVariantProps {
  /**
   * Whether to show the loading spinner
   * @default true
   */
  loading?: boolean;
  /**
   * Size of the spinner in pixels
   * @default 24
   */
  size?: number;
  className?: string;
  /**
   * Spinner color
   * @default "var(--primary)"
   */
  color?: string;
  /**
   * Accessibility label for screen readers
   * @default "Loading..."
   */
  ariaLabel?: string;
}

export function Loading({
  loading = true,
  size = 24,
  className,
  variant,
  color = "var(--primary)",
  ariaLabel = "Loading...",
}: LoadingProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted || !loading) return null;

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cn(
        loadingVariants({ variant, className }),
        // Add minimum size constraints
        variant !== "inline" && "min-h-[100px] min-w-[100px]",
      )}
    >
      <ClipLoader
        loading={loading}
        size={size}
        color={color}
        cssOverride={{
          display: "block",
        }}
        aria-label={ariaLabel}
        data-testid="loading-spinner"
      />
    </div>
  );
}
