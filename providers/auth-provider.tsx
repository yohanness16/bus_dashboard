"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  getSession,
  setBusSession,
  setDriverSession,
  setRouteId,
  clearSession,
} from "@/lib/session-storage";
import { AppScreen, SessionData, Vehicle, RouteWithStops } from "@/types";
import { authApi, vehicleApi, routeApi } from "@/lib/api";

interface AuthContextType {
  screen: AppScreen;
  session: SessionData;
  vehicle: Vehicle | null;
  route: RouteWithStops | null;
  loading: boolean;
  error: string | null;
  setScreen: (s: AppScreen) => void;
  // Pairing
  pairDevice: (code: string, password: string) => Promise<void>;
  // Bus unlock
  unlockBus: (password: string) => Promise<void>;
  // Driver login
  driverLogin: (username: string, password: string) => Promise<void>;
  // Logout
  logout: () => Promise<void>;
  // Pre-ride data loading
  loadPreRideData: () => Promise<void>;
  // Refresh vehicle
  refreshVehicle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [screen, setScreenState] = useState<AppScreen>("pairing");
  const [session, setSession] = useState<SessionData>({});
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [route, setRoute] = useState<RouteWithStops | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine initial screen from localStorage
  useEffect(() => {
    const s = getSession();
    setSession(s);

    if (s.driver_token) {
      setScreenState("pre-ride");
    } else if (s.bd_bus_token) {
      setScreenState("login");
    } else if (s.bd_device_id) {
      setScreenState("unlock");
    } else {
      setScreenState("pairing");
    }
  }, []);

  const setScreen = useCallback((s: AppScreen) => {
    setScreenState(s);
  }, []);

  // ─── Pairing ───
  const pairDevice = useCallback(async (code: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/pair/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, password }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Invalid or expired code");
      }
      const data = await res.json();
      setBusSession({
        bus_token: "", // no bus_token yet, need unlock first
        vehicle_id: data.vehicle_id,
        device_id: data.device_id,
        plate_number: data.plate_number,
      });
      setSession((prev) => ({
        ...prev,
        bd_vehicle_id: data.vehicle_id,
        bd_device_id: data.device_id,
        bd_plate: data.plate_number,
      }));
      setScreenState("unlock");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Pairing failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Bus Unlock ───
  const unlockBus = useCallback(
    async (password: string) => {
      setLoading(true);
      setError(null);
      const s = getSession();
      if (!s.bd_vehicle_id || !s.bd_device_id) {
        setError("Device not paired yet");
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.busDashboardLogin(
          s.bd_vehicle_id,
          s.bd_device_id,
          password
        );
        const data = res.data;
        localStorage.setItem("bd_bus_token", data.access_token);
        setSession((prev) => ({ ...prev, bd_bus_token: data.access_token }));
        setScreenState("login");
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Incorrect device password";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ─── Driver Login ───
  const driverLogin = useCallback(
    async (username: string, password: string) => {
      setLoading(true);
      setError(null);
      const s = getSession();
      if (!s.bd_bus_token || !s.bd_device_id) {
        setError("Bus not unlocked");
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.driverLogin(
          username,
          password,
          s.bd_device_id,
          s.bd_bus_token
        );
        const data = res.data;
        setDriverSession({
          driver_token: data.access_token,
          session_id: data.session_id,
          driver_id: data.driver_id,
          username,
          vehicle_id: data.vehicle_id,
        });
        setSession((prev) => ({
          ...prev,
          driver_token: data.access_token,
          driver_session_id: data.session_id,
          driver_id: data.driver_id,
          driver_username: username,
          vehicle_id: data.vehicle_id,
        }));
        // Load pre-ride data
        setScreenState("pre-ride");
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Invalid username or password";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ─── Load Pre-Ride Data ───
  const loadPreRideData = useCallback(async () => {
    const s = getSession();
    if (!s.vehicle_id) return;
    try {
      const vRes = await vehicleApi.getVehicle(s.vehicle_id);
      setVehicle(vRes.data);
      if (vRes.data.route_id) {
        setRouteId(vRes.data.route_id);
        setSession((prev) => ({ ...prev, route_id: vRes.data.route_id }));
        const rRes = await routeApi.getRoute(vRes.data.route_id);
        setRoute(rRes.data);
      }
    } catch {
      // non-fatal
    }
  }, []);

  // ─── Refresh Vehicle ───
  const refreshVehicle = useCallback(async () => {
    const s = getSession();
    if (!s.vehicle_id) return;
    try {
      const vRes = await vehicleApi.getVehicle(s.vehicle_id);
      setVehicle(vRes.data);
      if (vRes.data.route_id && vRes.data.route_id !== s.route_id) {
        setRouteId(vRes.data.route_id);
        setSession((prev) => ({ ...prev, route_id: vRes.data.route_id }));
        const rRes = await routeApi.getRoute(vRes.data.route_id);
        setRoute(rRes.data);
      }
    } catch {
      // non-fatal
    }
  }, []);

  // ─── Logout ───
  const logout = useCallback(async () => {
    const s = getSession();
    if (s.driver_session_id) {
      try {
        await authApi.driverLogout(s.driver_session_id);
      } catch {
        // ignore
      }
    }
    clearSession();
    setSession({});
    setVehicle(null);
    setRoute(null);
    setScreenState("login");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        screen,
        session,
        vehicle,
        route,
        loading,
        error,
        setScreen,
        pairDevice,
        unlockBus,
        driverLogin,
        logout,
        loadPreRideData,
        refreshVehicle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
