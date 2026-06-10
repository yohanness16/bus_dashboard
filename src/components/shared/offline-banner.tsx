"use client";

import { WifiOff } from "lucide-react";

interface OfflineBannerProps {
  show: boolean;
}

export function OfflineBanner({ show }: OfflineBannerProps) {
  if (!show) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold"
      style={{
        background: "var(--danger-dim)",
        borderBottom: "1px solid var(--danger-border)",
        color: "var(--danger)",
        animation: "fadeInDown 0.3s ease-out",
      }}
    >
      <WifiOff className="w-4 h-4" />
      Connection lost — reconnecting...
    </div>
  );
}
