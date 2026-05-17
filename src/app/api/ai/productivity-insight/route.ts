// ─── POST /api/ai/productivity-insight ────────────────────────────────────────
import { NextRequest } from "next/server";
import { generateProductivityInsight } from "@/lib/ai/anthropic";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userName,
      department,
      goalsCompleted,
      goalsActive,
      streak,
      weeklyScores,
      topGoal,
    } = body as {
      userName: string;
      department: string;
      goalsCompleted: number;
      goalsActive: number;
      streak: number;
      weeklyScores: number[];
      topGoal?: string;
    };

    if (!userName || !department) {
      return Response.json({ error: "userName and department are required" }, { status: 400 });
    }

    const result = await generateProductivityInsight({
      userName,
      department,
      goalsCompleted: goalsCompleted ?? 0,
      goalsActive: goalsActive ?? 0,
      streak: streak ?? 0,
      weeklyScores: weeklyScores ?? [],
      topGoal,
    });

    return Response.json({ success: true, insight: result });
  } catch (err) {
    console.error("[/api/ai/productivity-insight]", err);
    return Response.json({ error: "Failed to generate insight" }, { status: 500 });
  }
}