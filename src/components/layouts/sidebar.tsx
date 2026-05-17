"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Trophy, BrainCircuit, Cloud, Shield,
  BarChart3, CheckSquare, Bell, ChevronLeft, ChevronRight, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { Role } from "@/store/app-store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: Role[];
}

const navItems: NavItem[] = [
  { label: "Employee",  href: "/employee",          icon: LayoutDashboard, roles: ["EMPLOYEE","MANAGER","ADMIN","EXECUTIVE"] },
  { label: "Manager",   href: "/manager/approvals",  icon: CheckSquare,     roles: ["MANAGER","ADMIN","EXECUTIVE"] },
  { label: "Admin",     href: "/admin",              icon: Shield,          roles: ["ADMIN","EXECUTIVE"] },
  { label: "Executive", href: "/executive",          icon: BarChart3,       roles: ["EXECUTIVE"] },
];

const toolItems: NavItem[] = [
  { label: "AI Center",   href: "/ai-center",   icon: BrainCircuit },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Alerts",      href: "/alerts",      icon: AlertTriangle },
  { label: "System Arch", href: "/system-arch", icon: Cloud },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);
  const activeRole = useAppStore((s) => s.activeRole);
  const setNotificationPanelOpen = useAppStore((s) => s.setNotificationPanelOpen);

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 224 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border shrink-0">
        <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-sm font-serif">A</span>
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-baseline gap-1 whitespace-nowrap"
            >
              <span className="font-bold text-base tracking-tight text-foreground">Atom</span>
              <span className="font-light text-base tracking-widest text-primary">QUEST</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto scrollbar-thin">
        {/* Tools only — role switching is handled by the topbar */}
        <div>
          {!sidebarCollapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-2">
              Navigation
            </p>
          )}
          {toolItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>

        {/* My Dashboard — shows the most specific dashboard for the user's role */}
        {!sidebarCollapsed && <div className="mx-2 my-3 h-px bg-border" />}
        <div>
          {!sidebarCollapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-2">
              My Dashboard
            </p>
          )}
          {(() => {
            // Find the most specific dashboard for this role (last match = highest privilege)
            const matching = navItems.filter((item) => !item.roles || item.roles.includes(activeRole));
            const dashboardItem = matching[matching.length - 1]; // last = most specific
            if (!dashboardItem) return null;
            const isActive = pathname === dashboardItem.href || pathname.startsWith(dashboardItem.href + "/");
            return (
              <Link
                href={dashboardItem.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <dashboardItem.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                      {dashboardItem.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div layoutId="activeNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })()}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <button
          onClick={() => setNotificationPanelOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all relative"
        >
          <Bell className="h-4 w-4 shrink-0 text-muted-foreground" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                Notifications
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center hover:bg-sidebar-accent transition-colors z-10 shadow-sm"
      >
        {sidebarCollapsed
          ? <ChevronRight className="h-3 w-3 text-muted-foreground" />
          : <ChevronLeft className="h-3 w-3 text-muted-foreground" />}
      </button>
    </motion.aside>
  );
}
