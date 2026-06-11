import { RouteStop } from "@/types";
import { haversine } from "./haversine";

/**
 * Find the index of the nearest stop to the given GPS position.
 * Returns -1 if stops array is empty.
 */
export function findNearestStopIndex(
  lat: number,
  lon: number,
  stops: RouteStop[]
): number {
  if (stops.length === 0) return -1;

  let nearestIdx = 0;
  let nearestDist = Infinity;

  for (let i = 0; i < stops.length; i++) {
    const d = haversine(lat, lon, stops[i].lat, stops[i].lon);
    if (d < nearestDist) {
      nearestDist = d;
      nearestIdx = i;
    }
  }

  return nearestIdx;
}
