"use client";
import { RouteStop } from "@/types";
import { Navigation } from "lucide-react";
import { cn, formatETA } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface RouteProgressProps {
  stops: RouteStop[];
  currentStopIndex: number;
  nextStopEta?: number;
  routeNumber?: string;
  routeName?: string;
}

export function RouteProgress({ stops, currentStopIndex, nextStopEta, routeNumber, routeName }: RouteProgressProps) {
  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-medium text-content-secondary">Route Progress</h3>
        </div>
        {routeNumber && (
          <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg font-mono">{routeNumber}</span>
        )}
      </div>

      {routeName && <p className="text-xs text-content-tertiary mb-4">{routeName}</p>}

      {nextStopEta !== undefined && nextStopEta > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-primary-50 border border-primary-100">
          <p className="text-[10px] text-primary-500 mb-0.5 uppercase tracking-wider font-medium">Next stop ETA</p>
          <p className="text-lg font-bold text-primary-700 font-mono">{formatETA(nextStopEta)}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-0">
        {stops.map((stop, index) => {
          const isPassed = index < currentStopIndex;
          const isCurrent = index === currentStopIndex;
          const isNext = index === currentStopIndex + 1;
          const isLast = index === stops.length - 1;

          return (
            <div key={stop.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn("w-3 h-3 rounded-full border-2 shrink-0 transition-colors", isPassed && "bg-success border-success", isCurrent && "bg-primary-500 border-primary-500 animate-pulse", isNext && "bg-gray-200 border-primary-300", !isPassed && !isCurrent && !isNext && "bg-gray-200 border-gray-300")} />
                {!isLast && <div className={cn("w-0.5 flex-1 min-h-[20px]", isPassed ? "bg-success/30" : "bg-gray-100")} />}
              </div>
              <div className={cn("pb-3 -mt-0.5", isPassed && "opacity-50", isCurrent && "opacity-100", !isPassed && !isCurrent && "opacity-70")}>
                <p className={cn("text-sm font-medium", isCurrent ? "text-gray-900" : "text-content-secondary")}>{stop.name}</p>
                {isCurrent && <p className="text-[10px] text-primary-600 mt-0.5 font-medium">Current stop</p>}
                {isNext && nextStopEta && <p className="text-[10px] text-content-tertiary mt-0.5">ETA {formatETA(nextStopEta)}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
