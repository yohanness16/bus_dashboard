"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  dot?: boolean;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", dot = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-gray-100 text-gray-600 border border-gray-200",
      primary: "bg-primary-50 text-primary-700 border border-primary-100",
      success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      warning: "bg-amber-50 text-amber-700 border border-amber-100",
      danger: "bg-red-50 text-red-700 border border-red-100",
    };

    const dotColors = {
      default: "bg-gray-400",
      primary: "bg-primary-500",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-danger",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
          variants[variant],
          className
        )}
        {...props}
      >
        {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />}
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";
export { Badge };
