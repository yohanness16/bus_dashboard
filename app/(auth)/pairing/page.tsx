"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bus,
  KeyRound,
  Lock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  Wifi,
} from "lucide-react";

export default function PairingPage() {
  const { pairDevice, loading, error, screen } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect to unlock after successful pairing
  useEffect(() => {
    if (success && screen === "unlock") {
      const timer = setTimeout(() => {
        router.replace("/unlock");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [success, screen, router]);

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
        err instanceof Error ? err.message : "Pairing failed. Check your code and password.";
      setLocalError(msg);
    }
  };

  return (
    <div className="min-h-dvh bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Blue gradient mesh background */}
      <div className="auth-mesh-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* Grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo + Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="absolute w-[72px] h-[72px] rounded-2xl bg-primary-200/30 animate-[pulseRing_3s_ease-out_infinite]" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Bus className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">
            Bus<span className="text-primary-600">Track</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 font-light">Device Pairing</p>
        </div>

        {/* Card */}
        <div className="animate-slide-up">
          <Card variant="elevated" className="p-8 !rounded-[20px] !shadow-xl !shadow-primary-500/[0.04]">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-7">
              <div className="w-9 h-1.5 rounded-full bg-primary-500" />
              <div className="w-9 h-1.5 rounded-full bg-gray-200" />
              <div className="w-9 h-1.5 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 border border-primary-100 mb-4">
                <ShieldCheck className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Connect Your Device</h2>
              <p className="text-gray-400 text-sm mt-1.5 leading-relaxed max-w-[280px] mx-auto">
                Enter the pairing code from your admin panel to link this device to your fleet
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Pairing Code"
                placeholder="BUS-XXXX-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                icon={<KeyRound className="w-4 h-4" />}
                autoComplete="off"
                autoFocus
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
              />

              {displayError && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
                  <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                  <p className="text-sm text-danger/90 leading-relaxed">{displayError}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    Device paired successfully! Redirecting...
                  </p>
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                <Sparkles className="w-4 h-4" />
                Pair Device
              </Button>
            </form>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in">
          <div className="flex items-center justify-center gap-1.5 text-gray-300">
            <Wifi className="w-3 h-3" />
            <span className="text-[10px] tracking-widest uppercase font-medium">Secure Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
