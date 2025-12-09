import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors cursor-pointer";
    const size = "h-10 px-4";

    const variants: Record<Variant, string> = {
      default:
        "bg-sky-600 text-[var(--primary-foreground)] hover:opacity-90 shadow-card",
      outline:
        "border border-border bg-card text-text hover:bg-white/60 dark:hover:bg-white/5",
      ghost: "bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
    };

    return (
      <button
        ref={ref}
        className={cn(base, size, variants[variant], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
