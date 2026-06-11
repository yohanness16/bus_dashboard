"use client";

import {
  Bus,
  LayoutDashboard,
  Map,
  Route,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeItem?: string;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "live-map", label: "Live Map", icon: Map },
  { id: "routes", label: "Routes", icon: Route },
  { id: "history", label: "Trip History", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ collapsed, onToggle, activeItem = "dashboard" }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-full shrink-0 transition-all duration-300 ease-out"
      style={{
        width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
        background: "var(--surface-850)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{ height: "var(--topnav-height)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(59,130,246,0.15)" }}
        >
          <Bus className="w-5 h-5" style={{ color: "var(--primary-400)" }} />
        </div>
        {!collapsed && (
          <span
            className="text-base font-bold tracking-tight whitespace-nowrap"
            style={{ color: "var(--text-primary)" }}
          >
            Bus<span style={{ color: "var(--primary-400)" }}>Track</span>
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 rounded-xl cursor-pointer transition-all duration-200 group"
              style={{
                padding: collapsed ? "10px 0" : "10px 14px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive ? "rgba(59,130,246,0.12)" : "transparent",
                color: isActive ? "var(--primary-400)" : "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--surface-700)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <span className="text-[13px] font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-4 shrink-0" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl cursor-pointer transition-all duration-200"
          style={{
            color: "var(--text-muted)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-700)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
