"use client";

import { useState } from "react";
import { Bus, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-muted/30">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary flex items-center justify-center relative">
            <Bus className="w-7 h-7 text-primary-foreground" />
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary animate-pulse-dot" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Bus<span className="text-primary">Track</span></h1>
          {session.bd_plate && (
            <p className="text-sm text-muted-foreground mt-1">Bus — Plate: {session.bd_plate}</p>
          )}
        </div>

        <div className="rounded-lg border bg-card shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Dashboard Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2 pl-10 pr-10 rounded-md border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="Enter device password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  disabled={locked}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {locked && (
              <div className="px-3 py-2 rounded-md text-sm text-center bg-warning-bg text-warning border border-warning-border">
                Too many attempts. Locked for 30 seconds.
              </div>
            )}

            {error && !locked && (
              <div className="px-3 py-2 rounded-md text-sm bg-danger-bg text-danger border border-danger-border">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || locked}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unlock Bus Dashboard"}
            </button>
          </form>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Protected device access</span>
        </div>
      </div>
    </div>
  );
}
