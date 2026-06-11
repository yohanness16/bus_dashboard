import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bustrack.dpdns.org";

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
  generateCode: (vehicleId: number) =>
    api.post(`/admin/vehicles/${vehicleId}/generate-pairing-code`),
  unpair: (vehicleId: number) =>
    api.post(`/admin/vehicles/${vehicleId}/unpair`),
};

// ─── Auth ───
export const authApi = {
  busDashboardLogin: (vehicle_id: number, device_id: string, password: string) =>
    api.post("/auth/bus-dashboard/login", { vehicle_id, device_id, password }),
  driverLogin: (username: string, password: string, device_id: string, bus_token: string) =>
    api.post("/auth/driver-login", { username, password, device_id, bus_token }),
  driverLogout: (session_id: number) =>
    api.post("/auth/driver-logout", { session_id }),
  getMe: () => api.get("/auth/me"),
};

// ─── Vehicles ───
export const vehicleApi = {
  getVehicle: (id: number) => api.get(`/vehicles/${id}`),
  getPosition: (id: number) => api.get(`/vehicles/positions/${id}`),
  getAllPositions: () => api.get("/vehicles/positions"),
  sendTelemetry: (device_id: string, lat: number, lon: number, speed?: number) =>
    api.post("/vehicles/telemetry", { device_id, lat, lon, speed: speed || 0 }),
  listVehicles: (skip = 0, limit = 100) =>
    api.get("/vehicles", { params: { skip, limit } }),
  registerVehicle: (data: { plate_number: string; device_id: string; bus_type?: string; capacity?: number }) =>
    api.post("/vehicles", data),
  updateVehicle: (id: number, data: { route_id?: number | null }) =>
    api.put(`/vehicles/${id}`, data),
};

// ─── Routes ───
export const routeApi = {
  listRoutes: (skip = 0, limit = 100) =>
    api.get("/routes", { params: { skip, limit } }),
  getRoute: (id: number) => api.get(`/routes/${id}`),
  // Note: use listRoutes + filter client-side, or getRoute(id)
  getEtas: (routeNumber: string) => api.get(`/routes/${routeNumber}/etas`),
  createRoute: (data: {
    route_number: string;
    direction?: string;
    name?: string;
    origin?: string;
    destination?: string;
    stops?: { stop_id: number; sequence_order: number }[];
  }) => api.post("/routes", data),
  listStops: (skip = 0, limit = 100) =>
    api.get("/stops", { params: { skip, limit } }),
  getStop: (id: number) => api.get(`/stops/${id}`),
  createStop: (data: {
    name: string;
    lat: number;
    lon: number;
    base_dwell_time?: number;
    is_terminal?: boolean;
    peak_multiplier?: number;
  }) => api.post("/stops", data),
};

// ─── Driver Assignments ───
export const assignmentApi = {
  getCurrent: () => api.get("/driver/assignments/current"),
  start: (route_number: string) =>
    api.post("/driver/assignments/start", { route_number }),
  end: (assignment_id: number) =>
    api.post("/driver/assignments/end", { assignment_id }),
  // Admin endpoints
  listActive: () => api.get("/assignments/active"),
  adminStart: (driver_id: number, vehicle_id: number, route_id: number) =>
    api.post("/assignments/start", { driver_id, vehicle_id, route_id }),
  adminEnd: (assignment_id: number) =>
    api.post("/assignments/end", { assignment_id }),
};

// ─── Trip History ───
export const tripHistoryApi = {
  getByVehicle: (vehicleId: number, limit = 50, offset = 0) =>
    api.get(`/admin/trip-history/vehicle/${vehicleId}`, { params: { limit, offset } }),
  getByAssignment: (assignmentId: number) =>
    api.get(`/admin/trip-history/assignment/${assignmentId}`),
};

// ─── Crowd / CV ───
export const crowdApi = {
  getCrowd: (plate: string) => api.get(`/admin/crowd/${encodeURIComponent(plate)}`),
};

// ─── Search ───
export const searchApi = {
  pointToPoint: (start_stop_id: number, end_stop_id: number, max_routes?: number, max_buses?: number) =>
    api.post("/search/point-to-point", { start_stop_id, end_stop_id, max_routes, max_buses }),
  journey: (data: {
    start_query?: string;
    start_lat?: number;
    start_lon?: number;
    end_query?: string;
    end_lat?: number;
    end_lon?: number;
    max_routes?: number;
    max_buses?: number;
  }) => api.post("/search/journey", data),
};

// ─── Favorites ───
export const favoritesApi = {
  add: (user_id: number, route_id: number, nickname?: string) =>
    api.post("/favorites", { user_id, route_id, nickname }),
  list: (user_id: number) => api.get(`/favorites/${user_id}`),
  remove: (favorite_id: number) => api.delete(`/favorites/${favorite_id}`),
};

// ─── Ratings ───
export const ratingsApi = {
  add: (user_id: number, assignment_id: number, score: number, comment?: string) =>
    api.post("/ratings", { user_id, assignment_id, score, comment }),
  list: (assignment_id: number) => api.get(`/ratings/${assignment_id}`),
};

// ─── Notifications ───
export const notificationApi = {
  setSetting: (data: { user_id: number; route_id: number; stop_id?: number; lead_time_minutes?: number }) =>
    api.post("/notifications/settings", data),
  getSettings: (user_id: number) => api.get(`/notifications/settings/${user_id}`),
  registerFcmToken: (user_id: number, token: string) =>
    api.post("/notifications/register-token", { user_id, token }),
};

// ─── Performance ───
export const performanceApi = {
  getCsv: () => api.get("/admin/performance/csv", { responseType: "blob" }),
  getJson: () => api.get("/admin/performance/json"),
  getSummary: () => api.get("/admin/performance/summary"),
  getReport: () => api.get("/admin/performance/report"),
};

// ─── Admin ───
export const adminApi = {
  getMlToggle: () => api.get("/admin/use-ml"),
};

// ─── Health ───
export const healthApi = {
  check: () => api.get("/health"),
};
