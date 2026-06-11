"use client";

import { useState } from "react";
import { Bus, User, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/shared/toast-stack";

export function DriverLoginScreen() {
  const { driverLogin, loading, error, session } = useAuth();
  const { error: toastError } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await driverLogin(username, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      toastError(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-muted/30">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary flex items-center justify-center">
            <Bus className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Bus<span className="text-primary">Track</span>
          </h1>
          {session.bd_plate && (
            <p className="text-sm text-muted-foreground mt-1">Bus — Plate: {session.bd_plate}</p>
          )}
        </div>

        {/* Card */}
        <div className="rounded-lg border bg-card shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 pl-10 rounded-md border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="john.doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2 pl-10 pr-10 rounded-md border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            {error && (
              <div className="px-3 py-2 rounded-md text-sm bg-danger-bg text-danger border border-danger-border">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login as Driver"}
            </button>
          </form>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Authorized personnel only</span>
        </div>
      </div>
    </div>
  );
}
