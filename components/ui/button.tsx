"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-gradient-to-r from-accent to-blue-500 text-white hover:from-accent-hover hover:to-blue-600 focus:ring-accent shadow-[0_0_30px_rgba(37,99,235,0.25)] hover:shadow-[0_0_40px_rgba(37,99,235,0.35)] border border-white/[0.08]",
      secondary:
        "bg-white/[0.06] text-text-primary hover:bg-white/[0.1] focus:ring-bg-elevated border border-white/[0.08] backdrop-blur-sm",
      danger:
        "bg-gradient-to-r from-destructive to-red-500 text-white hover:from-red-700 hover:to-red-600 focus:ring-destructive shadow-[0_0_20px_rgba(220,38,38,0.2)] border border-white/[0.08]",
      ghost:
        "bg-transparent text-text-secondary hover:bg-white/[0.06] hover:text-text-primary border border-transparent",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center gap-2.5 rounded-xl font-semibold",
          "transition-all duration-300 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
          "cursor-pointer active:scale-[0.97]",
          "overflow-hidden",
          // Shimmer overlay on hover
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/[0.08] before:to-transparent",
          "before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : icon ? (
          <span className="relative z-10">{icon}</span>
        ) : null}
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
