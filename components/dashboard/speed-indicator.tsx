"use client";

import { Gauge } from "lucide-react";

interface SpeedIndicatorProps {
  speed: number; // km/h
  maxSpeed?: number;
}

export function SpeedIndicator({ speed, maxSpeed = 120 }: SpeedIndicatorProps) {
  const clampedSpeed = Math.max(0, speed);
  const percentage = Math.min((clampedSpeed / maxSpeed) * 100, 100);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-accent" />
          <h3 className="text-sm font-medium text-text-secondary">Speed</h3>
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-mono font-bold text-text-primary tracking-tighter">
          {Math.round(clampedSpeed)}
        </span>
        <span className="text-sm text-text-muted font-medium">km/h</span>
      </div>

      {/* Speed bar */}
      <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-accent to-blue-400"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-xs text-text-muted">0</span>
        <span className="text-xs text-text-muted">{maxSpeed}</span>
      </div>
    </div>
  );
}
