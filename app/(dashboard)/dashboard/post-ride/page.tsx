"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentTime } from "@/hooks/use-current-time";
import { formatTime, formatDuration } from "@/lib/utils";
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
} from "lucide-react";
import type { Assignment } from "@/types";
import { assignmentApi } from "@/lib/api";

export default function PostRidePage() {
  const { vehicle, route, session, setScreen } = useAuth();
  const router = useRouter();
  const now = useCurrentTime();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignment();
  }, []);

  const loadAssignment = async () => {
    try {
      const res = await assignmentApi.getCurrent();
      setAssignment(res.data);
    } catch {
      // No active assignment — show last completed
    } finally {
      setLoading(false);
    }
  };

  const handleNewRoute = () => {
    setScreen("pre-ride");
    router.push("/dashboard");
  };

  // Calculate duration
  const duration = assignment?.start_time
    ? Math.floor(
        (Date.now() - new Date(assignment.start_time).getTime()) / 1000
      )
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 border border-success/20 mb-4">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Ride Completed
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Trip summary and statistics
        </p>
        {now && (
          <p className="text-xs text-text-muted mt-2">
            {now.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" at "}
            {formatTime(now)}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Duration */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Timer className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Duration</p>
              <p className="text-xl font-mono font-bold text-text-primary">
                {formatDuration(duration)}
              </p>
            </div>
          </div>
        </Card>

        {/* Route */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Route className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Route</p>
              <p className="text-xl font-mono font-bold text-text-primary">
                {route?.route_number || "—"}
              </p>
            </div>
          </div>
        </Card>

        {/* Vehicle */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Gauge className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Vehicle</p>
              <p className="text-xl font-mono font-bold text-text-primary">
                {vehicle?.plate_number || "—"}
              </p>
            </div>
          </div>
        </Card>

        {/* Stops */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Stops</p>
              <p className="text-xl font-mono font-bold text-text-primary">
                {route?.stops?.length || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Capacity */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Capacity</p>
              <p className="text-xl font-mono font-bold text-text-primary">
                {vehicle?.capacity || "—"}
              </p>
            </div>
          </div>
        </Card>

        {/* Assignment ID */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Assignment</p>
              <p className="text-xl font-mono font-bold text-text-primary">
                #{assignment?.id || "—"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Route Summary */}
      {route && route.stops && route.stops.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Route className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-medium text-text-secondary">
              Route Summary
            </h3>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {route.stops.map((stop, idx) => (
              <div key={stop.id} className="flex items-center shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated/50">
                  <span className="text-xs font-mono text-text-muted">
                    {idx + 1}.
                  </span>
                  <span className="text-xs text-text-secondary whitespace-nowrap">
                    {stop.name}
                  </span>
                </div>
                {idx < route.stops.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-text-muted mx-1 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action */}
      <div className="flex justify-center pt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleNewRoute}
          className="min-w-[280px] text-base"
          icon={<TrendingUp className="w-5 h-5" />}
        >
          Start New Route
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
