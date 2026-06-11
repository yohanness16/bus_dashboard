"use client";

import { useEffect, useState } from "react";
import { Bus, CheckCircle, Gauge, MapPin, Users, Route, LogOut, Play, Clock, ArrowRight, Loader2 } from "lucide-react";
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

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    setLoading(true);
    try {
      const assignRes = await assignmentApi.getCurrent();
      if (assignRes.data) { setAssignment(assignRes.data); const histRes = await tripHistoryApi.getByAssignment(assignRes.data.id); setHistory(histRes.data || []); }
      else if (session.vehicle_id) { const histRes = await tripHistoryApi.getByVehicle(session.vehicle_id, 20); setHistory(histRes.data || []); }
    } catch { toastError("Failed to load trip data"); } finally { setLoading(false); }
  };
  const handleLogout = async () => { await logout(); };
  const handleStartNewRide = () => { setScreen("pre-ride"); };
  const duration = (() => { if (!assignment?.start_time) return "—"; const start = new Date(assignment.start_time); const end = assignment.end_time ? new Date(assignment.end_time) : new Date(); const diff = Math.floor((end.getTime() - start.getTime()) / 1000); const h = Math.floor(diff / 3600); const m = Math.floor((diff % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m`; })();
  const stopsPassed = history.filter((h) => h.arrival_time).length;
  const totalStops = route?.stops?.length || 0;
  const avgCrowd = history.length > 0 ? history.reduce((sum, h) => sum + (h.occupancy_level || 0), 0) / history.length : 0;
  const crowdLabel = avgCrowd < 0.5 ? "Low" : avgCrowd < 1.5 ? "Medium" : "High";
  const crowdColor = avgCrowd < 0.5 ? "var(--success)" : avgCrowd < 1.5 ? "var(--warning)" : "var(--danger)";
  const formatTime = (ts?: string) => { if (!ts) return "—"; return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); };
  const formatDuration = (s?: number) => { if (!s) return "—"; const m = Math.floor(s / 60); const sec = s % 60; return m > 0 ? `${m}m ${sec}s` : `${sec}s`; };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="flex items-center justify-between px-4 py-2 shrink-0 border-b bg-card" style={{ height: "var(--topnav-height)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Bus className="w-4 h-4 text-primary-foreground" /></div>
          <span className="text-sm font-semibold text-card-foreground">Trip Summary</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
          <LogOut className="w-3.5 h-3.5" /><span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-6xl mx-auto w-full">
        {/* Completion Banner */}
        <div className="rounded-lg border bg-card shadow-sm p-6 text-center animate-fade-up" style={{ borderColor: "var(--success-border)", background: "linear-gradient(135deg, var(--success-bg), transparent)" }}>
          <CheckCircle className="w-10 h-10 mx-auto mb-2 text-success" />
          <h2 className="text-lg font-bold text-card-foreground">Ride Completed</h2>
          {route && <p className="text-sm text-muted-foreground mt-1">{route.route_number} — {route.origin} → {route.destination}</p>}
          {assignment && <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground"><span>Started: {formatTime(assignment.start_time)}</span><ArrowRight className="w-3 h-3" /><span>Ended: {formatTime(assignment.end_time)}</span></div>}
          <p className="text-sm font-medium text-muted-foreground mt-2">Duration: {duration}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-up" style={{ animationDelay: "50ms" }}>
          {[
            { icon: Gauge, value: "—", label: "Avg Speed", color: "text-primary" },
            { icon: MapPin, value: `${stopsPassed}/${totalStops}`, label: "Stops", color: "text-success" },
            { icon: Users, value: crowdLabel, label: "Peak Crowd", color: crowdColor },
            { icon: Route, value: "— km", label: "Distance", color: "text-blue-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border bg-card shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2"><s.icon className={`w-4 h-4 ${s.color}`} /><span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span></div>
              <p className="text-xl font-bold" style={{ color: s.color && s.color.startsWith("var") ? s.color : "hsl(var(--card-foreground))" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* History Table */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="px-5 py-3 border-b"><h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trip History</h3></div>
          {loading ? (
            <div className="p-8 flex items-center justify-center"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50">
                  {["Stop", "Arrive", "Dwell", "Crowd", "ETA"].map((h) => (
                    <th key={h} className={`px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider ${h === "Stop" ? "text-left" : "text-center"}`}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {history.map((h, idx) => (
                    <tr key={h.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-card-foreground">{h.stop_name || `Stop ${h.stop_id}`}</td>
                      <td className="text-center px-3 py-2.5 text-muted-foreground">{formatTime(h.arrival_time)}</td>
                      <td className="text-center px-3 py-2.5 text-muted-foreground">{formatDuration(h.dwell_time)}</td>
                      <td className="text-center px-3 py-2.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: (h.occupancy_level || 0) === 0 ? "var(--success)" : (h.occupancy_level || 0) === 1 ? "var(--warning)" : "var(--danger)" }}>
                          {(h.occupancy_level || 0) === 0 ? "Low" : (h.occupancy_level || 0) === 1 ? "Med" : "High"}
                        </span>
                      </td>
                      <td className="text-center px-3 py-2.5 tabular-nums text-muted-foreground">{h.heuristic_eta ? formatDuration(h.heuristic_eta) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center"><Clock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">No trip history data available yet</p></div>
          )}
        </div>

        {/* Start New Ride */}
        <div className="pt-2 pb-6 animate-fade-up" style={{ animationDelay: "150ms" }}>
          <button onClick={handleStartNewRide}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-success text-white text-sm font-semibold uppercase tracking-wider hover:bg-success/90 transition-colors active:scale-[0.98] cursor-pointer"
          ><Play className="w-4 h-4" />Start New Ride</button>
        </div>
      </div>
    </div>
  );
}
