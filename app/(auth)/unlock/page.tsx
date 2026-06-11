"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bus, Lock, Unlock, XCircle, Fingerprint } from "lucide-react";

export default function UnlockPage() {
  const { unlockBus, loading, error, session, screen } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect to login after successful unlock
  useEffect(() => {
    if (success && screen === "login") {
      const timer = setTimeout(() => {
        router.replace("/login");
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [success, screen, router]);

  const displayError = localError || error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!password.trim()) {
      setLocalError("Device password is required");
      return;
    }

    try {
      await unlockBus(password);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Incorrect password";
      setLocalError(msg);
    }
  };

  return (
    <div className="min-h-dvh bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="auth-mesh-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="absolute w-[72px] h-[72px] rounded-2xl bg-amber-200/20 animate-[pulseRing_3s_ease-out_infinite]" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Bus className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">
            Bus<span className="text-amber-500">Track</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 font-light">Unlock Dashboard</p>
        </div>

        {/* Vehicle Badge */}
        {session.bd_plate && (
          <div className="flex justify-center mb-7 animate-fade-in">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm">
              <Bus className="w-3.5 h-3.5 text-primary-500" />
              <span className="text-sm font-mono font-semibold text-gray-700 tracking-wider">
                {session.bd_plate}
              </span>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="animate-slide-up">
          <Card variant="elevated" className="p-8 !rounded-[20px] !shadow-xl !shadow-amber-500/[0.04]">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-7">
              <div className="w-9 h-1.5 rounded-full bg-success" />
              <div className="w-9 h-1.5 rounded-full bg-amber-400" />
              <div className="w-9 h-1.5 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 mb-4">
                <Fingerprint className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Device Locked</h2>
              <p className="text-gray-400 text-sm mt-1.5 leading-relaxed max-w-[280px] mx-auto">
                Enter your device password to access the dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Device Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                showPasswordToggle
                autoFocus
              />

              {displayError && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
                  <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                  <p className="text-sm text-danger/90 leading-relaxed">{displayError}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <Unlock className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    Device unlocked! Redirecting...
                  </p>
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                <Unlock className="w-4 h-4" />
                Unlock Dashboard
              </Button>
            </form>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in">
          <p className="text-gray-300 text-[10px] tracking-wider font-mono">
            DEVICE {session.bd_device_id?.slice(0, 12).toUpperCase()}...
          </p>
        </div>
      </div>
    </div>
  );
}
