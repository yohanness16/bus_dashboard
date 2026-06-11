"use client";

import { RouteStop } from "@/types";
import { MapPin, Navigation, CircleDot, Flag } from "lucide-react";
import { cn, formatETA } from "@/lib/utils";

interface RouteProgressProps {
  stops: RouteStop[];
  currentStopIndex: number;
  nextStopEta?: number; // seconds
  routeNumber?: string;
  routeName?: string;
}

export function RouteProgress({
  stops,
  currentStopIndex,
  nextStopEta,
  routeNumber,
  routeName,
}: RouteProgressProps) {
  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-accent" />
          <h3 className="text-sm font-medium text-text-secondary">
            Route Progress
          </h3>
        </div>
        {routeNumber && (
          <span className="text-xs font-mono font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
            {routeNumber}
          </span>
        )}
      </div>

      {routeName && (
        <p className="text-xs text-text-muted mb-4">{routeName}</p>
      )}

      {/* Next stop ETA */}
      {nextStopEta !== undefined && nextStopEta > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-accent/5 border border-accent/10">
          <p className="text-xs text-text-muted mb-1">Next stop ETA</p>
          <p className="text-lg font-mono font-bold text-accent">
            {formatETA(nextStopEta)}
          </p>
        </div>
      )}

      {/* Stops list */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-0">
        {stops.map((stop, index) => {
          const isPassed = index < currentStopIndex;
          const isCurrent = index === currentStopIndex;
          const isNext = index === currentStopIndex + 1;
          const isLast = index === stops.length - 1;

          return (
            <div key={stop.id} className="flex gap-3">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full border-2 shrink-0 transition-colors",
                    isPassed && "bg-success border-success",
                    isCurrent && "bg-accent border-accent animate-pulse",
                    isNext && "bg-bg-elevated border-accent/50",
                    !isPassed && !isCurrent && !isNext && "bg-bg-elevated border-text-muted/30"
                  )}
                />
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[24px]",
                      isPassed ? "bg-success/40" : "bg-bg-elevated"
                    )}
                  />
                )}
              </div>

              {/* Stop info */}
              <div
                className={cn(
                  "pb-4 -mt-0.5",
                  isPassed && "opacity-50",
                  isCurrent && "opacity-100",
                  !isPassed && !isCurrent && "opacity-70"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCurrent ? "text-text-primary" : "text-text-secondary"
                  )}
                >
                  {stop.name}
                </p>
                {isCurrent && (
                  <p className="text-xs text-accent mt-0.5">Current stop</p>
                )}
                {isNext && nextStopEta && (
                  <p className="text-xs text-text-muted mt-0.5">
                    ETA {formatETA(nextStopEta)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
