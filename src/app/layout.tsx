import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastProvider } from "@/components/shared/toast-stack";

export const metadata: Metadata = {
  title: "BusTrack — Bus Dashboard",
  description: "BusTrack Bus Dashboard — Driver shift management and real-time ride tracking",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground font-sans">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
