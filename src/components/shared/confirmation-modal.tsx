"use client";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean; title: string; message: string;
  confirmLabel?: string; cancelLabel?: string;
  onConfirm: () => void; onCancel: () => void;
  variant?: "danger" | "warning" | "primary";
}

export function ConfirmationModal({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel, variant = "danger" }: ConfirmationModalProps) {
  if (!open) return null;
  const colorMap = { danger: "var(--danger)", warning: "var(--warning)", primary: "hsl(var(--primary))" };
  const bgMap = { danger: "var(--danger-bg)", warning: "var(--warning-bg)", primary: "var(--info-bg)" };
  const borderMap = { danger: "var(--danger-border)", warning: "var(--warning-border)", primary: "var(--info-border)" };
  const color = colorMap[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm p-6 rounded-lg border bg-card shadow-xl animate-scale-in">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: bgMap[variant], border: `1px solid ${borderMap[variant]}` }}>
            <AlertTriangle className="w-6 h-6" style={{ color }} />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex gap-3 w-full mt-2">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-md border bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer">{cancelLabel}</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white transition-colors cursor-pointer" style={{ background: color }}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
