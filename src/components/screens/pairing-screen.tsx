"use client";

import { useState, useEffect } from "react";
import { Bus, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/shared/toast-stack";

export function PairingScreen() {
  const { pairDevice, loading, error } = useAuth();
  const { error: toastError } = useToast();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (password.length < 6) { setLocalError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { setLocalError("Passwords don't match"); return; }
    if (!code.trim()) { setLocalError("Pairing code is required"); return; }
    try {
      await pairDevice(code.trim().toUpperCase(), password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Pairing failed";
      toastError(msg);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-muted/30">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary flex items-center justify-center">
            <Bus className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Bus<span className="text-primary">Track</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Device Pairing — First Time Setup</p>
        </div>

        <div className="rounded-lg border bg-card shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Pairing Code</label>
              <input
                className="w-full px-3 py-2 rounded-md border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all font-mono tracking-widest text-center text-lg"
                placeholder="BUS-XXXX-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={14}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Set Dashboard Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2 pr-10 rounded-md border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2 rounded-md border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all"
                  style={{ borderColor: confirmPassword && confirmPassword !== password ? "var(--danger)" : undefined }}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {displayError && (
              <div className="px-3 py-2 rounded-md text-sm bg-danger-bg text-danger border border-danger-border">
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pair Device"}
            </button>
          </form>

          <div className="mt-3 text-center">
            <p className="text-xs" style={{ color: timeLeft < 60 ? "var(--danger)" : "hsl(var(--muted-foreground))" }}>
              Code expires in {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secured with end-to-end encryption</span>
        </div>
      </div>
    </div>
  );
}
