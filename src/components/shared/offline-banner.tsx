"use client";
import { WifiOff, RefreshCw } from "lucide-react";

interface OfflineBannerProps { show: boolean; }

export function OfflineBanner({ show }: OfflineBannerProps) {
  if (!show) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium border-b animate-fade-down" style={{ background: "var(--danger-bg)", borderColor: "var(--danger-border)", color: "var(--danger)", backdropFilter: "blur(8px)" }}>
      <WifiOff className="w-4 h-4" />
      <span>Connection lost — reconnecting...</span>
      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
    </div>
  );
}
