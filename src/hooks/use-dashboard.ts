"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "./use-session";

export type DashboardData = {
  role: string;
  user?: any;
  kpis: Record<string, any>;
  goals?: any[];
  weeklyProgress?: any[];
  aiInsights?: any[];
  notifications?: any[];
  activityFeed?: any[];
  charts?: Record<string, any>;
  // Manager specific
  pendingApprovals?: any[];
  memberPerformance?: any[];
  escalationAlerts?: any[];
  approvalStats?: any;
  deptHeatmap?: any[];
  teamInsights?: any[];
  // Admin specific
  users?: any[];
  roleDistribution?: any[];
  departmentAnalytics?: any[];
  securityEvents?: any[];
  auditLogs?: any[];
  orgKPIs?: any[];
  systemHealth?: any;
  platformMetrics?: any;
  // Executive specific
  departmentComparison?: any[];
  strategicRisks?: any[];
  forecasting?: any[];
  executiveKPIs?: any[];
  executiveInsights?: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useDashboard(): DashboardData {
  const { user: sessionUser, loading: sessionLoading } = useSession();
  const [data, setData] = useState<Omit<DashboardData, "loading" | "error" | "refetch">>({ role: "", kpis: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (sessionLoading) return;
    if (!sessionUser) { setLoading(false); return; }

    setLoading(true);
    setError(null);
    try {
      // Use the unified /api/dashboard endpoint — auto-routes by role
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const json = await res.json();
      const { success, ...rest } = json;
      setData(rest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [sessionUser, sessionLoading]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  return { ...data, loading, error, refetch: fetchDashboard };
}
