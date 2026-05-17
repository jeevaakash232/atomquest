// ─── POST /api/ai/risk-analysis ───────────────────────────────────────────────
import { NextRequest } from "next/server";
import { analyzeGoalRisk } from "@/lib/ai/anthropic";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goalTitle, progress, deadline, daysSinceUpdate, department } = body as {
      goalTitle: string;
      progress: number;
      deadline: string;
      daysSinceUpdate: number;
      department: string;
    };

    if (!goalTitle || progress === undefined || !deadline) {
      return Response.json({ error: "goalTitle, progress, and deadline are required" }, { status: 400 });
    }

    const result = await analyzeGoalRisk({
      goalTitle,
      progress,
      deadline,
      daysSinceUpdate: daysSinceUpdate ?? 0,
      department: department ?? "Engineering",
    });

    return Response.json({ success: true, analysis: result });
  } catch (err) {
    console.error("[/api/ai/risk-analysis]", err);
    return Response.json({ error: "Failed to analyze risk" }, { status: 500 });
  }
}
