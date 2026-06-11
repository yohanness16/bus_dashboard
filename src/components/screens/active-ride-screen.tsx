"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Bus, Gauge, Users, Clock, MapPin, LogOut, Square, Loader2,
  Navigation, Wifi, WifiOff, Route,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/shared/toast-stack";
import { useBusWebSocket } from "@/hooks/use-bus-websocket";
import { vehicleApi, assignmentApi, routeApi } from "@/lib/api";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { findNearestStopIndex } from "@/lib/nearest-stop";
import { haversine } from "@/lib/haversine";
import type { VehiclePosition, RouteWithStops, RouteStop, ETAStopPayload, CrowdLevel, WSVehiclePosition, WSCVResult } from "@/types";

function CrowdIndicator({ level }: { level: CrowdLevel }) {
  const config = [
    { label: "Low", color: "var(--success)", bars: 1 },
    { label: "Medium", color: "var(--warning)", bars: 2 },
    { label: "High", color: "var(--danger)", bars: 3 },
  ][level];
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-2 rounded-sm transition-all" style={{ background: i <= config.bars ? config.color : "hsl(var(--muted))", height: `${8 + i * 4}px` }} />
      ))}
      <span className="text-[10px] font-semibold uppercase tracking-wider ml-1" style={{ color: config.color }}>{config.label}</span>
    </div>
  );
}

