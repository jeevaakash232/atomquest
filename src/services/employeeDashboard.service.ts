// ─── Employee Dashboard Service ───────────────────────────────────────────────
import { getUser, getUserGoals, getRecentActivity, getUserNotifications } from "@/lib/aws/dynamodb";
import { users as mockUsers, goals as mockGoals, activityFeed as mockActivity, notifications as mockNotifs } from "@/mock/data";

export async function getEmployeeDashboard(userId: string) {
  // Fetch real data with mock fallback
  let user: any = null;
  let goals: any[] = [];
  let activity: any[] = [];
  let notifications: any[] = [];

  try { user = await getUser(userId); } catch {}
  if (!user) user = mockUsers.find((u) => u.id === userId) ?? mockUsers[0];

  try {
    goals = await getUserGoals(userId);
    if (goals.length === 0) throw new Error("empty");
  } catch {
    goals = mockGoals.filter((g) => g.userId === userId).map((g) => ({ ...g, goalId: g.id }));
  }

  try {
    const acts = await getRecentActivity(10);
    activity = acts.filter((a: any) => a.userId === userId);
    if (activity.length === 0) activity = acts.slice(0, 5);
  } catch {
    activity = mockActivity.slice(0, 5).map((a) => ({
      activityId: a.id, userId, userName: a.user, userAvatar: a.avatar,
      action: a.action, target: a.target, type: a.type, createdAt: new Date().toISOString(),
    }));
  }

  try {
    const notifs = await getUserNotifications(userId, 10);
    notifications = notifs;
    if (notifications.length === 0) throw new Error("empty");
  } catch {
    notifications = mockNotifs.filter((n) => !n.read).slice(0, 5).map((n) => ({
      notifId: n.id, userId, title: n.title, message: n.message,
      type: n.type, priority: n.priority, read: n.read, createdAt: new Date().toISOString(),
    }));
  }

  const now = new Date();
  const completedGoals = goals.filter((g: any) => g.status === "LOCKED");
  const activeGoals    = goals.filter((g: any) => g.status !== "LOCKED");
  const overdueGoals   = goals.filter((g: any) => new Date(g.deadline) < now && g.status !== "LOCKED");
  const avgProgress    = activeGoals.length
    ? Math.round(activeGoals.reduce((a: number, g: any) => a + g.progress, 0) / activeGoals.length) : 0;

  const xp      = user?.xp ?? 0;
  const streak  = user?.streak ?? 0;
  const level   = user?.level ?? 1;
  const badges  = user?.badges ?? [];

  // Weekly progress (derived from goal progress)
  const weeklyProgress = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => ({
    day,
    score: Math.max(20, Math.min(100, avgProgress + [-16,-3,-10,3,0,-23,-18][i])),
  }));

  // Productivity score
  const productivityScore = Math.min(100, Math.round(
    (completedGoals.length / Math.max(goals.length, 1)) * 40 +
    (avgProgress / 100) * 35 +
    Math.min(streak, 30) / 30 * 25
  ));

  // Personal AI insights
  const aiInsights = [
    {
      id: "emp_ins_1",
      type: "PERSONAL",
      title: "Productivity Trend",
      content: avgProgress >= 70
        ? `Great momentum! Your average goal progress is ${avgProgress}%. You're outperforming 78% of your peers.`
        : `Your average progress is ${avgProgress}%. Focus on your top-priority goals to improve your score.`,
      confidence: 87,
    },
    ...(overdueGoals.length > 0 ? [{
      id: "emp_ins_2",
      type: "RISK",
      title: "Overdue Alert",
      content: `You have ${overdueGoals.length} overdue goal${overdueGoals.length > 1 ? "s" : ""}. Immediate action recommended.`,
      confidence: 95,
    }] : []),
    {
      id: "emp_ins_3",
      type: "ACHIEVEMENT",
      title: "XP Milestone",
      content: `You're ${1000 - (xp % 1000)} XP away from Level ${level + 1}. Complete a goal to get there faster!`,
      confidence: 100,
    },
  ];

  return {
    role: "EMPLOYEE",
    user: { userId: user?.userId ?? user?.id, name: user?.name, email: user?.email, department: user?.department, xp, streak, level, badges, avatar: user?.avatar },
    kpis: {
      goalsCompleted:    completedGoals.length,
      goalsActive:       activeGoals.length,
      goalsOverdue:      overdueGoals.length,
      productivityScore,
      xpPoints:          xp,
      currentStreak:     streak,
      currentLevel:      level,
      badgesEarned:      badges.length,
      avgProgress,
    },
    goals: goals.slice(0, 10),
    weeklyProgress,
    aiInsights,
    notifications: notifications.slice(0, 5),
    activityFeed:  activity.slice(0, 8),
    charts: {
      productivityScore: [{ name: "Score", value: productivityScore, fill: "var(--primary)" }],
      weeklyProgress,
      goalStatusBreakdown: [
        { name: "Completed", value: completedGoals.length },
        { name: "Active",    value: activeGoals.length },
        { name: "Overdue",   value: overdueGoals.length },
      ],
    },
  };
}
