// Re-export from centralized mock data for backward compatibility
export * from "@/mock/data";

// Legacy exports kept for any existing references
export const mockUser = {
  id: "usr_1",
  name: "Alex Sterling",
  email: "alex.sterling@atomquest.inc",
  role: "EMPLOYEE",
  department: "Engineering",
  xpPoints: 12450,
  streakDays: 14,
  badges: ["Top Performer", "Consistency Champion"],
};

export const mockManager = {
  id: "mgr_1",
  name: "Sarah Chen",
  email: "sarah.chen@atomquest.inc",
  role: "MANAGER",
  department: "Engineering",
};

export const mockGoals = [
  { id: "goal_1", title: "Increase automated API test coverage from 60% to 90%", status: "APPROVED", priority: "HIGH", progress: 75, deadline: "2026-09-30", createdAt: "2026-05-01" },
  { id: "goal_2", title: "Migrate legacy authentication to NextAuth.js", status: "LOCKED", priority: "CRITICAL", progress: 100, deadline: "2026-05-15", createdAt: "2026-04-10" },
  { id: "goal_3", title: "Optimize database queries for reporting dashboard", status: "DRAFT", priority: "MEDIUM", progress: 10, deadline: "2026-08-15", createdAt: "2026-05-10" },
  { id: "goal_4", title: "Implement real-time WebSocket notifications", status: "SUBMITTED", priority: "HIGH", progress: 0, deadline: "2026-07-01", createdAt: "2026-05-12" },
];

export const mockActivityFeed = [
  { id: "act_1", user: "Sarah Chen", action: "approved your goal", target: "Migrate legacy authentication to NextAuth.js", time: "2 hours ago", avatar: "SC" },
  { id: "act_2", user: "System AI", action: "generated an insight", target: "Productivity improved by 12% this week.", time: "5 hours ago", avatar: "AI" },
  { id: "act_3", user: "Alex Sterling", action: "updated progress to 75%", target: "Increase automated API test coverage", time: "1 day ago", avatar: "AS" },
];

export const mockApprovals = [
  { id: "app_1", employeeName: "David Kim", goalTitle: "Reduce AWS EC2 costs by 20%", status: "SUBMITTED", submittedAt: "2026-05-14", priority: "HIGH", avatar: "DK" },
  { id: "app_2", employeeName: "Emily Watson", goalTitle: "Redesign Employee Onboarding Flow", status: "SUBMITTED", submittedAt: "2026-05-15", priority: "MEDIUM", avatar: "EW" },
];

export const mockTeamAnalytics = [
  { name: "David Kim", productivity: 92, goalsCompleted: 4 },
  { name: "Emily Watson", productivity: 88, goalsCompleted: 3 },
  { name: "Alex Sterling", productivity: 95, goalsCompleted: 5 },
  { name: "James Carter", productivity: 78, goalsCompleted: 2 },
];

export const mockAIInsights = [
  { id: "insight_1", type: "RISK", content: "James Carter has 2 goals marked 'CRITICAL' but hasn't updated progress in 6 days.", confidence: 89 },
  { id: "insight_2", type: "TREND", content: "Engineering department goal completion is up 15% compared to last month.", confidence: 94 },
  { id: "insight_3", type: "OPTIMIZATION", content: "Suggesting weekly syncs for the Q3 Migration project to prevent potential bottlenecks.", confidence: 76 },
];
