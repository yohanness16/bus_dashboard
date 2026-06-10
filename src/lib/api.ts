import axios from "axios";

const API_URL =  "https://api.bustrack.dpdns.org";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("driver_token") ||
      localStorage.getItem("bd_bus_token") ||
      localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Pairing ───
export const pairingApi = {
  verifyCode: (code: string, password: string) =>
    api.post("/pair/verify", { code, password }),
};

// ─── Auth ───
export const authApi = {
  busDashboardLogin: (vehicle_id: number, device_id: string, password: string) =>
    api.post("/auth/bus-dashboard/login", { vehicle_id, device_id, password }),

  driverLogin: (
    username: string,
    password: string,
    device_id: string,
    bus_token: string
  ) => api.post("/auth/driver-login", { username, password, device_id, bus_token }),

  driverLogout: (session_id: number) =>
    api.post("/auth/driver-logout", { session_id }),
};

// ─── Vehicles ───
export const vehicleApi = {
  getVehicle: (id: number) => api.get(`/vehicles/${id}`),
  getPosition: (id: number) => api.get(`/vehicles/positions/${id}`),
  sendTelemetry: (device_id: string, lat: number, lon: number) =>
    api.post("/vehicles/telemetry", { device_id, lat, lon }),
};

// ─── Routes ───
export const routeApi = {
  getRoute: (id: number) => api.get(`/routes/${id}`),
  getEtas: (routeNumber: string) => api.get(`/routes/${routeNumber}/etas`),
};

// ─── Driver Assignments ───
export const assignmentApi = {
  getCurrent: () => api.get("/driver/assignments/current"),
  start: (route_id: number) => api.post("/driver/assignments/start", { route_id }),
  end: (assignment_id: number) =>
    api.post("/driver/assignments/end", { assignment_id }),
};

// ─── Trip History ───
export const tripHistoryApi = {
  getByVehicle: (vehicleId: number, limit = 50, offset = 0) =>
    api.get(`/admin/trip-history/vehicle/${vehicleId}`, { params: { limit, offset } }),
  getByAssignment: (assignmentId: number) =>
    api.get(`/admin/trip-history/assignment/${assignmentId}`),
};

// ─── Crowd ───
export const crowdApi = {
  getCrowd: (plate: string) => api.get(`/admin/crowd/${encodeURIComponent(plate)}`),
};

// ─── Announcements (future) ───
export const announcementApi = {
  create: (data: {
    vehicle_id: number;
    announcement_type: "next_stop" | "current_stop" | "general";
    message: string;
    stop_name?: string | null;
  }) => api.post("/admin/announcements", data),
};

// ─── Health ───
export const healthApi = {
  check: () => api.get("/health"),
};
