// ─── GET /api/analytics ───────────────────────────────────────────────────────
// Tries AWS Lambda first; falls back to computed mock data if Lambda unavailable.
import { NextRequest } from "next/server";
import { invokeAnalyticsLambda, type AnalyticsPayload } from "@/lib/aws/lambda";
import {
  departments, users, goals, weeklyProductivity,
  goalCompletionTrend, tokenUsage, aiInsights,
} from "@/mock/data";

export const runtime = "nodejs";

// ─── Fallback analytics computed from mock data ───────────────────────────────
function getFallbackData(action: AnalyticsPayload["action"], params: Record<string, string | null>) {
  switch (action) {
    case "GET_ORG_SUMMARY": {
      const avgProductivity = Math.round(
        departments.reduce((a, d) => a + d.avgProductivity, 0) / departments.length
      );
      const totalGoalsCompleted = departments.reduce((a, d) => a + d.goalsCompleted, 0);
      const totalGoalsActive = departments.reduce((a, d) => a + d.goalsActive, 0);
      const aiActivityCount = aiInsights.length;
      return {
        orgProductivity: avgProductivity,
        totalGoalsCompleted,
        totalGoalsActive,
        aiAdoptionRate: Math.round((departments.filter(d => d.riskLevel === "HEALTHY").length / departments.length) * 100),
        totalUsers: users.length,
        insightCount: (aiActivityCount * 240).toLocaleString(),
        predictionAccuracy: `${Math.round(aiInsights.reduce((a, i) => a + i.confidence, 0) / aiInsights.length)}%`,
      };
    }
    case "GET_DEPT_ANALYTICS": {
      return departments.map((d) => ({
        id: d.id,
        name: d.name,
        productivity: d.avgProductivity,
        headCount: d.headCount,
        goalsCompleted: d.goalsCompleted,
        goalsActive: d.goalsActive,
        riskLevel: d.riskLevel,
      }));
    }
    case "GET_USER_PRODUCTIVITY": {
      const userId = params.userId;
      const userGoals = goals.filter((g) => g.userId === userId);
      const avgProgress = userGoals.length
        ? Math.round(userGoals.reduce((a, g) => a + g.progress, 0) / userGoals.length)
        : 0;
      return {
        avgProgress,
        goalsCompleted: userGoals.filter((g) => g.status === "LOCKED").length,
        goalsActive: userGoals.length,
        weeklyProductivity: weeklyProductivity.slice(0, 7),
        promptHistory: [
          { id: "ph_1", prompt: "Improve our software testing process", result: "SMART goal generated", time: "10:30 AM", tokens: 1240, confidence: 94 },
          { id: "ph_2", prompt: "Risk analysis for Engineering team",   result: "Risk report generated", time: "09:15 AM", tokens: 890,  confidence: 89 },
          { id: "ph_3", prompt: "Weekly productivity summary",          result: "Summary generated",    time: "08:00 AM", tokens: 2100, confidence: 97 },
        ],
        insightCount: (aiInsights.length * 240).toLocaleString(),
        predictionAccuracy: `${Math.round(aiInsights.reduce((a, i) => a + i.confidence, 0) / aiInsights.length)}%`,
      };
    }
    case "GET_GOAL_TRENDS": {
      return {
        completionTrend: goalCompletionTrend,
        weeklyProductivity,
        tokenUsage,
      };
    }
    default:
      return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") as AnalyticsPayload["action"];
  const userId = searchParams.get("userId");
  const departmentId = searchParams.get("departmentId");

  if (!action) {
    return Response.json({ error: "action parameter is required" }, { status: 400 });
  }

  // Try Lambda first
  try {
    const payload: AnalyticsPayload = {
      action,
      params: { userId, departmentId, period: searchParams.get("period") ?? "30d" },
    };
    const result = await invokeAnalyticsLambda(payload);
    return Response.json({ success: true, data: result });
  } catch {
    // Lambda not available — use computed fallback
    const fallback = getFallbackData(action, { userId, departmentId });
    return Response.json({ success: true, data: fallback, source: "fallback" });
  }
}
