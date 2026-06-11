"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OccupancyGauge } from "@/components/dashboard/occupancy-gauge";
import { VehicleStats } from "@/components/dashboard/vehicle-stats";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useBusWebSocket } from "@/hooks/use-bus-websocket";
import { routeApi, assignmentApi } from "@/lib/api";
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
  Search,
  ChevronRight,
  CheckCircle2,
  List,
} from "lucide-react";
import type { ConnectionStatus as WSStatus, WSVehiclePosition, RouteWithStops, Route as RouteType } from "@/types";

export default function PreRidePage() {
  const { session, vehicle, route: assignedRoute, loadPreRideData, loading: authLoading } = useAuth();
  const router = useRouter();
  const now = useCurrentTime();
  const [wsStatus, setWsStatus] = useState<WSStatus>("idle");
  const [vehiclePos, setVehiclePos] = useState<WSVehiclePosition | null>(null);

  // Route selection state
  const [routes, setRoutes] = useState<RouteWithStops[]>([]);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteWithStops | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRouteList, setShowRouteList] = useState(false);
  const [startingRide, setStartingRide] = useState(false);

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
    // Load initial routes list (no search = show all)
    handleSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!query.trim()) {
      // Load initial list — just first 20 routes with details
      setRoutesLoading(true);
      try {
        const res = await routeApi.listRoutes(0, 20);
        const routeList: RouteType[] = res.data || [];
        const routesWithStops = await Promise.all(
          routeList.map(async (r) => {
            try {
              const detail = await routeApi.getRoute(r.id);
              return detail.data as RouteWithStops;
            } catch {
              return { ...r, stops: [] } as RouteWithStops;
            }
          })
        );
        setRoutes(routesWithStops);
        if (assignedRoute) setSelectedRoute(assignedRoute);
      } catch { /* non-fatal */ } finally {
        setRoutesLoading(false);
      }
      return;
    }

    // Debounced server-side search
    searchTimerRef.current = setTimeout(async () => {
      setRoutesLoading(true);
      try {
        const res = await routeApi.search(query, 20);
        setRoutes(res.data || []);
      } catch {
        // Fallback to client-side filter on existing routes
      } finally {
        setRoutesLoading(false);
      }
    }, 350);
  }, [assignedRoute]);

  const handleSelectRoute = (route: RouteWithStops) => {
    setSelectedRoute(route);
    setShowRouteList(false);
    setSearchQuery("");
  };

  const handleStartRide = async () => {
    if (!selectedRoute) return;
    setStartingRide(true);
    try {
      await assignmentApi.start(selectedRoute.route_number);
      router.push("/dashboard/ride");
    } catch (err: unknown) {
      let msg = "Could not start ride. Please try again.";
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        const detail = axiosErr.response?.data?.detail;
        if (detail?.includes("already has an active assignment")) {
          msg = "This bus already has an active ride. Please end it first.";
        } else if (detail?.includes("not found")) {
          msg = "Route not found. Please select a different route.";
        }
      }
      alert(msg);
    } finally {
      setStartingRide(false);
    }
  };

  const filteredRoutes = routes.filter(
    (r) =>
      r.route_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pre-Ride Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Select a route and review your vehicle before starting</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-base font-bold text-gray-900 font-mono">
              {now ? formatTime(now) : "--:--:--"}
            </p>
            <p className="text-[10px] text-content-tertiary">
              {now?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Route Selection Card ── */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Route className="w-5 h-5 text-primary-600" />
          <h2 className="text-base font-semibold text-gray-900">Select Route</h2>
          {selectedRoute && (
            <Badge variant="primary" className="ml-auto">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {selectedRoute.route_number}
            </Badge>
          )}
        </div>

        {/* Selected route display / dropdown trigger */}
        <button
          onClick={() => setShowRouteList(!showRouteList)}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-stroke hover:border-primary-300 bg-surface-secondary/50 hover:bg-primary-50/30 transition-all duration-200 group"
        >
          {selectedRoute ? (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <Route className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">
                  Route {selectedRoute.route_number}
                  {selectedRoute.name ? ` — ${selectedRoute.name}` : ""}
                </p>
                <p className="text-xs text-content-tertiary mt-0.5">
                  {selectedRoute.stops.length} stops
                  {selectedRoute.origin ? ` · From ${selectedRoute.origin}` : ""}
                  {selectedRoute.destination ? ` → ${selectedRoute.destination}` : ""}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <List className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-content-tertiary">Choose a route to start your ride...</p>
            </div>
          )}
          <ChevronRight className={`w-5 h-5 text-content-tertiary transition-transform duration-200 ${showRouteList ? "rotate-90" : ""}`} />
        </button>

        {/* Route list dropdown */}
        {showRouteList && (
          <div className="mt-3 border border-stroke rounded-xl overflow-hidden bg-white shadow-lg animate-slide-down">
            {/* Search */}
            <div className="p-3 border-b border-stroke">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary" />
                <input
                  type="text"
                  placeholder="Search routes..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stroke text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                  autoFocus
                />
              </div>
            </div>

            {/* Route items */}
            <div className="max-h-[320px] overflow-y-auto">
              {routesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                </div>
              ) : filteredRoutes.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-content-tertiary">No routes found</p>
                </div>
              ) : (
                filteredRoutes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRoute(r)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50/50 transition-colors text-left border-b border-stroke/50 last:border-0 ${
                      selectedRoute?.id === r.id ? "bg-primary-50" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedRoute?.id === r.id ? "bg-primary-100" : "bg-gray-100"
                    }`}>
                      <Route className={`w-4 h-4 ${selectedRoute?.id === r.id ? "text-primary-600" : "text-gray-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {r.route_number}
                        {r.name ? ` — ${r.name}` : ""}
                      </p>
                      <p className="text-[11px] text-content-tertiary truncate">
                        {r.stops.length} stops
                        {r.origin ? ` · ${r.origin}` : ""}
                        {r.destination ? ` → ${r.destination}` : ""}
                      </p>
                    </div>
                    {selectedRoute?.id === r.id && (
                      <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Selected route stops preview */}
        {selectedRoute && selectedRoute.stops.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-surface-secondary/50 border border-stroke">
            <p className="text-xs font-medium text-content-secondary mb-3 uppercase tracking-wider">
              Route Stops ({selectedRoute.stops.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedRoute.stops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-stroke text-xs"
                >
                  <span className="font-mono text-content-tertiary w-4">{idx + 1}</span>
                  <span className="text-content font-medium">{stop.name}</span>
                  {stop.is_terminal && <Badge variant="warning" className="ml-1 text-[9px]">T</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Vehicle Info */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bus className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-medium text-content-secondary">Vehicle</h3>
          </div>
          {authLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-4 skeleton rounded" />)}
            </div>
          ) : vehicle ? (
            <div className="space-y-2.5">
              {[
                { label: "Plate", value: vehicle.plate_number },
                { label: "Type", value: vehicle.bus_type || "Standard" },
                { label: "Capacity", value: `${vehicle.capacity || "—"} seats` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-content-tertiary">{item.label}</span>
                  <span className="text-sm font-medium text-content font-mono">{item.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-xs text-content-tertiary">Status</span>
                <Badge variant="success" dot>Active</Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-content-tertiary text-center py-4">No vehicle data</p>
          )}
        </Card>

        {/* Occupancy */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-medium text-content-secondary">Occupancy</h3>
          </div>
          <div className="flex items-center justify-center py-2">
            <OccupancyGauge
              level={vehiclePos?.occupancy_level ?? 0}
              peopleCount={0}
              capacity={vehicle?.capacity}
              compact
            />
          </div>
        </Card>

        {/* Telemetry */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-medium text-content-secondary">Telemetry</h3>
          </div>
          {vehiclePos ? (
            <div className="space-y-2.5">
              {[
                { label: "Latitude", value: vehiclePos.lat.toFixed(6) },
                { label: "Longitude", value: vehiclePos.lon.toFixed(6) },
                { label: "Speed", value: `${vehiclePos.speed?.toFixed(1) || "0.0"} km/h` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-content-tertiary">{item.label}</span>
                  <span className="text-sm font-mono text-content">{item.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-content-tertiary text-center py-4">Waiting for GPS...</p>
          )}
        </Card>
      </div>

      {/* ── Start Ride CTA ── */}
      <div className="flex justify-center pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={handleStartRide}
          disabled={!selectedRoute}
          loading={startingRide}
          className="min-w-[280px] text-base"
        >
          <Play className="w-5 h-5" />
          Start Ride
          <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
      {!selectedRoute && (
        <p className="text-center text-xs text-content-tertiary -mt-2">Select a route above to start</p>
      )}
    </div>
  );
}
