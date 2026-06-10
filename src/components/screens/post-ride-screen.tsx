"use client";

import { useEffect, useState } from "react";
import {
  Bus,
  CheckCircle,
  Gauge,
  MapPin,
  Users,
  Route,
  LogOut,
  Play,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/shared/toast-stack";
import { tripHistoryApi, assignmentApi } from "@/lib/api";
import { LargeButton } from "@/components/shared/large-button";
import type { TripHistory, Assignment } from "@/types";

export function PostRideScreen() {
  const { session, vehicle, route, logout, setScreen } = useAuth();
  const { error: toastError } = useToast();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [history, setHistory] = useState<TripHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get current/completed assignment
      const assignRes = await assignmentApi.getCurrent();
      if (assignRes.data) {
        setAssignment(assignRes.data);
        // Load trip history for this assignment
        const histRes = await tripHistoryApi.getByAssignment(assignRes.data.id);
        setHistory(histRes.data || []);
      } else if (session.vehicle_id) {
        // Fallback: load by vehicle
        const histRes = await tripHistoryApi.getByVehicle(session.vehicle_id, 20);
        setHistory(histRes.data || []);
      }
    } catch (err) {
      toastError("Failed to load trip data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleStartNewRide = () => {
    setScreen("pre-ride");
  };

  // Compute summary stats
  const duration = (() => {
    if (!assignment?.start_time) return "—";
    const start = new Date(assignment.start_time);
    const end = assignment.end_time ? new Date(assignment.end_time) : new Date();
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  })();

  const stopsPassed = history.filter((h) => h.arrival_time).length;
  const totalStops = route?.stops?.length || 0;

  const avgCrowd = history.length > 0
    ? history.reduce((sum, h) => sum + (h.occupancy_level || 0), 0) / history.length
    : 0;

  const crowdLabel = avgCrowd < 0.5 ? "Low" : avgCrowd < 1.5 ? "Medium" : "High";
  const crowdColor = avgCrowd < 0.5 ? "var(--success)" : avgCrowd < 1.5 ? "var(--warning)" : "var(--danger)";

  const formatTime = (ts?: string) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDuration = (s?: number) => {
    if (!s) return "—";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
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
        <div className="flex items-center gap-2">
          <Bus className="w-5 h-5" style={{ color: "var(--primary-400)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Post-Ride Summary
          </span>
          {vehicle && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--surface-700)", color: "var(--text-secondary)" }}>
              Bus #{vehicle.id}
            </span>
          )}
        </div>
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
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Completion Banner */}
        <div
          className="p-5 rounded-2xl text-center"
          style={{
            background: "linear-gradient(135deg, rgba(52,211,153,0.1), rgba(16,185,129,0.05))",
            border: "1px solid var(--success-border)",
          }}
        >
          <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--success)" }} />
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Ride Completed
          </h2>
          {route && (
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {route.route_number} — {route.origin} → {route.destination}
            </p>
          )}
          {assignment && (
            <div className="flex items-center justify-center gap-4 mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
              <span>Started: {formatTime(assignment.start_time)}</span>
              <ArrowRight className="w-3 h-3" />
              <span>Ended: {formatTime(assignment.end_time)}</span>
            </div>
          )}
          <p className="text-sm font-semibold mt-2" style={{ color: "var(--text-secondary)" }}>
            Duration: {duration}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Average Speed */}
          <div
            className="p-4 rounded-2xl flex flex-col items-center"
            style={{ background: "var(--surface-800)", border: "1px solid var(--border-subtle)" }}
          >
            <Gauge className="w-5 h-5 mb-2" style={{ color: "var(--primary-400)" }} />
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              —
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Avg Speed
            </p>
          </div>

          {/* Stops Passed */}
          <div
            className="p-4 rounded-2xl flex flex-col items-center"
            style={{ background: "var(--surface-800)", border: "1px solid var(--border-subtle)" }}
          >
            <MapPin className="w-5 h-5 mb-2" style={{ color: "var(--success)" }} />
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {stopsPassed}/{totalStops}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Stops Passed
            </p>
          </div>

          {/* Peak Crowd */}
          <div
            className="p-4 rounded-2xl flex flex-col items-center"
            style={{ background: "var(--surface-800)", border: "1px solid var(--border-subtle)" }}
          >
            <Users className="w-5 h-5 mb-2" style={{ color: crowdColor }} />
            <p className="text-2xl font-bold" style={{ color: crowdColor }}>
              {crowdLabel}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Peak Crowd
            </p>
          </div>

          {/* Distance */}
          <div
            className="p-4 rounded-2xl flex flex-col items-center"
            style={{ background: "var(--surface-800)", border: "1px solid var(--border-subtle)" }}
          >
            <Route className="w-5 h-5 mb-2" style={{ color: "var(--accent-300)" }} />
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              — km
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Distance
            </p>
          </div>
        </div>

        {/* Trip History Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--surface-800)", border: "1px solid var(--border-subtle)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Trip History
            </h3>
          </div>

          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6" style={{ color: "var(--primary-400)", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--surface-700)" }}>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                      Stop
                    </th>
                    <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                      Arrive
                    </th>
                    <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                      Dwell
                    </th>
                    <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                      Crowd
                    </th>
                    <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                      ETA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, idx) => (
                    <tr
                      key={h.id}
                      style={{
                        borderTop: "1px solid var(--border-subtle)",
                        background: idx % 2 === 0 ? "transparent" : "rgba(30,41,59,0.3)",
                      }}
                    >
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                        {h.stop_name || `Stop ${h.stop_id}`}
                      </td>
                      <td className="text-center px-3 py-3" style={{ color: "var(--text-secondary)" }}>
                        {formatTime(h.arrival_time)}
                      </td>
                      <td className="text-center px-3 py-3" style={{ color: "var(--text-secondary)" }}>
                        {formatDuration(h.dwell_time)}
                      </td>
                      <td className="text-center px-3 py-3">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background:
                              (h.occupancy_level || 0) === 0
                                ? "var(--success-dim)"
                                : (h.occupancy_level || 0) === 1
                                ? "var(--warning-dim)"
                                : "var(--danger-dim)",
                            color:
                              (h.occupancy_level || 0) === 0
                                ? "var(--success)"
                                : (h.occupancy_level || 0) === 1
                                ? "var(--warning)"
                                : "var(--danger)",
                          }}
                        >
                          {(h.occupancy_level || 0) === 0
                            ? "Low"
                            : (h.occupancy_level || 0) === 1
                            ? "Med"
                            : "High"}
                        </span>
                      </td>
                      <td className="text-center px-3 py-3 tabular-nums" style={{ color: "var(--text-muted)" }}>
                        {h.heuristic_eta ? formatDuration(h.heuristic_eta) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No trip history data available yet
              </p>
            </div>
          )}
        </div>

        {/* Start New Ride */}
        <div className="pt-2 pb-6">
          <LargeButton
            variant="success"
            onClick={handleStartNewRide}
            icon={<Play className="w-5 h-5" />}
          >
            Start New Ride
          </LargeButton>
        </div>
      </div>
    </div>
  );
}
