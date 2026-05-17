"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cloud, Server, Database, Cpu, Zap, Shield, Activity,
  Globe, Lock, RefreshCw, AlertTriangle, CheckCircle2,
  ArrowRight, Layers, GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { apiPerformance } from "@/mock/data";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const infraNodes = [
  { id: "client", label: "Next.js Client", sublabel: "Vercel Edge", icon: Zap, color: "text-blue-500", bg: "bg-blue-500/15", status: "HEALTHY" },
  { id: "cdn", label: "CloudFront CDN", sublabel: "AWS CDN", icon: Globe, color: "text-cyan-500", bg: "bg-cyan-500/15", status: "HEALTHY" },
  { id: "api", label: "API Gateway", sublabel: "AWS API GW", icon: Server, color: "text-primary", bg: "bg-primary/15", status: "HEALTHY" },
  { id: "ai", label: "AI Orchestrator", sublabel: "AWS ECS", icon: Cpu, color: "text-purple-500", bg: "bg-purple-500/15", status: "HEALTHY" },
  { id: "queue", label: "BullMQ Queue", sublabel: "Redis Pub/Sub", icon: GitBranch, color: "text-orange-500", bg: "bg-orange-500/15", status: "HEALTHY" },
  { id: "db", label: "PostgreSQL", sublabel: "RDS Multi-AZ", icon: Database, color: "text-green-500", bg: "bg-green-500/15", status: "HEALTHY" },
  { id: "s3", label: "S3 Storage", sublabel: "AWS S3", icon: Cloud, color: "text-yellow-500", bg: "bg-yellow-500/15", status: "HEALTHY" },
  { id: "sec", label: "Security Hub", sublabel: "AWS Shield", icon: Shield, color: "text-red-500", bg: "bg-red-500/15", status: "WARNING" },
];

const awsServices = [
  { name: "EC2 Instances", value: "4 Nodes", detail: "CPU Avg: 42%", status: "HEALTHY", icon: Server, color: "text-blue-400" },
  { name: "RDS Primary", value: "1.2 TB", detail: "IOPS: 12,400", status: "HEALTHY", icon: Database, color: "text-green-400" },
  { name: "S3 Storage", value: "4.8 TB", detail: "8.2M Objects", status: "HEALTHY", icon: Cloud, color: "text-yellow-400" },
  { name: "ElastiCache", value: "Redis 7.x", detail: "Hit rate: 94%", status: "HEALTHY", icon: Zap, color: "text-orange-400" },
  { name: "SES Email", value: "2,840/day", detail: "Delivery: 99.2%", status: "HEALTHY", icon: Globe, color: "text-cyan-400" },
  { name: "Security Hub", value: "2 Alerts", detail: "Failed logins", status: "WARNING", icon: Shield, color: "text-red-400" },
  { name: "CloudWatch", value: "142 Events", detail: "Last 24h", status: "HEALTHY", icon: Activity, color: "text-primary" },
  { name: "ECS Cluster", value: "3 Tasks", detail: "AI Agents", status: "HEALTHY", icon: Cpu, color: "text-purple-400" },
];

