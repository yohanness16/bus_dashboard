"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

interface DashboardShellProps {
  children: React.ReactNode;
  driverName?: string;
  onLogout?: () => void;
  activeNav?: string;
}

export function DashboardShell({
  children,
  driverName,
  onLogout,
  activeNav = "dashboard",
}: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync dark mode class on mount
  useEffect(() => {
    setMounted(true);
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDark = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next);
        document.documentElement.classList.toggle("light", !next);
      }
      return next;
    });
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface-900)" }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeItem={activeNav}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="h-full"
            style={{ width: "var(--sidebar-width)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
              activeItem={activeNav}
            />
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav
          driverName={driverName}
          darkMode={darkMode}
          onToggleDark={toggleDark}
          onLogout={onLogout}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: "var(--surface-900)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
