"use client";

// Session is now handled via cookie-based JWT (no external provider needed)
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
