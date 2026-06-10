"use client";

import { Wifi, WifiOff } from "lucide-react";
import type { WSConnectionStatus } from "@/hooks/use-bus-websocket";

interface ConnectionBadgeProps {
  status: WSConnectionStatus;
  compact?: boolean;
}

export function ConnectionBadge({ status, compact }: ConnectionBadgeProps) {
  const config = {
    connected: {
      icon: Wifi,
      label: "LIVE",
      color: "var(--success)",
      bg: "var(--success-dim)",
      border: "var(--success-border)",
      pulse: true,
    },
    connecting: {
      icon: Wifi,
      label: "Connecting",
      color: "var(--warning)",
      bg: "var(--warning-dim)",
      border: "var(--warning-border)",
      pulse: false,
    },
    disconnected: {
      icon: WifiOff,
      label: "Offline",
      color: "var(--danger)",
      bg: "var(--danger-dim)",
      border: "var(--danger-border)",
      pulse: false,
    },
    error: {
      icon: WifiOff,
      label: "Error",
      color: "var(--danger)",
      bg: "var(--danger-dim)",
      border: "var(--danger-border)",
      pulse: false,
    },
    idle: {
      icon: WifiOff,
      label: "Idle",
      color: "var(--text-muted)",
      bg: "var(--surface-800)",
      border: "var(--border-subtle)",
      pulse: false,
    },
  }[status];

  const Icon = config.icon;

  if (compact) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
        style={{
          background: config.bg,
          border: `1px solid ${config.border}`,
          color: config.color,
        }}
      >
        <Icon className="w-3 h-3" />
        {config.pulse && (
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: config.color,
              animation: "pulse 2s infinite",
            }}
          />
        )}
        {config.label}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
      }}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.pulse && (
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background: config.color,
            animation: "pulse 2s infinite",
          }}
        />
      )}
      {config.label}
    </div>
  );
}
