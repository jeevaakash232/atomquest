"use client";

import { useEffect, useState } from "react";

/**
 * Prevents Recharts from rendering during SSR (which causes -1 dimension warnings).
 * Renders children only after the component mounts on the client.
 */
export function ChartWrapper({
  children,
  height = 200,
  className,
}: {
  children: React.ReactNode;
  height?: number;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className={`flex items-center justify-center ${className ?? ""}`}
      >
        <div className="h-1 w-16 bg-muted rounded-full animate-pulse" />
      </div>
    );
  }

  return <div style={{ height }} className={className}>{children}</div>;
}
