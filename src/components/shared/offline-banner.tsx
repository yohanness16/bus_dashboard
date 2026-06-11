"use client";

import { WifiOff, RefreshCw } from "lucide-react";

interface OfflineBannerProps {
  show: boolean;
}

export function OfflineBanner({ show }: OfflineBannerProps) {
  if (!show) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2.5 py-2.5 px-4 text-sm font-semibold"
      style={{
        background: "var(--danger-dim)",
        borderBottom: "1px solid var(--danger-border)",
        color: "var(--danger)",
        animation: "fadeInDown 0.3s ease-out",
        backdropFilter: "blur(8px)",
      }}
    >
      <WifiOff className="w-4 h-4" />
      <span>Connection lost — reconnecting...</span>
      <RefreshCw
        className="w-3.5 h-3.5"
        style={{ animation: "spin 1s linear infinite" }}
      />
    </div>
  );
}
