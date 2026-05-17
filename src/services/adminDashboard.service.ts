// ─── Admin Dashboard Service ──────────────────────────────────────────────────
import { getAllUsers, getRecentActivity } from "@/lib/aws/dynamodb";
import { users as mockUsers, departments, auditLogs, securityEvents, orgKPIs, activityFeed as mockActivity } from "@/mock/data";

export async function getAdminDashboard(userId: string) {
  let allUsers: any[] = [];
  let activity: any[] = [];

  try {
    allUsers = await getAllUsers();
    if (allUsers.length === 0) throw new Error("empty");
  } catch {
    allUsers = mockUsers;
  }

  try {
    activity = await getRecentActivity(30);
    if (activity.length === 0) throw new Error("empty");
  } catch {
    activity = mockActivity.map((a) => ({
      activityId: a.id, userId, userName: a.user, userAvatar: a.avatar,
      action: a.action, target: a.target, type: a.type, createdAt: new Date().toISOString(),
    }));
  }

  // Role distribution
  const roleDistribution = ["EMPLOYEE","MANAGER","ADMIN","EXECUTIVE"].map((role) => ({
    role,
    count: allUsers.filter((u: any) => u.role === role).length,
  }));

  // Department analytics
  const departmentAnalytics = departments.map((d) => ({
    id:           d.id,
    name:         d.name,
    headCount:    d.headCount,
    productivity: d.avgProductivity,
    goalsActive:  d.goalsActive,
    goalsDone:    d.goalsCompleted,
    riskLevel:    d.riskLevel,
    budget:       d.budget,
    budgetUsed:   d.budgetUsed,
    budgetPct:    Math.round((d.budgetUsed / d.budget) * 100),
  }));

  // Security alerts
  const criticalSecurity = securityEvents.filter((e) => e.severity === "CRITICAL" || e.severity === "WARNING");

  // System health (mocked — replace with real CloudWatch in production)
  const systemHealth = {
    apiUptime:      99.97,
    avgLatency:     128,
    errorRate:      0.08,
    activeNodes:    4,
    dbConnections:  24,
    cacheHitRate:   94,
    queueDepth:     12,
    storageUsed:    68,
  };

  // Platform metrics
  const platformMetrics = {
    totalUsers:      allUsers.length,
    activeToday:     Math.round(allUsers.length * 0.72),
    newThisMonth:    Math.round(allUsers.length * 0.08),
    mfaEnabled:      Math.round(allUsers.length * 0.91),
    avgSessionTime:  "24m",
    aiUsageRate:     64,
  };

  // Notification analytics
  const notificationAnalytics = {
    sentToday:    142,
    openRate:     78,
    actionRate:   45,
    unreadTotal:  Math.round(allUsers.length * 1.8),
  };

  // Admin-specific notifications
  const adminNotifications = [
    { id: "adm_n1", title: "Security Alert", message: `${criticalSecurity.length} security event${criticalSecurity.length !== 1 ? "s" : ""} require review`, type: "error",   priority: "CRITICAL", read: false, createdAt: new Date().toISOString() },
    { id: "adm_n2", title: "New Users",      message: `${Math.round(allUsers.length * 0.08)} new users registered this month`, type: "info", priority: "LOW", read: false, createdAt: new Date().toISOString() },
    { id: "adm_n3", title: "Audit Report",   message: `${auditLogs.length} audit events logged in the last 24 hours`, type: "info", priority: "MEDIUM", read: true, createdAt: new Date().toISOString() },
  ];

  // Login activity (7 days)
  const loginActivity = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => ({
    day,
    logins: Math.round(allUsers.length * [0.72, 0.78, 0.65, 0.81, 0.74, 0.38, 0.27][i]),
  }));

  return {
    role: "ADMIN",
    kpis: {
      totalUsers:       allUsers.length,
      activeUsers:      platformMetrics.activeToday,
      securityAlerts:   criticalSecurity.length,
      auditEvents:      auditLogs.length,
      systemUptime:     systemHealth.apiUptime,
      mfaAdoption:      Math.round((platformMetrics.mfaEnabled / allUsers.length) * 100),
      aiAdoptionRate:   platformMetrics.aiUsageRate,
      avgLatency:       systemHealth.avgLatency,
    },
    users:                allUsers.slice(0, 20),
    roleDistribution,
    departmentAnalytics,
    securityEvents:       securityEvents,
    auditLogs:            auditLogs.slice(0, 20),
    orgKPIs,
    systemHealth,
    platformMetrics,
    notificationAnalytics,
    notifications:        adminNotifications,
    activityFeed:         activity.slice(0, 15),
    charts: {
      roleDistribution,
      departmentAnalytics,
      loginActivity,
      systemHealth: Object.entries(systemHealth).map(([k, v]) => ({ metric: k, value: v })),
    },
  };
}
