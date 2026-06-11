"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OccupancyGauge } from "@/components/dashboard/occupancy-gauge";
import { VehicleStats } from "@/components/dashboard/vehicle-stats";
import { ConnectionStatus } from "@/components/dashboard/connection-status";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useBusWebSocket } from "@/hooks/use-bus-websocket";
import { formatTime } from "@/lib/utils";
import {
  Bus,
  Route,
  Play,
  MapPin,
  Clock,
  Users,
  Navigation,
  ArrowRight,
  Loader2,
} from "lucide-react";
import type { ConnectionStatus as WSStatus, WSVehiclePosition } from "@/types";

export default function PreRidePage() {
  const { session, vehicle, route, loadPreRideData, loading } = useAuth();
  const router = useRouter();
  const now = useCurrentTime();
  const [wsStatus, setWsStatus] = useState<WSStatus>("idle");
  const [vehiclePos, setVehiclePos] = useState<WSVehiclePosition | null>(null);

  const { status } = useBusWebSocket({
    token: session.bd_bus_token || null,
    routeId: session.route_id,
    onMessage: (msg) => {
      if (msg.type === "vehicle_position") {
        setVehiclePos(msg);
      }
    },
  });

  useEffect(() => {
    setWsStatus(status);
  }, [status]);

  useEffect(() => {
    loadPreRideData();
  }, [loadPreRideData]);

  const handleStartRide = () => {
    router.push("/dashboard/ride");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Pre-Ride Overview
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Review your vehicle and route before starting
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus status={wsStatus} />
          <div className="text-right">
            <p className="text-lg font-mono font-bold text-text-primary">
              {now ? formatTime(now) : "--:--:--"}
            </p>
            <p className="text-xs text-text-muted">
              {now?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Vehicle Info Card */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Bus className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-medium text-text-secondary">
              Vehicle
            </h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 skeleton rounded" />
              ))}
            </div>
          ) : vehicle ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Plate</span>
                <span className="text-sm font-mono font-bold text-text-primary">
                  {vehicle.plate_number}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Type</span>
                <span className="text-sm text-text-primary">
                  {vehicle.bus_type || "Standard"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Capacity</span>
                <span className="text-sm text-text-primary">
                  {vehicle.capacity || "—"} seats
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Status</span>
                <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                  {vehicle.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-4">
              No vehicle data
            </p>
          )}
        </Card>

        {/* Route Info Card */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Route className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-medium text-text-secondary">Route</h3>
          </div>
          {route ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Number</span>
                <span className="text-sm font-mono font-bold text-accent">
                  {route.route_number}
                </span>
              </div>
              {route.name && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Name</span>
                  <span className="text-sm text-text-primary">{route.name}</span>
                </div>
              )}
              {route.origin && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-success shrink-0" />
                  <span className="text-xs text-text-secondary">
                    From: {route.origin}
                  </span>
                </div>
              )}
              {route.destination && (
                <div className="flex items-center gap-2">
                  <Navigation className="w-3 h-3 text-destructive shrink-0" />
                  <span className="text-xs text-text-secondary">
                    To: {route.destination}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Stops</span>
                <span className="text-sm text-text-primary">
                  {route.stops?.length || 0} stops
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-4">
              No route assigned
            </p>
          )}
        </Card>

        {/* Occupancy Card */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-medium text-text-secondary">
              Occupancy
            </h3>
          </div>
          <div className="flex items-center justify-center py-4">
            <OccupancyGauge
              level={vehiclePos?.occupancy_level ?? 0}
              peopleCount={0}
              capacity={vehicle?.capacity}
              compact
            />
          </div>
        </Card>

        {/* Telemetry Card */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-medium text-text-secondary">
              Telemetry
            </h3>
          </div>
          {vehiclePos ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Latitude</span>
                <span className="text-sm font-mono text-text-primary">
                  {vehiclePos.lat.toFixed(6)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Longitude</span>
                <span className="text-sm font-mono text-text-primary">
                  {vehiclePos.lon.toFixed(6)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Speed</span>
                <span className="text-sm font-mono text-text-primary">
                  {vehiclePos.speed?.toFixed(1) || "0.0"} km/h
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-4">
              Waiting for GPS data...
            </p>
          )}
        </Card>

        {/* Stops Preview */}
        {route && route.stops && route.stops.length > 0 && (
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-accent" />
              <h3 className="text-sm font-medium text-text-secondary">
                Route Stops ({route.stops.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto no-scrollbar">
              {route.stops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-elevated/50"
                >
                  <span className="text-xs font-mono text-text-muted w-5">
                    {idx + 1}.
                  </span>
                  <span className="text-xs text-text-secondary truncate">
                    {stop.name}
                  </span>
                  {stop.is_terminal && (
                    <span className="text-xs text-destructive ml-auto">T</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Start Ride CTA */}
      <div className="flex justify-center pt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleStartRide}
          className="min-w-[280px] text-base"
          icon={<Play className="w-5 h-5" />}
        >
          Start Ride
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
