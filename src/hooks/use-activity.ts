"use client";

import { useState, useEffect, useCallback } from "react";
import { getRecentActivity, type Activity } from "@/services/api";
import { activityFeed as mockFeed } from "@/mock/data";

export function useActivity(limit = 20) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRecentActivity(limit);
      setActivities(data);
    } catch {
      // Fall back to mock data
      setActivities(
        mockFeed.slice(0, limit).map((a) => ({
          activityId: a.id,
          userId: "usr_1",
          userName: a.user,
          userAvatar: a.avatar,
          action: a.action,
          target: a.target,
          type: a.type,
          createdAt: new Date().toISOString(),
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { activities, loading, refetch: fetch };
}
