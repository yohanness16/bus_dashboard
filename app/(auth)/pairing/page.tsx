"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bus,
  KeyRound,
  Lock,
  Shield,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

export default function PairingPage() {
  const { pairDevice, loading, error } = useAuth();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const displayError = localError || error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!code.trim()) {
      setLocalError("Pairing code is required");
      return;
    }
    if (!password.trim()) {
      setLocalError("Password is required");
      return;
    }
    if (password.length < 4) {
      setLocalError("Password must be at least 4 characters");
      return;
    }

    try {
      await pairDevice(code.trim(), password);
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Pairing failed. Check your code and password.";
      setLocalError(msg);
    }
  };

  return (
    <div className="min-h-dvh bg-[#070B14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="auth-mesh-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo + Header */}
        <div className="text-center mb-10 animate-fade-in">
          {/* Animated logo mark */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-20 h-20 rounded-full bg-accent/20 animate-[pulseRing_3s_ease-out_infinite]" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-blue-500/10 border border-accent/20 flex items-center justify-center backdrop-blur-xl">
              <Bus className="w-7 h-7 text-accent" />
            </div>
          </div>

          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
            Bus<span className="text-accent">Track</span>
          </h1>
          <p className="text-white/40 text-sm mt-2 font-light tracking-wide">
            Device Pairing
          </p>
        </div>

        {/* Main Card — Liquid Glass */}
        <div className="animate-slide-up">
          <div className="relative">
            {/* Card glow */}
            <div className="absolute -inset-1 bg-gradient-to-b from-accent/10 via-transparent to-accent/5 rounded-[20px] blur-xl opacity-60" />

            <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] rounded-[20px] p-8">
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-8 h-1 rounded-full bg-accent" />
                <div className="w-8 h-1 rounded-full bg-white/10" />
                <div className="w-8 h-1 rounded-full bg-white/10" />
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-accent/10 border border-accent/15 mb-4">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-lg font-semibold text-white/90 tracking-tight">
                  Connect Device
                </h2>
                <p className="text-white/35 text-sm mt-1.5 leading-relaxed max-w-[280px] mx-auto">
                  Enter the pairing code from your admin panel to link this device
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Pairing Code"
                  placeholder="XXXX-XXXX-XXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  icon={<KeyRound className="w-4 h-4" />}
                  autoComplete="off"
                  autoFocus
                  error={displayError && !code.trim() ? "Required" : undefined}
                />

                <Input
                  label="Device Password"
                  type="password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  showPasswordToggle
                  helperText="Minimum 4 characters. Used to unlock this device."
                  error={
                    displayError && !password.trim()
                      ? "Required"
                      : password.length > 0 && password.length < 4
                      ? "Too short"
                      : undefined
                  }
                />

                {/* Error message */}
                {displayError && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/[0.08] border border-destructive/15">
                    <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive/90 leading-relaxed">
                      {displayError}
                    </p>
                  </div>
                )}

                {/* Success message */}
                {success && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-success/[0.08] border border-success/15">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <p className="text-sm text-success/90 leading-relaxed">
                      Device paired successfully! Redirecting...
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  loading={loading}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Pair Device
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in">
          <p className="text-white/20 text-[11px] tracking-widest uppercase">
            BusTrack Fleet Management
          </p>
        </div>
      </div>
    </div>
  );
}
