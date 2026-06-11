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
    success: {
      bg: "var(--surface-800)",
      border: "var(--success-border)",
      color: "var(--success)",
      icon: "var(--success)",
      glow: "0 0 12px rgba(52,211,153,0.15)",
    },
    error: {
      bg: "var(--surface-800)",
      border: "var(--danger-border)",
      color: "var(--danger)",
      icon: "var(--danger)",
      glow: "0 0 12px rgba(248,113,113,0.15)",
    },
    warning: {
      bg: "var(--surface-800)",
      border: "var(--warning-border)",
      color: "var(--warning)",
      icon: "var(--warning)",
      glow: "0 0 12px rgba(251,191,36,0.15)",
    },
    info: {
      bg: "var(--surface-800)",
      border: "var(--info-border)",
      color: "var(--info)",
      icon: "var(--info)",
      glow: "0 0 12px rgba(96,165,250,0.15)",
    },
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
              className="flex items-start gap-3 px-4 py-3 rounded-xl anim-slide-right"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                boxShadow: `var(--shadow-lg), ${colors.glow}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${colors.color}15` }}
              >
                <Icon className="w-4 h-4" style={{ color: colors.icon }} />
              </div>
              <p
                className="text-sm font-medium flex-1"
                style={{ color: "var(--text-primary)" }}
              >
                {t.message}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 rounded-lg cursor-pointer transition-all duration-150"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-700)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                <X className="w-3.5 h-3.5" />
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
