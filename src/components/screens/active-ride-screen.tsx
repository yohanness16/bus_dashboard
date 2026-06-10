"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Bus,
  Gauge,
  Users,
  Clock,
  MapPin,
  LogOut,
  Square,
  Megaphone,
  Loader2,
  Navigation,
  Wifi,
  WifiOff,
  Route,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/shared/toast-stack";
import { useBusWebSocket } from "@/hooks/use-bus-websocket";
import { vehicleApi, assignmentApi, routeApi } from "@/lib/api";
import { ConfirmationModal } from "@/components/shared/confirmation-modal";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { findNearestStopIndex } from "@/lib/nearest-stop";
import { haversine } from "@/lib/haversine";
import type {
  VehiclePosition,
  RouteWithStops,
  RouteStop,
  ETAStopPayload,
  CrowdLevel,
  WSVehiclePosition,
  WSCVResult,
} from "@/types";

// ─── Crowd Indicator ───
function CrowdIndicator({ level }: { level: CrowdLevel }) {
  const config = [
    { label: "Low", color: "var(--success)", bars: 1 },
    { label: "Medium", color: "var(--warning)", bars: 2 },
    { label: "High", color: "var(--danger)", bars: 3 },
  ][level];

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-2.5 rounded-sm transition-all"
          style={{
            background: i <= config.bars ? config.color : "var(--surface-600)",
            height: `${10 + i * 5}px`,
          }}
        />
      ))}
      <span
        className="text-[10px] font-bold uppercase tracking-wider ml-1"
        style={{ color: config.color }}
      >
        {config.label}
      </span>
    </div>
  );
}

