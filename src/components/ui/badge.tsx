"use client";

import type { ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success" | "danger" | "warning" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; border: string; color: string }> = {
  default: {
    bg: "var(--surface-700)",
    border: "var(--border-subtle)",
    color: "var(--text-secondary)",
  },
  primary: {
    bg: "var(--info-dim)",
    border: "var(--info-border)",
    color: "var(--info)",
  },
  success: {
    bg: "var(--success-dim)",
    border: "var(--success-border)",
    color: "var(--success)",
  },
  danger: {
    bg: "var(--danger-dim)",
    border: "var(--danger-border)",
    color: "var(--danger)",
  },
  warning: {
    bg: "var(--warning-dim)",
    border: "var(--warning-border)",
    color: "var(--warning)",
  },
  info: {
    bg: "var(--info-dim)",
    border: "var(--info-border)",
    color: "var(--info)",
  },
};

export function Badge({
  children,
  variant = "default",
  dot = false,
  className = "",
}: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${className}`}
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        color: styles.color,
      }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: styles.color }}
        />
      )}
      {children}
    </span>
  );
}
