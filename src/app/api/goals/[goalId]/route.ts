// ─── Individual Goal API Routes ───────────────────────────────────────────────
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import {
  getGoal,
  updateGoalProgress,
  updateGoalStatus,
  putActivity,
  type GoalRecord,
} from "@/lib/aws/dynamodb";

export const runtime = "nodejs";

// PATCH /api/goals/[goalId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  try {
    const { goalId } = await params;
    const body = await req.json();
    const { userId, progress, status } = body as {
      userId: string;
      progress?: number;
      status?: GoalRecord["status"];
    };

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    // Verify goal exists
    const goal = await getGoal(userId, goalId);
    if (!goal) {
      return Response.json({ error: "Goal not found" }, { status: 404 });
    }

    // Update progress
    if (progress !== undefined) {
      await updateGoalProgress(userId, goalId, progress);
      
      // Log activity
      await putActivity({
        activityId: randomUUID(),
        userId,
        userName: "User",
        userAvatar: "U",
        action: `updated progress to ${progress}%`,
        target: goal.title,
        type: "progress",
        createdAt: new Date().toISOString(),
      });
    }

    // Update status
    if (status) {
      await updateGoalStatus(userId, goalId, status);
      
      // Log activity
      await putActivity({
        activityId: randomUUID(),
        userId,
        userName: "User",
        userAvatar: "U",
        action: `changed status to ${status}`,
        target: goal.title,
        type: "goal",
        createdAt: new Date().toISOString(),
      });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/goals/[goalId]]", err);
    return Response.json({ error: "Failed to update goal" }, { status: 500 });
  }
}