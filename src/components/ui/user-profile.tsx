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
  darkMode = false,
  onToggleDark,
  onLogout,
}: UserProfileProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-medium text-foreground leading-tight">{name}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">{role}</p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border bg-card shadow-lg z-50 animate-scale-in overflow-hidden">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium text-card-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
          <div className="py-1">
            {[
              { icon: User, label: "Profile" },
              { icon: Settings, label: "Settings" },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            {onToggleDark && (
              <button
                onClick={() => { onToggleDark(); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
            )}
          </div>
          {onLogout && (
            <div className="py-1 border-t">
              <button
                onClick={() => { onLogout(); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
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
