"use client";

import { useAuth } from "@/providers/auth-provider";
import { useCurrentTime } from "@/hooks/use-current-time";
import { ConnectionStatus } from "./connection-status";
import { formatTime, formatDate } from "@/lib/utils";
import { Bell, LogOut, User } from "lucide-react";
import type { ConnectionStatus as WSStatus } from "@/types";

interface TopbarProps {
  connectionStatus?: WSStatus;
  routeNumber?: string;
}

export function Topbar({ connectionStatus = "idle", routeNumber }: TopbarProps) {
  const { session, logout } = useAuth();
  const now = useCurrentTime();

  return (
    <header className="h-16 bg-bg-surface/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Route info */}
      <div className="flex items-center gap-4">
        {routeNumber && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Route</span>
            <span className="text-sm font-mono font-bold text-accent bg-accent/10 px-2.5 py-0.5 rounded">
              {routeNumber}
            </span>
          </div>
        )}
      </div>

      {/* Center: Time & Date */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-lg font-mono font-bold text-text-primary tracking-tight">
            {now ? formatTime(now) : "--:--:--"}
          </p>
          <p className="text-xs text-text-muted">
            {now ? formatDate(now) : "Loading..."}
          </p>
        </div>
      </div>

      {/* Right: Status + User */}
      <div className="flex items-center gap-4">
        <ConnectionStatus status={connectionStatus} compact />

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-bg-elevated transition-colors">
          <Bell className="w-4 h-4 text-text-secondary" />
        </button>

        {/* User info */}
        {session.driver_username && (
          <div className="flex items-center gap-2 pl-4 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
              <User className="w-4 h-4 text-accent" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-text-primary">
                {session.driver_username}
              </p>
              <p className="text-xs text-text-muted">Driver</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-destructive/10 text-text-muted hover:text-destructive transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