function ETACountdown({ eta }: { eta: ETAStopPayload | null }) {
  const [display, setDisplay] = useState("—:——");
  useEffect(() => {
    if (!eta) return;
    const update = () => {
      const elapsed = Math.floor(Date.now() / 1000) - eta.computed_at;
      const remaining = Math.max(0, eta.eta_seconds - elapsed);
      setDisplay(`${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [eta]);
  if (!eta) return <span className="text-2xl font-bold tabular-nums text-muted-foreground">—:——</span>;
  return (
    <div>
      <p className="text-2xl font-bold tabular-nums text-card-foreground">{display}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{eta.stop_name} · {(eta.distance_m / 1000).toFixed(1)} km away</p>
    </div>
  );
}

function RouteProgressBar({ stops, currentIdx }: { stops: RouteStop[]; currentIdx: number }) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto py-2 px-1">
      {stops.map((stop, idx) => {
        const passed = idx < currentIdx;
        const current = idx === currentIdx;
        return (
          <div key={stop.id} className="flex items-center shrink-0">
            {idx > 0 && <div className="w-3 h-0.5 shrink-0" style={{ background: passed ? "var(--success)" : "hsl(var(--muted))" }} />}
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all text-white"
              style={{ background: passed ? "var(--success)" : current ? "hsl(var(--primary))" : "hsl(var(--muted))", transform: current ? "scale(1.15)" : "scale(1)", boxShadow: current ? "0 0 0 3px hsl(var(--primary) / 0.3)" : "none" }}
            >{passed ? "✓" : idx + 1}</div>
          </div>
        );
      })}
    </div>
  );
}

export function ActiveRideScreen() {
  const { session, vehicle, route, logout, setScreen } = useAuth();
  const { success, error: toastError } = useToast();
  const [position, setPosition] = useState<VehiclePosition | null>(null);
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel>(0);
  const [etas, setEtas] = useState<Record<string, ETAStopPayload>>({});
  const [currentStopIdx, setCurrentStopIdx] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [ending, setEnding] = useState(false);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [liveRoute, setLiveRoute] = useState<RouteWithStops | null>(route);
  const statsRef = useRef({ speedSamples: [] as number[], crowdSamples: [] as number[], distanceM: 0, lastLat: null as number | null, lastLon: null as number | null, startTime: Date.now() });

  useEffect(() => { if (!route && vehicle?.route_id) { routeApi.getRoute(vehicle.route_id).then((res) => setLiveRoute(res.data)).catch(() => {}); } }, [route, vehicle?.route_id]);
  const activeRoute = route || liveRoute;

  useEffect(() => {
    if (!position || !activeRoute?.stops) return;
    const idx = findNearestStopIndex(position.lat, position.lon, activeRoute.stops);
    if (idx >= 0) setCurrentStopIdx(idx);
    const s = statsRef.current;
    if (s.lastLat !== null && s.lastLon !== null) s.distanceM += haversine(s.lastLat, s.lastLon, position.lat, position.lon);
    s.lastLat = position.lat; s.lastLon = position.lon;
    if (position.speed !== undefined) s.speedSamples.push(position.speed);
  }, [position, activeRoute]);

  const { status: wsStatus } = useBusWebSocket({
    token: session.driver_token || null, routeId: session.route_id || vehicle?.route_id || null,
    onMessage: (msg) => {
      if (msg.type === "vehicle_position") { const vp = msg as WSVehiclePosition; setPosition({ vehicle_id: vp.vehicle_id, plate_number: vp.plate_number, lat: vp.lat, lon: vp.lon, speed: vp.speed, timestamp: vp.timestamp, route_id: vp.route_id, occupancy_level: vp.occupancy_level }); if (vp.eta_payloads) setEtas(vp.eta_payloads); }
      else if (msg.type === "cv_result") { const cv = msg as WSCVResult; setCrowdLevel(cv.cv.crowd_density as CrowdLevel); statsRef.current.crowdSamples.push(cv.cv.crowd_density); }
    },
  });

  useEffect(() => { assignmentApi.getCurrent().then((res) => { if (res.data) setAssignmentId(res.data.id); }).catch(() => {}); }, []);

  const nextStopEta = useCallback((): ETAStopPayload | null => {
    if (!activeRoute?.stops || !etas) return null;
    for (let i = currentStopIdx; i < activeRoute.stops.length; i++) { const eta = etas[String(activeRoute.stops[i].id)]; if (eta) return eta; }
    const values = Object.values(etas); return values.length > 0 ? values[0] : null;
  }, [activeRoute, etas, currentStopIdx]);

  const handleEndRide = async () => {
    if (!assignmentId) { toastError("No active assignment found"); return; }
    setEnding(true);
    try { await assignmentApi.end(assignmentId); success("Ride ended!"); setShowEndModal(false); setScreen("post-ride"); }
    catch (err: unknown) { let msg = "Failed to end ride"; if (err && typeof err === "object" && "response" in err) { msg = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || msg; } else if (err instanceof Error) { msg = err.message; } toastError(msg); }
    finally { setEnding(false); }
  };
  const handleLogout = async () => { await logout(); };

  const avgSpeed = statsRef.current.speedSamples.length > 0 ? Math.round(statsRef.current.speedSamples.reduce((a, b) => a + b, 0) / statsRef.current.speedSamples.length) : 0;
  const peakCrowd = statsRef.current.crowdSamples.length > 0 ? (Math.max(...statsRef.current.crowdSamples) as CrowdLevel) : 0;
  const distanceKm = (statsRef.current.distanceM / 1000).toFixed(1);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <OfflineBanner show={wsStatus === "disconnected" || wsStatus === "error"} />

      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 shrink-0 border-b bg-card" style={{ height: "var(--topnav-height)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Bus className="w-4 h-4 text-primary-foreground" /></div>
          <span className="text-sm font-semibold text-card-foreground">Bus #{vehicle?.id || session.vehicle_id}</span>
          {activeRoute && <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary text-primary-foreground">{activeRoute.route_number}</span>}
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
        </div>
        <div className="flex items-center gap-2">
          {wsStatus === "connected" ? <Wifi className="w-4 h-4 text-success" /> : <WifiOff className="w-4 h-4 text-warning" />}
          <button onClick={handleLogout} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-6xl mx-auto w-full">
        {/* ETA Hero */}
        <div className="rounded-lg border bg-card shadow-sm p-5 animate-fade-up" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--primary) / 0.02))", borderColor: "hsl(var(--primary) / 0.15)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Stop ETA</h3>
          </div>
          <ETACountdown eta={nextStopEta()} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up" style={{ animationDelay: "50ms" }}>
          {[
            { icon: Gauge, value: position?.speed?.toFixed(0) || "—", unit: "km/h", label: "Speed", color: "text-primary" },
            { icon: Users, value: crowdLevel === 0 ? "L" : crowdLevel === 1 ? "M" : "H", label: "Crowd", color: "text-warning" },
            { icon: Clock, value: nextStopEta() ? `${Math.ceil(nextStopEta()!.eta_seconds / 60)}` : "—", unit: "min", label: "ETA", color: "text-blue-400" },
            { icon: MapPin, value: `${currentStopIdx + 1}/${activeRoute?.stops?.length || "—"}`, label: "Progress", color: "text-success" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border bg-card shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2"><s.icon className={`w-4 h-4 ${s.color}`} /><span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span></div>
              <p className="text-xl font-bold text-card-foreground tabular-nums">{s.value}{s.unit && <span className="text-xs font-normal text-muted-foreground ml-0.5">{s.unit}</span>}</p>
            </div>
          ))}
        </div>

        {/* Crowd */}
        <div className="flex items-center justify-between px-4 py-3 rounded-lg border bg-card shadow-sm animate-fade-up" style={{ animationDelay: "100ms" }}>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Crowd Density</span>
          <CrowdIndicator level={crowdLevel} />
        </div>

        {/* Progress */}
        {activeRoute?.stops && activeRoute.stops.length > 0 && (
          <div className="rounded-lg border bg-card shadow-sm p-4 animate-fade-up" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center gap-2 mb-3"><Route className="w-4 h-4 text-success" /><h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Route Progress</h3></div>
            <RouteProgressBar stops={activeRoute.stops} currentIdx={currentStopIdx} />
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground"><span>{activeRoute.stops[0]?.name}</span><span>{activeRoute.stops[activeRoute.stops.length - 1]?.name}</span></div>
          </div>
        )}

        {/* Trip Summary */}
        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
          {[
            { value: avgSpeed, label: "Avg km/h" },
            { value: distanceKm, label: "km" },
            { value: peakCrowd === 0 ? "Low" : peakCrowd === 1 ? "Med" : "High", label: "Peak Crowd", color: peakCrowd === 0 ? "var(--success)" : peakCrowd === 1 ? "var(--warning)" : "var(--danger)" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center p-3 rounded-lg border bg-card shadow-sm">
              <p className="text-lg font-bold tabular-nums" style={{ color: s.color || "hsl(var(--card-foreground))" }}>{s.value}</p>
              <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* End Ride */}
        <div className="pt-2 pb-6 animate-fade-up" style={{ animationDelay: "250ms" }}>
          <button onClick={() => setShowEndModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-danger text-danger-foreground text-sm font-semibold uppercase tracking-wider hover:bg-danger/90 transition-colors active:scale-[0.98] cursor-pointer"
          ><Square className="w-4 h-4" />End Ride</button>
        </div>
      </div>

      <ConfirmationModal open={showEndModal} title="End Ride?" message="This will complete your current trip. Make sure you've reached the final stop." confirmLabel="End Ride" cancelLabel="Cancel" onConfirm={handleEndRide} onCancel={() => setShowEndModal(false)} variant="danger" />
    </div>
  );
}
