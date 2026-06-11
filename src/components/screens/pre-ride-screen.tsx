"use client";

import { useEffect, useState } from "react";
import {
  Bus, MapPin, Navigation, LogOut, Play, Loader2, Users, Route,
  ChevronRight, Wifi, Map,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/shared/toast-stack";
import { vehicleApi, assignmentApi, routeApi } from "@/lib/api";
import { VehiclePosition, RouteWithStops } from "@/types";
import { useBusWebSocket } from "@/hooks/use-bus-websocket";
import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("./live-map"), { ssr: false });

function WelcomeBanner({ driverName }: { driverName: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="rounded-lg border bg-card shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-primary mb-0.5">{greeting}</p>
          <h2 className="text-xl font-bold text-card-foreground">{driverName}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{dateStr}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-card-foreground tabular-nums">{timeStr}</p>
          <div className="flex items-center gap-1.5 justify-end mt-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        setPosition({ vehicle_id: msg.vehicle_id, plate_number: msg.plate_number, lat: msg.lat, lon: msg.lon, speed: msg.speed, timestamp: msg.timestamp, route_id: msg.route_id, occupancy_level: msg.occupancy_level });
      }
    },
  });

  useEffect(() => { loadPreRideData(); loadPosition(); assignmentApi.getCurrent().then((res) => { if (res.data) setScreen("active-ride"); }).catch(() => {}); }, []);
  const loadPosition = async () => { if (!session.vehicle_id) return; try { const res = await vehicleApi.getPosition(session.vehicle_id); setPosition(res.data); } catch {} };
  useEffect(() => {
    if (!routeNumber.trim()) { setLiveRoute(route); return; }
    const timer = setTimeout(async () => { setRouteLoading(true); try { const res = await routeApi.getEtas(routeNumber.trim()); if (res.data) setLiveRoute(res.data as unknown as RouteWithStops); } catch {} finally { setRouteLoading(false); } }, 500);
    return () => clearTimeout(timer);
  }, [routeNumber, route]);

  const handleStartRide = async () => { const rn = routeNumber.trim(); if (!rn) { toastError("Please enter a route number"); return; } setStarting(true); try { await assignmentApi.start(rn); success("Ride started! Navigate safely."); setScreen("active-ride"); } catch (err: unknown) { toastError(err instanceof Error ? err.message : "Failed to start ride"); } finally { setStarting(false); } };
  const handleLogout = async () => { await logout(); };
  const activeRoute = liveRoute;
  const mapPosition: [number, number] | null = position ? [position.lat, position.lon] : null;
  const formatCoord = (v?: number) => (v ? v.toFixed(5) : "—");

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 shrink-0 border-b bg-card" style={{ height: "var(--topnav-height)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Bus className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-card-foreground">Bus<span className="text-primary">Track</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border" style={{ background: wsStatus === "connected" ? "var(--success-bg)" : "var(--warning-bg)", borderColor: wsStatus === "connected" ? "var(--success-border)" : "var(--warning-border)", color: wsStatus === "connected" ? "var(--success)" : "var(--warning)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: wsStatus === "connected" ? "var(--success)" : "var(--warning)" }} />
            {wsStatus === "connected" ? "LIVE" : wsStatus === "connecting" ? "Connecting" : "Offline"}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-6xl mx-auto w-full">
        <div className="animate-fade-up">
          <WelcomeBanner driverName={session.driver_username || "Driver"} />
        </div>

        {/* Vehicle + Route */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: "50ms" }}>
          <div className="rounded-lg border bg-card shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bus className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vehicle</h3>
            </div>
            {vehicle ? (
              <div className="space-y-2">
                <p className="text-lg font-bold text-card-foreground">{vehicle.plate_number}</p>
                <p className="text-xs text-muted-foreground">ID: {vehicle.id} · Device: {vehicle.device_id}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {vehicle.capacity && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-info-bg text-info border border-info-border">
                      <Users className="w-3 h-3" />{vehicle.capacity} seats
                    </span>
                  )}
                  {position?.speed !== undefined && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-success-bg text-success border border-success-border">
                      {position.speed.toFixed(0)} km/h
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-5 w-28 rounded bg-muted animate-pulse" />
                <div className="h-3 w-40 rounded bg-muted animate-pulse" />
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-card shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Route className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Route</h3>
            </div>
            {activeRoute ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{activeRoute.route_number}</div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{activeRoute.name || `Route ${activeRoute.route_number}`}</p>
                    <p className="text-xs text-muted-foreground">{activeRoute.direction === "forward" ? "→ Forward" : "← Reverse"} · {activeRoute.stops?.length || 0} stops</p>
                  </div>
                </div>
                {activeRoute.origin && activeRoute.destination && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-medium text-card-foreground">{activeRoute.origin}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="font-medium text-card-foreground">{activeRoute.destination}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-5 w-24 rounded bg-muted animate-pulse" />
                <div className="h-3 w-36 rounded bg-muted animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Live Map */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-success" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Location</h3>
            </div>
            {position && <span className="text-[10px] font-mono text-muted-foreground">{formatCoord(position.lat)}, {formatCoord(position.lon)}</span>}
          </div>
          <LiveMap position={mapPosition} plateNumber={vehicle?.plate_number || "Your Bus"} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up" style={{ animationDelay: "150ms" }}>
          {[
            { icon: MapPin, label: "Latitude", value: position ? position.lat.toFixed(5) : "—", color: "text-primary" },
            { icon: MapPin, label: "Longitude", value: position ? position.lon.toFixed(5) : "—", color: "text-blue-400" },
            { icon: Navigation, label: "Speed", value: position?.speed?.toFixed(0) || "—", unit: "km/h", color: "text-success" },
            { icon: Wifi, label: "Connection", value: wsStatus === "connected" ? "Live" : wsStatus === "connecting" ? "Connecting" : "Offline", color: wsStatus === "connected" ? "text-success" : "text-warning" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border bg-card shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-lg font-bold text-card-foreground tabular-nums">{stat.value}{stat.unit && <span className="text-xs font-normal text-muted-foreground ml-0.5">{stat.unit}</span>}</p>
            </div>
          ))}
        </div>

        {/* Route Assignment */}
        <div className="rounded-lg border bg-card shadow-sm p-5 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assign Route & Start Ride</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input type="text" value={routeNumber} onChange={(e) => setRouteNumber(e.target.value)} placeholder="Enter route number (e.g. 121)"
                className="w-full pl-10 pr-10 py-2.5 rounded-md border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all"
                onKeyDown={(e) => { if (e.key === "Enter") handleStartRide(); }}
              />
              {routeLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />}
            </div>
            <button onClick={handleStartRide} disabled={starting || !routeNumber.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-success text-white text-sm font-medium hover:bg-success/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Start Ride
            </button>
          </div>
          {routeNumber.trim() && activeRoute && activeRoute.route_number === routeNumber.trim() && (
            <div className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-md bg-success-bg text-success border border-success-border">
              <span className="w-2 h-2 rounded-full bg-success shrink-0" />
              Route found: <strong>{activeRoute.name || activeRoute.route_number}</strong> · {activeRoute.stops?.length || 0} stops
            </div>
          )}
        </div>

        {/* Stops Preview */}
        {activeRoute?.stops && activeRoute.stops.length > 0 && (
          <div className="rounded-lg border bg-card shadow-sm p-5 animate-fade-up" style={{ animationDelay: "250ms" }}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-success" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stops ({activeRoute.stops.length})</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {activeRoute.stops.map((stop, idx) => (
                <div key={stop.id} className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/30 text-xs transition-colors hover:bg-muted cursor-default">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 text-white"
                    style={{ background: idx === 0 ? "var(--success)" : idx === activeRoute.stops.length - 1 ? "var(--danger)" : "hsl(var(--primary))" }}
                  >{idx + 1}</span>
                  <span className="font-medium text-card-foreground truncate">{stop.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
