"use client";

import { motion } from "framer-motion";
import { CheckCircle2, BrainCircuit, Target, Award, AlertTriangle, Shield, Trophy, Loader2 } from "lucide-react";
import { useActivity } from "@/hooks/use-activity";
import { cn } from "@/lib/utils";

const typeConfig = {
  approval: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/15" },
  ai:       { icon: BrainCircuit, color: "text-primary",   bg: "bg-primary/15"   },
  progress: { icon: Target,       color: "text-blue-500",  bg: "bg-blue-500/15"  },
  goal:     { icon: Target,       color: "text-blue-500",  bg: "bg-blue-500/15"  },
  badge:    { icon: Award,        color: "text-yellow-500",bg: "bg-yellow-500/15" },
  risk:     { icon: AlertTriangle,color: "text-destructive",bg:"bg-destructive/15"},
  admin:    { icon: Shield,       color: "text-orange-500",bg: "bg-orange-500/15" },
  achievement:{ icon: Trophy,     color: "text-yellow-500",bg: "bg-yellow-500/15" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ActivityFeed({ limit = 8 }: { limit?: number }) {
  const { activities, loading } = useActivity(limit);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((item, i) => {
        const cfg = typeConfig[item.type as keyof typeof typeConfig] ?? typeConfig.goal;
        const Icon = cfg.icon;
        return (
          <motion.div
            key={item.activityId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={cn(
              "flex gap-3 py-3 px-1",
              i !== activities.length - 1 && "border-b border-border/40"
            )}
          >
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
              <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-sm">
                <span className="font-medium">{item.userName}</span>{" "}
                <span className="text-muted-foreground">{item.action}</span>
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.target}</p>
              <p className="text-[10px] text-muted-foreground/60">{timeAgo(item.createdAt)}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
