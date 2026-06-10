const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getMobileWebSocketUrl(token: string): string {
  const wsBase = API_URL.replace(/^http/, "ws");
  return `${wsBase}/api/v1/ws/mobile?token=${encodeURIComponent(token)}`;
}
