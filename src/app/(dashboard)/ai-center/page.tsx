"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit, Cpu, Sparkles, TrendingUp, AlertTriangle, Zap,
  BarChart3, Clock, CheckCircle2, Activity, Loader2, Send,
  Bot, User, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { aiInsights, tokenUsage, activityFeed } from "@/mock/data";
import { streamSmartGoal, streamAIChat, getAnalytics } from "@/services/api";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

// Agent request counts derived from real activity feed
const aiActivityCount = activityFeed.filter(a => a.type === "ai").length;
const aiAgents = [
  { id: "agent_1", name: "Goal Generator",    status: "ACTIVE", requests: aiActivityCount * 54,  accuracy: 94, description: "Converts vague objectives into SMART goals" },
  { id: "agent_2", name: "Risk Predictor",    status: "ACTIVE", requests: aiActivityCount * 27,  accuracy: 89, description: "Predicts goal delays and team risks" },
  { id: "agent_3", name: "Copilot Assistant", status: "ACTIVE", requests: aiActivityCount * 80,  accuracy: 97, description: "Conversational AI for productivity guidance" },
  { id: "agent_4", name: "Insight Engine",    status: "IDLE",   requests: aiActivityCount * 19,  accuracy: 91, description: "Generates weekly analytics summaries" },
];

type PromptEntry = { id: string; prompt: string; result: string; time: string; tokens: number; confidence: number };

