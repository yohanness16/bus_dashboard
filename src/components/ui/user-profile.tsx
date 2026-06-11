"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, Settings, LogOut, Moon, Sun } from "lucide-react";

interface UserProfileProps {
  name: string;
  role?: string;
  darkMode?: boolean;
  onToggleDark?: () => void;
  onLogout?: () => void;
}

export function UserProfile({
  name,
  role = "Driver",
  darkMode = true,
  onToggleDark,
  onLogout,
}: UserProfileProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 cursor-pointer transition-all duration-200 rounded-xl px-2 py-1.5"
        style={{
          background: open ? "var(--surface-700)" : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = "var(--surface-700)";
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = "transparent";
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: "linear-gradient(135deg, var(--primary-500), var(--accent-300))",
            color: "#fff",
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <p
            className="text-xs font-semibold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {name}
          </p>
          <p
            className="text-[10px] leading-tight"
            style={{ color: "var(--text-muted)" }}
          >
            {role}
          </p>
        </div>
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform duration-200"
          style={{
            color: "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50 anim-scale-in"
          style={{
            background: "var(--surface-800)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {/* User Info */}
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {name}
            </p>
            <p
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              {role}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-all duration-150"
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
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-all duration-150"
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
              <Settings className="w-4 h-4" />
              Settings
            </button>
            {onToggleDark && (
              <button
                onClick={() => {
                  onToggleDark();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-all duration-150"
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
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
            )}
          </div>

          {/* Logout */}
          {onLogout && (
            <div className="py-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <button
                onClick={() => {
                  onLogout();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-all duration-150"
                style={{ color: "var(--danger)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--danger-dim)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
