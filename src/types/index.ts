// ============================================================
// BusTrack Bus Dashboard — Complete Type Definitions
// ============================================================

// === Auth Types ===

export interface PairVerifyRequest {
  code: string;
  password: string;
}

export interface PairVerifyResponse {
  status: "paired";
  vehicle_id: number;
  plate_number: string;
  device_id: string;
  message: string;
}

export interface BusDashboardLoginRequest {
  vehicle_id: number;
  device_id: string;
  password: string;
}

export interface BusDashboardLoginResponse {
  access_token: string;
  token_type: "bearer";
  vehicle_id: number;
  device_id: string;
}

export interface DriverLoginRequest {
  username: string;
  password: string;
  device_id: string;
  bus_token: string;
}

export interface DriverLoginResponse {
  access_token: string;
  token_type: "bearer";
  session_id: number;
  driver_id: number;
  vehicle_id: number;
  device_id: string;
}

export interface DriverLogoutRequest {
  session_id: number;
}

// === Vehicle Types ===

export interface Vehicle {
  id: number;
  plate_number: string;
  device_id: string;
  bus_type?: string;
  capacity?: number;
  is_active: boolean;
  route_id?: number;
  route_number?: string;
  last_lat?: number;
  last_lon?: number;
  speed?: number;
  position_updated_at?: string;
}

export interface VehiclePosition {
  vehicle_id: number;
  plate_number: string;
  lat: number;
  lon: number;
  speed: number;
  timestamp: number;
  route_id?: number;
  assignment_id?: number;
  occupancy_level: number;
  last_updated?: string;
}

// === Route Types ===

export interface Route {
  id: number;
  route_number: string;
  direction: "forward" | "reverse";
  name?: string;
  origin?: string;
  destination?: string;
  active: boolean;
}

export interface RouteStop {
  id: number;
  name: string;
  lat: number;
  lon: number;
  base_dwell_time: number;
  is_terminal: boolean;
  peak_multiplier: number;
  stop_order?: number;
}

export interface RouteWithStops extends Route {
  stops: RouteStop[];
}

// === Assignment Types ===

export interface Assignment {
  id: number;
  driver_id: number;
  vehicle_id: number;
  route_id: number;
  start_time: string;
  end_time?: string;
  status: "active" | "completed";
  driver_username?: string;
  vehicle_plate?: string;
  route_number?: string;
}

// === Crowd Types ===

export interface CrowdData {
  plate_number: string;
  cv: {
    occupancy_level: number;
    people_count: number;
    face_count: number;
    head_blob_count: number;
    crowd_density: number;
    confidence: number;
    method: string;
    updated_at: number;
    image_path: string;
  };
  image_path?: string;
}

// === Trip History Types ===

export interface TripHistory {
  id: number;
  assignment_id: number;
  stop_id: number;
  arrival_time: string;
  dwell_time?: number;
  occupancy_level?: number;
  heuristic_eta?: number;
  ml_eta?: number;
  actual_travel_time?: number;
  stop_name?: string;
}

// === WebSocket Types ===

export type WSMessage =
  | { type: "connected"; detail: string }
  | { type: "subscribed"; route_id: number }
  | { type: "unsubscribed" }
  | WSVehiclePosition
  | WSCVResult
  | { type: "heartbeat" }
  | { type: "pong" };

export interface WSVehiclePosition {
  type: "vehicle_position";
  vehicle_id: number;
  plate_number: string;
  lat: number;
  lon: number;
  speed: number;
  route_id?: number;
  timestamp: number;
  bus_type?: string;
  occupancy_level: number;
  eta_payloads?: Record<string, ETAStopPayload>;
  assignment_id?: number;
}

export interface WSCVResult {
  type: "cv_result";
  vehicle_id: number;
  plate_number: string;
  timestamp: number;
  cv: {
    people_count: number;
    face_count: number;
    head_blob_count: number;
    crowd_density: number;
    is_crowded: boolean;
    method: string;
    confidence: number;
    foreground_ratio: number;
    inference_ms: number;
  };
}

export interface ETAStopPayload {
  stop_name: string;
  eta_seconds: number;
  distance_m: number;
  computed_at: number;
}

// === Session Storage ===

export interface SessionData {
  bd_bus_token?: string;
  bd_vehicle_id?: number;
  bd_device_id?: string;
  bd_plate?: string;
  driver_token?: string;
  driver_session_id?: number;
  driver_id?: number;
  driver_username?: string;
  vehicle_id?: number;
  route_id?: number;
}

// === Announcement Types (FUTURE) ===

export interface AnnouncementPayload {
  vehicle_id: number;
  announcement_type: "next_stop" | "current_stop" | "general";
  message: string;
  stop_name?: string;
}

// === App State ===

export type AppScreen =
  | "pairing"
  | "unlock"
  | "login"
  | "pre-ride"
  | "active-ride"
  | "post-ride";

export type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

export type CrowdLevel = 0 | 1 | 2; // Low, Medium, High
