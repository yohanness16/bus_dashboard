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
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDark = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
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
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="fixed inset-y-0 left-0 z-50 lg:hidden"
            style={{ width: "var(--sidebar-width)" }}
          >
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
              activeItem={activeNav}
            />
          </div>
        </>
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
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
