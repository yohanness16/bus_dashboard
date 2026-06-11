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
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { AppScreen } from "@/types";

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
      icon: Map,
      label: "Active Ride",
      href: "/dashboard/ride",
      active: pathname === "/dashboard/ride",
      visible: screen === "active-ride",
    },
    {
      icon: BarChart3,
      label: "Trip Summary",
      href: "/dashboard/post-ride",
      active: pathname === "/dashboard/post-ride",
      visible: screen === ("post-ride" as AppScreen),
    },
  ];

  return (
    <aside
      className={cn(
        "h-dvh bg-white border-r border-stroke flex flex-col transition-all duration-300 sticky top-0 z-20",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-stroke">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shrink-0 shadow-sm shadow-primary-600/20">
            <Bus className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-base font-bold text-gray-900 tracking-tight whitespace-nowrap">
                Bus<span className="text-primary-600">Track</span>
              </h1>
              {vehiclePlate && (
                <p className="text-[10px] text-content-tertiary font-mono">{vehiclePlate}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Route badge */}
      {routeNumber && !collapsed && (
        <div className="px-4 pt-4">
          <div className="px-3 py-2 rounded-lg bg-primary-50 border border-primary-100">
            <p className="text-[10px] text-primary-500 font-medium uppercase tracking-wider">Route</p>
            <p className="text-sm font-bold text-primary-700 font-mono">{routeNumber}</p>
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
                  ? "bg-primary-50 text-primary-700 border border-primary-100"
                  : "text-content-secondary hover:bg-gray-50 hover:text-content"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </a>
          ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-4 border-t border-stroke">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-content-secondary hover:bg-gray-50 hover:text-content w-full transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5 shrink-0" /> : (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-stroke">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
