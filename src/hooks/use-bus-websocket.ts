"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { WSMessage } from "@/types";
import { getMobileWebSocketUrl } from "@/lib/ws-url";

interface UseBusWebSocketOptions {
  token: string | null;
  routeId?: number | null;
  onMessage?: (data: WSMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
}

export type WSConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export function useBusWebSocket({
  token,
  routeId,
  onMessage,
  onConnect,
  onDisconnect,
  reconnectInterval = 3000,
}: UseBusWebSocketOptions) {
  const [status, setStatus] = useState<WSConnectionStatus>("idle");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnect = useRef(true);
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const routeIdRef = useRef(routeId);

  onMessageRef.current = onMessage;
  onConnectRef.current = onConnect;
  onDisconnectRef.current = onDisconnect;
  routeIdRef.current = routeId;

  const sendMessage = useCallback((msg: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const connect = useCallback(() => {
    if (!token) return;

    const url = getMobileWebSocketUrl(token);
    setStatus("connecting");
    shouldReconnect.current = true;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      onConnectRef.current?.();
      // Subscribe to route if we have one
      if (routeIdRef.current) {
        ws.send(
          JSON.stringify({ type: "subscribe", route_id: routeIdRef.current })
        );
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WSMessage;
        // Auto-subscribe after connected if we missed it
        if (data.type === "connected" && routeIdRef.current) {
          ws.send(
            JSON.stringify({
              type: "subscribe",
              route_id: routeIdRef.current,
            })
          );
        }
        onMessageRef.current?.(data);
      } catch {
        // ignore malformed
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      onDisconnectRef.current?.();
      wsRef.current = null;

      if (shouldReconnect.current) {
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    };

    ws.onerror = () => {
      setStatus("error");
    };
  }, [token, reconnectInterval]);

  const disconnect = useCallback(() => {
    shouldReconnect.current = false;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus("idle");
  }, []);

  // Send ping periodically to keep alive
  useEffect(() => {
    if (status !== "connected") return;
    const interval = setInterval(() => {
      sendMessage({ type: "ping" });
    }, 25000);
    return () => clearInterval(interval);
  }, [status, sendMessage]);

  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }
    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return { status, connect, disconnect, sendMessage };
}
