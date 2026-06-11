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
  Route,
  ChevronRight,
  Wifi,
  Map,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/shared/toast-stack";
import { vehicleApi, assignmentApi, routeApi } from "@/lib/api";
import { VehiclePosition, RouteWithStops } from "@/types";
import { ConnectionBadge } from "@/components/shared/connection-badge";
import { useBusWebSocket } from "@/hooks/use-bus-websocket";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("./live-map"), { ssr: false });

// ─── Welcome Banner ───
function WelcomeBanner({ driverName }: { driverName: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateStr = now.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(15,23,42,0.6) 100%)",
        border: "1px solid rgba(59,130,246,0.2)",
      }}
    >
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #3B82F6, transparent 70%)" }}
      />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--primary-400)" }}
          >
            {greeting}
          </p>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {driverName}
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
            {dateStr}
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-3xl font-bold tabular-nums tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {timeStr}
          </p>
          <div
            className="flex items-center gap-1.5 justify-end mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--success)" }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Tile ───
function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="surface-card surface-card-hover flex items-center gap-3 p-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          {label}
        </p>
        <p
          className="text-sm font-bold truncate tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </p>
        {sub && (
          <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Screen ───
export function PreRideScreen() {
  const { session, vehicle, route, loadPreRideData, logout, setScreen } = useAuth();
  const { success, error: toastError } = useToast();
  const [position, setPosition] = useState<VehiclePosition | null>(null);
  const [starting, setStarting] = useState(false);
  const [routeNumber, setRouteNumber] = useState("");
  const [liveRoute, setLiveRoute] = useState<RouteWithStops | null>(route);
  const [routeLoading, setRouteLoading] = useState(false);

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

    assignmentApi
      .getCurrent()
      .then((res) => {
        if (res.data) setScreen("active-ride");
      })
      .catch(() => {});
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

  useEffect(() => {
    if (!routeNumber.trim()) {
      setLiveRoute(route);
      return;
    }
    const timer = setTimeout(async () => {
      setRouteLoading(true);
      try {
        const res = await routeApi.getEtas(routeNumber.trim());
        if (res.data) {
          setLiveRoute(res.data as unknown as RouteWithStops);
        }
      } catch {
        // non-fatal
      } finally {
        setRouteLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [routeNumber, route]);

  const handleStartRide = async () => {
    const rn = routeNumber.trim();
    if (!rn) {
      toastError("Please enter a route number");
      return;
    }
    setStarting(true);
    try {
      await assignmentApi.start(rn);
      success("Ride started! Navigate safely.");
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

  const activeRoute = liveRoute;
  const mapPosition: [number, number] | null = position
    ? [position.lat, position.lon]
    : null;

  const formatCoord = (v?: number) => (v ? v.toFixed(5) : "—");

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--surface-900)" }}
    >
      {/* ── Top Bar ── */}
      <header
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: "var(--surface-850)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.15)" }}
          >
            <Bus className="w-4 h-4" style={{ color: "var(--primary-400)" }} />
          </div>
          <div>
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              BusTrack
            </span>
            <span className="text-sm font-light" style={{ color: "var(--text-tertiary)" }}>
              {" "}Dashboard
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConnectionBadge status={wsStatus} compact />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200"
            style={{
              background: "var(--danger-dim)",
              border: "1px solid var(--danger-border)",
              color: "var(--danger)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--danger)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--danger-dim)";
              e.currentTarget.style.color = "var(--danger)";
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 max-w-6xl mx-auto w-full">
        {/* Welcome Banner */}
        <div className="anim-fade-up">
          <WelcomeBanner driverName={session.driver_username || "Driver"} />
        </div>

        {/* Vehicle + Route Info */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 anim-fade-up"
          style={{ animationDelay: "50ms" }}
        >
          {/* Vehicle Card */}
          <div className="surface-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bus className="w-4 h-4" style={{ color: "var(--accent-300)" }} />
              <h3
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                Vehicle
              </h3>
            </div>
            {vehicle ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {vehicle.plate_number}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    ID: {vehicle.id} · Device: {vehicle.device_id}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {vehicle.capacity && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: "var(--info-dim)", color: "var(--info)" }}
                    >
                      <Users className="w-3 h-3" />
                      {vehicle.capacity} seats
                    </span>
                  )}
                  {position?.speed !== undefined && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: "var(--success-dim)", color: "var(--success)" }}
                    >
                      {position.speed.toFixed(0)} km/h
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="skeleton h-6 w-28 rounded-lg" />
                <div className="skeleton h-3 w-40 rounded-lg" />
              </div>
            )}
          </div>

          {/* Route Card */}
          <div className="surface-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Route className="w-4 h-4" style={{ color: "var(--primary-400)" }} />
              <h3
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                Current Route
              </h3>
            </div>
            {activeRoute ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{
                      background: "rgba(59,130,246,0.15)",
                      color: "var(--primary-400)",
                    }}
                  >
                    {activeRoute.route_number}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {activeRoute.name || `Route ${activeRoute.route_number}`}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {activeRoute.direction === "forward" ? "→ Forward" : "← Reverse"} · {activeRoute.stops?.length || 0} stops
                    </p>
                  </div>
                </div>
                {activeRoute.origin && activeRoute.destination && (
                  <div
                    className="flex items-center gap-2 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="font-medium">{activeRoute.origin}</span>
                    <ChevronRight className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                    <span className="font-medium">{activeRoute.destination}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="skeleton h-6 w-24 rounded-lg" />
                <div className="skeleton h-3 w-36 rounded-lg" />
              </div>
            )}
          </div>
        </div>

        {/* Live Map */}
        <div
          className="surface-card overflow-hidden anim-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4" style={{ color: "var(--success)" }} />
              <h3
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                Live Location
              </h3>
            </div>
            {position && (
              <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                {formatCoord(position.lat)}, {formatCoord(position.lon)}
              </span>
            )}
          </div>
          <LiveMap
            position={mapPosition}
            plateNumber={vehicle?.plate_number || "Your Bus"}
          />
        </div>

        {/* Stats Row */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 anim-fade-up"
          style={{ animationDelay: "150ms" }}
        >
          <StatTile
            icon={MapPin}
            label="Latitude"
            value={position ? position.lat.toFixed(5) : "—"}
            color="var(--primary-400)"
          />
          <StatTile
            icon={MapPin}
            label="Longitude"
            value={position ? position.lon.toFixed(5) : "—"}
            color="var(--accent-300)"
          />
          <StatTile
            icon={Navigation}
            label="Speed"
            value={position?.speed?.toFixed(0) || "—"}
            sub="km/h"
            color="var(--success)"
          />
          <StatTile
            icon={Wifi}
            label="Connection"
            value={
              wsStatus === "connected"
                ? "Live"
                : wsStatus === "connecting"
                ? "Connecting"
                : "Offline"
            }
            color={wsStatus === "connected" ? "var(--success)" : "var(--warning)"}
          />
        </div>

        {/* Route Assignment + Start */}
        <div
          className="surface-card p-5 anim-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Navigation className="w-4 h-4" style={{ color: "var(--primary-400)" }} />
            <h3
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Assign Route & Start Ride
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Navigation
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                value={routeNumber}
                onChange={(e) => setRouteNumber(e.target.value)}
                placeholder="Enter route number (e.g. 121)"
                className="w-full pl-10 pr-10 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                style={{
                  background: "var(--surface-700)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleStartRide();
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid var(--primary-500)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid var(--border-subtle)";
                  e.target.style.boxShadow = "none";
                }}
              />
              {routeLoading && (
                <Loader2
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--primary-400)", animation: "spin 0.8s linear infinite" }}
                />
              )}
            </div>
            <button
              onClick={handleStartRide}
              disabled={starting || !routeNumber.trim()}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #34D399, #10B981)",
                color: "#fff",
                border: "1px solid rgba(52,211,153,0.3)",
                boxShadow: "0 4px 16px rgba(52,211,153,0.25)",
                whiteSpace: "nowrap",
              }}
            >
              {starting ? (
                <Loader2 className="w-5 h-5" style={{ animation: "spin 0.8s linear infinite" }} />
              ) : (
                <Play className="w-5 h-5" />
              )}
              Start Ride
            </button>
          </div>

          {routeNumber.trim() &&
            activeRoute &&
            activeRoute.route_number === routeNumber.trim() && (
              <div
                className="mt-3 flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl"
                style={{
                  background: "var(--success-dim)",
                  border: "1px solid var(--success-border)",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: "var(--success)" }}
                />
                <span style={{ color: "var(--success)" }}>
                  Route found: <strong>{activeRoute.name || activeRoute.route_number}</strong> · {activeRoute.stops?.length || 0} stops
                </span>
              </div>
            )}
        </div>

        {/* Stops Preview */}
        {activeRoute?.stops && activeRoute.stops.length > 0 && (
          <div
            className="surface-card p-5 anim-fade-up"
            style={{ animationDelay: "250ms" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4" style={{ color: "var(--success)" }} />
              <h3
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                Stops ({activeRoute.stops.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {activeRoute.stops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all duration-150"
                  style={{
                    background: "var(--surface-700)",
                    border: "1px solid var(--border-subtle)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-600)";
                    e.currentTarget.style.borderColor = "var(--border-default)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--surface-700)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{
                      background:
                        idx === 0
                          ? "var(--success-dim)"
                          : idx === activeRoute.stops.length - 1
                          ? "var(--danger-dim)"
                          : "var(--primary-500)",
                      color:
                        idx === 0
                          ? "var(--success)"
                          : idx === activeRoute.stops.length - 1
                          ? "var(--danger)"
                          : "#fff",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className="font-medium truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {stop.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
