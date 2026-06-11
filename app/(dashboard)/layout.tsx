"use client";

import { useAuth } from "@/providers/auth-provider";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { useBusWebSocket } from "@/hooks/use-bus-websocket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ConnectionStatus } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, screen } = useAuth();
  const router = useRouter();
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>("idle");

  const { status } = useBusWebSocket({
    token: session.bd_bus_token || null,
    routeId: session.route_id,
  });

  useEffect(() => {
    setWsStatus(status);
  }, [status]);

  useEffect(() => {
    if (screen === "pairing") router.replace("/pairing");
    else if (screen === "unlock") router.replace("/unlock");
    else if (screen === "login") router.replace("/login");
  }, [screen, router]);

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
