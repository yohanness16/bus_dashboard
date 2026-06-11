"use client";
import { Wifi, WifiOff, type LucideIcon } from "lucide-react";
import type { WSConnectionStatus } from "@/hooks/use-bus-websocket";

interface ConnectionBadgeProps { status: WSConnectionStatus; compact?: boolean; }

interface BadgeConfig { icon: LucideIcon; label: string; color: string; bg: string; border: string; pulse: boolean }

export function ConnectionBadge({ status, compact }: ConnectionBadgeProps) {
  const configs: Record<WSConnectionStatus, BadgeConfig> = {
    connected: { icon: Wifi, label: "LIVE", color: "var(--success)", bg: "var(--success-bg)", border: "var(--success-border)", pulse: true },
    connecting: { icon: Wifi, label: "Connecting", color: "var(--warning)", bg: "var(--warning-bg)", border: "var(--warning-border)", pulse: false },
    disconnected: { icon: WifiOff, label: "Offline", color: "var(--danger)", bg: "var(--danger-bg)", border: "var(--danger-border)", pulse: false },
    error: { icon: WifiOff, label: "Error", color: "var(--danger)", bg: "var(--danger-bg)", border: "var(--danger-border)", pulse: false },
    idle: { icon: WifiOff, label: "Idle", color: "hsl(var(--muted-foreground))", bg: "hsl(var(--secondary))", border: "hsl(var(--border))", pulse: false },
  };
  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 rounded-full border font-medium ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`} style={{ background: config.bg, borderColor: config.border, color: config.color }}>
      <Icon className="w-3 h-3" />
      {config.pulse && <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: config.color }} />}
      {config.label}
    </div>
  );
}
