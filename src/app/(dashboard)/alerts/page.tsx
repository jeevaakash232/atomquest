"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Clock, CheckCircle2, TrendingUp, Bell,
  Calendar, Plus, Trash2, ToggleLeft, ToggleRight,
  FileText, Loader2, RefreshCw, X, Target, Flame,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";
type AlertType = "DEADLINE" | "OVERDUE" | "AT_RISK" | "MILESTONE" | "STREAK";

type Alert = {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  goalId?: string;
  goalTitle?: string;
  createdAt: string;
};

type Reminder = {
  id: string;
  title: string;
  time: string;
  days: string[];
  enabled: boolean;
  type: string;
};

type DailyReport = {
  date: string;
  user: { name: string; role: string; xp: number; streak: number; level: number };
  summary: { totalGoals: number; completed: number; active: number; overdue: number; dueSoon: number; avgProgress: number };
  highlights: string[];
  activeGoals: { title: string; progress: number; deadline: string; priority: string; status: string }[];
  overdueGoals: { title: string; deadline: string; priority: string }[];
  recentActivity: any[];
  recommendation: string;
};

// ─── Severity config ──────────────────────────────────────────────────────────
const severityConfig: Record<AlertSeverity, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  CRITICAL: { color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    icon: AlertTriangle },
  WARNING:  { color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  icon: Clock },
  INFO:     { color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   icon: TrendingUp },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AlertsPage() {
  const [alerts, setAlerts]         = useState<Alert[]>([]);
  const [reminders, setReminders]   = useState<Reminder[]>([]);
  const [report, setReport]         = useState<DailyReport | null>(null);
  const [loadingAlerts, setLoadingAlerts]   = useState(true);
  const [loadingReport, setLoadingReport]   = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [showAddReminder, setShowAddReminder] = useState(false);

  // New reminder form
  const [newTitle, setNewTitle]   = useState("");
  const [newTime, setNewTime]     = useState("09:00");
  const [newDays, setNewDays]     = useState<string[]>(["Mon","Tue","Wed","Thu","Fri"]);
  const [newType, setNewType]     = useState("PROGRESS_UPDATE");
  const [saving, setSaving]       = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(data.alerts ?? []);
    } catch { setAlerts([]); }
    finally { setLoadingAlerts(false); }
  }, []);

  const fetchReport = useCallback(async () => {
    setLoadingReport(true);
    try {
      const res = await fetch("/api/daily-report");
      const data = await res.json();
      setReport(data.report ?? null);
    } catch { setReport(null); }
    finally { setLoadingReport(false); }
  }, []);

  const fetchSchedule = useCallback(async () => {
    setLoadingSchedule(true);
    try {
      const res = await fetch("/api/schedule");
      const data = await res.json();
      setReminders(data.reminders ?? []);
    } catch { setReminders([]); }
    finally { setLoadingSchedule(false); }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchReport();
    fetchSchedule();
  }, [fetchAlerts, fetchReport, fetchSchedule]);

  const toggleReminder = async (reminder: Reminder) => {
    setReminders((prev) => prev.map((r) => r.id === reminder.id ? { ...r, enabled: !r.enabled } : r));
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", reminder }),
    });
  };

  const deleteReminder = async (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", reminder: { id } }),
    });
  };

  const addReminder = async () => {
    if (!newTitle.trim() || newDays.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", reminder: { title: newTitle, time: newTime, days: newDays, type: newType, enabled: true } }),
      });
      const data = await res.json();
      if (data.reminder) setReminders((prev) => [...prev, data.reminder]);
      setShowAddReminder(false);
      setNewTitle(""); setNewTime("09:00"); setNewDays(["Mon","Tue","Wed","Thu","Fri"]);
    } finally { setSaving(false); }
  };

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const warningCount  = alerts.filter((a) => a.severity === "WARNING").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-content">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-8 h-0.5 bg-primary mb-3" />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Alerts & Schedule</h1>
            <p className="text-muted-foreground text-sm mt-1">Stay on top of your goals with smart alerts and reminders</p>
          </div>
          <button onClick={() => { fetchAlerts(); fetchReport(); fetchSchedule(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-accent text-sm font-medium transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Summary badges */}
      {!loadingAlerts && (
        <div className="flex gap-3 flex-wrap">
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" /> {criticalCount} Critical Alert{criticalCount > 1 ? "s" : ""}
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-semibold">
              <Clock className="h-3.5 w-3.5" /> {warningCount} Warning{warningCount > 1 ? "s" : ""}
            </div>
          )}
          {criticalCount === 0 && warningCount === 0 && alerts.length === 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> All goals on track
            </div>
          )}
        </div>
      )}

      <Tabs defaultValue="alerts">
        <TabsList className="bg-muted/60 h-9 mb-2">
          <TabsTrigger value="alerts" className="text-xs px-4">
            Alerts
            {criticalCount + warningCount > 0 && (
              <span className="ml-1.5 h-4 w-4 rounded-full bg-destructive text-[9px] text-white flex items-center justify-center font-bold">
                {criticalCount + warningCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs px-4">Schedule</TabsTrigger>
          <TabsTrigger value="report" className="text-xs px-4">Daily Report</TabsTrigger>
        </TabsList>

        {/* ── ALERTS TAB ── */}
        <TabsContent value="alerts" className="mt-0">
          {loadingAlerts ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-lg">All Clear!</p>
              <p className="text-sm text-muted-foreground mt-1">No alerts right now. Your goals are on track.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, i) => {
                const cfg = severityConfig[alert.severity];
                const Icon = cfg.icon;
                return (
                  <motion.div key={alert.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className={cn("rounded-2xl border p-5", cfg.bg, cfg.border)}>
                    <div className="flex items-start gap-3">
                      <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        alert.severity === "CRITICAL" ? "bg-red-100" : alert.severity === "WARNING" ? "bg-amber-100" : "bg-blue-100")}>
                        <Icon className={cn("h-4.5 w-4.5", cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={cn("font-semibold text-sm", cfg.color)}>{alert.title}</p>
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                            alert.severity === "CRITICAL" ? "bg-red-100 text-red-700" :
                            alert.severity === "WARNING"  ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700")}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{alert.message}</p>
                        {alert.goalTitle && (
                          <div className="flex items-center gap-1 mt-2">
                            <Target className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{alert.goalTitle}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── SCHEDULE TAB ── */}
        <TabsContent value="schedule" className="mt-0">
          <div className="space-y-4">
            {/* Add reminder button */}
            <div className="flex justify-end">
              <button onClick={() => setShowAddReminder(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-md hover:-translate-y-0.5 transition-all"
                style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)" }}>
                <Plus className="h-4 w-4" /> Add Reminder
              </button>
            </div>

            {/* Add reminder form */}
            <AnimatePresence>
              {showAddReminder && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="bg-card rounded-2xl border border-primary/30 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">New Reminder</h3>
                    <button onClick={() => setShowAddReminder(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Title</label>
                      <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Morning check-in"
                        className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Time</label>
                      <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
                        className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Days</label>
                    <div className="flex gap-2 flex-wrap">
                      {DAYS.map((day) => (
                        <button key={day} onClick={() => setNewDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])}
                          className={cn("px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                            newDays.includes(day) ? "bg-primary text-white border-primary" : "bg-muted border-border text-muted-foreground hover:border-primary/40")}>
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Type</label>
                    <select value={newType} onChange={(e) => setNewType(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary">
                      <option value="PROGRESS_UPDATE">Progress Update</option>
                      <option value="DAILY_REPORT">Daily Report</option>
                      <option value="WEEKLY_REVIEW">Weekly Review</option>
                      <option value="DEADLINE_CHECK">Deadline Check</option>
                    </select>
                  </div>
                  <button onClick={addReminder} disabled={!newTitle.trim() || saving}
                    className="w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-all"
                    style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)" }}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Save Reminder"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reminders list */}
            {loadingSchedule ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
            ) : (
              <div className="space-y-3">
                {reminders.map((r, i) => (
                  <motion.div key={r.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className={cn("bg-card rounded-2xl border p-5 transition-all", r.enabled ? "border-border" : "border-border/50 opacity-60")}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                          r.enabled ? "bg-primary/10" : "bg-muted")}>
                          <Bell className={cn("h-4 w-4", r.enabled ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{r.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{r.time}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{r.days.join(", ")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleReminder(r)} className="text-muted-foreground hover:text-primary transition-colors">
                          {r.enabled
                            ? <ToggleRight className="h-6 w-6 text-primary" />
                            : <ToggleLeft className="h-6 w-6" />}
                        </button>
                        <button onClick={() => deleteReminder(r.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── DAILY REPORT TAB ── */}
        <TabsContent value="report" className="mt-0">
          {loadingReport ? (
            <div className="space-y-4">
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          ) : !report ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold">No report available</p>
              <p className="text-sm text-muted-foreground mt-1">Create some goals to generate your daily report.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Report header */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Daily Report</span>
                    </div>
                    <h2 className="font-serif text-xl font-bold text-foreground">{report.date}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {report.user.name} · {report.user.role} · Level {report.user.level}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-500">
                    <Flame className="h-4 w-4" />
                    <span className="text-sm font-bold">{report.user.streak}d streak</span>
                  </div>
                </div>

                {/* Summary grid */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { label: "Total",     value: report.summary.totalGoals,  color: "text-foreground" },
                    { label: "Active",    value: report.summary.active,      color: "text-blue-600" },
                    { label: "Completed", value: report.summary.completed,   color: "text-green-600" },
                    { label: "Overdue",   value: report.summary.overdue,     color: "text-red-600" },
                    { label: "Due Soon",  value: report.summary.dueSoon,     color: "text-amber-600" },
                    { label: "Avg %",     value: `${report.summary.avgProgress}%`, color: "text-primary" },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted/40 rounded-xl p-3 text-center">
                      <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Highlights */}
              {report.highlights.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-card rounded-2xl border border-border p-5">
                  <h3 className="font-semibold text-sm mb-3">Today&apos;s Highlights</h3>
                  <div className="space-y-2">
                    {report.highlights.map((h, i) => (
                      <p key={i} className="text-sm text-foreground">{h}</p>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Active goals */}
              {report.activeGoals.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="bg-card rounded-2xl border border-border p-5">
                  <h3 className="font-semibold text-sm mb-4">Active Goals</h3>
                  <div className="space-y-3">
                    {report.activeGoals.map((g, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-medium text-foreground truncate flex-1 mr-3">{g.title}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
                              g.priority === "CRITICAL" ? "bg-red-50 text-red-600" :
                              g.priority === "HIGH"     ? "bg-amber-50 text-amber-700" :
                              "bg-blue-50 text-blue-600")}>
                              {g.priority}
                            </span>
                            <span className="text-xs text-muted-foreground">{g.deadline}</span>
                            <span className="text-xs font-bold text-foreground">{g.progress}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all",
                            g.progress >= 75 ? "bg-green-500" : g.progress >= 50 ? "bg-primary" : "bg-amber-500")}
                            style={{ width: `${g.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Overdue */}
              {report.overdueGoals.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-red-50 rounded-2xl border border-red-200 p-5">
                  <h3 className="font-semibold text-sm text-red-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Overdue Goals
                  </h3>
                  <div className="space-y-2">
                    {report.overdueGoals.map((g, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <p className="text-sm text-red-800 font-medium">{g.title}</p>
                        <span className="text-xs text-red-600">Was due {g.deadline}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Recommendation */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="bg-primary/5 rounded-2xl border border-primary/20 p-5">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Today&apos;s Recommendation</p>
                    <p className="text-sm text-foreground leading-relaxed">{report.recommendation}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
