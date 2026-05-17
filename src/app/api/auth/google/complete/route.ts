// ─── POST /api/auth/google/complete ──────────────────────────────────────────
// Finalizes Google signup after user selects their role
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createSession, type SessionUser } from "@/lib/auth";
import { putUser } from "@/lib/aws/dynamodb";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "atomquest-secret-key-change-in-production"
);

const ROLE_REDIRECTS: Record<string, string> = {
  EMPLOYEE: "/employee", MANAGER: "/manager/approvals",
  ADMIN: "/admin", EXECUTIVE: "/executive",
};

export async function POST(req: NextRequest) {
  try {
    const tempToken = req.cookies.get("atomquest-google-temp")?.value;
    if (!tempToken) {
      return Response.json({ error: "Session expired. Please sign in again." }, { status: 401 });
    }

    const { payload } = await jwtVerify(tempToken, SECRET);
    const { email, name, picture } = payload as { email: string; name: string; picture: string };

    const { role, department } = await req.json();
    if (!role) return Response.json({ error: "Role is required" }, { status: 400 });

    const userId = `usr_${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    // Save to DynamoDB
    try {
      await putUser({
        PK: `USER#${userId}`,
        SK: "PROFILE",
        userId,
        name,
        email,
        role,
        department: department || role,
        xp: 0,
        streak: 0,
        level: 1,
        badges: [],
        createdAt: now,
        updatedAt: now,
      });
    } catch {
      // DynamoDB unavailable — continue
    }

    const sessionUser: SessionUser = {
      id: userId, name, email, role, department: department || role,
    };
    const token = await createSession(sessionUser);
    const redirectTo = ROLE_REDIRECTS[role] ?? "/employee";

    const response = NextResponse.json({ success: true, redirectTo });

    // Set real session cookie
    response.cookies.set("atomquest-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Clear temp cookie
    response.cookies.set("atomquest-google-temp", "", { maxAge: 0, path: "/" });

    return response;
  } catch (err) {
    console.error("[Google complete]", err);
    return Response.json({ error: "Failed to complete signup" }, { status: 500 });
  }
}
