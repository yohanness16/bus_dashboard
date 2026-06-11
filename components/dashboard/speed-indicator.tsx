"use client";

import { Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SpeedIndicatorProps {
  speed: number;
  maxSpeed?: number;
}

export function SpeedIndicator({ speed, maxSpeed = 120 }: SpeedIndicatorProps) {
  const clampedSpeed = Math.max(0, speed);
  const percentage = Math.min((clampedSpeed / maxSpeed) * 100, 100);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-medium text-content-secondary">Speed</h3>
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-bold text-gray-900 font-mono tracking-tighter">
          {Math.round(clampedSpeed)}
        </span>
        <span className="text-sm text-content-tertiary font-medium">km/h</span>
      </div>

      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-primary-500 to-primary-400"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-content-tertiary">0</span>
        <span className="text-[10px] text-content-tertiary">{maxSpeed}</span>
      </div>
    </Card>
  );
}