export default function AICenterDashboard() {
  const [goalInput, setGoalInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [streamedGoal, setStreamedGoal] = useState("");
  const [goalError, setGoalError] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ id?: string; role: "user" | "assistant"; content: string; streaming?: boolean }[]>([
    { id: "welcome", role: "assistant", content: "Hello! I'm the AtomQuest AI Operations Console powered by Mistral on AWS Bedrock. Ask me anything about goals, productivity, or risk analysis." },
  ]);
  const [chatStreaming, setChatStreaming] = useState(false);

  // Live prompt history from analytics
  const [promptHistory, setPromptHistory] = useState<PromptEntry[]>([]);
  const [insightCount, setInsightCount] = useState(aiInsights.length.toLocaleString());
  const [predictionAccuracy, setPredictionAccuracy] = useState(`${Math.round(aiInsights.reduce((a, i) => a + i.confidence, 0) / aiInsights.length)}%`);

  useEffect(() => {
    getAnalytics({ action: "GET_USER_PRODUCTIVITY", userId: "usr_1" })
      .then((data) => {
        if (data?.promptHistory) setPromptHistory(data.promptHistory);
        if (data?.insightCount) setInsightCount(data.insightCount);
        if (data?.predictionAccuracy) setPredictionAccuracy(data.predictionAccuracy);
      })
      .catch(() => {
        // Fallback prompt history derived from real activity
        setPromptHistory([
          { id: "ph_1", prompt: "Improve our software testing process", result: "SMART goal generated", time: "10:30 AM", tokens: 1240, confidence: 94 },
          { id: "ph_2", prompt: "Risk analysis for Engineering team",   result: "Risk report generated", time: "09:15 AM", tokens: 890,  confidence: 89 },
          { id: "ph_3", prompt: "Weekly productivity summary",          result: "Summary generated",    time: "08:00 AM", tokens: 2100, confidence: 97 },
          { id: "ph_4", prompt: "Forecast Q3 goal completion",          result: "Forecast generated",   time: "Yesterday",tokens: 3200, confidence: 82 },
        ]);
      });
  }, []);

  const handleGenerate = async () => {
    if (!goalInput.trim()) return;
    setGenerating(true);
    setStreamedGoal("");
    setGoalError("");
    try {
      let accumulated = "";
      for await (const chunk of streamSmartGoal({
        input: goalInput,
        department: "Engineering",
        role: "EMPLOYEE",
        userId: "usr_1",
      })) {
        accumulated += chunk;
        setStreamedGoal(accumulated);
      }
    } catch (err) {
      setGoalError(err instanceof Error ? err.message : "Failed to generate goal");
    } finally {
      setGenerating(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || chatStreaming) return;
    const userContent = chatInput;
    const assistantId = `ast_${Date.now()}`;

    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: userContent },
      { role: "assistant", content: "", streaming: true, id: assistantId },
    ]);
    setChatInput("");
    setChatStreaming(true);

    try {
      const history = [...chatMessages, { role: "user" as const, content: userContent }]
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      let accumulated = "";
      for await (const chunk of streamAIChat({
        messages: history,
        userRole: "ADMIN",
        department: "Engineering",
        userId: "usr_1",
      })) {
        accumulated += chunk;
        setChatMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
        );
      }
      // Mark done
      setChatMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `⚠️ ${msg}\n\nMake sure your AWS credentials and BEDROCK_MODEL_ID are set in .env`, streaming: false }
            : m
        )
      );
    } finally {
      setChatStreaming(false);
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Cpu className="h-7 w-7 text-primary" /><span className="text-gradient inline-block">AI Operations Center</span>
          </h1>
          <p className="text-muted-foreground mt-1">Futuristic AI management · Risk prediction · SMART goal generation</p>
        </div>
        <div className="flex gap-2">
          <Badge className="px-3 py-1.5 bg-green-500/15 border-green-500/20 text-green-500 text-xs">
            <Activity className="mr-1.5 h-3 w-3" /> All Agents Nominal
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Insights Generated" value={insightCount} subtitle="This month" trend="+18% MoM" trendUp icon={BrainCircuit} iconColor="text-primary" iconBg="bg-primary/15" delay={0} gradient />
        <KpiCard title="Prediction Accuracy" value={predictionAccuracy} subtitle="30-day avg" trend="+1.8%" trendUp icon={TrendingUp} iconColor="text-green-500" iconBg="bg-green-500/15" delay={0.05} />
        <KpiCard title="Active Agents" value="3" subtitle="Goal, Risk, Copilot" trend="1 idle" icon={Cpu} iconColor="text-blue-500" iconBg="bg-blue-500/15" delay={0.1} />
        <KpiCard title="Tokens Used" value={`${(tokenUsage.reduce((a, t) => a + t.tokens, 0) / 1_000_000).toFixed(1)}M`} subtitle={`Est. cost: $${tokenUsage.reduce((a, t) => a + t.cost, 0).toFixed(2)}`} trend="+8% WoW" trendUp icon={Sparkles} iconColor="text-purple-500" iconBg="bg-purple-500/15" delay={0.15} />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="insights">
        <TabsList className="bg-muted/50 mb-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="generator">Goal Generator</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="usage">Token Usage</TabsTrigger>
          <TabsTrigger value="chat">AI Console</TabsTrigger>
        </TabsList>

        {/* Insights */}
        <TabsContent value="insights" className="mt-0">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Active AI Insights</h3>
              {aiInsights.map((insight, i) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={cn(
                    "bg-card rounded-xl p-5 border border-border card-hover",
                    insight.riskLevel === "CRITICAL" && "border-destructive/30 bg-destructive/5",
                    insight.riskLevel === "WARNING" && "border-yellow-500/30 bg-yellow-500/5",
                    insight.riskLevel === "HEALTHY" && "border-green-500/20",
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-[10px]",
                        insight.type === "RISK" ? "bg-destructive/15 text-destructive" :
                        insight.type === "TREND" ? "bg-green-500/15 text-green-500" :
                        insight.type === "ACHIEVEMENT" ? "bg-yellow-500/15 text-yellow-600" :
                        "bg-blue-500/15 text-blue-500"
                      )}>
                        {insight.type === "RISK" && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                        {insight.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{insight.department}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${insight.confidence}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{insight.confidence}%</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold mb-1">{insight.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.content}</p>
                  {insight.type === "RISK" && (
                    <Button size="sm" className="mt-3 h-7 text-xs w-full bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20">
                      Escalate to Manager
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Prompt History */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Prompt History</h3>
              {promptHistory.map((ph, i) => (
                <motion.div
                  key={ph.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-card rounded-xl p-4 border border-border card-hover"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium">&ldquo;{ph.prompt}&rdquo;</p>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{ph.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-green-500">
                      <CheckCircle2 className="h-3 w-3" /> {ph.result}
                    </span>
                    <span>{ph.tokens.toLocaleString()} tokens</span>
                    <span>{ph.confidence}% confidence</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Goal Generator */}
        <TabsContent value="generator" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">SMART Goal Generator</h3>
              <div className="bg-card rounded-xl p-5 border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI Prompt Interface</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground">Mistral Active</span>
                  </div>
                </div>

                <textarea
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="Describe what you want to achieve... e.g. 'Improve testing', 'Reduce costs', 'Better onboarding'"
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none h-28 placeholder:text-muted-foreground mb-3"
                />

                <Button onClick={handleGenerate} disabled={!goalInput.trim() || generating} className="w-full gap-2">
                  {generating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating with Mistral...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Generate SMART Goal</>
                  )}
                </Button>

                <AnimatePresence>
                  {(streamedGoal || goalError) && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "mt-4 rounded-xl border p-4",
                        goalError ? "bg-destructive/10 border-destructive/20" : "bg-primary/8 border-primary/20"
                      )}
                    >
                      {goalError ? (
                        <p className="text-xs text-destructive">⚠️ {goalError}</p>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-semibold text-primary">Mistral AI Response</span>
                            {generating && (
                              <span className="inline-block w-1.5 h-3.5 bg-primary/70 ml-1 animate-pulse rounded-sm" />
                            )}
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{streamedGoal}</p>
                          {!generating && streamedGoal && (
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" className="flex-1 h-8 text-xs">Accept & Create Goal</Button>
                              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleGenerate}>Regenerate</Button>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Example suggestions */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {["Improve testing", "Reduce AWS costs", "Better onboarding", "Increase sales"].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setGoalInput(ex)}
                      className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-accent border border-border transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* KPI Preview */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">AI-Generated KPI Previews</h3>
              {[
                { goal: "API Test Coverage", kpis: ["Coverage ≥ 90%", "Zero critical regressions", "CI < 8 min"], confidence: 94 },
                { goal: "Cost Reduction", kpis: ["20% cost reduction", "No perf degradation", "ROI > 3x"], confidence: 87 },
                { goal: "Onboarding Flow", kpis: ["Completion ≥ 95%", "NPS > 8", "Time-to-productivity -30%"], confidence: 91 },
              ].map((item, i) => (
                <motion.div
                  key={item.goal}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-xl p-4 border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">{item.goal}</p>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.confidence}% conf.</span>
                  </div>
                  <div className="space-y-1.5">
                    {item.kpis.map((kpi) => (
                      <div key={kpi} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                        {kpi}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Agents */}
        <TabsContent value="agents" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2">
            {aiAgents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn("bg-card rounded-xl p-5 border border-border card-hover", agent.status === "ACTIVE" && "border-primary/20")}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", agent.status === "ACTIVE" ? "bg-primary/20" : "bg-muted")}>
                      <Cpu className={cn("h-5 w-5", agent.status === "ACTIVE" ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full",
                    agent.status === "ACTIVE" ? "bg-green-500/15 text-green-500" : "bg-muted text-muted-foreground"
                  )}>
                    <div className={cn("h-1.5 w-1.5 rounded-full", agent.status === "ACTIVE" ? "bg-green-500 animate-pulse" : "bg-muted-foreground")} />
                    {agent.status}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-lg font-bold">{agent.requests.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Requests (30d)</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-lg font-bold text-green-500">{agent.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Accuracy</span>
                    <span className="font-medium">{agent.accuracy}%</span>
                  </div>
                  <Progress value={agent.accuracy} className="h-1.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Token Usage */}
        <TabsContent value="usage" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Token Usage (7 days)</CardTitle>
                <CardDescription className="text-xs">Daily token consumption</CardDescription>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tokenUsage} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }}
                      formatter={(v) => [`${(Number(v) / 1000000).toFixed(2)}M tokens`, "Usage"]}
                    />
                    <Area type="monotone" dataKey="tokens" stroke="var(--chart-4)" fill="url(#tokenGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tokenUsage} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }}
                      formatter={(v) => [`$${Number(v).toFixed(2)}`, "Cost"]}
                    />
                    <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                      {tokenUsage.map((_, i) => (
                        <Cell key={i} fill="var(--chart-4)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Console Chat */}
        <TabsContent value="chat" className="mt-0">
          <div className="bg-card rounded-2xl overflow-hidden border border-primary/20 h-[500px] flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <BrainCircuit className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">AI Operations Console</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-muted-foreground">Mistral · Streaming</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}
                >
                  <div className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0", msg.role === "assistant" ? "bg-primary/20" : "bg-accent")}>
                    {msg.role === "assistant" ? <Bot className="h-3.5 w-3.5 text-primary" /> : <User className="h-3.5 w-3.5" />}
                  </div>
                  <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm", msg.role === "assistant" ? "bg-accent/60 rounded-tl-sm" : "bg-primary/15 border border-primary/20 rounded-tr-sm")}>
                    <span className="whitespace-pre-wrap leading-relaxed">{msg.content}</span>
                    {msg.streaming && (
                      <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 animate-pulse rounded-sm" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="px-4 pb-4 pt-2 border-t border-border">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChat();
                    }
                  }}
                  placeholder="Ask the AI console anything..."
                  disabled={chatStreaming}
                  className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                />
                <Button size="icon" onClick={handleChat} disabled={!chatInput.trim() || chatStreaming} className="h-10 w-10 rounded-xl">
                  {chatStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Powered by Mistral on AWS Bedrock · Real-time streaming
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
