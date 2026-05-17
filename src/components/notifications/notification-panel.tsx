"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCheck, AlertTriangle, Info, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { getUserNotifications, type Notification } from "@/services/api";
import { notifications as mockNotifications } from "@/mock/data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const typeConfig = {
  success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  info:    { icon: Info,         color: "text-blue-500",  bg: "bg-blue-500/10"  },
  warning: { icon: AlertTriangle,color: "text-yellow-500",bg: "bg-yellow-500/10"},
  error:   { icon: XCircle,      color: "text-destructive",bg:"bg-destructive/10"},
};

const priorityColor = {
  LOW:      "bg-muted text-muted-foreground",
  MEDIUM:   "bg-blue-500/15 text-blue-500",
  HIGH:     "bg-orange-500/15 text-orange-500",
  CRITICAL: "bg-destructive/15 text-destructive",
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

export function NotificationPanel() {
  const { notificationPanelOpen, setNotificationPanelOpen } = useAppStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserNotifications("usr_1", 30);
      setNotifications(data);
    } catch {
      // Fall back to mock data
      setNotifications(
        mockNotifications.map((n) => ({
          notifId: n.id,
          userId: "usr_1",
          title: n.title,
          message: n.message,
          type: n.type as Notification["type"],
          priority: n.priority as Notification["priority"],
          read: n.read,
          createdAt: new Date(Date.now() - (n.read ? 2 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000)).toISOString(),
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (notificationPanelOpen) fetchNotifications();
  }, [notificationPanelOpen, fetchNotifications]);

  const unread = notifications.filter((n) => !n.read && !readIds.has(n.notifId));
  const read   = notifications.filter((n) => n.read  || readIds.has(n.notifId));

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.notifId)));
  };

  return (
    <AnimatePresence>
      {notificationPanelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setNotificationPanelOpen(false)}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm z-50 glass-panel border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Notifications</h2>
                {unread.length > 0 && (
                  <Badge className="bg-primary/15 text-primary border-primary/20 text-xs">
                    {unread.length} new
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7" onClick={markAllRead}>
                  <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
                </Button>
                <button
                  onClick={() => setNotificationPanelOpen(false)}
                  className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Unread */}
                  {unread.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-5 py-3">
                        New
                      </p>
                      {unread.map((notif) => {
                        const cfg = typeConfig[notif.type] ?? typeConfig.info;
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={notif.notifId}
                            onClick={() => setReadIds((prev) => new Set([...prev, notif.notifId]))}
                            className="flex gap-3 px-5 py-4 border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer"
                          >
                            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
                              <Icon className={cn("h-4 w-4", cfg.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium">{notif.title}</p>
                                <Badge className={cn("text-[9px] shrink-0", priorityColor[notif.priority])}>
                                  {notif.priority}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                              <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(notif.createdAt)}</p>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Read */}
                  {read.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-5 py-3">
                        Earlier
                      </p>
                      {read.map((notif) => {
                        const cfg = typeConfig[notif.type] ?? typeConfig.info;
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={notif.notifId}
                            className="flex gap-3 px-5 py-4 border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer opacity-60"
                          >
                            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
                              <Icon className={cn("h-4 w-4", cfg.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{notif.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                              <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(notif.createdAt)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                      <Bell className="h-8 w-8 text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-medium">No notifications yet</p>
                      <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
