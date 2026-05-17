// ─── POST /api/ai/executive-summary ───────────────────────────────────────────
import { NextRequest } from "next/server";
import { generateExecutiveSummary } from "@/lib/ai/anthropic";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orgProductivity,
      departments,
      totalGoalsCompleted,
      totalGoalsActive,
      aiAdoptionRate,
      period = "Q2 2026",
    } = body as {
      orgProductivity: number;
      departments: Array<{ name: string; productivity: number; riskLevel: string }>;
      totalGoalsCompleted: number;
      totalGoalsActive: number;
      aiAdoptionRate: number;
      period: string;
    };

    if (!departments || !Array.isArray(departments)) {
      return Response.json({ error: "departments array is required" }, { status: 400 });
    }

    const result = await generateExecutiveSummary({
      orgProductivity: orgProductivity ?? 87,
      departments,
      totalGoalsCompleted: totalGoalsCompleted ?? 0,
      totalGoalsActive: totalGoalsActive ?? 0,
      aiAdoptionRate: aiAdoptionRate ?? 64,
      period,
    });

    return Response.json({ success: true, summary: result });
  } catch (err) {
    console.error("[/api/ai/executive-summary]", err);
    return Response.json({ error: "Failed to generate executive summary" }, { status: 500 });
  }
}