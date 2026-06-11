"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { screen, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for session to be loaded from localStorage
    if (!session) return;

    switch (screen) {
      case "pairing":
        router.replace("/pairing");
        break;
      case "unlock":
        router.replace("/unlock");
        break;
      case "login":
        router.replace("/login");
        break;
      case "pre-ride":
        router.replace("/dashboard");
        break;
      case "active-ride":
        router.replace("/dashboard/ride");
        break;
      case "post-ride":
        router.replace("/dashboard/post-ride");
        break;
      default:
        router.replace("/pairing");
    }
  }, [screen, session, router]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-text-secondary text-sm">Loading BusTrack...</p>
      </div>
    </div>
  );
}
