"use client";

import {
  Bus,
  LayoutDashboard,
  Map,
  Route,
  History,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Zap,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeItem?: string;
}

const mainNav = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "live-map", label: "Live Map", icon: Map },
  { id: "routes", label: "Routes", icon: Route },
  { id: "history", label: "Trip History", icon: History },
];

const bottomNav = [
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ collapsed, onToggle, activeItem = "dashboard" }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-full shrink-0 border-r bg-card transition-all duration-200 ease-out"
      style={{ width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-4 shrink-0 border-b"
        style={{ height: "var(--topnav-height)" }}
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Bus className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
            Bus<span className="text-primary">Track</span>
          </span>
        )}
      </div>

      {/* Toggle */}
      <div className="px-3 py-2 shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer text-xs"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4 mx-auto" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Main
          </p>
        )}
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              className="w-full flex items-center gap-2.5 rounded-md cursor-pointer transition-colors text-sm"
              style={{
                padding: collapsed ? "9px 0" : "9px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive ? "hsl(var(--accent))" : "transparent",
                color: isActive ? "hsl(var(--accent-foreground))" : "hsl(var(--muted-foreground))",
                fontWeight: isActive ? 500 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "hsl(var(--accent))";
                  e.currentTarget.style.color = "hsl(var(--accent-foreground))";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "hsl(var(--muted-foreground))";
                }
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="px-3 py-2 border-t space-y-1 shrink-0">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="w-full flex items-center gap-2.5 rounded-md cursor-pointer transition-colors text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
              style={{
                padding: collapsed ? "9px 0" : "9px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Status */}
      {!collapsed && (
        <div className="px-3 py-3 border-t shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-muted/50">
            <Zap className="w-3.5 h-3.5 text-success" />
            <span className="text-[11px] text-muted-foreground">System Online</span>
          </div>
        </div>
      )}
    </aside>
  );
}
