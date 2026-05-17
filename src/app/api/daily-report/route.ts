// ─── GET /api/daily-report ────────────────────────────────────────────────────
// Generates a daily summary report for the authenticated user
import { getSession } from "@/lib/auth";
import { getUser, getUserGoals, getRecentActivity } from "@/lib/aws/dynamodb";
import { users as mockUsers, goals as mockGoals, activityFeed as mockActivity } from "@/mock/data";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let user: any = null;
  let goals: any[] = [];
  let activity: any[] = [];

  try {
    [user, goals, activity] = await Promise.all([
      getUser(session.id),
      getUserGoals(session.id),
      getRecentActivity(20),
    ]);
    if (!user) throw new Error("no user");
    if (goals.length === 0) throw new Error("no goals");
  } catch {
    user = mockUsers.find((u) => u.id === session.id) ?? null;
    goals = mockGoals.filter((g) => g.userId === session.id).map((g) => ({ ...g, goalId: g.id }));
    activity = mockActivity.slice(0, 10).map((a) => ({
      activityId: a.id, userName: a.user, action: a.action, target: a.target, type: a.type,
      createdAt: new Date().toISOString(),
    }));
  }

  const now = new Date();
  const today = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const completed   = goals.filter((g) => g.status === "LOCKED");
  const active      = goals.filter((g) => g.status !== "LOCKED");
  const overdue     = goals.filter((g) => new Date(g.deadline) < now && g.status !== "LOCKED");
  const dueSoon     = goals.filter((g) => {
    const d = new Date(g.deadline);
    const days = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 7 && g.status !== "LOCKED";
  });
  const avgProgress = active.length
    ? Math.round(active.reduce((a: number, g: any) => a + g.progress, 0) / active.length)
    : 0;

  const report = {
    date: today,
    user: { name: user?.name ?? session.name, role: user?.role ?? session.role, xp: user?.xp ?? 0, streak: user?.streak ?? 0, level: user?.level ?? 1 },
    summary: {
      totalGoals:     goals.length,
      completed:      completed.length,
      active:         active.length,
      overdue:        overdue.length,
      dueSoon:        dueSoon.length,
      avgProgress,
    },
    highlights: [
      ...(completed.length > 0 ? [`✅ ${completed.length} goal${completed.length > 1 ? "s" : ""} completed`] : []),
      ...(overdue.length > 0   ? [`⚠️ ${overdue.length} goal${overdue.length > 1 ? "s" : ""} overdue`] : []),
      ...(dueSoon.length > 0   ? [`📅 ${dueSoon.length} goal${dueSoon.length > 1 ? "s" : ""} due within 7 days`] : []),
      ...(avgProgress >= 75    ? [`🚀 Great momentum — ${avgProgress}% average progress`] : []),
      ...(user?.streak > 0     ? [`🔥 ${user.streak}-day streak — keep it up!`] : []),
    ],
    activeGoals: active.slice(0, 5).map((g: any) => ({
      title:    g.title,
      progress: g.progress,
      deadline: new Date(g.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      priority: g.priority,
      status:   g.status,
    })),
    overdueGoals: overdue.map((g: any) => ({
      title:    g.title,
      deadline: new Date(g.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      priority: g.priority,
    })),
    recentActivity: activity.slice(0, 5),
    recommendation: avgProgress < 30
      ? "Focus on making progress on your active goals today. Even small updates help!"
      : avgProgress < 70
      ? "Good progress! Try to push at least one goal past the 75% mark today."
      : "Excellent work! You're on track. Consider submitting completed goals for review.",
  };

  return Response.json({ success: true, report });
}
