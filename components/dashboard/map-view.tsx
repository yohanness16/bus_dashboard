"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import { RouteStop, VehiclePosition } from "@/types";

interface MapViewProps {
  center: [number, number];
  stops?: RouteStop[];
  vehiclePosition?: VehiclePosition | null;
  routePolyline?: [number, number][];
  height?: string;
}

function createBusIcon(): L.DivIcon {
  return L.divIcon({
    className: "custom-bus-marker",
    html: `
      <div class="relative">
        <div class="absolute -inset-3 bg-primary-500/20 rounded-full animate-ping-slow"></div>
        <div class="relative w-8 h-8 bg-primary-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H6c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
            <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function createStopIcon(isTerminal: boolean, isPassed: boolean): L.DivIcon {
  const color = isTerminal ? "#EF4444" : isPassed ? "#10B981" : "#94A3B8";
  const size = isTerminal ? 10 : 7;
  return L.divIcon({
    className: "custom-stop-marker",
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function MapView({ center, stops = [], vehiclePosition, routePolyline = [], height = "400px" }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current, { center, zoom: 14, zoomControl: false, attributionControl: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { maxZoom: 19, subdomains: "abcd" }).addTo(mapRef.current);
    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
    L.control.attribution({ position: "bottomleft", prefix: false }).addTo(mapRef.current);
    routeLayerRef.current = L.layerGroup().addTo(mapRef.current);
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !vehiclePosition) return;
    const pos: [number, number] = [vehiclePosition.lat, vehiclePosition.lon];
    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setLatLng(pos);
    } else {
      vehicleMarkerRef.current = L.marker(pos, { icon: createBusIcon(), zIndexOffset: 1000 }).addTo(mapRef.current);
    }
  }, [vehiclePosition]);

  useEffect(() => {
    if (!mapRef.current || !routeLayerRef.current) return;
    routeLayerRef.current.clearLayers();
    if (routePolyline.length > 1) {
      L.polyline(routePolyline, { color: "#3B82F6", weight: 4, opacity: 0.7, dashArray: "8, 5" }).addTo(routeLayerRef.current);
    }
    stops.forEach((stop) => {
      const marker = L.marker([stop.lat, stop.lon], { icon: createStopIcon(stop.is_terminal, false) });
      marker.bindTooltip(stop.name, { permanent: false, direction: "top" });
      routeLayerRef.current!.addLayer(marker);
    });
  }, [stops, routePolyline]);

  useEffect(() => {
    if (mapRef.current) mapRef.current.setView(center, 14);
  }, [center]);

  return <div ref={containerRef} className="map-container w-full rounded-2xl overflow-hidden border border-stroke" style={{ height, minHeight: "300px" }} />;
}
