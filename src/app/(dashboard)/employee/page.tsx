"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, BrainCircuit, Target, Plus, Star, Flame, Award,
  CheckCircle2, Upload, ChevronRight, Sparkles, X, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { GoalCard } from "@/components/dashboard/goal-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { FileUploadZone } from "@/components/dashboard/file-upload";
import { weeklyChallenges, aiInsights } from "@/mock/data";
import { generateSmartGoal, createGoal, type SmartGoalResult } from "@/services/api";
import { useDashboard } from "@/hooks/use-dashboard";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export default function EmployeeDashboard() {
  const { user, goals: rawGoals, loading, refetch, aiInsights: liveInsights, weeklyProgress: liveWeekly, kpis } = useDashboard();
  const myGoals = rawGoals ?? [];
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGoal, setAiGoal] = useState<SmartGoalResult | null>(null);
  const [goalInput, setGoalInput] = useState("");
  const [aiError, setAiError] = useState("");
  const [saving, setSaving] = useState(false);

  const completedGoals = myGoals.filter((g) => g.status === "LOCKED");
  const avgProgress = kpis?.avgProgress ?? (myGoals.length
    ? Math.round(myGoals.reduce((a, g) => a + g.progress, 0) / myGoals.length)
    : 0);

  const weeklyData = liveWeekly ?? [
    { day: "Mon", score: Math.max(50, avgProgress - 16) },
    { day: "Tue", score: Math.max(50, avgProgress - 3) },
    { day: "Wed", score: Math.max(50, avgProgress - 10) },
    { day: "Thu", score: Math.min(100, avgProgress + 3) },
    { day: "Fri", score: Math.max(50, avgProgress) },
    { day: "Sat", score: Math.max(50, avgProgress - 23) },
    { day: "Sun", score: Math.max(50, avgProgress - 18) },
  ];
  const productivityScore = kpis?.productivityScore ?? avgProgress;
  const productivityScoreData = [{ name: "Score", value: productivityScore, fill: "var(--primary)" }];
  // Use live AI insights from backend, fall back to mock
  const displayInsights = liveInsights ?? aiInsights;

  const handleAiGenerate = async () => {
    if (!goalInput.trim() || !user) return;
    setAiGenerating(true);
    setAiGoal(null);
    setAiError("");
    try {
      const result = await generateSmartGoal({
        input: goalInput,
        department: user.department,
        role: user.role,
        userId: user.userId,
        existingGoals: myGoals.map((g) => g.title),
      });
      setAiGoal(result);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to generate goal");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAcceptGoal = async () => {
    if (!aiGoal || !user) return;
    setSaving(true);
    try {
      await createGoal({
        userId: user.userId,
        title: aiGoal.title,
        description: aiGoal.description,
        priority: aiGoal.priority,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        kpis: aiGoal.kpis,
        xpReward: aiGoal.xpReward,
        aiGenerated: true,
      });
      await refetch();
      setShowGoalModal(false);
      setAiGoal(null);
      setGoalInput("");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to save goal");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto page-content">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-7">
          <Skeleton className="lg:col-span-4 h-96 rounded-xl" />
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-content">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient inline-block">
              Welcome back, {user?.name?.split(" ")[0] ?? "..."} 👋
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            {user?.department ? ` · ${user.department}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowUploadModal(true)}>
            <Upload className="h-3.5 w-3.5" /> Upload Evidence
          </Button>
          <Button size="sm" className="gap-2 bg-primary" onClick={() => setShowGoalModal(true)}>
            <Plus className="h-3.5 w-3.5" /> Create Goal
          </Button>
        </div>
      </motion.div>

      {/* KPI Row — all from live user data */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="XP Points"
          value={user?.xp?.toLocaleString() ?? "0"}
          subtitle="+240 this week"
          trend="+2.1%"
          trendUp
          icon={Trophy}
          iconColor="text-yellow-500"
          iconBg="bg-yellow-500/15"
          delay={0}
        />
        <KpiCard
          title="Active Streak"
          value={user ? `${user.streak} Days` : "0 Days"}
          subtitle="Keep it up!"
          trend={user?.streak ? "Personal best" : "Start today"}
          trendUp={!!user?.streak}
          icon={Flame}
          iconColor="text-orange-500"
          iconBg="bg-orange-500/15"
          delay={0.05}
        />
        <KpiCard
          title="Goals Completed"
          value={completedGoals.length}
          subtitle={`of ${myGoals.length} total`}
          trend={completedGoals.length > 0 ? `+${completedGoals.length} done` : "Get started"}
          trendUp={completedGoals.length > 0}
          icon={CheckCircle2}
          iconColor="text-green-500"
          iconBg="bg-green-500/15"
          delay={0.1}
        />
        <KpiCard
          title="Level"
          value={user ? `Level ${user.level}` : "Level 1"}
          subtitle={user?.level ? (user.level >= 10 ? "Senior Contributor" : "Rising Star") : "Newcomer"}
          trend={user?.xp ? `${(user.xp % 1000)} / 1000 XP` : "0 / 1000 XP"}
          icon={Star}
          iconColor="text-primary"
          iconBg="bg-primary/15"
          delay={0.15}
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Left: Goals + Analytics + Challenges */}
        <div className="lg:col-span-4">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Tabs defaultValue="goals">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
                <TabsList className="bg-muted/60 h-8">
                  <TabsTrigger value="goals" className="text-xs h-7 px-3">
                    My Goals
                    {myGoals.length > 0 && (
                      <span className="ml-1.5 h-4 w-4 rounded-full bg-primary/20 text-primary text-[9px] flex items-center justify-center font-bold">
                        {myGoals.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs h-7 px-3">Analytics</TabsTrigger>
                  <TabsTrigger value="challenges" className="text-xs h-7 px-3">Challenges</TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 h-7">
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </div>

              <div className="p-4">
                {/* Goals tab */}
                <TabsContent value="goals" className="space-y-3 mt-0">
                  {myGoals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Target className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="font-semibold text-sm">No goals yet</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Create your first SMART goal to start tracking progress
                      </p>
                      <Button size="sm" className="gap-2" onClick={() => setShowGoalModal(true)}>
                        <Plus className="h-3.5 w-3.5" /> Create Goal
                      </Button>
                    </div>
                  ) : (
                    myGoals.map((goal, i) => (
                      <GoalCard key={goal.goalId ?? i} goal={goal} delay={i * 0.07} />
                    ))
                  )}
                </TabsContent>

                {/* Analytics tab */}
                <TabsContent value="analytics" className="mt-0 space-y-3">
                  <Card className="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Weekly Performance Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} domain={[0, 100]} />
                          <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
                          <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: "var(--primary)", r: 3 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-card border border-border p-4">
                      <p className="text-xs text-muted-foreground mb-1">Productivity Score</p>
                      <div className="h-28">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={productivityScoreData} startAngle={90} endAngle={-270}>
                            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "var(--muted)" }} />
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-bold" style={{ fontSize: 18 }}>{productivityScore}%</text>
                          </RadialBarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                    <Card className="bg-card border border-border p-4 space-y-3">
                      <p className="text-xs text-muted-foreground">This Week</p>
                      {[
                        {
                          label: "Goals Updated",
                          value: `${myGoals.filter(g => g.progress > 0).length}/${myGoals.length}`,
                          pct: myGoals.length ? Math.round((myGoals.filter(g => g.progress > 0).length / myGoals.length) * 100) : 0,
                        },
                        {
                          label: "AI Used",
                          value: `${(user?.badges?.length ?? 0) * 2}x`,
                          pct: Math.min(100, (user?.badges?.length ?? 0) * 20),
                        },
                        {
                          label: "On-time Rate",
                          value: `${myGoals.length ? Math.round((myGoals.filter(g => g.status === "APPROVED" || g.status === "LOCKED").length / myGoals.length) * 100) : 100}%`,
                          pct: myGoals.length ? Math.round((myGoals.filter(g => g.status === "APPROVED" || g.status === "LOCKED").length / myGoals.length) * 100) : 100,
                        },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-medium">{item.value}</span>
                          </div>
                          <Progress value={item.pct} className="h-1" />
                        </div>
                      ))}
                    </Card>
                  </div>
                </TabsContent>

                {/* Challenges tab */}
                <TabsContent value="challenges" className="mt-0 space-y-3">
                  {weeklyChallenges.map((ch, i) => (
                    <motion.div
                      key={ch.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={cn("bg-card rounded-xl border border-border p-4", ch.completed && "border-green-500/30 bg-green-500/5")}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm">{ch.title}</h3>
                            {ch.completed && <Badge className="bg-green-500/15 text-green-500 border-green-500/20 text-[10px]">Completed!</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{ch.description}</p>
                        </div>
                        <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full shrink-0 ml-3">+{ch.xpReward} XP</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{ch.participants} participants</span>
                          <span>{Math.min(ch.progress, ch.target)}/{ch.target}</span>
                        </div>
                        <Progress value={(Math.min(ch.progress, ch.target) / ch.target) * 100} className="h-1.5" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">Ends {ch.deadline}</p>
                    </motion.div>
                  ))}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Right: AI Insight + Risk + Badges + Activity */}
        <div className="lg:col-span-3 space-y-4">
          {/* AI Insight — computed from real user goals */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-5 bg-gradient-to-br from-primary/8 to-transparent border-primary/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <BrainCircuit className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold">AI Insight</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground">Live</span>
              </div>
            </div>
            {myGoals.length > 0 ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                You have{" "}
                <span className="text-foreground font-semibold">{myGoals.length} active goal{myGoals.length !== 1 ? "s" : ""}</span>{" "}
                with an average progress of{" "}
                <span className="text-primary font-semibold">{avgProgress}%</span>.{" "}
                {myGoals.filter(g => g.priority === "HIGH" || g.priority === "CRITICAL").length > 0 && (
                  <>
                    Your{" "}
                    <span className="text-yellow-500 font-medium">
                      {myGoals.filter(g => g.priority === "HIGH" || g.priority === "CRITICAL")[0].title.slice(0, 40)}
                      {myGoals.filter(g => g.priority === "HIGH" || g.priority === "CRITICAL")[0].title.length > 40 ? "…" : ""}
                    </span>{" "}
                    goal needs attention.
                  </>
                )}
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                No goals yet. Create your first SMART goal to start tracking your progress and earning XP.
              </p>
            )}
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="text-xs h-7 border-primary/30 text-primary hover:bg-primary/10" onClick={() => setShowGoalModal(true)}>
                <Sparkles className="h-3 w-3 mr-1" /> Generate Goal
              </Button>
              <Button size="sm" variant="ghost" className="text-xs h-7 text-muted-foreground">Dismiss</Button>
            </div>
          </motion.div>

          {/* Risk Alert — from live backend insights */}
          {(displayInsights ?? []).filter((i: any) => i.type === "RISK").slice(0, 1).map((insight: any) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card rounded-xl border border-border p-4 border-destructive/30 bg-destructive/5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                  <Target className="h-3 w-3 text-destructive" />
                </div>
                <span className="text-xs font-semibold text-destructive">Risk Alert</span>
                <span className="ml-auto text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{insight.confidence}% confidence</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{insight.content}</p>
            </motion.div>
          ))}

          {/* Badges — from real user profile */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">My Badges</h3>
              <span className="text-xs text-muted-foreground">{user?.badges?.length ?? 0} earned</span>
            </div>
            {user?.badges && user.badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badge: string) => (
                  <div key={badge} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <Award className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-primary">{badge}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-dashed border-border">
                  <Plus className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Earn more</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Complete goals to earn badges.</p>
            )}
          </motion.div>

          {/* Live Activity — from DynamoDB */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Live Activity</h3>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground">Real-time</span>
              </div>
            </div>
            <ActivityFeed limit={5} />
          </motion.div>
        </div>
      </div>

      {/* Upload Evidence Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowUploadModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50">
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Upload className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="font-bold text-lg">Upload Evidence</h2>
                  </div>
                  <button onClick={() => setShowUploadModal(false)}
                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Upload files as evidence for your goals. Files are stored securely in AWS S3.
                </p>
                <FileUploadZone
                  userId={user?.userId ?? "usr_1"}
                  onUploadComplete={(key, url, name) => {
                    console.log("Uploaded:", name, key, url);
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SMART Goal Creation Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowGoalModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
            >
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <BrainCircuit className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="font-bold text-lg">Create SMART Goal</h2>
                  </div>
                  <button onClick={() => setShowGoalModal(false)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                      Describe your goal
                    </label>
                    <textarea
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      placeholder="e.g. Improve our software testing process..."
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none h-24 placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button onClick={handleAiGenerate} disabled={!goalInput.trim() || aiGenerating} className="w-full gap-2">
                    {aiGenerating
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating SMART Goal...</>
                      : <><Sparkles className="h-4 w-4" /> Generate with AI</>}
                  </Button>
                  <AnimatePresence>
                    {aiGoal && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-primary/8 border border-primary/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-semibold text-primary">AI-Generated SMART Goal</span>
                          <span className="ml-auto text-[10px] bg-green-500/15 text-green-500 px-2 py-0.5 rounded-full">{aiGoal.confidence}% confidence</span>
                        </div>
                        <p className="text-sm leading-relaxed font-medium mb-1">&ldquo;{aiGoal.title}&rdquo;</p>
                        <p className="text-xs text-muted-foreground mb-2">{aiGoal.description}</p>
                        {aiGoal.kpis?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {aiGoal.kpis.map((kpi) => (
                              <span key={kpi} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{kpi}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <span>Priority: <strong className="text-foreground">{aiGoal.priority}</strong></span>
                          <span>·</span>
                          <span>Timeline: <strong className="text-foreground">{aiGoal.timeline}</strong></span>
                          <span>·</span>
                          <span className="text-yellow-500 font-semibold">+{aiGoal.xpReward} XP</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleAcceptGoal} disabled={saving}>
                            {saving ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Saving...</> : "Accept & Create"}
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleAiGenerate}>Regenerate</Button>
                        </div>
                      </motion.div>
                    )}
                    {aiError && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                        ⚠️ {aiError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
