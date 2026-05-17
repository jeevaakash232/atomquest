"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Search, Bell, Sun, Moon, Zap, Sparkles,
  Monitor, User, LogOut, Settings,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore } from "@/store/app-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { clearSessionCache } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

const themeOptions = [
  { value: "light" as const,    label: "Light",    icon: Sun },
  { value: "dark" as const,     label: "Warm Dark", icon: Moon },
  { value: "midnight" as const, label: "Midnight", icon: Monitor },
  { value: "neon" as const,     label: "Neon",     icon: Zap },
];

const breadcrumbMap: Record<string, string> = {
  "/employee":          "Employee Dashboard",
  "/manager/approvals": "Manager — Approvals",
  "/admin":             "Admin Dashboard",
  "/executive":         "Executive Dashboard",
  "/ai-center":         "AI Operations Center",
  "/leaderboard":       "Leaderboard",
  "/system-arch":       "System Architecture",
};

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, setCommandPaletteOpen, setNotificationPanelOpen, setAiChatOpen } = useAppStore();
  const { user: liveUser } = useCurrentUser();

  const currentTheme = themeOptions.find((t) => t.value === theme) ?? themeOptions[0];
  const ThemeIcon = currentTheme.icon;
  const pageTitle = breadcrumbMap[pathname] ?? "AtomQuest";

  const displayName   = liveUser?.name   ?? "User";
  const displayAvatar = liveUser?.avatar ?? displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const displayEmail  = liveUser?.email  ?? "";

  return (
    <header className="h-14 border-b border-border bg-card/90 backdrop-blur-md flex items-center px-5 gap-3 shrink-0 z-20">
      {/* Page title */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
        <span className="text-sm font-semibold text-foreground truncate">{pageTitle}</span>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/60 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search...</span>
        <kbd className="ml-3 text-[10px] bg-card border border-border rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
      </button>

      <div className="hidden md:block h-5 w-px bg-border" />

      {/* Theme */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors">
          <ThemeIcon className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {themeOptions.map((t) => {
            const Icon = t.icon;
            return (
              <DropdownMenuItem key={t.value} onClick={() => setTheme(t.value)}
                className={cn("gap-2 text-sm cursor-pointer", theme === t.value && "bg-accent")}>
                <Icon className="h-3.5 w-3.5" />
                {t.label}
                {theme === t.value && <span className="ml-auto text-primary text-xs">✓</span>}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* AI Chat */}
      <button className="h-8 w-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors" onClick={() => setAiChatOpen(true)}>
        <Sparkles className="h-4 w-4" />
      </button>

      {/* Notifications */}
      <button onClick={() => setNotificationPanelOpen(true)}
        className="relative h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-destructive rounded-full" />
      </button>

      <div className="h-5 w-px bg-border" />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-accent rounded-lg px-2 py-1.5 transition-colors">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
              {displayAvatar}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block text-sm font-medium">{displayName.split(" ")[0]}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-medium">{displayName}</span>
              <span className="text-xs text-muted-foreground font-normal">{displayEmail}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push("/profile")}><User className="h-3.5 w-3.5" /> Profile</DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push("/settings")}><Settings className="h-3.5 w-3.5" /> Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 cursor-pointer text-destructive"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              clearSessionCache();
              router.push("/login");
            }}>
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
