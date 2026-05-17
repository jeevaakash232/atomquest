// ─── AtomQuest Enterprise Mock Data ───────────────────────────────────────────
// Types are now in @/types — re-exported here for backward compatibility
export type { Role, GoalStatus, Priority, InsightType, RiskLevel } from "@/types";
import type { Role, GoalStatus, Priority, InsightType, RiskLevel } from "@/types";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = [
  { id: "usr_1", name: "Alex Sterling", email: "alex.sterling@atomquest.inc", role: "EMPLOYEE" as Role, department: "Engineering", avatar: "AS", xp: 12450, streak: 14, level: 9, badges: ["Top Performer", "Consistency Champion", "AI Productivity Master"] },
  { id: "usr_2", name: "Sarah Chen", email: "sarah.chen@atomquest.inc", role: "MANAGER" as Role, department: "Engineering", avatar: "SC", xp: 18200, streak: 22, level: 12, badges: ["Fast Approver", "Team Leader"] },
  { id: "usr_3", name: "David Kim", email: "david.kim@atomquest.inc", role: "EMPLOYEE" as Role, department: "Engineering", avatar: "DK", xp: 9800, streak: 7, level: 7, badges: ["Cloud Optimizer"] },
  { id: "usr_4", name: "Emily Watson", email: "emily.watson@atomquest.inc", role: "EMPLOYEE" as Role, department: "Design", avatar: "EW", xp: 11200, streak: 11, level: 8, badges: ["UX Champion"] },
  { id: "usr_5", name: "James Carter", email: "james.carter@atomquest.inc", role: "EMPLOYEE" as Role, department: "Engineering", avatar: "JC", xp: 6400, streak: 2, level: 5, badges: [] },
  { id: "usr_6", name: "Priya Nair", email: "priya.nair@atomquest.inc", role: "ADMIN" as Role, department: "Operations", avatar: "PN", xp: 22000, streak: 30, level: 15, badges: ["System Guardian", "Audit Master"] },
  { id: "usr_7", name: "Marcus Webb", email: "marcus.webb@atomquest.inc", role: "EXECUTIVE" as Role, department: "Executive", avatar: "MW", xp: 35000, streak: 45, level: 20, badges: ["Visionary", "Growth Driver"] },
  { id: "usr_8", name: "Lena Hoffman", email: "lena.hoffman@atomquest.inc", role: "EMPLOYEE" as Role, department: "Marketing", avatar: "LH", xp: 8900, streak: 9, level: 6, badges: ["Campaign Star"] },
  { id: "usr_9", name: "Raj Patel", email: "raj.patel@atomquest.inc", role: "MANAGER" as Role, department: "Product", avatar: "RP", xp: 16500, streak: 18, level: 11, badges: ["Product Visionary"] },
  { id: "usr_10", name: "Sofia Torres", email: "sofia.torres@atomquest.inc", role: "EMPLOYEE" as Role, department: "Sales", avatar: "ST", xp: 13700, streak: 16, level: 10, badges: ["Revenue Champion", "Weekly Winner"] },
];

export const currentUser = users[0];
export const currentManager = users[1];
export const currentAdmin = users[5];
export const currentExecutive = users[6];

