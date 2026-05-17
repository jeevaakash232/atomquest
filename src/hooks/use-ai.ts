"use client";

import { useState, useCallback } from "react";
import {
  generateSmartGoal,
  streamSmartGoal,
  generateProductivityInsight,
  generateExecutiveSummary,
  type SmartGoalResult,
} from "@/services/api";

// ─── useSmartGoal ─────────────────────────────────────────────────────────────

export function useSmartGoal() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartGoalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (params: {
      input: string;
      department: string;
      role: string;
      userId: string;
      existingGoals?: string[];
    }) => {
      setLoading(true);
      setResult(null);
      setError(null);
      try {
        const goal = await generateSmartGoal(params);
        setResult(goal);
        return goal;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to generate goal";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { generate, loading, result, error, reset };
}

// ─── useStreamingGoal ─────────────────────────────────────────────────────────

export function useStreamingGoal() {
  const [streaming, setStreaming] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (params: {
      input: string;
      department: string;
      role: string;
      userId: string;
    }) => {
      setStreaming(true);
      setText("");
      setError(null);
      try {
        let accumulated = "";
        for await (const chunk of streamSmartGoal(params)) {
          accumulated += chunk;
          setText(accumulated);
        }
        return accumulated;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to generate goal";
        setError(msg);
        return null;
      } finally {
        setStreaming(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setText("");
    setError(null);
  }, []);

  return { generate, streaming, text, error, reset };
}

// ─── useProductivityInsight ───────────────────────────────────────────────────

export function useProductivityInsight() {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<{
    summary: string;
    highlights: string[];
    suggestions: string[];
    score: number;
    trend: "improving" | "stable" | "declining";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (params: {
      userName: string;
      department: string;
      goalsCompleted: number;
      goalsActive: number;
      streak: number;
      weeklyScores: number[];
      topGoal?: string;
    }) => {
      setLoading(true);
      setInsight(null);
      setError(null);
      try {
        const result = await generateProductivityInsight(params);
        setInsight(result);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to generate insight";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { generate, loading, insight, error };
}

// ─── useExecutiveSummary ──────────────────────────────────────────────────────

export function useExecutiveSummary() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{
    headline: string;
    body: string;
    strengths: string[];
    watchItems: string[];
    opportunities: string[];
    forecast: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (params: {
      orgProductivity: number;
      departments: Array<{ name: string; productivity: number; riskLevel: string }>;
      totalGoalsCompleted: number;
      totalGoalsActive: number;
      aiAdoptionRate: number;
      period?: string;
    }) => {
      setLoading(true);
      setSummary(null);
      setError(null);
      try {
        const result = await generateExecutiveSummary(params);
        setSummary(result);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to generate summary";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { generate, loading, summary, error };
}
