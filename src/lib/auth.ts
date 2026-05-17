// ─── JWT Auth ─────────────────────────────────────────────────────────────────
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getUser, putUser, getAllUsers, type UserRecord } from "@/lib/aws/dynamodb";
import { randomUUID } from "crypto";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "atomquest-secret-key-change-in-production"
);
const COOKIE_NAME = "atomquest-session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN" | "EXECUTIVE";
  department: string;
};

// ─── In-memory user store (persists for server lifetime, DynamoDB is primary) ─
// Keyed by email → { hashedPassword (plain for demo), userId }
const runtimeUsers = new Map<string, { password: string; userId: string }>();

// ─── Seed default demo accounts ───────────────────────────────────────────────
const DEMO_SEEDS: Array<Omit<UserRecord, "PK" | "SK" | "createdAt" | "updatedAt"> & { password: string }> = [
  { userId: "usr_1", name: "Alex Sterling",  email: "alex@atomquest.inc",   password: "password123", role: "EMPLOYEE",  department: "Engineering", xp: 12450, streak: 14, level: 9,  badges: ["Top Performer", "Consistency Champion", "AI Productivity Master"] },
  { userId: "usr_2", name: "Sarah Chen",     email: "sarah@atomquest.inc",  password: "password123", role: "MANAGER",   department: "Engineering", xp: 18200, streak: 22, level: 12, badges: ["Fast Approver", "Team Leader"] },
  { userId: "usr_6", name: "Priya Nair",     email: "priya@atomquest.inc",  password: "password123", role: "ADMIN",     department: "Operations",  xp: 22000, streak: 30, level: 15, badges: ["System Guardian", "Audit Master"] },
  { userId: "usr_7", name: "Marcus Webb",    email: "marcus@atomquest.inc", password: "password123", role: "EXECUTIVE", department: "Executive",   xp: 35000, streak: 45, level: 20, badges: ["Visionary", "Growth Driver"] },
];

// Seed runtime map on module load
DEMO_SEEDS.forEach((u) => {
  runtimeUsers.set(u.email.toLowerCase(), { password: u.password, userId: u.userId });
});

// ─── JWT helpers ──────────────────────────────────────────────────────────────
export async function createSession(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export async function signup(params: {
  name: string;
  email: string;
  password: string;
  role: SessionUser["role"];
  department: string;
}): Promise<{ success: boolean; error?: string; token?: string; role?: string }> {
  const email = params.email.toLowerCase().trim();

  // Check if email already exists
  if (runtimeUsers.has(email)) {
    return { success: false, error: "An account with this email already exists" };
  }

  // Also check DynamoDB
  try {
    const allUsers = await getAllUsers();
    const existing = allUsers.find((u) => u.email.toLowerCase() === email);
    if (existing) return { success: false, error: "An account with this email already exists" };
  } catch {
    // DynamoDB unavailable — continue
  }

  const userId = `usr_${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  const newUser: UserRecord = {
    PK: `USER#${userId}`,
    SK: "PROFILE",
    userId,
    name: params.name.trim(),
    email,
    role: params.role,
    department: params.department.trim() || params.role,
    xp: 0,
    streak: 0,
    level: 1,
    badges: [],
    createdAt: now,
    updatedAt: now,
  };

  // Save to DynamoDB
  try {
    await putUser(newUser);
  } catch {
    // DynamoDB unavailable — store in memory only
  }

  // Register in runtime map
  runtimeUsers.set(email, { password: params.password, userId });

  const sessionUser: SessionUser = {
    id: userId,
    name: newUser.name,
    email,
    role: params.role,
    department: newUser.department,
  };

  const token = await createSession(sessionUser);
  return { success: true, token, role: params.role };
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; token?: string; role?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const entry = runtimeUsers.get(normalizedEmail);

  if (!entry || entry.password !== password) {
    return { success: false, error: "Invalid email or password" };
  }

  // Get full profile
  let profile: UserRecord | null = null;
  try {
    profile = await getUser(entry.userId);
  } catch {
    // DynamoDB unavailable
  }

  // Fallback: find in demo seeds
  if (!profile) {
    const seed = DEMO_SEEDS.find((s) => s.email.toLowerCase() === normalizedEmail);
    if (seed) {
      const now = new Date().toISOString();
      profile = { ...seed, PK: `USER#${seed.userId}`, SK: "PROFILE", createdAt: now, updatedAt: now };
      // Try to seed DynamoDB
      try { await putUser(profile); } catch {}
    }
  }

  if (!profile) return { success: false, error: "User profile not found" };

  const sessionUser: SessionUser = {
    id: profile.userId,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    department: profile.department,
  };

  const token = await createSession(sessionUser);
  return { success: true, token, role: profile.role };
}
