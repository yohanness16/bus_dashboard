"use client";

import { Vehicle } from "@/types";
import { Bus, Calendar, Hash, Zap } from "lucide-react";

interface VehicleStatsProps {
  vehicle: Vehicle | null;
  loading?: boolean;
}

export function VehicleStats({ vehicle, loading }: VehicleStatsProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 skeleton rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="card">
        <p className="text-sm text-text-muted text-center py-4">
          No vehicle data available
        </p>
      </div>
    );
  }

  const stats = [
    {
      icon: Bus,
      label: "Plate Number",
      value: vehicle.plate_number,
    },
    {
      icon: Hash,
      label: "Vehicle ID",
      value: `#${vehicle.id}`,
    },
    {
      icon: Zap,
      label: "Device ID",
      value: vehicle.device_id?.slice(0, 12) + "..." || "N/A",
    },
    {
      icon: Calendar,
      label: "Bus Type",
      value: vehicle.bus_type || "Standard",
    },
  ];

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Bus className="w-5 h-5 text-accent" />
        <h3 className="text-sm font-medium text-text-secondary">
          Vehicle Info
        </h3>
      </div>

      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <stat.icon className="w-4 h-4 text-text-muted" />
              <span className="text-xs text-text-muted">{stat.label}</span>
            </div>
            <span className="text-sm font-mono font-medium text-text-primary">
              {stat.value}
            </span>
          </div>
        ))}

        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Capacity</span>
            <span className="text-sm font-mono font-medium text-text-primary">
              {vehicle.capacity || "—"} seats
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