// ─── Goals ────────────────────────────────────────────────────────────────────
export const goals = [
  { id: "goal_1", userId: "usr_1", title: "Increase automated API test coverage from 60% to 90%", description: "Improve test reliability across all microservices by Q3 2026.", status: "APPROVED" as GoalStatus, priority: "HIGH" as Priority, progress: 75, deadline: "2026-09-30", createdAt: "2026-05-01", kpis: ["Test coverage ≥ 90%", "Zero critical regressions", "CI pipeline < 8 min"], xpReward: 500 },
  { id: "goal_2", userId: "usr_1", title: "Migrate legacy authentication to NextAuth.js", description: "Replace custom JWT implementation with NextAuth.js for better security.", status: "LOCKED" as GoalStatus, priority: "CRITICAL" as Priority, progress: 100, deadline: "2026-05-15", createdAt: "2026-04-10", kpis: ["100% migration", "Zero auth downtime", "Security audit passed"], xpReward: 800 },
  { id: "goal_3", userId: "usr_1", title: "Optimize database queries for reporting dashboard", description: "Reduce average query time from 2.4s to under 400ms.", status: "DRAFT" as GoalStatus, priority: "MEDIUM" as Priority, progress: 10, deadline: "2026-08-15", createdAt: "2026-05-10", kpis: ["Query time < 400ms", "Index coverage > 95%"], xpReward: 350 },
  { id: "goal_4", userId: "usr_1", title: "Implement real-time WebSocket notifications", description: "Build scalable notification system using Socket.io and Redis pub/sub.", status: "SUBMITTED" as GoalStatus, priority: "HIGH" as Priority, progress: 0, deadline: "2026-07-01", createdAt: "2026-05-12", kpis: ["< 100ms delivery", "99.9% uptime", "10k concurrent users"], xpReward: 600 },
  { id: "goal_5", userId: "usr_3", title: "Reduce AWS EC2 costs by 20%", description: "Right-size instances and implement auto-scaling policies.", status: "SUBMITTED" as GoalStatus, priority: "HIGH" as Priority, progress: 0, deadline: "2026-07-15", createdAt: "2026-05-14", kpis: ["20% cost reduction", "No performance degradation"], xpReward: 450 },
  { id: "goal_6", userId: "usr_4", title: "Redesign Employee Onboarding Flow", description: "Improve onboarding completion rate from 68% to 95%.", status: "SUBMITTED" as GoalStatus, priority: "MEDIUM" as Priority, progress: 0, deadline: "2026-08-01", createdAt: "2026-05-15", kpis: ["Completion rate ≥ 95%", "NPS score > 8"], xpReward: 400 },
  { id: "goal_7", userId: "usr_5", title: "Implement GraphQL API layer", description: "Replace REST endpoints with GraphQL for better client flexibility.", status: "DRAFT" as GoalStatus, priority: "HIGH" as Priority, progress: 5, deadline: "2026-10-01", createdAt: "2026-05-08", kpis: ["100% endpoint coverage", "< 50ms p95 latency"], xpReward: 700 },
  { id: "goal_8", userId: "usr_5", title: "Set up Kubernetes cluster for microservices", description: "Migrate Docker Compose setup to production-grade K8s.", status: "REJECTED" as GoalStatus, priority: "CRITICAL" as Priority, progress: 30, deadline: "2026-06-30", createdAt: "2026-04-20", kpis: ["Zero-downtime deployments", "Auto-scaling configured"], xpReward: 900 },
];

// ─── Departments ──────────────────────────────────────────────────────────────
export const departments = [
  { id: "dept_1", name: "Engineering", headCount: 24, avgProductivity: 88, goalsCompleted: 42, goalsActive: 18, riskLevel: "HEALTHY" as RiskLevel, budget: 2400000, budgetUsed: 1680000 },
  { id: "dept_2", name: "Design", headCount: 8, avgProductivity: 92, goalsCompleted: 16, goalsActive: 6, riskLevel: "HEALTHY" as RiskLevel, budget: 800000, budgetUsed: 520000 },
  { id: "dept_3", name: "Marketing", headCount: 12, avgProductivity: 74, goalsCompleted: 22, goalsActive: 14, riskLevel: "WARNING" as RiskLevel, budget: 1200000, budgetUsed: 980000 },
  { id: "dept_4", name: "Sales", headCount: 18, avgProductivity: 85, goalsCompleted: 38, goalsActive: 12, riskLevel: "HEALTHY" as RiskLevel, budget: 1800000, budgetUsed: 1260000 },
  { id: "dept_5", name: "Product", headCount: 10, avgProductivity: 90, goalsCompleted: 28, goalsActive: 8, riskLevel: "HEALTHY" as RiskLevel, budget: 1000000, budgetUsed: 720000 },
  { id: "dept_6", name: "Operations", headCount: 6, avgProductivity: 96, goalsCompleted: 18, goalsActive: 4, riskLevel: "HEALTHY" as RiskLevel, budget: 600000, budgetUsed: 380000 },
];

