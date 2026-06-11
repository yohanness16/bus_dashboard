"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, icon, disabled, children, ...props }, ref) => {
    const variants = {
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md border border-transparent",
      secondary:
        "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 border border-gray-200",
      danger:
        "bg-danger text-white hover:bg-red-600 focus:ring-danger shadow-sm border border-transparent",
      ghost:
        "bg-transparent text-content-secondary hover:bg-gray-100 hover:text-content border border-transparent",
      outline:
        "bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500 border border-primary-200",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-7 py-3.5 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium",
          "transition-all duration-200 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
          "cursor-pointer active:scale-[0.97]",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon ? icon : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
