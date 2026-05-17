// ─── GET /api/activity ────────────────────────────────────────────────────────
import { NextRequest } from "next/server";
import { getRecentActivity } from "@/lib/aws/dynamodb";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    const activities = await getRecentActivity(Math.min(limit, 50));
    return Response.json({ success: true, activities });
  } catch (err) {
    console.error("[GET /api/activity]", err);
    return Response.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}