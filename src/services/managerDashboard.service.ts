// ─── Manager Dashboard Service ────────────────────────────────────────────────
import { getUser, getUserGoals, getRecentActivity, getAllUsers } from "@/lib/aws/dynamodb";
import { users as mockUsers, goals as mockGoals, activityFeed as mockActivity, departments, weeklyProductivity, aiInsights as mockInsights } from "@/mock/data";

export async function getManagerDashboard(userId: string) {
  let manager: any = null;
  let allUsers: any[] = [];
  let allGoals: any[] = [];
  let activity: any[] = [];

  try { manager = await getUser(userId); } catch {}
  if (!manager) manager = mockUsers.find((u) => u.id === userId) ?? mockUsers[1];

  const dept = manager?.department ?? "Engineering";

  try {
    allUsers = await getAllUsers();
    if (allUsers.length === 0) throw new Error("empty");
  } catch {
    allUsers = mockUsers;
  }

  // Team members in same department (non-manager)
  const teamMembers = allUsers.filter((u: any) =>
    u.department === dept && (u.role === "EMPLOYEE" || u.role === "MANAGER")
  );

  // Fetch goals for all team members
  try {
    const goalPromises = teamMembers.map((u: any) => getUserGoals(u.userId ?? u.id).catch(() => []));
    const results = await Promise.all(goalPromises);
    allGoals = results.flat();
    if (allGoals.length === 0) throw new Error("empty");
  } catch {
    allGoals = mockGoals.filter((g) =>
      teamMembers.some((u: any) => (u.userId ?? u.id) === g.userId)
    ).map((g) => ({ ...g, goalId: g.id }));
  }

  try {
    activity = await getRecentActivity(20);
    if (activity.length === 0) throw new Error("empty");
  } catch {
    activity = mockActivity.map((a) => ({
      activityId: a.id, userId, userName: a.user, userAvatar: a.avatar,
      action: a.action, target: a.target, type: a.type, createdAt: new Date().toISOString(),
    }));
  }

  const pendingApprovals = allGoals.filter((g: any) => g.status === "SUBMITTED");
  const completedGoals   = allGoals.filter((g: any) => g.status === "LOCKED");
  const atRiskGoals      = allGoals.filter((g: any) => {
    const days = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);
    return days <= 7 && g.progress < 50 && g.status !== "LOCKED";
  });

  const teamProductivity = teamMembers.length > 0
    ? Math.round(teamMembers.reduce((a: number, u: any) => a + Math.min(100, Math.round((u.xp ?? 0) / 200)), 0) / teamMembers.length)
    : 88;

  // Per-member productivity
  const memberPerformance = teamMembers.slice(0, 8).map((u: any) => ({
    name:         (u.name ?? "").split(" ")[0],
    productivity: Math.min(100, Math.round((u.xp ?? 0) / 200)),
    goalsActive:  allGoals.filter((g: any) => (g.userId === (u.userId ?? u.id)) && g.status !== "LOCKED").length,
    streak:       u.streak ?? 0,
    xp:           u.xp ?? 0,
    avatar:       u.avatar ?? "?",
  }));

  // Department heatmap
  const deptHeatmap = departments.map((d) => ({
    name:        d.name,
    productivity: d.avgProductivity,
    headCount:   d.headCount,
    riskLevel:   d.riskLevel,
    goalsActive: d.goalsActive,
    goalsDone:   d.goalsCompleted,
  }));

  // Approval stats
  const approvalStats = {
    pending:  pendingApprovals.length,
    approved: allGoals.filter((g: any) => g.status === "APPROVED").length,
    rejected: allGoals.filter((g: any) => g.status === "REJECTED").length,
    total:    allGoals.length,
  };

  // Escalation alerts
  const escalationAlerts = atRiskGoals.slice(0, 5).map((g: any) => {
    const member = teamMembers.find((u: any) => (u.userId ?? u.id) === g.userId);
    return {
      goalId:    g.goalId ?? g.id,
      goalTitle: g.title,
      employee:  member?.name ?? "Unknown",
      progress:  g.progress,
      deadline:  g.deadline,
      priority:  g.priority,
    };
  });

  // Team AI insights
  const teamInsights = [
    {
      id: "mgr_ins_1",
      type: "TEAM",
      title: "Team Productivity",
      content: `Your team's average productivity is ${teamProductivity}%. ${teamProductivity >= 85 ? "Excellent performance!" : "Consider scheduling 1:1s to identify blockers."}`,
      confidence: 91,
    },
    {
      id: "mgr_ins_2",
      type: "APPROVAL",
      title: "Pending Approvals",
      content: `${pendingApprovals.length} goal${pendingApprovals.length !== 1 ? "s" : ""} awaiting your approval. ${pendingApprovals.filter((g: any) => g.priority === "CRITICAL" || g.priority === "HIGH").length} are high priority.`,
      confidence: 100,
    },
    ...(atRiskGoals.length > 0 ? [{
      id: "mgr_ins_3",
      type: "RISK",
      title: "At-Risk Goals",
      content: `${atRiskGoals.length} team goal${atRiskGoals.length !== 1 ? "s" : ""} at risk of missing deadline. Escalation recommended.`,
      confidence: 89,
    }] : []),
  ];

  return {
    role: "MANAGER",
    user: { userId: manager?.userId ?? manager?.id, name: manager?.name, email: manager?.email, department: dept },
    kpis: {
      pendingApprovals:  pendingApprovals.length,
      teamProductivity,
      teamSize:          teamMembers.length,
      goalsCompleted:    completedGoals.length,
      atRiskGoals:       atRiskGoals.length,
      escalationAlerts:  escalationAlerts.length,
      approvalRate:      allGoals.length > 0 ? Math.round((approvalStats.approved / allGoals.length) * 100) : 0,
    },
    pendingApprovals: pendingApprovals.slice(0, 10),
    memberPerformance,
    escalationAlerts,
    approvalStats,
    deptHeatmap,
    teamInsights,
    activityFeed: activity.slice(0, 10),
    charts: {
      weeklyProductivity,
      memberPerformance,
      approvalBreakdown: [
        { name: "Pending",  value: approvalStats.pending },
        { name: "Approved", value: approvalStats.approved },
        { name: "Rejected", value: approvalStats.rejected },
      ],
    },
  };
}
