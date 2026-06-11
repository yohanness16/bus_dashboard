"use client";

import { useAuth } from "@/providers/auth-provider";
import { usePathname } from "next/navigation";
import {
  Bus,
  LayoutDashboard,
  Route,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  vehiclePlate?: string;
  routeNumber?: string;
}

export function Sidebar({ vehiclePlate, routeNumber }: SidebarProps) {
  const { screen, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      icon: Route,
      label: "Active Ride",
      href: "/dashboard/ride",
      active: pathname === "/dashboard/ride",
      visible: screen === "active-ride" || screen === "pre-ride",
    },
    {
      icon: BarChart3,
      label: "Trip Summary",
      href: "/dashboard/post-ride",
      active: pathname === "/dashboard/post-ride",
      visible: screen === "post-ride",
    },
  ];

  return (
    <aside
      className={cn(
        "h-dvh bg-bg-surface border-r border-border flex flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <Bus className="w-5 h-5 text-accent" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-base font-bold text-text-primary tracking-tight whitespace-nowrap">
                BusTrack
              </h1>
              {vehiclePlate && (
                <p className="text-xs text-text-muted font-mono">
                  {vehiclePlate}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Route badge */}
      {routeNumber && !collapsed && (
        <div className="px-4 pt-4">
          <div className="px-3 py-2 rounded-lg bg-accent/5 border border-accent/10">
            <p className="text-xs text-text-muted">Current Route</p>
            <p className="text-sm font-mono font-bold text-accent">
              {routeNumber}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems
          .filter((item) => item.visible !== false)
          .map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                item.active
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </a>
          ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-elevated hover:text-text-primary w-full transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
