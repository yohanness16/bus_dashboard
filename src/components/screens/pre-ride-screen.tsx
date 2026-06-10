"use client";

import { useEffect, useState } from "react";
import {
  Bus,
  MapPin,
  Navigation,
  LogOut,
  Play,
  Loader2,
  Users,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/shared/toast-stack";
import { vehicleApi, assignmentApi } from "@/lib/api";
import { VehiclePosition } from "@/types";
import { LargeButton } from "@/components/shared/large-button";
import { ConnectionBadge } from "@/components/shared/connection-badge";
import { useBusWebSocket, type WSConnectionStatus } from "@/hooks/use-bus-websocket";

export function PreRideScreen() {
  const { session, vehicle, route, loadPreRideData, logout, setScreen } = useAuth();
  const { success, error: toastError } = useToast();
  const [position, setPosition] = useState<VehiclePosition | null>(null);
  const [starting, setStarting] = useState(false);

  const { status: wsStatus } = useBusWebSocket({
    token: session.driver_token || null,
    routeId: session.route_id || null,
    onMessage: (msg) => {
      if (msg.type === "vehicle_position") {
        setPosition({
          vehicle_id: msg.vehicle_id,
          plate_number: msg.plate_number,
          lat: msg.lat,
          lon: msg.lon,
          speed: msg.speed,
          timestamp: msg.timestamp,
          route_id: msg.route_id,
          occupancy_level: msg.occupancy_level,
        });
      }
    },
  });

  useEffect(() => {
    loadPreRideData();
    loadPosition();

    // Check for existing active assignment
    assignmentApi.getCurrent().then((res) => {
      if (res.data) {
        setScreen("active-ride");
      }
    }).catch(() => {
      // no active assignment, stay on pre-ride
    });
  }, []);

  const loadPosition = async () => {
    if (!session.vehicle_id) return;
    try {
      const res = await vehicleApi.getPosition(session.vehicle_id);
      setPosition(res.data);
    } catch {
      // non-fatal
    }
  };

  const handleStartRide = async () => {
    if (!vehicle?.route_id) {
      toastError("No route assigned to this vehicle");
      return;
    }
    setStarting(true);
    try {
      await assignmentApi.start(vehicle.route_id);
      success("Ride started!");
      setScreen("active-ride");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start ride";
      toastError(msg);
    } finally {
      setStarting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const formatCoord = (v?: number) =>
    v ? v.toFixed(4) : "—";

  const formatTime = (ts?: number | string) => {
    if (!ts) return "—";
    const d = new Date(typeof ts === "number" ? ts * 1000 : ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--surface-900)" }}>
      {/* Top Bar */}
      <header
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: "var(--surface-800)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-3">
          <Bus className="w-5 h-5" style={{ color: "var(--primary-400)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Pre-Ride
          </span>
          {vehicle && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--surface-700)", color: "var(--text-secondary)" }}>
              Bus #{vehicle.id}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ConnectionBadge status={wsStatus} compact />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
            style={{
              background: "var(--danger-dim)",
              border: "1px solid var(--danger-border)",
              color: "var(--danger)",
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Route & Vehicle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Route Card */}
          <div
            className="p-5 rounded-2xl"
            style={{
              background: "var(--surface-800)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Navigation className="w-4 h-4" style={{ color: "var(--primary-400)" }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Route
              </h3>
            </div>
            {route ? (
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {route.route_number}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {route.direction === "forward" ? "→ Forward" : "← Reverse"}
                  </p>
                </div>
                {route.origin && route.destination && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="font-medium">{route.origin}</span>
                    <span style={{ color: "var(--text-muted)" }}>→</span>
                    <span className="font-medium">{route.destination}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  <MapPin className="w-3.5 h-3.5" />
                  {route.stops?.length || 0} stops
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="skeleton h-8 w-24 rounded-lg" />
                <div className="skeleton h-4 w-40 rounded-lg" />
              </div>
            )}
          </div>

          {/* Vehicle Card */}
          <div
            className="p-5 rounded-2xl"
            style={{
              background: "var(--surface-800)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Bus className="w-4 h-4" style={{ color: "var(--accent-300)" }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Vehicle
              </h3>
            </div>
            {vehicle ? (
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {vehicle.plate_number}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Device: {vehicle.device_id}
                  </p>
                </div>
                {vehicle.capacity && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                    <Users className="w-3.5 h-3.5" />
                    Capacity: {vehicle.capacity}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  <Clock className="w-3.5 h-3.5" />
                  Last GPS: {formatCoord(position?.lat)}, {formatCoord(position?.lon)}
                  {position?.timestamp && (
                    <span> · {formatTime(position.timestamp)}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="skeleton h-8 w-32 rounded-lg" />
                <div className="skeleton h-4 w-48 rounded-lg" />
              </div>
            )}
          </div>
        </div>

        {/* Stops List */}
        {route?.stops && route.stops.length > 0 && (
          <div
            className="p-5 rounded-2xl"
            style={{
              background: "var(--surface-800)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4" style={{ color: "var(--success)" }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Route Stops ({route.stops.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {route.stops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm"
                  style={{
                    background: "var(--surface-700)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{
                      background: idx === 0
                        ? "var(--success-dim)"
                        : idx === route.stops.length - 1
                        ? "var(--danger-dim)"
                        : "var(--primary-500)",
                      color: idx === 0
                        ? "var(--success)"
                        : idx === route.stops.length - 1
                        ? "var(--danger)"
                        : "#fff",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {stop.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Ride Button */}
        <div className="pt-2 pb-6">
          <LargeButton
            variant="success"
            onClick={handleStartRide}
            loading={starting}
            icon={<Play className="w-5 h-5" />}
          >
            Start Ride
          </LargeButton>
        </div>
      </div>
    </div>
  );
}
