"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  trend?: "up" | "down";
  trendValue?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "var(--primary-400)",
  trend,
  trendValue,
}: StatCardProps) {
  return (
    <div
      className="surface-card surface-card-hover p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && trendValue && (
          <div
            className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{
              background: trend === "up" ? "var(--success-dim)" : "var(--danger-dim)",
              color: trend === "up" ? "var(--success)" : "var(--danger)",
            }}
          >
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <p
        className="text-[10px] font-semibold uppercase tracking-wider mb-1"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </p>
      <p
        className="text-xl font-bold tabular-nums"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-[10px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
