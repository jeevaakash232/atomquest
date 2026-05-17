// ─── GET /api/alerts ──────────────────────────────────────────────────────────
// Returns smart alerts based on user's goals — deadlines, overdue, at-risk
import { getSession } from "@/lib/auth";
import { getUserGoals } from "@/lib/aws/dynamodb";
import { goals as mockGoals } from "@/mock/data";

export const runtime = "nodejs";

export type Alert = {
  id: string;
  type: "DEADLINE" | "OVERDUE" | "AT_RISK" | "MILESTONE" | "STREAK";
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  goalId?: string;
  goalTitle?: string;
  createdAt: string;
};

export async function GET() {
  const session = await getSession();
  if (!session?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let goals: any[] = [];
  try {
    goals = await getUserGoals(session.id);
    if (goals.length === 0) throw new Error("empty");
  } catch {
    goals = mockGoals
      .filter((g) => g.userId === session.id)
      .map((g) => ({ ...g, goalId: g.id }));
  }

  const now = new Date();
  const alerts: Alert[] = [];

  goals.forEach((goal) => {
    const deadline = new Date(goal.deadline);
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const goalId = goal.goalId ?? goal.id;

    // Overdue
    if (daysLeft < 0 && goal.status !== "LOCKED") {
      alerts.push({
        id: `overdue_${goalId}`,
        type: "OVERDUE",
        severity: "CRITICAL",
        title: "Goal Overdue",
        message: `"${goal.title}" was due ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? "s" : ""} ago and is not completed.`,
        goalId,
        goalTitle: goal.title,
        createdAt: now.toISOString(),
      });
    }
    // Deadline in 3 days
    else if (daysLeft >= 0 && daysLeft <= 3 && goal.status !== "LOCKED") {
      alerts.push({
        id: `deadline_${goalId}`,
        type: "DEADLINE",
        severity: daysLeft === 0 ? "CRITICAL" : "WARNING",
        title: daysLeft === 0 ? "Due Today!" : `Due in ${daysLeft} Day${daysLeft !== 1 ? "s" : ""}`,
        message: `"${goal.title}" is due ${daysLeft === 0 ? "today" : `in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}. Current progress: ${goal.progress}%.`,
        goalId,
        goalTitle: goal.title,
        createdAt: now.toISOString(),
      });
    }
    // At risk — low progress with deadline approaching
    else if (daysLeft <= 14 && goal.progress < 50 && goal.status !== "LOCKED") {
      alerts.push({
        id: `risk_${goalId}`,
        type: "AT_RISK",
        severity: "WARNING",
        title: "Goal At Risk",
        message: `"${goal.title}" is only ${goal.progress}% complete with ${daysLeft} days remaining.`,
        goalId,
        goalTitle: goal.title,
        createdAt: now.toISOString(),
      });
    }
    // Milestone — 50% or 100%
    if (goal.progress === 50) {
      alerts.push({
        id: `milestone_50_${goalId}`,
        type: "MILESTONE",
        severity: "INFO",
        title: "Halfway There! 🎯",
        message: `You've reached 50% on "${goal.title}". Keep going!`,
        goalId,
        goalTitle: goal.title,
        createdAt: now.toISOString(),
      });
    }
  });

  // Sort: CRITICAL first, then WARNING, then INFO
  const order = { CRITICAL: 0, WARNING: 1, INFO: 2 };
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);

  return Response.json({ success: true, alerts });
}
