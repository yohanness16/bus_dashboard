"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface GeoPosition {
  lat: number;
  lon: number;
  speed: number | null;
  heading: number | null;
  accuracy: number;
  timestamp: number;
}

export interface GeoError {
  code: number;
  message: string;
}

export function useGeolocation(enableHighAccuracy = true) {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<GeoError | null>(null);
  const [loading, setLoading] = useState(true);
  const watchIdRef = useRef<number | null>(null);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setPosition({
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    });
    setError(null);
    setLoading(false);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    setError({
      code: err.code,
      message: err.message,
    });
    setLoading(false);
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: "Geolocation is not supported by this browser",
      });
      setLoading(false);
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [handleSuccess, handleError, enableHighAccuracy]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    startWatching();
    return () => stopWatching();
  }, [startWatching, stopWatching]);

  return {
    position,
    error,
    loading,
    startWatching,
    stopWatching,
  };
}
