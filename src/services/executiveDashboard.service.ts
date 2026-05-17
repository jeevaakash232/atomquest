// ─── Executive Dashboard Service ─────────────────────────────────────────────
import { getAllUsers, getRecentActivity } from "@/lib/aws/dynamodb";
import { users as mockUsers, departments, orgKPIs, goalCompletionTrend, weeklyProductivity, aiInsights as mockInsights } from "@/mock/data";

export async function getExecutiveDashboard(userId: string) {
  let allUsers: any[] = [];
  let activity: any[] = [];

  try {
    allUsers = await getAllUsers();
    if (allUsers.length === 0) throw new Error("empty");
  } catch {
    allUsers = mockUsers;
  }

  try {
    activity = await getRecentActivity(10);
    if (activity.length === 0) throw new Error("empty");
  } catch {
    activity = [];
  }

  // Org-wide metrics
  const totalGoalsCompleted = departments.reduce((a, d) => a + d.goalsCompleted, 0);
  const totalGoalsActive    = departments.reduce((a, d) => a + d.goalsActive, 0);
  const orgProductivity     = Math.round(departments.reduce((a, d) => a + d.avgProductivity, 0) / departments.length);
  const healthyDepts        = departments.filter((d) => d.riskLevel === "HEALTHY").length;
  const aiAdoptionRate      = 64;

  // Department comparison
  const departmentComparison = departments.map((d) => ({
    name:         d.name,
    productivity: d.avgProductivity,
    headCount:    d.headCount,
    goalsCompleted: d.goalsCompleted,
    goalsActive:  d.goalsActive,
    riskLevel:    d.riskLevel,
    efficiency:   Math.round((d.goalsCompleted / (d.goalsCompleted + d.goalsActive)) * 100),
    budgetHealth: Math.round((d.budgetUsed / d.budget) * 100),
  }));

  // Strategic risks
  const strategicRisks = [
    ...departments.filter((d) => d.riskLevel === "WARNING" || d.riskLevel === "CRITICAL").map((d) => ({
      id:       `risk_dept_${d.id}`,
      area:     d.name,
      type:     "DEPARTMENT_RISK",
      severity: d.riskLevel,
      message:  `${d.name} department showing ${d.riskLevel.toLowerCase()} risk signals. Productivity at ${d.avgProductivity}%.`,
      impact:   "MEDIUM",
    })),
    {
      id:       "risk_budget_1",
      area:     "Marketing",
      type:     "BUDGET_RISK",
      severity: "WARNING",
      message:  "Marketing department at 82% budget utilization with 6 months remaining.",
      impact:   "HIGH",
    },
  ];

  // AI forecasting (6-month)
  const forecasting = [
    { month: "Jun", actual: orgProductivity,       forecast: orgProductivity },
    { month: "Jul", actual: null,                  forecast: Math.min(100, orgProductivity + 2) },
    { month: "Aug", actual: null,                  forecast: Math.min(100, orgProductivity + 4) },
    { month: "Sep", actual: null,                  forecast: Math.min(100, orgProductivity + 3) },
    { month: "Oct", actual: null,                  forecast: Math.min(100, orgProductivity + 6) },
    { month: "Nov", actual: null,                  forecast: Math.min(100, orgProductivity + 8) },
  ];

  // Executive KPI summaries
  const executiveKPIs = orgKPIs.map((kpi) => ({
    ...kpi,
    trend:   kpi.trend,
    status:  kpi.status,
    pct:     Math.round((kpi.value / kpi.target) * 100),
  }));

  // Executive insights
  const executiveInsights = [
    {
      id:         "exec_ins_1",
      type:       "STRATEGIC",
      title:      "Organizational Health",
      content:    `Organization is performing at ${orgProductivity}% productivity. ${healthyDepts}/${departments.length} departments are healthy.`,
      confidence: 94,
      impact:     "HIGH",
    },
    {
      id:         "exec_ins_2",
      type:       "TREND",
      title:      "Goal Completion Trend",
      content:    `${totalGoalsCompleted} goals completed this quarter, up 18% QoQ. ${totalGoalsActive} goals currently active.`,
      confidence: 91,
      impact:     "HIGH",
    },
    {
      id:         "exec_ins_3",
      type:       "AI_ADOPTION",
      title:      "AI Platform Adoption",
      content:    `${aiAdoptionRate}% of employees are actively using AI features, up 12.4% MoM. Projected to reach 78% by Q4.`,
      confidence: 87,
      impact:     "MEDIUM",
    },
    ...(strategicRisks.length > 0 ? [{
      id:         "exec_ins_4",
      type:       "RISK",
      title:      "Strategic Risk Alert",
      content:    `${strategicRisks.length} strategic risk${strategicRisks.length !== 1 ? "s" : ""} identified requiring executive attention.`,
      confidence: 89,
      impact:     "HIGH",
    }] : []),
  ];

  // Executive notifications
  const executiveNotifications = [
    { id: "exec_n1", title: "Q2 KPI Summary Ready",    message: `Organization productivity at ${orgProductivity}%. Full report available.`, type: "info",    priority: "HIGH",   read: false, createdAt: new Date().toISOString() },
    { id: "exec_n2", title: "Strategic Risk Detected",  message: `${strategicRisks.length} departments showing risk signals requiring attention.`, type: "warning", priority: "CRITICAL", read: false, createdAt: new Date().toISOString() },
    { id: "exec_n3", title: "AI Adoption Milestone",    message: `Platform AI adoption reached ${aiAdoptionRate}%, exceeding Q2 target of 60%.`, type: "success", priority: "MEDIUM", read: true, createdAt: new Date().toISOString() },
  ];

  return {
    role: "EXECUTIVE",
    kpis: {
      organizationScore:    orgProductivity,
      totalGoalsCompleted,
      totalGoalsActive,
      healthyDepartments:   healthyDepts,
      totalDepartments:     departments.length,
      aiAdoptionRate,
      totalEmployees:       allUsers.length,
      strategicRisks:       strategicRisks.length,
    },
    departmentComparison,
    strategicRisks,
    forecasting,
    executiveKPIs,
    executiveInsights,
    notifications:          executiveNotifications,
    activityFeed:           activity.slice(0, 8),
    charts: {
      departmentComparison,
      goalCompletionTrend,
      weeklyProductivity,
      forecasting,
      kpiSummary: executiveKPIs.slice(0, 6),
    },
  };
}
