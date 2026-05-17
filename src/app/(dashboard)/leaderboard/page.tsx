"use client";

import { motion } from "framer-motion";
import {
  Trophy, Medal, Star, Flame, Award, Crown, Zap, TrendingUp,
  ArrowUp, ArrowDown, Minus, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { leaderboard, badges, weeklyChallenges, departments } from "@/mock/data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

const rankColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];
const rankBgs = ["bg-yellow-500/15", "bg-gray-400/15", "bg-amber-600/15"];
const rankIcons = [Crown, Medal, Award];

const rarityConfig = {
  LEGENDARY: { color: "text-yellow-500", bg: "bg-yellow-500/15", border: "border-yellow-500/30" },
  EPIC: { color: "text-purple-500", bg: "bg-purple-500/15", border: "border-purple-500/30" },
  RARE: { color: "text-blue-500", bg: "bg-blue-500/15", border: "border-blue-500/30" },
};

const deptLeaderboard = departments.map((d) => ({
  name: d.name,
  score: d.avgProductivity,
  goals: d.goalsCompleted,
})).sort((a, b) => b.score - a.score);

export default function LeaderboardPage() {
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
            <Trophy className="h-7 w-7 text-yellow-500" /><span className="text-gradient inline-block">Gamification & Leaderboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">Rankings, XP, badges, and weekly challenges</p>
        </div>
        <Badge className="bg-yellow-500/15 text-yellow-600 border-yellow-500/30 px-3 py-1.5 text-xs">
          <Flame className="h-3 w-3 mr-1.5" /> Season 2 · Week 20
        </Badge>
      </motion.div>

      {/* Top 3 Podium */}
      <div className="grid gap-4 md:grid-cols-3">
        {leaderboard.slice(0, 3).map((entry, i) => {
          const RankIcon = rankIcons[i];
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "bg-card rounded-2xl border border-border p-6 text-center card-hover relative overflow-hidden",
                i === 0 && "border-yellow-500/30 bg-gradient-to-b from-yellow-500/8 to-transparent"
              )}
            >
              {i === 0 && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
              )}
              <div className={cn("h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3", rankBgs[i])}>
                <RankIcon className={cn("h-6 w-6", rankColors[i])} />
              </div>
              <Avatar className="h-14 w-14 mx-auto mb-3">
                <AvatarFallback className={cn("font-bold text-lg", i === 0 ? "bg-yellow-500/20 text-yellow-600" : "bg-primary/20 text-primary")}>
                  {entry.avatar}
                </AvatarFallback>
              </Avatar>
              <p className="font-bold text-base">{entry.name}</p>
              <p className="text-xs text-muted-foreground mb-3">{entry.department}</p>
              <p className={cn("text-2xl font-bold", rankColors[i])}>{entry.xp.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">XP Points</p>
              <div className="flex items-center justify-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" />{entry.streak}d</span>
                <span>{entry.goalsCompleted} goals</span>
              </div>
              {entry.badge && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <Star className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-medium text-primary">{entry.badge}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="individual">
        <TabsList className="bg-muted/50 mb-4">
          <TabsTrigger value="individual">Individual Rankings</TabsTrigger>
          <TabsTrigger value="department">Department Rankings</TabsTrigger>
          <TabsTrigger value="badges">Badge Gallery</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        {/* Individual */}
        <TabsContent value="individual" className="mt-0">
          <Card className="glass">
            <CardContent className="p-0">
              {leaderboard.map((entry, i) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 hover:bg-accent/30 transition-colors cursor-pointer",
                    i !== leaderboard.length - 1 && "border-b border-border/50"
                  )}
                >
                  {/* Rank */}
                  <div className="w-8 text-center">
                    {i < 3 ? (
                      <span className={cn("font-bold text-lg", rankColors[i])}>{entry.rank}</span>
                    ) : (
                      <span className="text-muted-foreground font-medium">{entry.rank}</span>
                    )}
                  </div>

                  {/* Change indicator */}
                  <div className="w-5">
                    {entry.change > 0 ? (
                      <ArrowUp className="h-3.5 w-3.5 text-green-500" />
                    ) : entry.change < 0 ? (
                      <ArrowDown className="h-3.5 w-3.5 text-destructive" />
                    ) : (
                      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>

                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className={cn("font-bold text-sm", i === 0 ? "bg-yellow-500/20 text-yellow-600" : "bg-primary/20 text-primary")}>
                      {entry.avatar}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{entry.name}</p>
                      {entry.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{entry.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{entry.department}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center hidden md:block">
                      <p className="font-semibold">{entry.goalsCompleted}</p>
                      <p className="text-[10px] text-muted-foreground">Goals</p>
                    </div>
                    <div className="text-center hidden md:block">
                      <p className="font-semibold flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />{entry.streak}d
                      </p>
                      <p className="text-[10px] text-muted-foreground">Streak</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-bold", i < 3 ? rankColors[i] : "text-foreground")}>
                        {entry.xp.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">XP</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Department */}
        <TabsContent value="department" className="mt-0">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Department Productivity Rankings</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptLeaderboard} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} domain={[60, 100]} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {deptLeaderboard.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "var(--chart-2)" : i === 1 ? "var(--primary)" : "var(--chart-1)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {deptLeaderboard.map((dept, i) => (
                <motion.div
                  key={dept.name}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
                >
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0", i < 3 ? rankBgs[i] : "bg-muted")}>
                    <span className={i < 3 ? rankColors[i] : "text-muted-foreground"}>{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <p className="font-semibold text-sm">{dept.name}</p>
                      <span className="text-sm font-bold">{dept.score}%</span>
                    </div>
                    <Progress value={dept.score} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">{dept.goals} goals completed</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge, i) => {
              const cfg = rarityConfig[badge.rarity as keyof typeof rarityConfig];
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                  className={cn("bg-card rounded-xl border border-border p-5 card-hover border", cfg.border)}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", cfg.bg)}>
                      <Trophy className={cn("h-6 w-6", cfg.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-sm">{badge.name}</p>
                        <Badge className={cn("text-[9px]", cfg.bg, cfg.color, cfg.border)}>
                          {badge.rarity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Challenges */}
        <TabsContent value="challenges" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {weeklyChallenges.map((ch, i) => (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn("bg-card rounded-xl border border-border p-5 card-hover", ch.completed && "border-green-500/30 bg-green-500/5")}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm">{ch.title}</h3>
                      {ch.completed && <Badge className="bg-green-500/15 text-green-500 text-[10px]">✓ Done</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{ch.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-lg font-bold text-yellow-500">+{ch.xpReward}</p>
                    <p className="text-[10px] text-muted-foreground">XP</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{ch.participants} participants</span>
                    <span>{Math.min(ch.progress, ch.target)}/{ch.target}</span>
                  </div>
                  <Progress value={(Math.min(ch.progress, ch.target) / ch.target) * 100} className="h-2" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Ends {ch.deadline}</p>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
