"use client";

import { Search, X } from "lucide-react";

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: "var(--text-muted)" }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
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
      {value && (
        <button
          onClick={() => onChange?.("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded cursor-pointer"
          style={{ color: "var(--text-muted)" }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
