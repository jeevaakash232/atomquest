"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Clock, Users, AlertCircle, TrendingUp,
  Filter, BarChart3, Flame, ChevronRight, Eye, MessageSquare, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { weeklyProductivity } from "@/mock/data";
import { updateGoalStatus, type Goal } from "@/services/api";
import { useDashboard } from "@/hooks/use-dashboard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend, CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

export default function ManagerDashboard() {
  const { kpis, pendingApprovals: livePending, memberPerformance, escalationAlerts,
          deptHeatmap, teamInsights, loading: dashLoading } = useDashboard();

  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);

  const pendingGoals = (livePending ?? []).filter(
    (g: any) => !approvedIds.includes(g.goalId ?? g.id) && !rejectedIds.includes(g.goalId ?? g.id)
  );

  const teamProductivity = memberPerformance ?? [];
  const teamMembers = memberPerformance ?? [];

  const handleApprove = async (goalId: string, userId: string) => {
    setApprovedIds((prev) => [...prev, goalId]);
    updateGoalStatus({ goalId, userId, status: "APPROVED" }).catch(console.error);
  };

  const handleReject = async (goalId: string, userId: string) => {
    setRejectedIds((prev) => [...prev, goalId]);
    updateGoalStatus({ goalId, userId, status: "REJECTED" }).catch(console.error);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-content">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><span className="text-gradient inline-block">Manager Overview</span></h1>
          <p className="text-muted-foreground mt-1">Engineering Team · {teamMembers.length} members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-3.5 w-3.5" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <BarChart3 className="h-3.5 w-3.5" /> Export Report
          </Button>
        </div>
      </motion.div>

      {/* KPIs — from live manager dashboard API */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Pending Approvals" value={dashLoading ? "…" : (kpis?.pendingApprovals ?? pendingGoals.length)} subtitle="Requires attention" trend={`${(livePending ?? []).filter((g: any) => g.priority === "HIGH" || g.priority === "CRITICAL").length} high priority`} trendUp={false} icon={Clock} iconColor="text-orange-500" iconBg="bg-orange-500/15" delay={0} />
        <KpiCard title="Team Productivity" value={dashLoading ? "…" : `${kpis?.teamProductivity ?? 88}%`} subtitle="Team average" trend="+4% from last month" trendUp icon={TrendingUp} iconColor="text-green-500" iconBg="bg-green-500/15" delay={0.05} />
        <KpiCard title="Goals at Risk" value={dashLoading ? "…" : (kpis?.atRiskGoals ?? 0)} subtitle="Needs attention" trend="Review required" trendUp={false} icon={AlertCircle} iconColor="text-destructive" iconBg="bg-destructive/15" delay={0.1} />
        <KpiCard title="Team Members" value={dashLoading ? "…" : (kpis?.teamSize ?? teamMembers.length)} subtitle="Active this week" trend={`${kpis?.teamSize ?? 0} members`} trendUp icon={Users} iconColor="text-primary" iconBg="bg-primary/15" delay={0.15} />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Left: Approvals + Team */}
        <div className="lg:col-span-4 space-y-5">
          <Tabs defaultValue="approvals">
            <TabsList className="bg-muted/50 mb-4">
              <TabsTrigger value="approvals">
                Approval Queue
                {pendingGoals.length > 0 && (
                  <span className="ml-2 h-4 w-4 rounded-full bg-destructive text-[9px] text-white flex items-center justify-center font-bold">
                    {pendingGoals.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="team">Team Members</TabsTrigger>
              <TabsTrigger value="heatmap">Dept Heatmap</TabsTrigger>
            </TabsList>

            <TabsContent value="approvals" className="mt-0 space-y-3">
              {dashLoading && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              <AnimatePresence>
                {pendingGoals.map((goal: any, i: number) => {
                  const employee = teamMembers.find((u: any) => (u.userId ?? u.id) === goal.userId);
                  return (
                    <motion.div
                      key={goal.goalId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="bg-card rounded-xl border border-border p-5"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                            {employee?.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <p className="font-semibold text-sm">{employee?.name}</p>
                              <p className="text-xs text-muted-foreground">{employee?.department}</p>
                            </div>
                            <Badge className={cn(
                              "text-[10px] shrink-0",
                              goal.priority === "CRITICAL" ? "bg-destructive/15 text-destructive border-destructive/20" :
                              goal.priority === "HIGH" ? "bg-orange-500/15 text-orange-500 border-orange-500/20" :
                              "bg-blue-500/15 text-blue-500 border-blue-500/20"
                            )}>
                              {goal.priority}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-2">{goal.title}</p>
                          {goal.kpis && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {goal.kpis.slice(0, 2).map((kpi: string) => (
                                <span key={kpi} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                  {kpi}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-[10px] text-muted-foreground mb-3">
                            Submitted {new Date(goal.createdAt).toLocaleDateString()} · Due {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 h-8 text-xs bg-green-500/15 text-green-500 hover:bg-green-500/25 border border-green-500/30"
                              onClick={() => handleApprove(goal.goalId, goal.userId)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => handleReject(goal.goalId, goal.userId)}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <MessageSquare className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {pendingGoals.length === 0 && !dashLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card rounded-xl border border-border p-10 text-center"
                >
                  <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                  <p className="font-semibold">All caught up!</p>
                  <p className="text-sm text-muted-foreground mt-1">No pending approvals.</p>
                </motion.div>
              )}

              {/* Approved/Rejected summary */}
              {(approvedIds.length > 0 || rejectedIds.length > 0) && (
                <div className="flex gap-3">
                  {approvedIds.length > 0 && (
                    <div className="flex-1 bg-card rounded-xl border border-border p-3 border-green-500/20 bg-green-500/5 text-center">
                      <p className="text-lg font-bold text-green-500">{approvedIds.length}</p>
                      <p className="text-xs text-muted-foreground">Approved</p>
                    </div>
                  )}
                  {rejectedIds.length > 0 && (
                    <div className="flex-1 bg-card rounded-xl border border-border p-3 border-destructive/20 bg-destructive/5 text-center">
                      <p className="text-lg font-bold text-destructive">{rejectedIds.length}</p>
                      <p className="text-xs text-muted-foreground">Rejected</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="team" className="mt-0 space-y-3">
              {teamMembers.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 card-hover"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">{member.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm">{member.name}</p>
                      <span className="text-xs font-bold text-primary">{member.xp.toLocaleString()} XP</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" />{member.streak}d streak</span>
                      <span>Level {member.level}</span>
                      {member.badges.length > 0 && (
                        <span className="flex items-center gap-1 text-yellow-500">
                          <CheckCircle2 className="h-3 w-3" />{member.badges.length} badges
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="heatmap" className="mt-0">
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Department Productivity Heatmap</CardTitle>
                  <CardDescription className="text-xs">8-week rolling average</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyProductivity} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} domain={[60, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Line type="monotone" dataKey="engineering" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="design" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="marketing" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="sales" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Charts + AI + Activity */}
        <div className="lg:col-span-3 space-y-5">
          {/* Team Productivity Bar */}
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Team Productivity Scores</CardTitle>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamProductivity} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} domain={[60, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }} />
                  <Bar dataKey="productivity" radius={[4, 4, 0, 0]}>
                    {teamProductivity.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.productivity < 75 ? "var(--destructive)" : entry.productivity >= 90 ? "var(--chart-2)" : "var(--primary)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* AI Risk Insights */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">AI Risk Predictions</h3>
            {(teamInsights ?? []).slice(0, 3).map((insight: any, i: number) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className={cn(
                  "bg-card rounded-xl border border-border p-4",
                  insight.riskLevel === "CRITICAL" && "border-destructive/30 bg-destructive/5",
                  insight.riskLevel === "WARNING" && "border-yellow-500/30 bg-yellow-500/5",
                  insight.riskLevel === "HEALTHY" && "border-green-500/20 bg-green-500/5",
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      insight.riskLevel === "CRITICAL" ? "bg-destructive animate-pulse" :
                      insight.riskLevel === "WARNING" ? "bg-yellow-500" : "bg-green-500"
                    )} />
                    <span className="text-xs font-semibold">{insight.title}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{insight.confidence}%</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.content}</p>
              </motion.div>
            ))}
          </div>

          {/* Activity */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold mb-3">Team Activity</h3>
            <ActivityFeed limit={4} />
          </div>
        </div>
      </div>
    </div>
  );
}