// ─── ETA Countdown ───
function ETACountdown({ eta }: { eta: ETAStopPayload | null }) {
  const [display, setDisplay] = useState("—:——");

  useEffect(() => {
    if (!eta) return;
    const update = () => {
      const elapsed = Math.floor(Date.now() / 1000) - eta.computed_at;
      const remaining = Math.max(0, eta.eta_seconds - elapsed);
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      setDisplay(`${m}:${s.toString().padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [eta]);

  if (!eta)
    return (
      <span
        className="text-3xl font-bold tabular-nums"
        style={{ color: "var(--text-muted)" }}
      >
        —:——
      </span>
    );

  return (
    <div>
      <p
        className="text-3xl font-bold tabular-nums tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {display}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
        {eta.stop_name} · {(eta.distance_m / 1000).toFixed(1)} km away
      </p>
    </div>
  );
}

// ─── Route Progress Bar ───
function RouteProgressBar({
  stops,
  currentIdx,
}: {
  stops: RouteStop[];
  currentIdx: number;
}) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto py-2 px-1">
      {stops.map((stop, idx) => {
        const passed = idx < currentIdx;
        const current = idx === currentIdx;

        return (
          <div key={stop.id} className="flex items-center shrink-0">
            {idx > 0 && (
              <div
                className="w-3 h-0.5 shrink-0"
                style={{
                  background: passed
                    ? "var(--success)"
                    : "var(--surface-600)",
                }}
              />
            )}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold transition-all"
              style={{
                background: passed
                  ? "var(--success)"
                  : current
                  ? "var(--primary-500)"
                  : "var(--surface-700)",
                color: passed || current ? "#fff" : "var(--text-muted)",
                boxShadow: current
                  ? "0 0 0 3px rgba(59,130,246,0.3)"
                  : "none",
                transform: current ? "scale(1.15)" : "scale(1)",
              }}
            >
              {passed ? "✓" : idx + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Screen ───
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

  const statsRef = useRef({
    speedSamples: [] as number[],
    crowdSamples: [] as number[],
    distanceM: 0,
    lastLat: null as number | null,
    lastLon: null as number | null,
    startTime: Date.now(),
  });

  // Load route if not already loaded
  useEffect(() => {
    if (!route && vehicle?.route_id) {
      routeApi
        .getRoute(vehicle.route_id)
        .then((res) => {
          setLiveRoute(res.data);
        })
        .catch(() => {});
    }
  }, [route, vehicle?.route_id]);

  const activeRoute = route || liveRoute;

  // Compute nearest stop when position changes
  useEffect(() => {
    if (!position || !activeRoute?.stops) return;
    const idx = findNearestStopIndex(
      position.lat,
      position.lon,
      activeRoute.stops
    );
    if (idx >= 0) setCurrentStopIdx(idx);

    const s = statsRef.current;
    if (s.lastLat !== null && s.lastLon !== null) {
      s.distanceM += haversine(
        s.lastLat,
        s.lastLon,
        position.lat,
        position.lon
      );
    }
    s.lastLat = position.lat;
    s.lastLon = position.lon;
    if (position.speed !== undefined) {
      s.speedSamples.push(position.speed);
    }
  }, [position, activeRoute]);

  // WebSocket
  const { status: wsStatus } = useBusWebSocket({
    token: session.driver_token || null,
    routeId: session.route_id || vehicle?.route_id || null,
    onMessage: (msg) => {
      if (msg.type === "vehicle_position") {
        const vp = msg as WSVehiclePosition;
        setPosition({
          vehicle_id: vp.vehicle_id,
          plate_number: vp.plate_number,
          lat: vp.lat,
          lon: vp.lon,
          speed: vp.speed,
          timestamp: vp.timestamp,
          route_id: vp.route_id,
          occupancy_level: vp.occupancy_level,
        });
        if (vp.eta_payloads) {
          setEtas(vp.eta_payloads);
        }
      } else if (msg.type === "cv_result") {
        const cv = msg as WSCVResult;
        setCrowdLevel(cv.cv.crowd_density as CrowdLevel);
        statsRef.current.crowdSamples.push(cv.cv.crowd_density);
      }
    },
  });

  // Get current assignment on mount
  useEffect(() => {
    assignmentApi
      .getCurrent()
      .then((res) => {
        if (res.data) {
          setAssignmentId(res.data.id);
        }
      })
      .catch(() => {});
  }, []);

  const nextStopEta = useCallback((): ETAStopPayload | null => {
    if (!activeRoute?.stops || !etas) return null;
    for (let i = currentStopIdx; i < activeRoute.stops.length; i++) {
      const stop = activeRoute.stops[i];
      const eta = etas[String(stop.id)];
      if (eta) return eta;
    }
    const values = Object.values(etas);
    return values.length > 0 ? values[0] : null;
  }, [activeRoute, etas, currentStopIdx]);

  const handleEndRide = async () => {
    if (!assignmentId) {
      toastError("No active assignment found");
      return;
    }
    setEnding(true);
    try {
      await assignmentApi.end(assignmentId);
      success("Ride ended!");
      setShowEndModal(false);
      setScreen("post-ride");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to end ride";
      toastError(msg);
    } finally {
      setEnding(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const avgSpeed =
    statsRef.current.speedSamples.length > 0
      ? Math.round(
          statsRef.current.speedSamples.reduce((a, b) => a + b, 0) /
            statsRef.current.speedSamples.length
        )
      : 0;

  const peakCrowd =
    statsRef.current.crowdSamples.length > 0
      ? (Math.max(...statsRef.current.crowdSamples) as CrowdLevel)
      : 0;

  const distanceKm = (statsRef.current.distanceM / 1000).toFixed(1);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--surface-900)" }}
    >
      <OfflineBanner
        show={wsStatus === "disconnected" || wsStatus === "error"}
      />

      {/* ── Top Bar ── */}
      <header
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: "var(--surface-800)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.15)" }}
          >
            <Bus
              className="w-4 h-4"
              style={{ color: "var(--primary-400)" }}
            />
          </div>
          <span
            className="text-sm font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Bus #{vehicle?.id || session.vehicle_id}
          </span>
          {activeRoute && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-md"
              style={{
                background: "var(--primary-500)",
                color: "#fff",
              }}
            >
              {activeRoute.route_number}
            </span>
          )}
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: "var(--success)",
              boxShadow: "0 0 8px var(--success)",
              animation: "pulse 2s infinite",
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          {wsStatus === "connected" ? (
            <Wifi
              className="w-3.5 h-3.5"
              style={{ color: "var(--success)" }}
            />
          ) : (
            <WifiOff
              className="w-3.5 h-3.5"
              style={{ color: "var(--warning)" }}
            />
          )}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg cursor-pointer transition-all hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-5xl mx-auto w-full">
        {/* Next Stop ETA — Hero Card */}
        <div
          className="rounded-2xl p-5 anim-fade-up"
          style={{
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(56,189,248,0.05))",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Navigation
              className="w-4 h-4"
              style={{ color: "var(--primary-400)" }}
            />
            <h3
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Next Stop ETA
            </h3>
          </div>
          <ETACountdown eta={nextStopEta()} />
        </div>

        {/* Stats Grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 anim-fade-up"
          style={{ animationDelay: "50ms" }}
        >
          <div
            className="flex flex-col items-center justify-center p-4 rounded-2xl"
            style={{
              background: "var(--surface-800)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Gauge
              className="w-5 h-5 mb-1.5"
              style={{ color: "var(--primary-400)" }}
            />
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: "var(--text-primary)" }}
            >
              {position?.speed?.toFixed(0) || "—"}
              <span
                className="text-xs font-medium ml-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                km/h
              </span>
            </p>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              Speed
            </p>
          </div>

          <div
            className="flex flex-col items-center justify-center p-4 rounded-2xl"
            style={{
              background: "var(--surface-800)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Users
              className="w-5 h-5 mb-1.5"
              style={{ color: "var(--warning)" }}
            />
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {crowdLevel === 0 ? "L" : crowdLevel === 1 ? "M" : "H"}
            </p>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              Crowd
            </p>
          </div>

          <div
            className="flex flex-col items-center justify-center p-4 rounded-2xl"
            style={{
              background: "var(--surface-800)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Clock
              className="w-5 h-5 mb-1.5"
              style={{ color: "var(--accent-300)" }}
            />
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: "var(--text-primary)" }}
            >
              {nextStopEta()
                ? `${Math.ceil(nextStopEta()!.eta_seconds / 60)}`
                : "—"}
              <span
                className="text-xs font-medium ml-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                min
              </span>
            </p>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              ETA
            </p>
          </div>

          <div
            className="flex flex-col items-center justify-center p-4 rounded-2xl"
            style={{
              background: "var(--surface-800)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <MapPin
              className="w-5 h-5 mb-1.5"
              style={{ color: "var(--success)" }}
            />
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {currentStopIdx + 1}/{activeRoute?.stops?.length || "—"}
            </p>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              Progress
            </p>
          </div>
        </div>

        {/* Crowd Density */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl anim-fade-up"
          style={{
            background: "var(--surface-800)",
            border: "1px solid var(--border-subtle)",
            animationDelay: "100ms",
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--text-tertiary)" }}
          >
            Crowd Density
          </span>
          <CrowdIndicator level={crowdLevel} />
        </div>

        {/* Route Progress */}
        {activeRoute?.stops && activeRoute.stops.length > 0 && (
          <div
            className="rounded-2xl p-4 anim-fade-up"
            style={{
              background: "var(--surface-800)",
              border: "1px solid var(--border-subtle)",
              animationDelay: "150ms",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Route
                className="w-4 h-4"
                style={{ color: "var(--success)" }}
              />
              <h3
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                Route Progress
              </h3>
            </div>
            <RouteProgressBar
              stops={activeRoute.stops}
              currentIdx={currentStopIdx}
            />
            <div
              className="flex justify-between mt-2 text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              <span>{activeRoute.stops[0]?.name}</span>
              <span>
                {activeRoute.stops[activeRoute.stops.length - 1]?.name}
              </span>
            </div>
          </div>
        )}

        {/* Trip Summary Mini */}
        <div
          className="grid grid-cols-3 gap-3 anim-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          <div
            className="flex flex-col items-center p-3 rounded-xl"
            style={{
              background: "var(--surface-800)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <p
              className="text-lg font-bold tabular-nums"
              style={{ color: "var(--text-primary)" }}
            >
              {avgSpeed}
            </p>
            <p
              className="text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Avg km/h
            </p>
          </div>
          <div
            className="flex flex-col items-center p-3 rounded-xl"
            style={{
              background: "var(--surface-800)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <p
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {distanceKm}
            </p>
            <p
              className="text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              km
            </p>
          </div>
          <div
            className="flex flex-col items-center p-3 rounded-xl"
            style={{
              background: "var(--surface-800)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <p
              className="text-lg font-bold"
              style={{
                color:
                  peakCrowd === 0
                    ? "var(--success)"
                    : peakCrowd === 1
                    ? "var(--warning)"
                    : "var(--danger)",
              }}
            >
              {peakCrowd === 0 ? "Low" : peakCrowd === 1 ? "Med" : "High"}
            </p>
            <p
              className="text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Peak Crowd
            </p>
          </div>
        </div>

        {/* End Ride Button */}
        <div className="pt-2 pb-6 anim-fade-up" style={{ animationDelay: "250ms" }}>
          <button
            onClick={() => setShowEndModal(true)}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #F87171, #EF4444)",
              color: "#fff",
              border: "1px solid rgba(248,113,113,0.3)",
              boxShadow: "0 4px 16px rgba(248,113,113,0.25)",
            }}
          >
            <Square className="w-5 h-5" />
            End Ride
          </button>
        </div>
      </div>

      {/* End Ride Confirmation */}
      <ConfirmationModal
        open={showEndModal}
        title="End Ride?"
        message="This will complete your current trip. Make sure you've reached the final stop."
        confirmLabel="End Ride"
        cancelLabel="Cancel"
        onConfirm={handleEndRide}
        onCancel={() => setShowEndModal(false)}
        variant="danger"
      />
    </div>
  );
}
