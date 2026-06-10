"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextId, setNextId] = useState(1);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId;
      setNextId((n) => n + 1);
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [nextId]
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    toast: addToast,
    success: (m: string) => addToast("success", m),
    error: (m: string) => addToast("error", m),
    warning: (m: string) => addToast("warning", m),
    info: (m: string) => addToast("info", m),
  };

  const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colorMap = {
    success: { bg: "var(--success-dim)", border: "var(--success-border)", color: "var(--success)", icon: "var(--success)" },
    error: { bg: "var(--danger-dim)", border: "var(--danger-border)", color: "var(--danger)", icon: "var(--danger)" },
    warning: { bg: "var(--warning-dim)", border: "var(--warning-border)", color: "var(--warning)", icon: "var(--warning)" },
    info: { bg: "var(--info-dim)", border: "var(--info-border)", color: "var(--info)", icon: "var(--info)" },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => {
          const Icon = iconMap[t.type];
          const colors = colorMap[t.type];
          return (
            <div
              key={t.id}
              className="flex items-start gap-3 px-4 py-3 rounded-xl anim-slide-left"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: colors.icon }} />
              <p className="text-sm font-medium flex-1" style={{ color: "var(--text-primary)" }}>
                {t.message}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-0.5 rounded-md cursor-pointer"
                style={{ color: "var(--text-muted)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
