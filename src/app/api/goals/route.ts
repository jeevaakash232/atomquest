// ─── Goals API Routes ─────────────────────────────────────────────────────────
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import {
  putGoal,
  getUserGoals,
  updateGoalProgress,
  updateGoalStatus,
  putActivity,
  type GoalRecord,
} from "@/lib/aws/dynamodb";

export const runtime = "nodejs";

// GET /api/goals?userId=usr_1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const goals = await getUserGoals(userId);
    return Response.json({ success: true, goals });
  } catch (err) {
    console.error("[GET /api/goals]", err);
    return Response.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

// POST /api/goals
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      title,
      description,
      priority = "MEDIUM",
      deadline,
      kpis = [],
      xpReward = 300,
      aiGenerated = false,
    } = body as {
      userId: string;
      title: string;
      description: string;
      priority: GoalRecord["priority"];
      deadline: string;
      kpis: string[];
      xpReward: number;
      aiGenerated: boolean;
    };

    if (!userId || !title || !deadline) {
      return Response.json({ error: "userId, title, and deadline are required" }, { status: 400 });
    }

    const goalId = randomUUID();
    const now = new Date().toISOString();

    const goal: GoalRecord = {
      PK: `USER#${userId}`,
      SK: `GOAL#${goalId}`,
      goalId,
      userId,
      title,
      description: description ?? "",
      status: "DRAFT",
      priority,
      progress: 0,
      deadline,
      kpis,
      xpReward,
      aiGenerated,
      evidenceKeys: [],
      createdAt: now,
      updatedAt: now,
      GSI1PK: "STATUS#DRAFT",
      GSI1SK: `CREATED#${now}`,
    };

    await putGoal(goal);

    // Log activity
    await putActivity({
      activityId: randomUUID(),
      userId,
      userName: "User", // In real app, get from session
      userAvatar: "U",
      action: aiGenerated ? "created an AI-generated goal" : "created a goal",
      target: title,
      type: "goal",
      createdAt: now,
    });

    return Response.json({ success: true, goal });
  } catch (err) {
    console.error("[POST /api/goals]", err);
    return Response.json({ error: "Failed to create goal" }, { status: 500 });
  }
}