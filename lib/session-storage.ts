import { SessionData } from "@/types";

const KEYS = {
  bd_bus_token: "bd_bus_token",
  bd_vehicle_id: "bd_vehicle_id",
  bd_device_id: "bd_device_id",
  bd_plate: "bd_plate",
  driver_token: "driver_token",
  driver_session_id: "driver_session_id",
  driver_id: "driver_id",
  driver_username: "driver_username",
  vehicle_id: "vehicle_id",
  route_id: "route_id",
};

export function getSession(): SessionData {
  if (typeof window === "undefined") return {};
  return {
    bd_bus_token: localStorage.getItem(KEYS.bd_bus_token) || undefined,
    bd_vehicle_id: localStorage.getItem(KEYS.bd_vehicle_id)
      ? Number(localStorage.getItem(KEYS.bd_vehicle_id))
      : undefined,
    bd_device_id: localStorage.getItem(KEYS.bd_device_id) || undefined,
    bd_plate: localStorage.getItem(KEYS.bd_plate) || undefined,
    driver_token: localStorage.getItem(KEYS.driver_token) || undefined,
    driver_session_id: localStorage.getItem(KEYS.driver_session_id)
      ? Number(localStorage.getItem(KEYS.driver_session_id))
      : undefined,
    driver_id: localStorage.getItem(KEYS.driver_id)
      ? Number(localStorage.getItem(KEYS.driver_id))
      : undefined,
    driver_username: localStorage.getItem(KEYS.driver_username) || undefined,
    vehicle_id: localStorage.getItem(KEYS.vehicle_id)
      ? Number(localStorage.getItem(KEYS.vehicle_id))
      : undefined,
    route_id: localStorage.getItem(KEYS.route_id)
      ? Number(localStorage.getItem(KEYS.route_id))
      : undefined,
  };
}

export function setBusSession(data: {
  bus_token: string;
  vehicle_id: number;
  device_id: string;
  plate_number: string;
}) {
  localStorage.setItem(KEYS.bd_bus_token, data.bus_token);
  localStorage.setItem(KEYS.bd_vehicle_id, String(data.vehicle_id));
  localStorage.setItem(KEYS.bd_device_id, data.device_id);
  localStorage.setItem(KEYS.bd_plate, data.plate_number);
}

export function setDriverSession(data: {
  driver_token: string;
  session_id: number;
  driver_id: number;
  username: string;
  vehicle_id: number;
}) {
  localStorage.setItem(KEYS.driver_token, data.driver_token);
  localStorage.setItem(KEYS.driver_session_id, String(data.session_id));
  localStorage.setItem(KEYS.driver_id, String(data.driver_id));
  localStorage.setItem(KEYS.driver_username, data.username);
  localStorage.setItem(KEYS.vehicle_id, String(data.vehicle_id));
}

export function setRouteId(route_id: number) {
  localStorage.setItem(KEYS.route_id, String(route_id));
}

export function clearSession() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
