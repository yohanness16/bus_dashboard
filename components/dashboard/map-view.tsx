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

// Custom bus icon
function createBusIcon(): L.DivIcon {
  return L.divIcon({
    className: "custom-bus-marker",
    html: `
      <div class="relative">
        <div class="absolute -inset-4 bg-accent/20 rounded-full animate-ping-slow"></div>
        <div class="relative w-8 h-8 bg-accent rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H6c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
            <circle cx="7" cy="18" r="2"/>
            <circle cx="17" cy="18" r="2"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function createStopIcon(isTerminal: boolean, isPassed: boolean): L.DivIcon {
  const color = isTerminal
    ? "#DC2626"
    : isPassed
    ? "#10B981"
    : "#64748B";
  const size = isTerminal ? 12 : 8;

  return L.divIcon({
    className: "custom-stop-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function MapView({
  center,
  stops = [],
  vehiclePosition,
  routePolyline = [],
  height = "400px",
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark tile layer (CartoDB Dark Matter)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
      }
    ).addTo(mapRef.current);

    // Zoom control bottom-right
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(mapRef.current);

    // Attribution
    L.control
      .attribution({
        position: "bottomleft",
        prefix: false,
      })
      .addTo(mapRef.current);

    routeLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update vehicle position
  useEffect(() => {
    if (!mapRef.current || !vehiclePosition) return;

    const pos: [number, number] = [vehiclePosition.lat, vehiclePosition.lon];

    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setLatLng(pos);
    } else {
      vehicleMarkerRef.current = L.marker(pos, {
        icon: createBusIcon(),
        zIndexOffset: 1000,
      }).addTo(mapRef.current);
    }
  }, [vehiclePosition]);

  // Draw route and stops
  useEffect(() => {
    if (!mapRef.current || !routeLayerRef.current) return;

    routeLayerRef.current.clearLayers();

    // Route polyline
    if (routePolyline.length > 1) {
      L.polyline(routePolyline, {
        color: "#2563EB",
        weight: 4,
        opacity: 0.7,
        dashArray: "10, 6",
      }).addTo(routeLayerRef.current);
    }

    // Stop markers
    stops.forEach((stop) => {
      const marker = L.marker([stop.lat, stop.lon], {
        icon: createStopIcon(stop.is_terminal, false),
      });
      marker.bindTooltip(stop.name, {
        permanent: false,
        direction: "top",
        className: "dark-tooltip",
      });
      routeLayerRef.current!.addLayer(marker);
    });
  }, [stops, routePolyline]);

  // Fly to center on initial load
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center, 14);
  }, [center]);

  return (
    <div
      ref={containerRef}
      className="map-container w-full rounded-2xl overflow-hidden border border-border"
      style={{ height, minHeight: "300px" }}
    />
  );
}
