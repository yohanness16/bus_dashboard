"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OccupancyGauge } from "@/components/dashboard/occupancy-gauge";
import { SpeedIndicator } from "@/components/dashboard/speed-indicator";
import { RouteProgress } from "@/components/dashboard/route-progress";
import { VehicleStats } from "@/components/dashboard/vehicle-stats";
import { ConnectionStatus } from "@/components/dashboard/connection-status";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useBusWebSocket } from "@/hooks/use-bus-websocket";
import { vehicleApi, assignmentApi } from "@/lib/api";
import { findNearestStopIndex } from "@/lib/nearest-stop";
import { formatTime, formatETA } from "@/lib/utils";
import {
  Play,
  Square,
  MapPin,
  Gauge,
  Clock,
  Navigation,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import type {
  ConnectionStatus as WSStatus,
  WSVehiclePosition,
  VehiclePosition,
  Assignment,
} from "@/types";

// Dynamic import for map (no SSR)
const MapView = dynamic(
  () => import("@/components/dashboard/map-view").then((m) => m.MapView),
  { ssr: false, loading: () => (
    <div className="w-full h-[400px] rounded-2xl bg-bg-surface border border-border flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-accent animate-spin" />
    </div>
  )}
);

export default function ActiveRidePage() {
  const { session, vehicle, route, loadPreRideData, setScreen } = useAuth();
  const router = useRouter();
  const now = useCurrentTime();
  const { position: geoPosition } = useGeolocation();

  const [wsStatus, setWsStatus] = useState<WSStatus>("idle");
  const [vehiclePos, setVehiclePos] = useState<WSVehiclePosition | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [currentStopIdx, setCurrentStopIdx] = useState(0);
  const [nextEta, setNextEta] = useState<number | undefined>();
  const [isRideActive, setIsRideActive] = useState(false);
  const [endingRide, setEndingRide] = useState(false);

  // WebSocket
  const { status, sendMessage } = useBusWebSocket({
    token: session.bd_bus_token || null,
    routeId: session.route_id,
    onMessage: (msg) => {
      if (msg.type === "vehicle_position") {
        setVehiclePos(msg);

        // Find nearest stop
        if (route?.stops && route.stops.length > 0) {
          const nearestIdx = findNearestStopIndex(
            msg.lat,
            msg.lon,
            route.stops
          );
          setCurrentStopIdx(nearestIdx);

          // Get ETA to next stop
          if (msg.eta_payloads) {
            const nextStop = route.stops[nearestIdx + 1];
            if (nextStop && msg.eta_payloads[nextStop.name]) {
              setNextEta(msg.eta_payloads[nextStop.name].eta_seconds);
            }
          }
        }
      }
    },
  });

  useEffect(() => {
    setWsStatus(status);
  }, [status]);

  // Load initial data
  useEffect(() => {
    loadPreRideData();
    loadCurrentAssignment();
  }, [loadPreRideData]);

  const loadCurrentAssignment = async () => {
    try {
      const res = await assignmentApi.getCurrent();
      if (res.data) {
        setAssignment(res.data);
        setIsRideActive(true);
      }
    } catch {
      // No active assignment
    }
  };

  // Send telemetry
  useEffect(() => {
    if (!geoPosition || !session.bd_device_id || !isRideActive) return;

    const sendTelemetry = async () => {
      try {
        await vehicleApi.sendTelemetry(
          session.bd_device_id!,
          geoPosition.lat,
          geoPosition.lon
        );
      } catch {
        // non-fatal
      }
    };

    sendTelemetry();
    const interval = setInterval(sendTelemetry, 5000);
    return () => clearInterval(interval);
  }, [geoPosition, session.bd_device_id, isRideActive]);

  const handleStartRide = async () => {
    if (!route?.route_number) return;
    try {
      const res = await assignmentApi.start(route.route_number);
      setAssignment(res.data);
      setIsRideActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start ride";
      alert(msg);
    }
  };

  const handleEndRide = async () => {
    if (!assignment) return;
    setEndingRide(true);
    try {
      await assignmentApi.end(assignment.id);
      setIsRideActive(false);
      setAssignment(null);
      router.push("/dashboard/post-ride");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to end ride";
      alert(msg);
    } finally {
      setEndingRide(false);
    }
  };

  const mapCenter: [number, number] = vehiclePos
    ? [vehiclePos.lat, vehiclePos.lon]
    : geoPosition
    ? [geoPosition.lat, geoPosition.lon]
    : [9.0222, 38.7468]; // Default: Addis Ababa

  const routePolyline: [number, number][] = route?.stops
    ? route.stops.map((s) => [s.lat, s.lon] as [number, number])
    : [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
              {isRideActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Active Ride
                </>
              ) : (
                "Ready to Start"
              )}
            </h1>
            {route && (
              <p className="text-sm text-text-secondary mt-0.5">
                Route {route.route_number}
                {route.name ? ` — ${route.name}` : ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatus status={wsStatus} />
          <div className="text-right">
            <p className="text-base font-mono font-bold text-text-primary">
              {now ? formatTime(now) : "--:--:--"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column — Stats */}
        <div className="lg:col-span-3 space-y-6">
          <SpeedIndicator speed={vehiclePos?.speed || 0} />
          <OccupancyGauge
            level={vehiclePos?.occupancy_level ?? 0}
            peopleCount={0}
            capacity={vehicle?.capacity}
          />
          <VehicleStats vehicle={vehicle} />
        </div>

        {/* Center — Map */}
        <div className="lg:col-span-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-accent" />
                <h3 className="text-sm font-medium text-text-secondary">
                  Live Map
                </h3>
              </div>
              {vehiclePos && (
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="font-mono">
                    {vehiclePos.lat.toFixed(5)}, {vehiclePos.lon.toFixed(5)}
                  </span>
                </div>
              )}
            </div>
            <div className="p-2">
              <MapView
                center={mapCenter}
                stops={route?.stops}
                vehiclePosition={vehiclePos}
                routePolyline={routePolyline}
                height="420px"
              />
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="mt-4 flex justify-center gap-4">
            {!isRideActive ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartRide}
                className="min-w-[200px]"
                icon={<Play className="w-5 h-5" />}
              >
                Start Ride
              </Button>
            ) : (
              <Button
                variant="danger"
                size="lg"
                onClick={handleEndRide}
                loading={endingRide}
                className="min-w-[200px]"
                icon={<Square className="w-5 h-5" />}
              >
                End Ride
              </Button>
            )}
          </div>
        </div>

        {/* Right Column — Route Progress */}
        <div className="lg:col-span-3">
          {route?.stops && route.stops.length > 0 ? (
            <RouteProgress
              stops={route.stops}
              currentStopIndex={currentStopIdx}
              nextStopEta={nextEta}
              routeNumber={route.route_number}
              routeName={route.name}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center py-8">
                <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
                <p className="text-sm text-text-muted">No route data</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Telemetry Bar */}
      <Card variant="compact">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-accent" />
            <div>
              <p className="text-xs text-text-muted">Position</p>
              <p className="text-sm font-mono text-text-primary">
                {vehiclePos
                  ? `${vehiclePos.lat.toFixed(4)}, ${vehiclePos.lon.toFixed(4)}`
                  : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Gauge className="w-4 h-4 text-accent" />
            <div>
              <p className="text-xs text-text-muted">Speed</p>
              <p className="text-sm font-mono text-text-primary">
                {vehiclePos?.speed?.toFixed(1) || "0.0"} km/h
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-accent" />
            <div>
              <p className="text-xs text-text-muted">Next Stop ETA</p>
              <p className="text-sm font-mono text-text-primary">
                {nextEta ? formatETA(nextEta) : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Navigation className="w-4 h-4 text-accent" />
            <div>
              <p className="text-xs text-text-muted">Assignment</p>
              <p className="text-sm font-mono text-text-primary">
                {assignment ? `#${assignment.id}` : "—"}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
