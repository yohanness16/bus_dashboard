"use client";

import type { ReactNode } from "react";

interface LargeButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "success" | "danger" | "warning" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit";
  icon?: ReactNode;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, var(--primary-600), var(--primary-500))",
    color: "#fff",
    border: "1px solid rgba(59,130,246,0.3)",
    boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
  },
  success: {
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "#fff",
    border: "1px solid rgba(16,185,129,0.3)",
    boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
  },
  danger: {
    background: "linear-gradient(135deg, #dc2626, #ef4444)",
    color: "#fff",
    border: "1px solid rgba(239,68,68,0.3)",
    boxShadow: "0 4px 20px rgba(239,68,68,0.3)",
  },
  warning: {
    background: "linear-gradient(135deg, #d97706, #f59e0b)",
    color: "#fff",
    border: "1px solid rgba(245,158,11,0.3)",
    boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
  },
  secondary: {
    background: "var(--surface-700)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-default)",
    boxShadow: "var(--shadow-sm)",
  },
};

export function LargeButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  loading,
  className = "",
  type = "button",
  icon,
}: LargeButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-base font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[56px] hover:brightness-110 ${className}`}
      style={variantStyles[variant]}
    >
      {loading ? (
        <span
          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
          style={{ animation: "spin 0.8s linear infinite" }}
        />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
