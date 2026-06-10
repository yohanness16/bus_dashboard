"use client";

import { useState } from "react";
import { Bus, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/shared/toast-stack";

export function PairingScreen() {
  const { pairDevice, loading, error } = useAuth();
  const { error: toastError } = useToast();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 min countdown
  const [localError, setLocalError] = useState<string | null>(null);

  // Countdown timer
  useState(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  });

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords don't match");
      return;
    }
    if (!code.trim()) {
      setLocalError("Pairing code is required");
      return;
    }

    try {
      await pairDevice(code.trim().toUpperCase(), password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Pairing failed";
      toastError(msg);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ background: "var(--surface-900)" }}>
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.04] anim-float"
          style={{ background: "radial-gradient(circle, var(--primary-500), transparent 70%)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.03] anim-float"
          style={{ background: "radial-gradient(circle, var(--accent-300), transparent 70%)", animationDelay: "3s" }}
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
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Bus<span style={{ background: "linear-gradient(135deg, var(--accent-200), var(--primary-400))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Track</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-tertiary)" }}>
            Device Pairing — First Time Setup
          </p>
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
            {/* Pairing Code */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                Pairing Code
              </label>
              <input
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 font-mono tracking-widest text-center text-lg"
                style={{
                  background: "var(--surface-800)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
                placeholder="BUS-XXXX-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={14}
                required
                autoFocus
                onFocus={(e) => (e.target.style.border = "1px solid var(--primary-500)")}
                onBlur={(e) => (e.target.style.border = "1px solid var(--border-subtle)")}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                Set Dashboard Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: "var(--surface-800)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  onFocus={(e) => (e.target.style.border = "1px solid var(--primary-500)")}
                  onBlur={(e) => (e.target.style.border = "1px solid var(--border-subtle)")}
                />
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

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: "var(--surface-800)",
                    border: `1px solid ${confirmPassword && confirmPassword !== password ? "var(--danger)" : "var(--border-subtle)"}`,
                    color: "var(--text-primary)",
                  }}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  onFocus={(e) => (e.target.style.border = "1px solid var(--primary-500)")}
                  onBlur={(e) => (e.target.style.border = confirmPassword && confirmPassword !== password ? "1px solid var(--danger)" : "1px solid var(--border-subtle)")}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              </div>
            </div>

            {/* Error */}
            {displayError && (
              <div
                className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: "var(--danger-dim)",
                  border: "1px solid var(--danger-border)",
                  color: "var(--danger)",
                }}
              >
                {displayError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
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
                "Pair Device"
              )}
            </button>
          </form>

          {/* Timer */}
          <div className="mt-4 text-center">
            <p className="text-xs font-medium" style={{ color: timeLeft < 60 ? "var(--danger)" : "var(--text-muted)" }}>
              Code expires in {formatTime(timeLeft)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
