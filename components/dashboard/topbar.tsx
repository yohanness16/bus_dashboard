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
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-stroke flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        {routeNumber && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-content-tertiary">Route</span>
            <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg font-mono">
              {routeNumber}
            </span>
          </div>
        )}
      </div>

      {/* Center: Time */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 font-mono tracking-tight">
            {now ? formatTime(now) : "--:--:--"}
          </p>
          <p className="text-[10px] text-content-tertiary">
            {now ? formatDate(now) : "Loading..."}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <ConnectionStatus status={connectionStatus} compact />

        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-4 h-4 text-content-secondary" />
        </button>

        {session.driver_username && (
          <div className="flex items-center gap-2 pl-3 border-l border-stroke">
            <div className="w-8 h-8 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-content">{session.driver_username}</p>
              <p className="text-[10px] text-content-tertiary">Driver</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="p-2 rounded-lg hover:bg-red-50 text-content-tertiary hover:text-danger transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
