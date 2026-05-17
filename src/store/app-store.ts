"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types";

export type { Role };

type Theme = "dark" | "light" | "midnight" | "neon";

interface AppState {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  aiChatOpen: boolean;
  setAiChatOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  notificationPanelOpen: boolean;
  setNotificationPanelOpen: (open: boolean) => void;
  presentationMode: boolean;
  setPresentationMode: (mode: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeRole: "EMPLOYEE",
      setActiveRole: (role) => set({ activeRole: role }),
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      aiChatOpen: false,
      setAiChatOpen: (open) => set({ aiChatOpen: open }),
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      notificationPanelOpen: false,
      setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),
      presentationMode: false,
      setPresentationMode: (mode) => set({ presentationMode: mode }),
    }),
    {
      name: "atomquest-store",
      partialize: (state) => ({
        activeRole: state.activeRole,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