// ─── AI Insights ──────────────────────────────────────────────────────────────
export const aiInsights = [
  { id: "ins_1", type: "RISK" as InsightType, title: "Goal Delay Detected", content: "James Carter has 2 goals marked CRITICAL but hasn't updated progress in 6 days. Escalation recommended.", confidence: 89, department: "Engineering", affectedUser: "James Carter", riskLevel: "CRITICAL" as RiskLevel, createdAt: "2026-05-16T08:30:00Z" },
  { id: "ins_2", type: "TREND" as InsightType, title: "Engineering Momentum", content: "Engineering department goal completion is up 15% compared to last month. Team velocity is accelerating.", confidence: 94, department: "Engineering", riskLevel: "HEALTHY" as RiskLevel, createdAt: "2026-05-16T07:00:00Z" },
  { id: "ins_3", type: "OPTIMIZATION" as InsightType, title: "Sync Cadence Suggestion", content: "Suggesting weekly syncs for the Q3 Migration project to prevent potential bottlenecks based on historical patterns.", confidence: 76, department: "Engineering", riskLevel: "WARNING" as RiskLevel, createdAt: "2026-05-15T14:00:00Z" },
  { id: "ins_4", type: "ACHIEVEMENT" as InsightType, title: "Marketing Recovery", content: "Marketing team has improved goal completion rate by 8% after implementing AI-suggested sprint planning.", confidence: 91, department: "Marketing", riskLevel: "HEALTHY" as RiskLevel, createdAt: "2026-05-15T10:00:00Z" },
  { id: "ins_5", type: "RISK" as InsightType, title: "Budget Overrun Risk", content: "Marketing department is at 82% budget utilization with 6 months remaining. Projected overrun of $120K.", confidence: 85, department: "Marketing", riskLevel: "WARNING" as RiskLevel, createdAt: "2026-05-14T16:00:00Z" },
];

// ─── Activity Feed ────────────────────────────────────────────────────────────
export const activityFeed = [
  { id: "act_1", user: "Sarah Chen", action: "approved your goal", target: "Migrate legacy authentication to NextAuth.js", time: "2 hours ago", avatar: "SC", type: "approval" },
  { id: "act_2", user: "AtomQuest AI", action: "generated an insight", target: "Productivity improved by 12% this week.", time: "5 hours ago", avatar: "AI", type: "ai" },
  { id: "act_3", user: "Alex Sterling", action: "updated progress to 75%", target: "Increase automated API test coverage", time: "1 day ago", avatar: "AS", type: "progress" },
  { id: "act_4", user: "David Kim", action: "submitted a new goal", target: "Reduce AWS EC2 costs by 20%", time: "1 day ago", avatar: "DK", type: "goal" },
  { id: "act_5", user: "Emily Watson", action: "earned a badge", target: "UX Champion", time: "2 days ago", avatar: "EW", type: "badge" },
  { id: "act_6", user: "AtomQuest AI", action: "flagged a risk", target: "James Carter — 6 days without progress update", time: "2 days ago", avatar: "AI", type: "risk" },
  { id: "act_7", user: "Priya Nair", action: "completed security audit", target: "Q2 Access Control Review", time: "3 days ago", avatar: "PN", type: "admin" },
  { id: "act_8", user: "Sofia Torres", action: "hit weekly target", target: "Revenue goal 110% achieved", time: "3 days ago", avatar: "ST", type: "achievement" },
];

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = [
  { id: "notif_1", title: "Goal Approved", message: "Your goal 'Migrate legacy authentication to NextAuth.js' has been approved by Sarah Chen.", type: "success", read: false, time: "2h ago", priority: "HIGH" },
  { id: "notif_2", title: "AI Insight Ready", message: "New productivity insight generated for your Engineering team. Completion rate up 15%.", type: "info", read: false, time: "5h ago", priority: "MEDIUM" },
  { id: "notif_3", title: "Weekly Summary", message: "Your weekly performance summary is ready. You earned 240 XP this week!", type: "info", read: false, time: "1d ago", priority: "LOW" },
  { id: "notif_4", title: "Goal at Risk", message: "Your goal 'Optimize database queries' is 3 weeks behind schedule. Consider updating your timeline.", type: "warning", read: true, time: "2d ago", priority: "HIGH" },
  { id: "notif_5", title: "New Badge Earned", message: "Congratulations! You've earned the 'AI Productivity Master' badge.", type: "success", read: true, time: "3d ago", priority: "MEDIUM" },
  { id: "notif_6", title: "Escalation Alert", message: "James Carter's critical goal has been escalated to department head.", type: "error", read: true, time: "3d ago", priority: "CRITICAL" },
];

