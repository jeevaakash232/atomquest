"use client";

import { useState, useEffect, useCallback } from "react";
import type { SessionUser } from "@/lib/auth";

type SessionState = {
  user: SessionUser | null;
  loading: boolean;
};

let cachedSession: SessionUser | null = null;
let sessionFetched = false;

export function useSession(): SessionState & { refetch: () => void } {
  const [state, setState] = useState<SessionState>({
    user: cachedSession,
    loading: !sessionFetched,
  });

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      cachedSession = data.user ?? null;
      sessionFetched = true;
      setState({ user: cachedSession, loading: false });
    } catch {
      sessionFetched = true;
      setState({ user: null, loading: false });
    }
  }, []);

  useEffect(() => {
    if (!sessionFetched) fetchSession();
  }, [fetchSession]);

  return { ...state, refetch: fetchSession };
}

export function clearSessionCache() {
  cachedSession = null;
  sessionFetched = false;
}
