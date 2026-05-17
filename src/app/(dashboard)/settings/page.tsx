"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Moon, Sun, Monitor, Zap, Bell, Shield, Trash2,
  ChevronRight, Check, Loader2, LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { clearSessionCache } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "midnight" | "neon";

const THEMES: { value: Theme; label: string; desc: string; icon: React.ElementType; preview: string }[] = [
  { value: "light",    label: "Light",     desc: "Clean warm tones",       icon: Sun,     preview: "bg-[#faf8f5] border-[#e5dfd4]" },
  { value: "dark",     label: "Warm Dark", desc: "Cozy dark with gold",    icon: Moon,    preview: "bg-[#1c1a16] border-[#2e2a22]" },
  { value: "midnight", label: "Midnight",  desc: "Deep corporate blue",    icon: Monitor, preview: "bg-[#07090f] border-[#141824]" },
  { value: "neon",     label: "AI Neon",   desc: "Vibrant purple glow",    icon: Zap,     preview: "bg-[#06010f] border-[#1a0a2e]" },
];

const NOTIFICATION_SETTINGS = [
  { key: "goal_updates",    label: "Goal Updates",       desc: "When your goals are approved or rejected" },
  { key: "ai_insights",     label: "AI Insights",        desc: "New risk alerts and productivity insights" },
  { key: "team_activity",   label: "Team Activity",      desc: "When teammates complete goals or earn badges" },
  { key: "weekly_summary",  label: "Weekly Summary",     desc: "Your weekly performance digest every Monday" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useAppStore();
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    goal_updates: true, ai_insights: true, team_activity: false, weekly_summary: true,
  });
  const [loggingOut, setLoggingOut] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleTheme = (t: Theme) => {
    setTheme(t);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotification = (key: string) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    clearSessionCache();
    router.push("/login");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-content">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-8 h-0.5 bg-primary mb-3" />
        <h1 className="font-serif text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Customize your AtomQuest experience</p>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-base">Appearance</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Choose your preferred theme</p>
          </div>
          {saved && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <Check className="h-3.5 w-3.5" /> Saved
            </motion.span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.value;
            return (
              <button key={t.value} onClick={() => handleTheme(t.value)}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left",
                  isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-accent"
                )}>
                <div className={cn("h-8 w-8 rounded-lg border-2 shrink-0", t.preview)} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold", isActive ? "text-primary" : "text-foreground")}>{t.label}</p>
                  <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-base">Notifications</h3>
        </div>
        <div className="space-y-3">
          {NOTIFICATION_SETTINGS.map((n) => (
            <div key={n.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <button
                onClick={() => toggleNotification(n.key)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors shrink-0",
                  notifications[n.key] ? "bg-primary" : "bg-muted"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                  notifications[n.key] ? "translate-x-5" : "translate-x-0.5"
                )} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-base">Security</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: "Change Password",       desc: "Update your account password" },
            { label: "Two-Factor Authentication", desc: "Add an extra layer of security" },
            { label: "Active Sessions",       desc: "Manage devices signed into your account" },
          ].map((item) => (
            <button key={item.label}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-accent transition-colors text-left group">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-card rounded-2xl border border-destructive/20 p-6">
        <h3 className="font-semibold text-base text-destructive mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-destructive/20 hover:bg-destructive/5 transition-colors text-left disabled:opacity-60"
          >
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin text-destructive" /> : <LogOut className="h-4 w-4 text-destructive" />}
            <div>
              <p className="text-sm font-medium text-destructive">Sign Out</p>
              <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-destructive/20 hover:bg-destructive/5 transition-colors text-left">
            <Trash2 className="h-4 w-4 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