// ─── Analytics Time Series ────────────────────────────────────────────────────
export const weeklyProductivity = [
  { week: "W1", engineering: 82, design: 88, marketing: 65, sales: 78, product: 85 },
  { week: "W2", engineering: 85, design: 90, marketing: 68, sales: 80, product: 87 },
  { week: "W3", engineering: 83, design: 87, marketing: 70, sales: 82, product: 88 },
  { week: "W4", engineering: 88, design: 92, marketing: 72, sales: 84, product: 90 },
  { week: "W5", engineering: 86, design: 91, marketing: 71, sales: 83, product: 89 },
  { week: "W6", engineering: 90, design: 93, marketing: 74, sales: 86, product: 91 },
  { week: "W7", engineering: 88, design: 92, marketing: 73, sales: 85, product: 90 },
  { week: "W8", engineering: 92, design: 94, marketing: 76, sales: 88, product: 92 },
];

export const goalCompletionTrend = [
  { month: "Jan", completed: 28, submitted: 35, approved: 32 },
  { month: "Feb", completed: 32, submitted: 40, approved: 37 },
  { month: "Mar", completed: 38, submitted: 44, approved: 41 },
  { month: "Apr", completed: 42, submitted: 48, approved: 45 },
  { month: "May", completed: 46, submitted: 52, approved: 49 },
  { month: "Jun", completed: 50, submitted: 56, approved: 53 },
];

export const kpiTrends = [
  { month: "Jan", score: 72, target: 80 },
  { month: "Feb", score: 75, target: 80 },
  { month: "Mar", score: 78, target: 82 },
  { month: "Apr", score: 82, target: 82 },
  { month: "May", score: 85, target: 85 },
  { month: "Jun", score: 88, target: 87 },
];

export const apiPerformance = [
  { time: "00:00", requests: 120, latency: 45, errors: 2 },
  { time: "02:00", requests: 80, latency: 38, errors: 1 },
  { time: "04:00", requests: 300, latency: 55, errors: 3 },
  { time: "06:00", requests: 800, latency: 72, errors: 5 },
  { time: "08:00", requests: 1800, latency: 120, errors: 12 },
  { time: "10:00", requests: 2200, latency: 135, errors: 8 },
  { time: "12:00", requests: 2400, latency: 140, errors: 10 },
  { time: "14:00", requests: 2100, latency: 128, errors: 7 },
  { time: "16:00", requests: 1900, latency: 110, errors: 6 },
  { time: "18:00", requests: 1400, latency: 88, errors: 4 },
  { time: "20:00", requests: 800, latency: 60, errors: 3 },
  { time: "22:00", requests: 400, latency: 48, errors: 2 },
];

