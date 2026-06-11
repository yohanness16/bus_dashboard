"use client";
import { cn, getOccupancyLabel, getOccupancyColor } from "@/lib/utils";
import { Users, UserCheck, UserX } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OccupancyGaugeProps {
  level: number;
  peopleCount?: number;
  capacity?: number;
  compact?: boolean;
}

export function OccupancyGauge({ level, peopleCount, capacity, compact = false }: OccupancyGaugeProps) {
  const percentage = Math.round(level * 100);
  const label = getOccupancyLabel(level);
  const colorClass = getOccupancyColor(level);
  const Icon = level <= 0.33 ? UserX : level <= 0.66 ? UserCheck : Users;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeDasharray={`${percentage}, 100`} className={cn("transition-all duration-500", level <= 0.33 ? "text-success" : level > 0.33 && level <= 0.66 ? "text-warning" : "text-danger")} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-900 font-mono">{percentage}</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {peopleCount !== undefined && capacity && (
            <p className="text-xs text-content-tertiary">{peopleCount}/{capacity} passengers</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-medium text-content-secondary">Occupancy</h3>
        </div>
        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", level <= 0.33 ? "bg-emerald-50 text-emerald-700" : level > 0.33 && level <= 0.66 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700")}>
          {label}
        </span>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-100" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="2.5" strokeDasharray={`${percentage}, 100`} className={cn("transition-all duration-700 ease-out", level <= 0.33 ? "text-success" : level > 0.33 && level <= 0.66 ? "text-warning" : "text-danger")} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-gray-900 font-mono">{percentage}</span>
            <span className="text-[10px] text-content-tertiary">%</span>
          </div>
        </div>
      </div>

      <div className="occupancy-bar mb-2">
        <div className={cn("occupancy-fill", colorClass)} style={{ width: `${percentage}%` }} />
      </div>

      {peopleCount !== undefined && capacity && (
        <p className="text-center text-[10px] text-content-tertiary">
          {peopleCount} of {capacity} seats occupied
        </p>
      )}
    </Card>
  );
}
