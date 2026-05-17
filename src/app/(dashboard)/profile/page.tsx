"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Building2, Trophy, Flame, Star, Award,
  Camera, Save, Loader2, CheckCircle2, Edit2,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function ProfilePage() {
  const { user, loading, refetch } = useCurrentUser();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setDepartment(user.department);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In production: call PATCH /api/user/profile
      await new Promise((r) => setTimeout(r, 800));
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const xpToNextLevel = 1000 - ((user?.xp ?? 0) % 1000);
  const xpProgress = (((user?.xp ?? 0) % 1000) / 1000) * 100;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 page-content">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 page-content">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-8 h-0.5 bg-primary mb-3" />
        <h1 className="font-serif text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your personal information and account details</p>
      </motion.div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-primary/15 flex items-center justify-center text-2xl font-bold text-primary">
                {user?.avatar ?? "?"}
              </div>
              <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                <Camera className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-accent text-sm font-medium transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
                className="w-full pl-9 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={user?.email ?? ""}
                disabled
                className="w-full pl-9 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground outline-none opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Department</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={!editing}
                className="w-full pl-9 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Role</label>
            <div className="relative">
              <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={user?.role ?? ""}
                disabled
                className="w-full pl-9 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground outline-none opacity-60"
              />
            </div>
          </div>
        </div>

        {editing && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #c9a84c, #e8c97a)" }}
            >
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
            </button>
          </motion.div>
        )}

        {saved && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle2 className="h-4 w-4" /> Profile updated successfully
          </motion.div>
        )}
      </motion.div>

      {/* Stats card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-base mb-5">Performance Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Trophy, label: "XP Points",     value: user?.xp?.toLocaleString() ?? "0",  color: "text-amber-600",  bg: "bg-amber-50" },
            { icon: Flame,  label: "Day Streak",    value: `${user?.streak ?? 0}d`,             color: "text-orange-600", bg: "bg-orange-50" },
            { icon: Star,   label: "Level",         value: `Lv. ${user?.level ?? 1}`,           color: "text-primary",    bg: "bg-primary/10" },
            { icon: Award,  label: "Badges Earned", value: `${user?.badges?.length ?? 0}`,      color: "text-purple-600", bg: "bg-purple-50" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`rounded-xl p-4 ${s.bg}`}>
                <Icon className={`h-5 w-5 ${s.color} mb-2`} />
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* XP progress */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium">Progress to Level {(user?.level ?? 1) + 1}</span>
            <span className="font-semibold text-foreground">{xpToNextLevel} XP to go</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>
      </motion.div>

      {/* Badges */}
      {user?.badges && user.badges.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-semibold text-base mb-4">My Badges</h3>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Award className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">{badge}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
