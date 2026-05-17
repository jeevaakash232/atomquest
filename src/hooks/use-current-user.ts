"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "./use-session";
import { users as mockUsers } from "@/mock/data";

export type LiveUser = {
  userId: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN" | "EXECUTIVE";
  department: string;
  xp: number;
  streak: number;
  level: number;
  badges: string[];
  avatar: string;
};

function getAvatar(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function useCurrentUser() {
  const { user: sessionUser, loading: sessionLoading } = useSession();
  const [user, setUser] = useState<LiveUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (sessionLoading) return;
    if (!sessionUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setUser({
          userId: u.userId ?? u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          department: u.department,
          xp: u.xp ?? 0,
          streak: u.streak ?? 0,
          level: u.level ?? 1,
          badges: u.badges ?? [],
          avatar: u.avatar ?? getAvatar(u.name),
        });
      } else {
        // Fallback to session data + mock
        const mock = mockUsers.find((u) => u.id === sessionUser.id);
        if (mock) {
          setUser({ ...mock, userId: mock.id, avatar: mock.avatar });
        }
      }
    } catch {
      const mock = mockUsers.find((u) => u.id === sessionUser.id);
      if (mock) setUser({ ...mock, userId: mock.id, avatar: mock.avatar });
    } finally {
      setLoading(false);
    }
  }, [sessionUser, sessionLoading]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { user, loading, refetch: fetchProfile };
}
