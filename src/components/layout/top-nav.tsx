"use client";

import { Search, Bell, LogOut, Moon, Sun, Menu } from "lucide-react";

interface TopNavProps {
  driverName?: string;
  darkMode?: boolean;
  onToggleDark?: () => void;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

export function TopNav({
  driverName = "Driver",
  darkMode = false,
  onToggleDark,
  onLogout,
  onMenuClick,
}: TopNavProps) {
  return (
    <header
      className="flex items-center justify-between px-4 shrink-0 border-b bg-card"
      style={{ height: "var(--topnav-height)" }}
    >
      {/* Left */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search routes, stops..."
            className="w-full pl-9 pr-4 py-1.5 rounded-md text-sm bg-muted/50 border-0 outline-none text-foreground placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 shrink-0 ml-4">
        {/* Dark Mode */}
        <button
          onClick={onToggleDark}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        {/* Notifications */}
        <button
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer relative"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* Profile */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-foreground leading-tight">{driverName}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Driver</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
            {driverName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