export default function SystemArchPage() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

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
            <Cloud className="h-7 w-7 text-primary" /><span className="text-gradient inline-block">Cloud & Architecture</span>
          </h1>
          <p className="text-muted-foreground mt-1">Live simulation of enterprise AWS infrastructure and API health</p>
        </div>
        <div className="flex gap-2">
          <Badge className="px-3 py-1.5 bg-green-500/15 border-green-500/20 text-green-500 text-xs">
            <Activity className="mr-1.5 h-3 w-3" /> All Systems Operational
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard title="API Uptime" value="99.97%" subtitle="Last 30 days" trend="+0.02%" trendUp icon={Activity} iconColor="text-green-500" iconBg="bg-green-500/15" delay={0} />
        <KpiCard title="Avg Latency" value="128ms" subtitle="p95 response" trend="-12ms" trendUp icon={Zap} iconColor="text-primary" iconBg="bg-primary/15" delay={0.05} />
        <KpiCard title="Error Rate" value="0.08%" subtitle="Last 24h" trend="-0.02%" trendUp icon={AlertTriangle} iconColor="text-yellow-500" iconBg="bg-yellow-500/15" delay={0.1} />
        <KpiCard title="Active Nodes" value="4" subtitle="EC2 instances" trend="All healthy" icon={Server} iconColor="text-blue-500" iconBg="bg-blue-500/15" delay={0.15} />
      </div>

      {/* Architecture Flow Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6 border-primary/20 bg-gradient-to-r from-background via-primary/3 to-background overflow-x-auto"
      >
        <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" /> System Architecture Flow
        </h3>
        <div className="flex items-center gap-2 min-w-max mx-auto justify-center flex-wrap gap-y-4">
          {infraNodes.map((node, i) => {
            const Icon = node.icon;
            return (
              <div key={node.id} className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  onHoverStart={() => setHoveredNode(node.id)}
                  onHoverEnd={() => setHoveredNode(null)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all",
                    hoveredNode === node.id ? "border-primary/50 bg-primary/5 shadow-lg" : "border-border bg-background/60",
                    node.status === "WARNING" && "border-yellow-500/30"
                  )}
                >
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", node.bg)}>
                    <Icon className={cn("h-5 w-5", node.color)} />
                  </div>
                  <p className="text-xs font-semibold text-center whitespace-nowrap">{node.label}</p>
                  <p className="text-[10px] text-muted-foreground text-center">{node.sublabel}</p>
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    node.status === "HEALTHY" ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                  )} />
                </motion.div>
                {i < infraNodes.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="performance">
        <TabsList className="bg-muted/50 mb-4">
          <TabsTrigger value="performance">API Performance</TabsTrigger>
          <TabsTrigger value="aws">AWS Services</TabsTrigger>
          <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
        </TabsList>

        {/* Performance */}
        <TabsContent value="performance" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">API Requests (24h)</CardTitle>
                <CardDescription className="text-xs">Total requests per 2-hour window</CardDescription>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={apiPerformance} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }} />
                    <Area type="monotone" dataKey="requests" stroke="var(--primary)" fill="url(#reqGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Latency & Errors (24h)</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={apiPerformance} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }} />
                    <Line type="monotone" dataKey="latency" stroke="var(--chart-3)" strokeWidth={2} dot={false} name="Latency (ms)" />
                    <Line type="monotone" dataKey="errors" stroke="var(--destructive)" strokeWidth={2} dot={false} name="Errors" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AWS Services */}
        <TabsContent value="aws" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {awsServices.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div
                  key={svc.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={cn(
                    "bg-card rounded-xl border border-border p-4 card-hover",
                    svc.status === "WARNING" && "border-yellow-500/30 bg-yellow-500/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={cn("h-5 w-5", svc.color)} />
                    <Badge className={cn("text-[10px]",
                      svc.status === "HEALTHY" ? "bg-green-500/15 text-green-500 border-green-500/20" :
                      "bg-yellow-500/15 text-yellow-500 border-yellow-500/20"
                    )}>
                      {svc.status}
                    </Badge>
                  </div>
                  <p className="font-semibold text-sm mb-1">{svc.name}</p>
                  <p className="text-xl font-bold">{svc.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{svc.detail}</p>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Monitoring */}
        <TabsContent value="monitoring" className="mt-0">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">System Health Metrics</h3>
              {[
                { label: "CPU Utilization", value: 42, unit: "%", status: "HEALTHY" },
                { label: "Memory Usage", value: 68, unit: "%", status: "HEALTHY" },
                { label: "Disk I/O", value: 31, unit: "%", status: "HEALTHY" },
                { label: "Network Throughput", value: 78, unit: "%", status: "WARNING" },
                { label: "Queue Depth", value: 12, unit: " jobs", status: "HEALTHY" },
                { label: "Cache Hit Rate", value: 94, unit: "%", status: "HEALTHY" },
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{metric.value}{metric.unit}</span>
                      <div className={cn("h-2 w-2 rounded-full", metric.status === "HEALTHY" ? "bg-green-500" : "bg-yellow-500 animate-pulse")} />
                    </div>
                  </div>
                  <Progress
                    value={metric.value}
                    className={cn("h-1.5", metric.value > 80 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500")}
                  />
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Uptime History (30 days)</h3>
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex flex-wrap gap-1 mb-3">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const isDown = i === 12 || i === 13;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className={cn("h-6 w-6 rounded-sm", isDown ? "bg-destructive/60" : "bg-green-500/60")}
                        title={isDown ? "Incident" : "Operational"}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm bg-green-500/60" /> Operational</span>
                  <span className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm bg-destructive/60" /> Incident</span>
                </div>
                <p className="text-sm font-bold mt-3">99.97% uptime <span className="text-xs font-normal text-muted-foreground">over 30 days</span></p>
              </div>

              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Queue Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Goal Processing", jobs: 142, rate: "98.6%", color: "bg-primary" },
                    { name: "AI Inference", jobs: 89, rate: "99.1%", color: "bg-purple-500" },
                    { name: "Notifications", jobs: 312, rate: "99.8%", color: "bg-green-500" },
                    { name: "Analytics", jobs: 56, rate: "97.2%", color: "bg-orange-500" },
                  ].map((q) => (
                    <div key={q.name} className="flex items-center gap-3">
                      <div className={cn("h-2 w-2 rounded-full shrink-0", q.color)} />
                      <span className="text-xs flex-1">{q.name}</span>
                      <span className="text-xs text-muted-foreground">{q.jobs} jobs</span>
                      <span className="text-xs font-medium text-green-500">{q.rate}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