export const tokenUsage = [
  { date: "May 10", tokens: 1200000, cost: 2.40 },
  { date: "May 11", tokens: 1450000, cost: 2.90 },
  { date: "May 12", tokens: 980000, cost: 1.96 },
  { date: "May 13", tokens: 1680000, cost: 3.36 },
  { date: "May 14", tokens: 2100000, cost: 4.20 },
  { date: "May 15", tokens: 1920000, cost: 3.84 },
  { date: "May 16", tokens: 2400000, cost: 4.80 },
];

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export const leaderboard = [
  { rank: 1, name: "Alex Sterling", department: "Engineering", xp: 12450, goalsCompleted: 5, streak: 14, badge: "Top Performer", avatar: "AS", change: 0 },
  { rank: 2, name: "Sofia Torres", department: "Sales", xp: 13700, goalsCompleted: 6, streak: 16, badge: "Revenue Champion", avatar: "ST", change: 1 },
  { rank: 3, name: "Emily Watson", department: "Design", xp: 11200, goalsCompleted: 4, streak: 11, badge: "UX Champion", avatar: "EW", change: -1 },
  { rank: 4, name: "David Kim", department: "Engineering", xp: 9800, goalsCompleted: 3, streak: 7, badge: "Cloud Optimizer", avatar: "DK", change: 2 },
  { rank: 5, name: "Lena Hoffman", department: "Marketing", xp: 8900, goalsCompleted: 3, streak: 9, badge: "Campaign Star", avatar: "LH", change: 0 },
  { rank: 6, name: "James Carter", department: "Engineering", xp: 6400, goalsCompleted: 2, streak: 2, badge: "", avatar: "JC", change: -2 },
];

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditLogs = [
  { id: "log_1", user: "Priya Nair", action: "USER_ROLE_CHANGED", target: "James Carter → EMPLOYEE", ip: "10.0.1.42", timestamp: "2026-05-16T09:15:00Z", severity: "HIGH" },
  { id: "log_2", user: "Sarah Chen", action: "GOAL_APPROVED", target: "goal_2 — NextAuth Migration", ip: "10.0.1.18", timestamp: "2026-05-16T08:30:00Z", severity: "LOW" },
  { id: "log_3", user: "System", action: "AI_INSIGHT_GENERATED", target: "Risk alert for Engineering dept", ip: "internal", timestamp: "2026-05-16T08:00:00Z", severity: "MEDIUM" },
  { id: "log_4", user: "Unknown", action: "FAILED_LOGIN_ATTEMPT", target: "admin@atomquest.inc", ip: "185.220.101.45", timestamp: "2026-05-16T07:45:00Z", severity: "CRITICAL" },
  { id: "log_5", user: "Priya Nair", action: "EXPORT_DATA", target: "Q1 Analytics Report", ip: "10.0.1.42", timestamp: "2026-05-15T16:00:00Z", severity: "MEDIUM" },
  { id: "log_6", user: "Marcus Webb", action: "DASHBOARD_ACCESS", target: "Executive Analytics", ip: "10.0.2.5", timestamp: "2026-05-15T14:30:00Z", severity: "LOW" },
];

// ─── Security Events ──────────────────────────────────────────────────────────
export const securityEvents = [
  { id: "sec_1", type: "FAILED_LOGIN", user: "admin@atomquest.inc", ip: "185.220.101.45", location: "Unknown — TOR Exit Node", time: "07:45 AM", severity: "CRITICAL" },
  { id: "sec_2", type: "SUSPICIOUS_ACCESS", user: "james.carter@atomquest.inc", ip: "10.0.1.99", location: "New Device — Chrome/Windows", time: "06:20 AM", severity: "WARNING" },
  { id: "sec_3", type: "SUCCESSFUL_LOGIN", user: "alex.sterling@atomquest.inc", ip: "10.0.1.42", location: "San Francisco, CA", time: "09:02 AM", severity: "INFO" },
  { id: "sec_4", type: "PERMISSION_ESCALATION", user: "System", ip: "internal", location: "Internal Service", time: "08:00 AM", severity: "MEDIUM" },
];

