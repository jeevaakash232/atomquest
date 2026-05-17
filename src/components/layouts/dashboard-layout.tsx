"use client";

import { useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "@/components/ui/command-palette";
import { AiChatPanel } from "@/components/ai/ai-chat-panel";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { useAppStore } from "@/store/app-store";
import { useCurrentUser } from "@/hooks/use-current-user";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const setActiveRole = useAppStore((s) => s.setActiveRole);
  const { user } = useCurrentUser();

  // Sync active role from authenticated user's real role
  useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role);
    }
  }, [user?.role, setActiveRole]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandPaletteOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="px-6 pt-6 pb-8">
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
      <AiChatPanel />
      <NotificationPanel />
    </div>
  );
}
