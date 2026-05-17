"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, Users, BarChart3, AlertTriangle, Activity, Lock,
  Eye, Download, RefreshCw, TrendingUp, Database, Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { departments, auditLogs, securityEvents, orgKPIs, users as mockUsers } from "@/mock/data";
import { useDashboard } from "@/hooks/use-dashboard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const severityColor = {
  LOW:      "bg-green-500/15 text-green-500",
  MEDIUM:   "bg-blue-500/15 text-blue-500",
  HIGH:     "bg-orange-500/15 text-orange-500",
  CRITICAL: "bg-destructive/15 text-destructive",
};

const securitySeverityColor = {
  INFO:     "bg-blue-500/15 text-blue-500",
  WARNING:  "bg-yellow-500/15 text-yellow-500",
  MEDIUM:   "bg-orange-500/15 text-orange-500",
  CRITICAL: "bg-destructive/15 text-destructive",
};

export default function AdminDashboard() {
  const { kpis, users: liveUsers, departmentAnalytics, securityEvents: liveSecEvents,
          auditLogs: liveAuditLogs, orgKPIs: liveOrgKPIs, systemHealth,
          loading: dashLoading, refetch } = useDashboard();

  const displayUsers     = (liveUsers ?? mockUsers) as any[];
  const displayDepts     = (departmentAnalytics ?? departments) as any[];
  const displaySecurity  = (liveSecEvents ?? securityEvents) as any[];
  const displayAuditLogs = (liveAuditLogs ?? auditLogs) as any[];
  const displayOrgKPIs   = (liveOrgKPIs ?? orgKPIs) as any[];

  const deptData = displayDepts.map((d: any) => ({
    name: (d.name ?? "").slice(0, 4),
    productivity: d.productivity ?? d.avgProductivity ?? 0,
    goals: d.goalsDone ?? d.goalsCompleted ?? 0,
  }));

  const roleDistribution = [
    { name: "Employee",  value: displayUsers.filter((u: any) => u.role === "EMPLOYEE").length,  fill: "var(--chart-1)" },
    { name: "Manager",   value: displayUsers.filter((u: any) => u.role === "MANAGER").length,   fill: "var(--chart-2)" },
    { name: "Admin",     value: displayUsers.filter((u: any) => u.role === "ADMIN").length,     fill: "var(--chart-3)" },
    { name: "Executive", value: displayUsers.filter((u: any) => u.role === "EXECUTIVE").length, fill: "var(--chart-4)" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-content">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" /><span className="text-gradient inline-block">Admin Control Center</span>
          </h1>
          <p className="text-muted-foreground mt-1">Organization-wide analytics, user management & security</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={refetch} disabled={dashLoading}>
            <RefreshCw className={cn("h-3.5 w-3.5", dashLoading && "animate-spin")} /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* KPIs — from live admin dashboard API */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Users" value={dashLoading ? "…" : (kpis?.totalUsers ?? displayUsers.length)} subtitle="Across all roles" trend="+2 this month" trendUp icon={Users} iconColor="text-primary" iconBg="bg-primary/15" delay={0} />
        <KpiCard title="Org Productivity" value={dashLoading ? "…" : `${kpis?.organizationScore ?? 87}%`} subtitle="All departments" trend="+3.2% MoM" trendUp icon={TrendingUp} iconColor="text-green-500" iconBg="bg-green-500/15" delay={0.05} />
        <KpiCard title="Security Alerts" value={dashLoading ? "…" : (kpis?.securityAlerts ?? displaySecurity.filter((e: any) => e.severity === "CRITICAL" || e.severity === "WARNING").length)} subtitle="Requires review" trend={`${displaySecurity.filter((e: any) => e.severity === "CRITICAL").length} critical`} trendUp={false} icon={AlertTriangle} iconColor="text-destructive" iconBg="bg-destructive/15" delay={0.1} />
        <KpiCard title="Audit Events" value={dashLoading ? "…" : (kpis?.auditEvents ?? displayAuditLogs.length)} subtitle="Last 24 hours" trend="Normal range" icon={Activity} iconColor="text-blue-500" iconBg="bg-blue-500/15" delay={0.15} />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-muted/50 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="kpis">KPI Management</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Department Performance */}
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Department Performance</CardTitle>
                <CardDescription className="text-xs">Productivity scores by department</CardDescription>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} domain={[60, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }} />
                    <Bar dataKey="productivity" radius={[4, 4, 0, 0]}>
                      {deptData.map((entry, i) => (
                        <Cell key={i} fill={entry.productivity < 80 ? "var(--chart-3)" : "var(--primary)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Role Distribution */}
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">User Role Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {roleDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Status */}
            <Card className="glass lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Department Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {displayDepts.map((dept, i) => (
                    <motion.div
                      key={dept.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={cn(
                        "rounded-xl p-4 border",
                        dept.riskLevel === "HEALTHY" ? "border-green-500/20 bg-green-500/5" :
                        dept.riskLevel === "WARNING" ? "border-yellow-500/20 bg-yellow-500/5" :
                        "border-destructive/20 bg-destructive/5"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm">{dept.name}</p>
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          dept.riskLevel === "HEALTHY" ? "bg-green-500" :
                          dept.riskLevel === "WARNING" ? "bg-yellow-500 animate-pulse" : "bg-destructive animate-pulse"
                        )} />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Productivity</span>
                          <span className="font-medium">{dept.avgProductivity}%</span>
                        </div>
                        <Progress value={dept.avgProductivity} className="h-1" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{dept.headCount} members</span>
                          <span>{dept.goalsCompleted} goals done</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="mt-0">
          <Card className="glass">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">All Users</CardTitle>
                <Button size="sm" className="h-7 text-xs gap-1"><Users className="h-3 w-3" /> Add User</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">User</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Role</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Department</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">XP</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Level</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayUsers.map((user, i) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{user.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <Badge className={cn("text-[10px]",
                            user.role === "EXECUTIVE" ? "bg-purple-500/15 text-purple-500" :
                            user.role === "ADMIN" ? "bg-orange-500/15 text-orange-500" :
                            user.role === "MANAGER" ? "bg-green-500/15 text-green-500" :
                            "bg-blue-500/15 text-blue-500"
                          )}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">{user.department}</td>
                        <td className="px-5 py-3 text-sm font-medium">{user.xp.toLocaleString()}</td>
                        <td className="px-5 py-3 text-sm">{user.level}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6"><Eye className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6"><Lock className="h-3 w-3" /></Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs */}
        <TabsContent value="audit" className="mt-0">
          <Card className="glass">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Audit Log</CardTitle>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Download className="h-3 w-3" /> Export CSV</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Timestamp</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">User</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Action</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Target</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">IP</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayAuditLogs.map((log, i) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-5 py-3 text-xs text-muted-foreground font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-5 py-3 text-sm font-medium">{log.user}</td>
                        <td className="px-5 py-3">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{log.action}</code>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{log.target}</td>
                        <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{log.ip}</td>
                        <td className="px-5 py-3">
                          <Badge className={cn("text-[10px]", severityColor[log.severity as keyof typeof severityColor])}>
                            {log.severity}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-0">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Recent Security Events</h3>
              {displaySecurity.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={cn(
                    "bg-card rounded-xl border border-border p-4",
                    event.severity === "CRITICAL" && "border-destructive/30 bg-destructive/5",
                    event.severity === "WARNING" && "border-yellow-500/30 bg-yellow-500/5",
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        event.severity === "CRITICAL" ? "bg-destructive animate-pulse" :
                        event.severity === "WARNING" ? "bg-yellow-500" : "bg-blue-500"
                      )} />
                      <code className="text-xs font-mono font-semibold">{event.type}</code>
                    </div>
                    <Badge className={cn("text-[10px]", securitySeverityColor[event.severity as keyof typeof securitySeverityColor])}>
                      {event.severity}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{event.user}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="font-mono">{event.ip}</span>
                    <span>·</span>
                    <span>{event.location}</span>
                    <span>·</span>
                    <span>{event.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Security Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Active Sessions", value: "24", icon: Activity, color: "text-green-500", bg: "bg-green-500/15" },
                  { label: "Failed Logins (24h)", value: "3", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/15" },
                  { label: "MFA Enabled", value: "91%", icon: Shield, color: "text-primary", bg: "bg-primary/15" },
                  { label: "Threat Score", value: "Low", icon: Lock, color: "text-green-500", bg: "bg-green-500/15" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="bg-card rounded-xl border border-border p-4">
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-2", item.bg)}>
                        <Icon className={cn("h-4 w-4", item.color)} />
                      </div>
                      <p className="text-xl font-bold">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  );
                })}
              </div>

              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Login Activity (7 days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                      const base = auditLogs.length;
                      const multipliers = [1.0, 1.08, 0.92, 1.12, 1.04, 0.53, 0.38];
                      const val = Math.round(base * multipliers[i]);
                      const max = Math.round(base * 1.12);
                      const pct = Math.min(100, Math.round((val / max) * 100));
                      return (
                        <div key={day} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-6">{day}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: i * 0.05 }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* KPIs */}
        <TabsContent value="kpis" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayOrgKPIs.map((kpi, i) => (
              <motion.div
                key={kpi.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={cn(
                  "bg-card rounded-xl border border-border p-5",
                  kpi.status === "HEALTHY" ? "border-green-500/20" :
                  kpi.status === "WARNING" ? "border-yellow-500/20" : "border-destructive/20"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-semibold">{kpi.name}</p>
                  <div className={cn(
                    "h-2 w-2 rounded-full mt-1",
                    kpi.status === "HEALTHY" ? "bg-green-500" :
                    kpi.status === "WARNING" ? "bg-yellow-500 animate-pulse" : "bg-destructive animate-pulse"
                  )} />
                </div>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-bold">{kpi.value}</span>
                  <span className="text-sm text-muted-foreground mb-1">{kpi.unit}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Target: {kpi.target}{kpi.unit}</span>
                    <span className={cn(
                      "font-medium",
                      kpi.trend.startsWith("+") ? "text-green-500" : "text-destructive"
                    )}>{kpi.trend}</span>
                  </div>
                  <Progress value={(kpi.value / kpi.target) * 100} className="h-1.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
