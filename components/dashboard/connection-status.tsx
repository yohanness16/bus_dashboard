"use client";

import { Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ConnectionStatus } from "@/types";

interface ConnectionStatusProps {
  status: ConnectionStatus;
  compact?: boolean;
}

export function ConnectionStatus({ status, compact = false }: ConnectionStatusProps) {
  const config = {
    idle: { icon: WifiOff, label: "Idle", variant: "default" as const, dot: false },
    connecting: { icon: Loader2, label: "Connecting", variant: "warning" as const, dot: true },
    connected: { icon: Wifi, label: "Live", variant: "success" as const, dot: true },
    disconnected: { icon: WifiOff, label: "Offline", variant: "danger" as const, dot: false },
    error: { icon: AlertTriangle, label: "Error", variant: "danger" as const, dot: true },
  };

  const { icon: Icon, label, variant, dot } = config[status];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 ${status === "connected" ? "text-success" : status === "connecting" ? "text-warning animate-spin" : status === "error" ? "text-danger" : "text-gray-400"}`} />
        <span className="text-[11px] text-content-tertiary font-medium">{label}</span>
      </div>
    );
  }

  return (
    <Badge variant={variant} dot={dot}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}
