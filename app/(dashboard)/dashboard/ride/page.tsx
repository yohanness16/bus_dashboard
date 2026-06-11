"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OccupancyGauge } from "@/components/dashboard/occupancy-gauge";
import { SpeedIndicator } from "@/components/dashboard/speed-indicator";
import { RouteProgress } from "@/components/dashboard/route-progress";
import { VehicleStats } from "@/components/dashboard/vehicle-stats";
import { ConnectionStatus } from "@/components/dashboard/connection-status";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useBusWebSocket } from "@/hooks/use-bus-websocket";
import { vehicleApi, assignmentApi, routeApi } from "@/lib/api";
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
  Route,
} from "lucide-react";
import type {
  ConnectionStatus as WSStatus,
  WSVehiclePosition,
  Assignment,
  RouteWithStops,
} from "@/types";

const MapView = dynamic(
  () => import("@/components/dashboard/map-view").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] rounded-2xl bg-gray-50 border border-stroke flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    ),
  }
);

export default function ActiveRidePage() {
  const { session, vehicle, route: preAssignedRoute, loadPreRideData } = useAuth();
  const router = useRouter();
  const now = useCurrentTime();
  const { position: geoPosition } = useGeolocation();

  const [wsStatus, setWsStatus] = useState<WSStatus>("idle");
  const [vehiclePos, setVehiclePos] = useState<WSVehiclePosition | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [route, setRoute] = useState<RouteWithStops | null>(null);
  const [currentStopIdx, setCurrentStopIdx] = useState(0);
  const [nextEta, setNextEta] = useState<number | undefined>();
  const [isRideActive, setIsRideActive] = useState(false);
  const [endingRide, setEndingRide] = useState(false);

  const { status } = useBusWebSocket({
    // Use driver_token (user JWT) for WebSocket — bd_bus_token is a
    // bus_dashboard type token which the WebSocket endpoint rejects.
    token: session.driver_token || session.bd_bus_token || null,
    routeId: session.route_id,
    onMessage: (msg) => {
      if (msg.type === "vehicle_position") {
        setVehiclePos(msg);
        if (route?.stops && route.stops.length > 0) {
          const nearestIdx = findNearestStopIndex(msg.lat, msg.lon, route.stops);
          setCurrentStopIdx(nearestIdx);
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
        // Load the route for this assignment
        if (res.data.route_id) {
          const rRes = await routeApi.getRoute(res.data.route_id);
          setRoute(rRes.data);
        }
      }
    } catch {
      // No active assignment
    }
  };

  // Send telemetry
  useEffect(() => {
    if (!geoPosition || !session.bd_device_id || !isRideActive) return;
    const send = async () => {
      try {
        await vehicleApi.sendTelemetry(session.bd_device_id!, geoPosition.lat, geoPosition.lon, geoPosition.speed ?? undefined);
      } catch { /* non-fatal */ }
    };
    send();
    const interval = setInterval(send, 5000);
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
    setEndingRide(true);
    try {
      // If we don't have the assignment in state, fetch it first
      let aid = assignment?.id;
      if (!aid) {
        const res = await assignmentApi.getCurrent();
        if (res.data?.id) {
          aid = res.data.id;
          setAssignment(res.data);
        } else {
          alert("No active assignment found. You may already have ended this ride.");
          return;
        }
      }
      await assignmentApi.end(aid!);
      setIsRideActive(false);
      setAssignment(null);
      router.push("/dashboard/post-ride");
    } catch (err: unknown) {
      let msg = "Failed to end ride";
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        msg = axiosErr.response?.data?.detail || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      alert(msg);
    } finally {
      setEndingRide(false);
    }
  };

  const mapCenter: [number, number] = vehiclePos
    ? [vehiclePos.lat, vehiclePos.lon]
    : geoPosition
    ? [geoPosition.lat, geoPosition.lon]
    : [9.0222, 38.7468];

  const routePolyline: [number, number][] = route?.stops
    ? route.stops.map((s) => [s.lat, s.lon] as [number, number])
    : [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
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
              <p className="text-sm text-gray-500 mt-0.5">
                Route {route.route_number}
                {route.name ? ` — ${route.name}` : ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatus status={wsStatus} />
          <div className="text-right">
            <p className="text-base font-bold text-gray-900 font-mono">
              {now ? formatTime(now) : "--:--:--"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left — Stats */}
        <div className="lg:col-span-3 space-y-5">
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
            <div className="p-4 border-b border-stroke flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary-600" />
                <h3 className="text-sm font-medium text-content-secondary">Live Map</h3>
              </div>
              {vehiclePos && (
                <span className="text-[10px] text-content-tertiary font-mono">
                  {vehiclePos.lat.toFixed(5)}, {vehiclePos.lon.toFixed(5)}
                </span>
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
              <Button variant="primary" size="lg" onClick={handleStartRide} className="min-w-[200px]">
                <Play className="w-5 h-5" />
                Start Ride
              </Button>
            ) : (
              <Button variant="danger" size="lg" onClick={handleEndRide} loading={endingRide} className="min-w-[200px]">
                <Square className="w-5 h-5" />
                End Ride
              </Button>
            )}
          </div>
        </div>

        {/* Right — Route Progress */}
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
                <p className="text-sm text-content-tertiary">No route data</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Telemetry Bar */}
      <Card variant="compact">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: MapPin, label: "Position", value: vehiclePos ? `${vehiclePos.lat.toFixed(4)}, ${vehiclePos.lon.toFixed(4)}` : "—" },
            { icon: Gauge, label: "Speed", value: `${vehiclePos?.speed?.toFixed(1) || "0.0"} km/h` },
            { icon: Clock, label: "Next Stop ETA", value: nextEta ? formatETA(nextEta) : "—" },
            { icon: Route, label: "Assignment", value: assignment ? `#${assignment.id}` : "—" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon className="w-4 h-4 text-primary-500" />
              <div>
                <p className="text-[10px] text-content-tertiary uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-mono text-content">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
