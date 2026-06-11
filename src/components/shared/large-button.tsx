"use client";
import type { ReactNode } from "react";

interface LargeButtonProps {
  children: ReactNode; onClick?: () => void;
  variant?: "primary" | "success" | "danger" | "warning" | "secondary";
  disabled?: boolean; loading?: boolean; className?: string;
  type?: "button" | "submit"; icon?: ReactNode;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", border: "1px solid transparent" },
  success: { background: "var(--success)", color: "#fff", border: "1px solid transparent" },
  danger: { background: "var(--danger)", color: "#fff", border: "1px solid transparent" },
  warning: { background: "var(--warning)", color: "#fff", border: "1px solid transparent" },
  secondary: { background: "hsl(var(--secondary))", color: "hsl(var(--secondary-foreground))", border: "1px solid hsl(var(--border))" },
};

export function LargeButton({ children, onClick, variant = "primary", disabled, loading, className = "", type = "button", icon }: LargeButtonProps) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-md text-sm font-semibold uppercase tracking-wider transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-90 min-h-[48px] ${className}`}
      style={variantStyles[variant]}
    >
      {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{icon}{children}</>}
    </button>
  );
}
