"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";
interface Toast { id: number; type: ToastType; message: string; }
interface ToastContextType { toast: (type: ToastType, message: string) => void; success: (msg: string) => void; error: (msg: string) => void; warning: (msg: string) => void; info: (msg: string) => void; }
const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextId, setNextId] = useState(1);
  const addToast = useCallback((type: ToastType, message: string) => {
    const id = nextId; setNextId((n) => n + 1);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, [nextId]);
  const removeToast = useCallback((id: number) => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, []);

  const iconMap = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info };
  const colorMap: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: "var(--success-bg)", border: "var(--success-border)", icon: "var(--success)" },
    error: { bg: "var(--danger-bg)", border: "var(--danger-border)", icon: "var(--danger)" },
    warning: { bg: "var(--warning-bg)", border: "var(--warning-border)", icon: "var(--warning)" },
    info: { bg: "var(--info-bg)", border: "var(--info-border)", icon: "var(--info)" },
  };

  return (
    <ToastContext.Provider value={{ toast: addToast, success: (m: string) => addToast("success", m), error: (m: string) => addToast("error", m), warning: (m: string) => addToast("warning", m), info: (m: string) => addToast("info", m) }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => {
          const Icon = iconMap[t.type]; const c = colorMap[t.type];
          return (
            <div key={t.id} className="flex items-start gap-3 px-4 py-3 rounded-lg border bg-card shadow-lg animate-slide-in-right">
              <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: c.icon }} />
              <p className="text-sm font-medium flex-1 text-card-foreground">{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-3.5 h-3.5" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() { const ctx = useContext(ToastContext); if (!ctx) throw new Error("useToast must be used within ToastProvider"); return ctx; }