// ─── KPIs ─────────────────────────────────────────────────────────────────────
export const orgKPIs = [
  { id: "kpi_1", name: "Overall Productivity Score", value: 87, target: 90, unit: "%", trend: "+3.2%", status: "HEALTHY" as RiskLevel },
  { id: "kpi_2", name: "Goal Completion Rate", value: 78, target: 85, unit: "%", trend: "+5.1%", status: "WARNING" as RiskLevel },
  { id: "kpi_3", name: "Employee Engagement", value: 82, target: 80, unit: "%", trend: "+1.8%", status: "HEALTHY" as RiskLevel },
  { id: "kpi_4", name: "AI Adoption Rate", value: 64, target: 75, unit: "%", trend: "+12.4%", status: "WARNING" as RiskLevel },
  { id: "kpi_5", name: "Avg Goal Cycle Time", value: 18, target: 14, unit: "days", trend: "-2.1 days", status: "WARNING" as RiskLevel },
  { id: "kpi_6", name: "Risk Goals Resolved", value: 91, target: 95, unit: "%", trend: "+4.3%", status: "HEALTHY" as RiskLevel },
];

// ─── AI Chat Messages ─────────────────────────────────────────────────────────
export const aiChatHistory = [
  { id: "msg_1", role: "user" as const, content: "Improve our software testing process.", timestamp: "10:30 AM" },
  { id: "msg_2", role: "assistant" as const, content: "Here's a SMART goal suggestion:\n\n**\"Increase automated API test coverage from 60% to 90% by Q3 2026 to reduce production bugs by 40%.\"**\n\nKey KPIs:\n• Test coverage ≥ 90%\n• Zero critical regressions post-deploy\n• CI pipeline runtime < 8 minutes", timestamp: "10:30 AM" },
  { id: "msg_3", role: "user" as const, content: "What's the risk level for Engineering this week?", timestamp: "10:32 AM" },
  { id: "msg_4", role: "assistant" as const, content: "Engineering is currently at **HEALTHY** status overall, but I've flagged one concern:\n\n⚠️ **James Carter** has 2 CRITICAL goals with no progress update in 6 days. Confidence: 89%.\n\nRecommendation: Schedule a 1:1 check-in within 24 hours.", timestamp: "10:32 AM" },
];

// ─── Badges ───────────────────────────────────────────────────────────────────
export const badges = [
  { id: "badge_1", name: "Top Performer", description: "Ranked #1 in department for 2 consecutive weeks", icon: "trophy", color: "yellow", rarity: "LEGENDARY" },
  { id: "badge_2", name: "Consistency Champion", description: "Maintained a 14-day productivity streak", icon: "flame", color: "orange", rarity: "EPIC" },
  { id: "badge_3", name: "AI Productivity Master", description: "Used AI suggestions to complete 5 goals ahead of schedule", icon: "brain", color: "purple", rarity: "EPIC" },
  { id: "badge_4", name: "Weekly Winner", description: "Highest XP earner in a single week", icon: "star", color: "blue", rarity: "RARE" },
  { id: "badge_5", name: "Fast Approver", description: "Approved 10 goals within 24 hours of submission", icon: "zap", color: "green", rarity: "RARE" },
  { id: "badge_6", name: "Cloud Optimizer", description: "Reduced infrastructure costs by 20%+", icon: "cloud", color: "cyan", rarity: "EPIC" },
];

// ─── Challenges ───────────────────────────────────────────────────────────────
export const weeklyChallenges = [
  { id: "ch_1", title: "Goal Sprint", description: "Complete 2 goals this week", xpReward: 300, progress: 1, target: 2, deadline: "May 18, 2026", participants: 24 },
  { id: "ch_2", title: "AI Explorer", description: "Use AI suggestions for 3 goals", xpReward: 200, progress: 2, target: 3, deadline: "May 18, 2026", participants: 18 },
  { id: "ch_3", title: "Streak Master", description: "Maintain a 7-day streak", xpReward: 150, progress: 14, target: 7, deadline: "May 18, 2026", participants: 31, completed: true },
];
