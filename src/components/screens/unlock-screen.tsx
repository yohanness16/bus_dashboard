"use client";

import { useState } from "react";
import { Bus, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/shared/toast-stack";

export function UnlockScreen() {
  const { unlockBus, loading, error, session } = useAuth();
  const { error: toastError } = useToast();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;

    try {
      await unlockBus(password);
      setFailCount(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Incorrect password";
      toastError(msg);
      const newCount = failCount + 1;
      setFailCount(newCount);
      if (newCount >= 5) {
        setLocked(true);
        setTimeout(() => setLocked(false), 30000);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ background: "var(--surface-900)" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.04] anim-float"
          style={{ background: "radial-gradient(circle, var(--primary-500), transparent 70%)" }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 anim-fade-up">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(56,189,248,0.05))",
              border: "1px solid rgba(59,130,246,0.2)",
              boxShadow: "var(--shadow-glow-lg)",
            }}
          >
            <Bus className="w-10 h-10" style={{ color: "var(--primary-400)" }} />
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full"
              style={{ background: "var(--primary-500)", boxShadow: "0 0 12px var(--primary-500)", animation: "pulseGlow 2s infinite" }}
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Bus<span style={{ background: "linear-gradient(135deg, var(--accent-200), var(--primary-400))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Track</span>
          </h1>
          {session.bd_plate && (
            <p className="text-sm mt-2 font-medium" style={{ color: "var(--text-secondary)" }}>
              Bus — Plate: {session.bd_plate}
            </p>
          )}
        </div>

        {/* Card */}
        <div
          className="p-8 anim-fade-up"
          style={{
            background: "linear-gradient(180deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                Dashboard Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3.5 pl-11 pr-12 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: "var(--surface-800)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Enter device password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  disabled={locked}
                  onFocus={(e) => (e.target.style.border = "1px solid var(--primary-500)")}
                  onBlur={(e) => (e.target.style.border = "1px solid var(--border-subtle)")}
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {locked && (
              <div
                className="px-4 py-3 rounded-xl text-sm font-medium text-center"
                style={{ background: "var(--warning-dim)", border: "1px solid var(--warning-border)", color: "var(--warning)" }}
              >
                Too many attempts. Locked for 30 seconds.
              </div>
            )}

            {error && !locked && (
              <div
                className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: "var(--danger-dim)", border: "1px solid var(--danger-border)", color: "var(--danger)" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || locked}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, var(--primary-600), var(--primary-500))",
                color: "#fff",
                border: "1px solid rgba(59,130,246,0.3)",
                boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
              }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5" style={{ animation: "spin 0.8s linear infinite" }} />
              ) : (
                "Unlock Bus Dashboard"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
