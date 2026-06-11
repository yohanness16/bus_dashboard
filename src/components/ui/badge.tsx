"use client";

import type { ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success" | "danger" | "warning" | "secondary";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-transparent bg-secondary text-secondary-foreground",
  primary: "border-transparent bg-primary text-primary-foreground",
  success: "border-transparent text-white",
  danger: "border-transparent text-white",
  warning: "border-transparent text-white",
  secondary: "border-transparent bg-muted text-muted-foreground",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const style: React.CSSProperties = {};
  if (variant === "success") style.background = "var(--success)";
  if (variant === "danger") style.background = "var(--danger)";
  if (variant === "warning") style.background = "var(--warning)";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
