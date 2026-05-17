"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUserGoals,
  createGoal,
  updateGoalProgress,
  updateGoalStatus,
  type Goal,
} from "@/services/api";
import { goals as mockGoals } from "@/mock/data";

export function useGoals(userId: string) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserGoals(userId);
      // If DynamoDB returns empty, fall back to mock so the UI is never blank
      if (data.length === 0) {
        throw new Error("empty");
      }
      setGoals(data);
    } catch {
      // Fall back to mock data when AWS is not configured or table is empty
      const fallback = mockGoals
        .filter((g) => g.userId === userId)
        .map((g) => ({
          ...g,
          goalId: g.id,
          description: g.description ?? "",
          aiGenerated: false,
          evidenceKeys: [],
          updatedAt: g.createdAt,
        })) as unknown as Goal[];
      setGoals(fallback);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = useCallback(
    async (params: {
      title: string;
      description: string;
      priority?: Goal["priority"];
      deadline: string;
      kpis?: string[];
      xpReward?: number;
      aiGenerated?: boolean;
    }) => {
      const goal = await createGoal({ ...params, userId });
      setGoals((prev) => [goal, ...prev]);
      return goal;
    },
    [userId]
  );

  const updateProgress = useCallback(
    async (goalId: string, progress: number) => {
      await updateGoalProgress({ goalId, userId, progress });
      setGoals((prev) =>
        prev.map((g) => (g.goalId === goalId ? { ...g, progress } : g))
      );
    },
    [userId]
  );

  const updateStatus = useCallback(
    async (goalId: string, status: Goal["status"]) => {
      await updateGoalStatus({ goalId, userId, status });
      setGoals((prev) =>
        prev.map((g) => (g.goalId === goalId ? { ...g, status } : g))
      );
    },
    [userId]
  );

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
    addGoal,
    updateProgress,
    updateStatus,
  };
}
