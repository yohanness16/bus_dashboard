"use client";

import { useAuth } from "@/providers/auth-provider";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { useBusWebSocket } from "@/hooks/use-bus-websocket";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ConnectionStatus } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, screen } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>("idle");

  const { status } = useBusWebSocket({
    // Use driver_token (user JWT) for WebSocket — bd_bus_token is a
    // bus_dashboard type token which the WebSocket endpoint rejects.
    token: session.driver_token || session.bd_bus_token || null,
    routeId: session.route_id,
  });

  useEffect(() => {
    setWsStatus(status);
  }, [status]);

  useEffect(() => {
    // Only redirect to auth screens if we're actually on an auth screen.
    // Don't redirect away from dashboard pages (pre-ride, active-ride, post-ride).
    if (screen === "pairing" && !pathname.startsWith("/pairing")) {
      router.replace("/pairing");
    } else if (screen === "unlock" && !pathname.startsWith("/unlock")) {
      router.replace("/unlock");
    } else if (screen === "login" && !pathname.startsWith("/login")) {
      router.replace("/login");
    }
  }, [screen, router, pathname]);

  return (
    <div className="flex min-h-dvh bg-surface-secondary">
      <Sidebar
        vehiclePlate={session.bd_plate}
        routeNumber={session.route_id?.toString()}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar connectionStatus={wsStatus} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
