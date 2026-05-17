"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutDashboard, CheckSquare, Shield, BarChart3,
  BrainCircuit, Trophy, Cloud, Target, Users, Sparkles, ArrowRight,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

const commands = [
  { id: "emp", label: "Employee Dashboard", description: "Goals, XP, AI insights", href: "/employee", icon: LayoutDashboard, category: "Navigate" },
  { id: "mgr", label: "Manager Dashboard", description: "Approvals & team analytics", href: "/manager/approvals", icon: CheckSquare, category: "Navigate" },
  { id: "adm", label: "Admin Dashboard", description: "Org analytics & audit logs", href: "/admin", icon: Shield, category: "Navigate" },
  { id: "exe", label: "Executive Dashboard", description: "KPIs & forecasting", href: "/executive", icon: BarChart3, category: "Navigate" },
  { id: "ai", label: "AI Operations Center", description: "Insights & risk prediction", href: "/ai-center", icon: BrainCircuit, category: "Navigate" },
  { id: "lb", label: "Leaderboard", description: "Rankings & badges", href: "/leaderboard", icon: Trophy, category: "Navigate" },
  { id: "sys", label: "System Architecture", description: "Infrastructure overview", href: "/system-arch", icon: Cloud, category: "Navigate" },
  { id: "goal", label: "Create SMART Goal", description: "AI-powered goal creation", href: "/employee", icon: Target, category: "Actions" },
  { id: "team", label: "View Team", description: "Team members & performance", href: "/manager/approvals", icon: Users, category: "Actions" },
  { id: "chat", label: "Open AI Copilot", description: "Chat with AtomQuest AI", href: "#ai-chat", icon: Sparkles, category: "Actions" },
];

export function CommandPalette() {
  const [query, setQuery] = useState("");
  const { commandPaletteOpen, setCommandPaletteOpen, setAiChatOpen } = useAppStore();
  const router = useRouter();

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const grouped = filtered.reduce<Record<string, typeof commands>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  const handleSelect = (cmd: (typeof commands)[0]) => {
    setCommandPaletteOpen(false);
    setQuery("");
    if (cmd.href === "#ai-chat") {
      setAiChatOpen(true);
    } else {
      router.push(cmd.href);
    }
  };

  useEffect(() => {
    if (!commandPaletteOpen) setQuery("");
  }, [commandPaletteOpen]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
          >
            <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-border">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search commands, pages, goals..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5 font-mono text-muted-foreground">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category} className="mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 py-1">
                      {category}
                    </p>
                    {items.map((cmd) => {
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => handleSelect(cmd)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left group"
                        >
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{cmd.label}</p>
                            <p className="text-xs text-muted-foreground">{cmd.description}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No results for &quot;{query}&quot;
                  </div>
                )}
              </div>

              <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
                <span><kbd className="bg-muted border border-border rounded px-1 font-mono">↑↓</kbd> navigate</span>
                <span><kbd className="bg-muted border border-border rounded px-1 font-mono">↵</kbd> select</span>
                <span><kbd className="bg-muted border border-border rounded px-1 font-mono">ESC</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
