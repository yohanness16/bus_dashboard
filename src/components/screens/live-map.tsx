"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const busIcon = L.divIcon({
  className: "custom-bus-marker",
  html: `<div style="
    width: 32px; height: 32px;
    background: linear-gradient(135deg, #3B82F6, #2563EB);
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.25), 0 4px 16px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="2"/>
      <path d="M7 18v2M17 18v2M8 6v4M12 6v4M16 6v4"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -20],
});

function MapUpdater({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (position && !hasCentered.current) {
      map.setView(position, 15, { animate: true });
      hasCentered.current = true;
    } else if (position) {
      map.panTo(position, { animate: true, duration: 1.5 });
    }
  }, [position, map]);

  return null;
}

export default function LiveMap({
  position,
  plateNumber,
}: {
  position: [number, number] | null;
  plateNumber: string;
}) {
  return (
    <div style={{ height: "300px", width: "100%" }}>
      <MapContainer
        center={position || [9.0222, 38.7468]}
        zoom={position ? 15 : 11}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && (
          <>
            <Marker position={position} icon={busIcon}>
              <Popup>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    textAlign: "center",
                    padding: "2px 4px",
                  }}
                >
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      margin: 0,
                      color: "#0F172A",
                    }}
                  >
                    {plateNumber}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#64748B",
                      margin: "2px 0 0",
                    }}
                  >
                    {position[0].toFixed(5)}, {position[1].toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
            <MapUpdater position={position} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
