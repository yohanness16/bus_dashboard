"use client";

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  circle?: boolean;
}

export function Skeleton({
  className = "",
  width,
  height = "16px",
  circle = false,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || "100%",
        height,
        borderRadius: circle ? "50%" : undefined,
      }}
    />
  );
}

interface SkeletonGroupProps {
  count?: number;
  className?: string;
}

export function SkeletonGroup({ count = 3, className = "" }: SkeletonGroupProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} width={`${Math.random() * 40 + 60}%`} height="14px" />
      ))}
    </div>
  );
}
