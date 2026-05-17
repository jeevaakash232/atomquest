"use client";

import { motion } from "framer-motion";
import { Calendar, ChevronRight, CheckCircle2, Clock, AlertCircle, FileEdit, Lock, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { GoalStatus, Priority } from "@/types";

const statusConfig: Record<GoalStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  DRAFT:     { label: "Draft",     icon: FileEdit,    color: "text-muted-foreground", bg: "bg-muted/60" },
  SUBMITTED: { label: "Submitted", icon: Clock,       color: "text-blue-600",         bg: "bg-blue-50" },
  APPROVED:  { label: "Approved",  icon: CheckCircle2,color: "text-green-700",        bg: "bg-green-50" },
  REJECTED:  { label: "Rejected",  icon: XCircle,     color: "text-destructive",      bg: "bg-red-50" },
  LOCKED:    { label: "Locked",    icon: Lock,        color: "text-purple-700",       bg: "bg-purple-50" },
};

const priorityConfig: Record<Priority, { color: string; bg: string }> = {
  LOW:      { color: "text-muted-foreground", bg: "bg-muted/60" },
  MEDIUM:   { color: "text-blue-600",         bg: "bg-blue-50" },
  HIGH:     { color: "text-amber-700",        bg: "bg-amber-50" },
  CRITICAL: { color: "text-destructive",      bg: "bg-red-50" },
};

interface GoalCardProps {
  goal: {
    id?: string;
    goalId?: string;
    title: string;
    status: GoalStatus;
    priority: Priority;
    progress: number;
    deadline: string;
    kpis?: string[];
    xpReward?: number;
  };
  delay?: number;
  onClick?: () => void;
}

export function GoalCard({ goal, delay = 0, onClick }: GoalCardProps) {
  const statusCfg   = statusConfig[goal.status];
  const priorityCfg = priorityConfig[goal.priority];
  const StatusIcon  = statusCfg.icon;

  const progressColor =
    goal.progress >= 80 ? "bg-green-500" :
    goal.progress >= 50 ? "bg-primary" :
    goal.progress >= 25 ? "bg-amber-500" : "bg-destructive";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      onClick={onClick}
      className="bg-card rounded-2xl p-5 border border-border card-hover cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
          {goal.title}
        </h3>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full", statusCfg.bg, statusCfg.color)}>
          <StatusIcon className="h-3 w-3" />
          {statusCfg.label}
        </span>
        <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", priorityCfg.bg, priorityCfg.color)}>
          {goal.priority}
        </span>
        {goal.xpReward && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
            +{goal.xpReward} XP
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">{goal.progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
            className={cn("h-full rounded-full", progressColor)}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>Due {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
      </div>
    </motion.div>
  );
}
