"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentTime } from "@/hooks/use-current-time";
import { formatTime, formatDuration } from "@/lib/utils";
import { assignmentApi, tripHistoryApi } from "@/lib/api";
import {
  CheckCircle2,
  Clock,
  Route,
  Gauge,
  Users,
  MapPin,
  ArrowRight,
  BarChart3,
  Timer,
  TrendingUp,
  Loader2,
} from "lucide-react";
import type { Assignment, TripHistory } from "@/types";

export default function PostRidePage() {
  const { vehicle, route, session } = useAuth();
  const router = useRouter();
  const now = useCurrentTime();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [tripHistory, setTripHistory] = useState<TripHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await assignmentApi.getCurrent();
      if (res.data) {
        setAssignment(res.data);
        // Load trip history
        if (res.data.id) {
          const thRes = await tripHistoryApi.getByAssignment(res.data.id);
          setTripHistory(thRes.data || []);
        }
      } else if (session.vehicle_id) {
        // Load last trip history for vehicle
        const thRes = await tripHistoryApi.getByVehicle(session.vehicle_id, 20);
        setTripHistory(thRes.data || []);
      }
    } catch { /* non-fatal */ } finally {
      setLoading(false);
    }
  };

  const handleNewRoute = () => {
    router.push("/dashboard");
  };

  const duration = assignment?.start_time
    ? Math.floor((Date.now() - new Date(assignment.start_time).getTime()) / 1000)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-success/10 border border-success/20 mb-4">
          <CheckCircle2 className="w-7 h-7 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ride Completed</h1>
        <p className="text-gray-500 text-sm mt-1">Trip summary and statistics</p>
        {now && (
          <p className="text-xs text-content-tertiary mt-2">
            {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            {" at "}{formatTime(now)}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { icon: Timer, label: "Duration", value: formatDuration(duration), color: "text-primary-600 bg-primary-50" },
          { icon: Route, label: "Route", value: route?.route_number || "—", color: "text-primary-600 bg-primary-50" },
          { icon: Gauge, label: "Vehicle", value: vehicle?.plate_number || "—", color: "text-primary-600 bg-primary-50" },
          { icon: MapPin, label: "Stops", value: `${route?.stops?.length || 0}`, color: "text-success bg-emerald-50" },
          { icon: Users, label: "Capacity", value: `${vehicle?.capacity || "—"}`, color: "text-warning bg-amber-50" },
          { icon: BarChart3, label: "Assignment", value: assignment ? `#${assignment.id}` : "—", color: "text-primary-600 bg-primary-50" },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-content-tertiary">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900 font-mono">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Trip History */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-medium text-content-secondary">Trip History</h3>
          <Badge variant="primary" className="ml-auto">{tripHistory.length} stops</Badge>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
          </div>
        ) : tripHistory.length > 0 ? (
          <div className="space-y-2">
            {tripHistory.map((th, idx) => (
              <div key={th.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary/50 border border-stroke">
                <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary-600">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-content">{th.stop_name || `Stop #${th.stop_id}`}</p>
                  <p className="text-[10px] text-content-tertiary">
                    {th.arrival_time ? new Date(th.arrival_time).toLocaleTimeString() : "—"}
                  </p>
                </div>
                {th.dwell_time && (
                  <Badge variant="default" className="text-[10px]">
                    {th.dwell_time}s dwell
                  </Badge>
                )}
                {th.occupancy_level !== undefined && th.occupancy_level !== null && (
                  <Badge variant={th.occupancy_level > 60 ? "danger" : th.occupancy_level > 30 ? "warning" : "success"} className="text-[10px]">
                    {th.occupancy_level}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-content-tertiary text-center py-6">No trip history available</p>
        )}
      </Card>

      {/* Route Summary */}
      {route && route.stops && route.stops.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Route className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-medium text-content-secondary">Route Summary</h3>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
            {route.stops.map((stop, idx) => (
              <div key={stop.id} className="flex items-center shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-stroke">
                  <span className="text-[10px] font-mono text-content-tertiary">{idx + 1}</span>
                  <span className="text-xs text-content font-medium whitespace-nowrap">{stop.name}</span>
                </div>
                {idx < route.stops.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-content-tertiary mx-0.5 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action */}
      <div className="flex justify-center pt-2">
        <Button variant="primary" size="lg" onClick={handleNewRoute} className="min-w-[280px] text-base">
          <TrendingUp className="w-5 h-5" />
          Start New Route
          <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
