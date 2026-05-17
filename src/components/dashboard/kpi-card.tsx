"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  className?: string;
  delay?: number;
  gradient?: boolean;
}

export function KpiCard({
  title, value, subtitle, trend, trendUp, icon: Icon,
  iconColor = "text-primary", iconBg = "bg-primary/10",
  className, delay = 0, gradient = false,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn(
        "bg-card rounded-2xl p-5 border border-border card-hover",
        gradient && "bg-gradient-to-br from-primary/5 to-transparent",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium mt-1",
              trendUp === true ? "text-green-600" : trendUp === false ? "text-destructive" : "text-muted-foreground"
            )}>
              {trendUp === true ? <TrendingUp className="h-3 w-3" /> : trendUp === false ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              {trend}
            </div>
          )}
        </div>
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ml-3", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}
