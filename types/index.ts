// ============================================================
// BusTrack Bus Dashboard — Complete Type Definitions
// Matches backend schemas exactly
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

export interface PairingCodeResponse {
  code: string;
  vehicle_id: number;
  plate_number: string;
  device_id: string;
  expires_in_seconds: number;
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

export interface TokenResponse {
  access_token: string;
  token_type: string;
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

export interface VehicleCreate {
  plate_number: string;
  device_id: string;
  bus_type?: string;
  capacity?: number;
  is_active?: boolean;
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

export interface TelemetryInput {
  device_id: string;
  lat: number;
  lon: number;
  speed?: number;
  pixel_count?: number;
  raw_payload?: string;
}

// === Stop Types ===

export interface Stop {
  id: number;
  name: string;
  lat: number;
  lon: number;
  base_dwell_time: number;
  is_terminal: boolean;
  peak_multiplier: number;
  stop_order?: number;
}

export interface StopCreate {
  name: string;
  lat: number;
  lon: number;
  base_dwell_time?: number;
  is_terminal?: boolean;
  peak_multiplier?: number;
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

export interface RouteCreate {
  route_number: string;
  direction?: string;
  name?: string;
  origin?: string;
  destination?: string;
  stops?: { stop_id: number; sequence_order: number }[];
}

export interface RouteStopSchema {
  stop_id: number;
  sequence_order: number;
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

export interface DriverAssignmentStartBody {
  route_number: string;
}

export interface DriverAssignmentEndBody {
  assignment_id: number;
}

// === Crowd / CV Types ===

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

// === ETA Types ===

export interface ETAData {
  stop_name: string;
  eta_seconds: number;
  distance_m: number;
  occupancy_level: number;
}

export interface RouteETAs {
  route_number: string;
  etas: Record<string, ETAData>;
}

// === Search Types ===

export interface PointToPointSearch {
  start_stop_id: number;
  end_stop_id: number;
  max_routes?: number;
  max_buses?: number;
}

export interface GeoJourneySearch {
  start_query?: string;
  start_lat?: number;
  start_lon?: number;
  end_query?: string;
  end_lat?: number;
  end_lon?: number;
  max_routes?: number;
  max_buses?: number;
}

export interface SearchRouteResult {
  route_id?: number;
  route_number: string;
  direction?: string;
  name?: string;
  start_index?: number;
  end_index?: number;
  etas: Record<string, unknown>;
  buses: SearchBusResult[];
}

export interface SearchBusResult {
  vehicle_id: number;
  plate_number: string;
  lat: number;
  lon: number;
  speed: number;
  route_id: number;
  assignment_id?: number;
  occupancy_level: number;
  eta_seconds?: number;
  eta_live_seconds?: number;
  eta_mode?: string;
  eta_ml_seconds?: number;
  eta_heuristic_seconds?: number;
  distance_m?: number;
  eta_to_start_stop?: number;
  eta_live_to_start_stop?: number;
  eta_to_end_stop?: number;
  eta_live_to_end_stop?: number;
  position_age_seconds?: number;
  cv_data?: {
    people_count: number;
    crowd_density: number;
    method: string;
    confidence: number;
  };
}

// === Favorites ===

export interface Favorite {
  id: number;
  user_id: number;
  route_id: number;
  nickname?: string;
}

export interface FavoriteCreate {
  user_id: number;
  route_id: number;
  nickname?: string;
}

// === Ratings ===

export interface Rating {
  id: number;
  user_id: number;
  assignment_id: number;
  score: number;
  comment?: string;
}

export interface RatingCreate {
  user_id: number;
  assignment_id: number;
  score: number;
  comment?: string;
}

// === Notifications ===

export interface NotificationSettingCreate {
  user_id: number;
  route_id: number;
  stop_id?: number;
  lead_time_minutes?: number;
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

// === App State ===

export type AppScreen =
  | "pairing"
  | "unlock"
  | "login"
  | "pre-ride"
  | "active-ride"
  | "post-ride";

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export type CrowdLevel = 0 | 1 | 2; // Low, Medium, High
