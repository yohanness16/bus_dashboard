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
    danger: "var(--danger)",
    warning: "var(--warning)",
    primary: "var(--primary-500)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
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
            style={{ background: `${colorMap[variant]}15`, border: `1px solid ${colorMap[variant]}30` }}
          >
            <AlertTriangle className="w-7 h-7" style={{ color: colorMap[variant] }} />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{message}</p>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all"
              style={{
                background: "var(--surface-700)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all"
              style={{
                background: variant === "danger" ? "var(--danger)" : colorMap[variant],
                color: "#fff",
                border: "none",
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
