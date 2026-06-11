"use client";

import { cn, getOccupancyLabel, getOccupancyColor } from "@/lib/utils";
import { Users, UserCheck, UserX } from "lucide-react";

interface OccupancyGaugeProps {
  level: number; // 0-1 scale
  peopleCount?: number;
  capacity?: number;
  compact?: boolean;
}

export function OccupancyGauge({
  level,
  peopleCount,
  capacity,
  compact = false,
}: OccupancyGaugeProps) {
  const percentage = Math.round(level * 100);
  const label = getOccupancyLabel(level);
  const colorClass = getOccupancyColor(level);

  const Icon =
    level <= 0.33 ? UserX : level <= 0.66 ? UserCheck : Users;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-bg-elevated"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeWidth="3"
              strokeDasharray={`${percentage}, 100`}
              className={cn(
                "transition-all duration-500",
                level <= 0.33 && "text-success",
                level > 0.33 && level <= 0.66 && "text-warning",
                level > 0.66 && "text-destructive"
              )}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-mono font-bold text-text-primary">
              {percentage}
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{label}</p>
          {peopleCount !== undefined && capacity && (
            <p className="text-xs text-text-muted">
              {peopleCount}/{capacity} passengers
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-accent" />
          <h3 className="text-sm font-medium text-text-secondary">
            Occupancy Level
          </h3>
        </div>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            level <= 0.33 && "bg-success/10 text-success",
            level > 0.33 && level <= 0.66 && "bg-warning/10 text-warning",
            level > 0.66 && "bg-destructive/10 text-destructive"
          )}
        >
          {label}
        </span>
      </div>

      {/* Circular gauge */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-bg-elevated"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeWidth="2.5"
              strokeDasharray={`${percentage}, 100`}
              className={cn(
                "transition-all duration-700 ease-out",
                level <= 0.33 && "text-success",
                level > 0.33 && level <= 0.66 && "text-warning",
                level > 0.66 && "text-destructive"
              )}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-mono font-bold text-text-primary">
              {percentage}
            </span>
            <span className="text-xs text-text-muted">%</span>
          </div>
        </div>
      </div>

      {/* Linear bar */}
      <div className="occupancy-bar mb-2">
        <div
          className={cn("occupancy-fill", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {peopleCount !== undefined && capacity && (
        <p className="text-center text-xs text-text-muted">
          {peopleCount} of {capacity} seats occupied
        </p>
      )}
    </div>
  );
}
