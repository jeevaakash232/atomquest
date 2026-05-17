"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove("dark", "light", "midnight", "neon");
    if (theme === "light") {
      // light is default :root, no class needed
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return <>{children}</>;
}
