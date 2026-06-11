"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "primary";
}

export function ConfirmationModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmationModalProps) {
  if (!open) return null;

  const colorMap = {
    danger: {
      color: "var(--danger)",
      bg: "var(--danger-dim)",
      border: "var(--danger-border)",
      glow: "0 0 20px rgba(248,113,113,0.15)",
    },
    warning: {
      color: "var(--warning)",
      bg: "var(--warning-dim)",
      border: "var(--warning-border)",
      glow: "0 0 20px rgba(251,191,36,0.15)",
    },
    primary: {
      color: "var(--primary-500)",
      bg: "var(--info-dim)",
      border: "var(--info-border)",
      glow: "0 0 20px rgba(59,130,246,0.15)",
    },
  };

  const colors = colorMap[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm p-6 rounded-2xl anim-scale-in"
        style={{
          background: "var(--surface-800)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.glow,
            }}
          >
            <AlertTriangle className="w-7 h-7" style={{ color: colors.color }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {message}
          </p>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200"
              style={{
                background: "var(--surface-700)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-600)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface-700)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200"
              style={{
                background: variant === "danger" ? "var(--danger)" : colors.color,
                color: "#fff",
                border: "none",
                boxShadow: `0 4px 12px ${colors.color}40`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = `0 6px 16px ${colors.color}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 12px ${colors.color}40`;
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
