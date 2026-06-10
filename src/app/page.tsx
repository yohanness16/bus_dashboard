"use client";

import { useAuth } from "@/providers/auth-provider";
import { PairingScreen } from "@/components/screens/pairing-screen";
import { UnlockScreen } from "@/components/screens/unlock-screen";
import { DriverLoginScreen } from "@/components/screens/driver-login-screen";
import { PreRideScreen } from "@/components/screens/pre-ride-screen";
import { ActiveRideScreen } from "@/components/screens/active-ride-screen";
import { PostRideScreen } from "@/components/screens/post-ride-screen";
import { Loader2 } from "lucide-react";

export default function BusDashboardApp() {
  const { screen } = useAuth();

  // Loading state
  if (screen === "pairing") {
    // Check if we have session data to determine actual screen
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("driver_token");
      const busToken = localStorage.getItem("bd_bus_token");
      const deviceId = localStorage.getItem("bd_device_id");

      if (token) {
        return <PreRideScreen />;
      } else if (busToken) {
        return <DriverLoginScreen />;
      } else if (deviceId) {
        return <UnlockScreen />;
      }
    }
    return <PairingScreen />;
  }

  switch (screen) {
    case "unlock":
      return <UnlockScreen />;
    case "login":
      return <DriverLoginScreen />;
    case "pre-ride":
      return <PreRideScreen />;
    case "active-ride":
      return <ActiveRideScreen />;
    case "post-ride":
      return <PostRideScreen />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface-900)" }}>
          <Loader2 className="w-8 h-8" style={{ color: "var(--primary-400)", animation: "spin 0.8s linear infinite" }} />
        </div>
      );
  }
}
