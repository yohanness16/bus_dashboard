"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  dot?: boolean;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", dot = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-bg-elevated text-text-secondary border border-border",
      success: "bg-success/10 text-success border border-success/20",
      warning: "bg-warning/10 text-warning border border-warning/20",
      danger: "bg-destructive/10 text-destructive border border-destructive/20",
      info: "bg-accent/10 text-accent border border-accent/20",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
          variants[variant],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              variant === "default" && "bg-text-muted",
              variant === "success" && "bg-success animate-pulse",
              variant === "warning" && "bg-warning animate-pulse",
              variant === "danger" && "bg-destructive animate-pulse",
              variant === "info" && "bg-accent animate-pulse"
            )}
          />
        )}
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
