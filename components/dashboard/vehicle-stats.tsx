"use client";
import { Vehicle } from "@/types";
import { Bus, Hash, Zap, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

interface VehicleStatsProps {
  vehicle: Vehicle | null;
  loading?: boolean;
}

export function VehicleStats({ vehicle, loading }: VehicleStatsProps) {
  if (loading) {
    return (
      <Card>
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-4 skeleton rounded" />)}</div>
      </Card>
    );
  }

  if (!vehicle) {
    return (
      <Card>
        <p className="text-sm text-content-tertiary text-center py-4">No vehicle data available</p>
      </Card>
    );
  }

  const stats = [
    { icon: Bus, label: "Plate Number", value: vehicle.plate_number },
    { icon: Hash, label: "Vehicle ID", value: `#${vehicle.id}` },
    { icon: Zap, label: "Device ID", value: vehicle.device_id?.slice(0, 12) + "..." || "N/A" },
    { icon: Calendar, label: "Bus Type", value: vehicle.bus_type || "Standard" },
  ];

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Bus className="w-4 h-4 text-primary-600" />
        <h3 className="text-sm font-medium text-content-secondary">Vehicle Info</h3>
      </div>
      <div className="space-y-2.5">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <stat.icon className="w-3.5 h-3.5 text-content-tertiary" />
              <span className="text-[11px] text-content-tertiary">{stat.label}</span>
            </div>
            <span className="text-xs font-mono font-medium text-content">{stat.value}</span>
          </div>
        ))}
        <div className="pt-2.5 border-t border-stroke">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-content-tertiary">Capacity</span>
            <span className="text-xs font-mono font-medium text-content">{vehicle.capacity || "—"} seats</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
