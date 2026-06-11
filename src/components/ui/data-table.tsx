"use client";

import type { ReactNode } from "react";

interface Column<T> {
  header: string;
  key: keyof T | string;
  render?: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  loading?: boolean;
  skeletonRows?: number;
}

export function DataTable<T extends { id?: number | string }>({
  columns,
  data,
  emptyMessage = "No data available",
  loading = false,
  skeletonRows = 5,
}: DataTableProps<T>) {
  const alignMap = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  if (loading) {
    return (
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--surface-700)" }}>
                {columns.map((col, i) => (
                  <th
                    key={String(col.key) + i}
                    className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-tertiary)", textAlign: col.align || "left" }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                <tr
                  key={rowIdx}
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    background: rowIdx % 2 === 0 ? "transparent" : "rgba(30,41,59,0.3)",
                  }}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-4 py-3"
                      style={{ textAlign: col.align || "left" }}
                    >
                      <div className="skeleton h-4 w-20 rounded-md" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className="surface-card p-12 text-center"
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface-700)" }}>
              {columns.map((col, i) => (
                <th
                  key={String(col.key) + i}
                  className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider ${alignMap[col.align || "left"]}`}
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={(row as { id?: number | string }).id ?? rowIdx}
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  background: rowIdx % 2 === 0 ? "transparent" : "rgba(30,41,59,0.3)",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-700)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    rowIdx % 2 === 0 ? "transparent" : "rgba(30,41,59,0.3)";
                }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-4 py-3 ${alignMap[col.align || "left"]}`}
                    style={{ color: "var(--text-primary)" }}
                  >
                    {col.render
                      ? col.render(row)
                      : String(
                          (row as Record<string, unknown>)[String(col.key)] ?? "—"
                        )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
