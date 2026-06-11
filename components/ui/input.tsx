"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      icon,
      id,
      type,
      showPasswordToggle = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium uppercase tracking-wider text-text-muted"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {/* Subtle glow on focus */}
          <div className="absolute -inset-0.5 rounded-[14px] bg-accent/0 group-focus-within:bg-accent/20 blur-sm transition-all duration-500" />

          <div className="relative">
            {icon && (
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors duration-300">
                {icon}
              </div>
            )}
            <input
              ref={ref}
              id={inputId}
              type={inputType}
              className={cn(
                "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5",
                "text-text-primary text-sm placeholder:text-text-muted/60",
                "focus:outline-none focus:border-accent/40 focus:bg-white/[0.06]",
                "transition-all duration-300",
                "hover:border-white/[0.12]",
                error &&
                  "border-destructive/50 focus:border-destructive/50 focus:ring-destructive/30",
                icon && "pl-11",
                (isPassword || (isPassword && showPasswordToggle)) && "pr-11",
                className
              )}
              {...props}
            />
            {isPassword && showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors duration-200 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
        {error && (
          <p className="text-xs text-destructive mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-text-muted/70 mt-1.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
