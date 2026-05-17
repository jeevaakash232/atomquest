"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Target, Users, Zap, Globe,
  ArrowUpRight, ArrowDownRight, Sparkles, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { departments, orgKPIs, goalCompletionTrend, weeklyProductivity } from "@/mock/data";
import { generateExecutiveSummary } from "@/services/api";
import { useDashboard } from "@/hooks/use-dashboard";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export default function ExecutiveDashboard() {
  const { kpis, departmentComparison, strategicRisks, forecasting: liveForecasting,
          executiveKPIs, executiveInsights, loading: dashLoading } = useDashboard();

  // Use live data from executive service, fall back to computed mock
  const displayDepts = (departmentComparison ?? departments.map((d) => ({
    name: d.name, productivity: d.avgProductivity, headCount: d.headCount,
    goalsCompleted: d.goalsCompleted, goalsActive: d.goalsActive, riskLevel: d.riskLevel,
    efficiency: Math.round((d.goalsCompleted / (d.goalsCompleted + d.goalsActive)) * 100),
  }))) as any[];

  const orgProductivity    = kpis?.organizationScore ?? Math.round(departments.reduce((a, d) => a + d.avgProductivity, 0) / departments.length);
  const liveGoalsCompleted = kpis?.totalGoalsCompleted ?? departments.reduce((a, d) => a + d.goalsCompleted, 0);
  const liveGoalsActive    = kpis?.totalGoalsActive ?? departments.reduce((a, d) => a + d.goalsActive, 0);
  const aiAdoptionRate     = kpis?.aiAdoptionRate ?? 64;
  const healthyDepts       = kpis?.healthyDepartments ?? displayDepts.filter((d: any) => d.riskLevel === "HEALTHY").length;

  const forecastData = liveForecasting ?? [
    { month: "Jun", actual: orgProductivity,       forecast: orgProductivity },
    { month: "Jul", actual: null,                  forecast: Math.min(100, orgProductivity + 2) },
    { month: "Aug", actual: null,                  forecast: Math.min(100, orgProductivity + 4) },
    { month: "Sep", actual: null,                  forecast: Math.min(100, orgProductivity + 3) },
    { month: "Oct", actual: null,                  forecast: Math.min(100, orgProductivity + 6) },
    { month: "Nov", actual: null,                  forecast: Math.min(100, orgProductivity + 8) },
  ];

  const displayOrgKPIs = (executiveKPIs ?? orgKPIs) as any[];
  const displayInsights = (executiveInsights ?? []) as any[];

  const [aiSummary, setAiSummary] = useState<{
    headline: string; body: string; strengths: string[];
    watchItems: string[]; opportunities: string[]; forecast: string;
  } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const fetchAiSummary = async () => {
    setLoadingSummary(true);
    setSummaryError("");
    try {
      const result = await generateExecutiveSummary({
        orgProductivity,
        departments: displayDepts.map((d: any) => ({
          name: d.name,
          productivity: d.productivity ?? d.avgProductivity,
          riskLevel: d.riskLevel,
        })),
        totalGoalsCompleted: liveGoalsCompleted,
        totalGoalsActive: liveGoalsActive,
        aiAdoptionRate,
        period: "Q2 2026",
      });
      setAiSummary(result);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setLoadingSummary(false);
    }
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
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-purple-500/15 text-purple-500 border-purple-500/20 text-xs">Executive View</Badge>
            <Badge className="bg-green-500/15 text-green-500 border-green-500/20 text-xs">Q2 2026</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient inline-block">Executive Intelligence</span>
          </h1>
          <p className="text-muted-foreground mt-1">Organization-wide performance · AI-powered forecasting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Summary
          </Button>
          <Button size="sm" className="gap-2">
            <BarChart3 className="h-3.5 w-3.5" /> Full Report
          </Button>
        </div>
      </motion.div>

      {/* Executive KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Org Productivity" value={`${orgProductivity}%`} subtitle="All departments" trend="+3.2% MoM" trendUp icon={TrendingUp} iconColor="text-green-500" iconBg="bg-green-500/15" delay={0} gradient />
        <KpiCard title="Goals Completed" value={liveGoalsCompleted} subtitle="Across org" trend="+18% QoQ" trendUp icon={Target} iconColor="text-primary" iconBg="bg-primary/15" delay={0.05} />
        <KpiCard title="Healthy Depts" value={`${healthyDepts}/${departments.length}`} subtitle="Risk-free" trend="1 warning" icon={Globe} iconColor="text-blue-500" iconBg="bg-blue-500/15" delay={0.1} />
        <KpiCard title="AI Adoption" value={`${aiAdoptionRate}%`} subtitle="Platform-wide" trend="+12.4% MoM" trendUp icon={Zap} iconColor="text-purple-500" iconBg="bg-purple-500/15" delay={0.15} />
      </div>

      {/* AI Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6 bg-gradient-to-r from-primary/8 via-transparent to-purple-500/5 border-primary/20"
      >
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 glow-sm">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-bold">AI Executive Summary</h3>
              <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px]">
                Mistral · Q2 2026
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto h-7 text-xs gap-1.5"
                onClick={fetchAiSummary}
                disabled={loadingSummary}
              >
                {loadingSummary
                  ? <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
                  : <><Sparkles className="h-3 w-3" /> Generate with AI</>}
              </Button>
            </div>

            {summaryError && (
              <p className="text-xs text-destructive mb-2">⚠️ {summaryError}</p>
            )}

            {aiSummary ? (
              <div className="space-y-3">
                <p className="font-semibold text-sm">{aiSummary.headline}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{aiSummary.body}</p>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-green-500 mb-1">Strengths</p>
                    {aiSummary.strengths.map((s) => (
                      <p key={s} className="text-xs text-muted-foreground">• {s}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-yellow-500 mb-1">Watch</p>
                    {aiSummary.watchItems.map((w) => (
                      <p key={w} className="text-xs text-muted-foreground">• {w}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">Opportunities</p>
                    {aiSummary.opportunities.map((o) => (
                      <p key={o} className="text-xs text-muted-foreground">• {o}</p>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                  <span className="font-medium text-foreground">Forecast: </span>{aiSummary.forecast}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                AtomQuest is performing at{" "}
                <span className="text-foreground font-semibold">{orgProductivity}% organizational productivity</span>, up 3.2% month-over-month.
                Engineering and Design are leading with 88% and 92% respectively.{" "}
                <span className="text-green-500 font-medium">Click &ldquo;Generate with AI&rdquo; for a live AI analysis.</span>
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Goal Completion Trend */}
        <Card className="glass lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Goal Completion Trend</CardTitle>
            <CardDescription className="text-xs">Submitted vs Approved vs Completed</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={goalCompletionTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area type="monotone" dataKey="completed" stroke="var(--chart-2)" fill="url(#completedGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="approved" stroke="var(--primary)" fill="url(#approvedGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* KPI Score Gauge */}
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Overall KPI Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="90%"
                  data={[{ name: "Score", value: 87, fill: "var(--primary)" }]}
                  startAngle={90} endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "var(--muted)" }} />
                  <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-bold" style={{ fontSize: "24px" }}>87%</text>
                  <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "11px", fill: "var(--muted-foreground)" }}>Org Score</text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {displayOrgKPIs.slice(0, 3).map((kpi) => (
                <div key={kpi.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate mr-2">{kpi.name.split(" ").slice(0, 2).join(" ")}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{kpi.value}{kpi.unit}</span>
                    {kpi.trend.startsWith("+") ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast + Dept Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Forecast */}
        <Card className="glass">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Performance Forecast</CardTitle>
                <CardDescription className="text-xs">AI-predicted trajectory through Q4</CardDescription>
              </div>
              <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px]">
                <Sparkles className="h-2.5 w-2.5 mr-1" /> AI Forecast
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} domain={[80, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="actual" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: "var(--primary)", r: 4 }} connectNulls={false} name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke="var(--chart-4)" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Forecast" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Efficiency */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Department Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayDepts.map((dept, i) => {
              const efficiency = Math.round((dept.goalsCompleted / (dept.goalsCompleted + dept.goalsActive)) * 100);
              return (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{dept.name}</span>
                      <span className="text-xs text-muted-foreground">{dept.headCount} people</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{efficiency}%</span>
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        dept.riskLevel === "HEALTHY" ? "bg-green-500" :
                        dept.riskLevel === "WARNING" ? "bg-yellow-500" : "bg-destructive"
                      )} />
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${efficiency}%` }}
                      transition={{ duration: 0.7, delay: 0.3 + i * 0.06 }}
                      className={cn(
                        "h-full rounded-full",
                        efficiency >= 80 ? "bg-green-500" : efficiency >= 65 ? "bg-primary" : "bg-yellow-500"
                      )}
                    />
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* AI Risk Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {displayInsights.map((insight, i) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.07 }}
            className={cn(
              "bg-card rounded-xl border border-border p-4 card-hover",
              insight.riskLevel === "CRITICAL" && "border-destructive/30",
              insight.riskLevel === "WARNING" && "border-yellow-500/30",
              insight.riskLevel === "HEALTHY" && "border-green-500/20",
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge className={cn("text-[10px]",
                insight.type === "RISK" ? "bg-destructive/15 text-destructive" :
                insight.type === "TREND" ? "bg-green-500/15 text-green-500" :
                insight.type === "ACHIEVEMENT" ? "bg-yellow-500/15 text-yellow-600" :
                "bg-blue-500/15 text-blue-500"
              )}>
                {insight.type}
              </Badge>
              <span className="text-[10px] text-muted-foreground">{insight.confidence}% confidence</span>
            </div>
            <p className="text-xs font-semibold mb-1">{insight.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{insight.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
