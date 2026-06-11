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
  darkMode = true,
  onToggleDark,
  onLogout,
  onMenuClick,
}: TopNavProps) {
  return (
    <header
      className="flex items-center justify-between px-4 shrink-0"
      style={{
        height: "var(--topnav-height)",
        background: "var(--surface-850)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg cursor-pointer transition-all duration-200 lg:hidden"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-700)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div
          className="relative flex-1 max-w-md"
        >
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search routes, stops..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none transition-all duration-200"
            style={{
              background: "var(--surface-800)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = "1px solid var(--primary-500)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = "1px solid var(--border-subtle)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* Right: Actions + Profile */}
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg cursor-pointer transition-all duration-200"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-700)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg cursor-pointer transition-all duration-200 relative"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-700)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <Bell className="w-[18px] h-[18px]" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "var(--danger)" }}
          />
        </button>

        {/* Divider */}
        <div
          className="w-px h-6 mx-1"
          style={{ background: "var(--border-subtle)" }}
        />

        {/* Profile */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p
              className="text-xs font-semibold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {driverName}
            </p>
            <p
              className="text-[10px] leading-tight"
              style={{ color: "var(--text-muted)" }}
            >
              Driver
            </p>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, var(--primary-500), var(--accent-300))",
              color: "#fff",
            }}
          >
            {driverName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200"
            style={{
              background: "var(--danger-dim)",
              border: "1px solid var(--danger-border)",
              color: "var(--danger)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--danger)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--danger-dim)";
              e.currentTarget.style.color = "var(--danger)";
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
