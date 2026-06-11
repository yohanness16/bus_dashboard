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
      const assignRes = await assignmentApi.getCurrent();
      if (assignRes.data) {
        setAssignment(assignRes.data);
        const histRes = await tripHistoryApi.getByAssignment(assignRes.data.id);
        setHistory(histRes.data || []);
      } else if (session.vehicle_id) {
        const histRes = await tripHistoryApi.getByVehicle(session.vehicle_id, 20);
        setHistory(histRes.data || []);
      }
    } catch {
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

  const avgCrowd =
    history.length > 0
      ? history.reduce((sum, h) => sum + (h.occupancy_level || 0), 0) / history.length
      : 0;

  const crowdLabel = avgCrowd < 0.5 ? "Low" : avgCrowd < 1.5 ? "Medium" : "High";
  const crowdColor =
    avgCrowd < 0.5 ? "var(--success)" : avgCrowd < 1.5 ? "var(--warning)" : "var(--danger)";

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
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Trip Summary
          </span>
        </div>
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
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 max-w-6xl mx-auto w-full">
        {/* Completion Banner */}
        <div
          className="surface-card p-6 text-center anim-fade-up"
          style={{
            background: "linear-gradient(135deg, rgba(52,211,153,0.1), rgba(16,185,129,0.05))",
            border: "1px solid var(--success-border)",
          }}
        >
          <CheckCircle
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: "var(--success)" }}
          />
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Ride Completed
          </h2>
          {route && (
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {route.route_number} — {route.origin} → {route.destination}
            </p>
          )}
          {assignment && (
            <div
              className="flex items-center justify-center gap-3 mt-3 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span>Started: {formatTime(assignment.start_time)}</span>
              <ArrowRight className="w-3 h-3" />
              <span>Ended: {formatTime(assignment.end_time)}</span>
            </div>
          )}
          <p
            className="text-sm font-semibold mt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Duration: {duration}
          </p>
        </div>

        {/* Stats Grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 anim-fade-up"
          style={{ animationDelay: "50ms" }}
        >
          <div className="flex flex-col items-center p-4 surface-card">
            <Gauge className="w-5 h-5 mb-2" style={{ color: "var(--primary-400)" }} />
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              —
            </p>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Avg Speed
            </p>
          </div>

          <div className="flex flex-col items-center p-4 surface-card">
            <MapPin className="w-5 h-5 mb-2" style={{ color: "var(--success)" }} />
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {stopsPassed}/{totalStops}
            </p>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Stops
            </p>
          </div>

          <div className="flex flex-col items-center p-4 surface-card">
            <Users className="w-5 h-5 mb-2" style={{ color: crowdColor }} />
            <p className="text-2xl font-bold" style={{ color: crowdColor }}>
              {crowdLabel}
            </p>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Peak Crowd
            </p>
          </div>

          <div className="flex flex-col items-center p-4 surface-card">
            <Route className="w-5 h-5 mb-2" style={{ color: "var(--accent-300)" }} />
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              — km
            </p>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Distance
            </p>
          </div>
        </div>

        {/* Trip History Table */}
        <div
          className="surface-card overflow-hidden anim-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h3
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Trip History
            </h3>
          </div>

          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2
                className="w-6 h-6"
                style={{ color: "var(--primary-400)", animation: "spin 0.8s linear infinite" }}
              />
            </div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--surface-700)" }}>
                    <th
                      className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Stop
                    </th>
                    <th
                      className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Arrive
                    </th>
                    <th
                      className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Dwell
                    </th>
                    <th
                      className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Crowd
                    </th>
                    <th
                      className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--text-tertiary)" }}
                    >
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
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--surface-700)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          idx % 2 === 0 ? "transparent" : "rgba(30,41,59,0.3)";
                      }}
                    >
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {h.stop_name || `Stop ${h.stop_id}`}
                      </td>
                      <td
                        className="text-center px-3 py-3"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatTime(h.arrival_time)}
                      </td>
                      <td
                        className="text-center px-3 py-3"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatDuration(h.dwell_time)}
                      </td>
                      <td className="text-center px-3 py-3">
                        <span
                          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase"
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
                      <td
                        className="text-center px-3 py-3 tabular-nums"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {h.heuristic_eta ? formatDuration(h.heuristic_eta) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Clock
                className="w-8 h-8 mx-auto mb-2"
                style={{ color: "var(--text-muted)" }}
              />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No trip history data available yet
              </p>
            </div>
          )}
        </div>

        {/* Start New Ride */}
        <div className="pt-2 pb-6 anim-fade-up" style={{ animationDelay: "150ms" }}>
          <button
            onClick={handleStartNewRide}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #34D399, #10B981)",
              color: "#fff",
              border: "1px solid rgba(52,211,153,0.3)",
              boxShadow: "0 4px 16px rgba(52,211,153,0.25)",
            }}
          >
            <Play className="w-5 h-5" />
            Start New Ride
          </button>
        </div>
      </div>
    </div>
  );
}
