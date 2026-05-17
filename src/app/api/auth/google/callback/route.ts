// ─── GET /api/auth/google/callback ───────────────────────────────────────────
// After Google auth: if new user → redirect to /select-role, else → dashboard
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getAllUsers } from "@/lib/aws/dynamodb";

export const runtime = "nodejs";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "atomquest-secret-key-change-in-production"
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_cancelled`);
  }

  try {
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri:  redirectUri,
        grant_type:    "authorization_code",
      }),
    });

    if (!tokenRes.ok) throw new Error("Token exchange failed");
    const tokens = await tokenRes.json();

    // Get Google user info
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!userInfoRes.ok) throw new Error("Failed to get user info");

    const googleUser = await userInfoRes.json();
    const email = googleUser.email?.toLowerCase();
    const name  = googleUser.name ?? email?.split("@")[0] ?? "User";
    const picture = googleUser.picture ?? "";

    if (!email) throw new Error("No email from Google");

    // Check if user already exists
    let existingRole: string | null = null;
    let existingUserId: string | null = null;
    try {
      const allUsers = await getAllUsers();
      const found = allUsers.find((u) => u.email.toLowerCase() === email);
      if (found) {
        existingRole   = found.role;
        existingUserId = found.userId;
      }
    } catch {
      // DynamoDB unavailable
    }

    // Store Google profile in a short-lived temp cookie, then redirect
    // If existing user → create session directly
    // If new user → go to role selection page
    if (existingRole && existingUserId) {
      // Existing user — create full session
      const { createSession } = await import("@/lib/auth");
      const token = await createSession({
        id: existingUserId,
        name,
        email,
        role: existingRole as any,
        department: "General",
      });

      const ROLE_REDIRECTS: Record<string, string> = {
        EMPLOYEE: "/employee", MANAGER: "/manager/approvals",
        ADMIN: "/admin", EXECUTIVE: "/executive",
      };

      const response = NextResponse.redirect(`${baseUrl}${ROLE_REDIRECTS[existingRole] ?? "/employee"}`);
      response.cookies.set("atomquest-session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    // New user — store temp Google data and redirect to role selection
    const tempToken = await new SignJWT({ email, name, picture, provider: "google" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("10m")
      .sign(SECRET);

    const response = NextResponse.redirect(`${baseUrl}/select-role`);
    response.cookies.set("atomquest-google-temp", tempToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });
    return response;

  } catch (err) {
    console.error("[Google OAuth callback]", err);
    return NextResponse.redirect(`${baseUrl}/login?error=google_failed`);
  }
}
