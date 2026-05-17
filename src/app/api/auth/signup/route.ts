// ─── POST /api/auth/signup ────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { signup } from "@/lib/auth";

export const runtime = "nodejs";

const ROLE_REDIRECTS: Record<string, string> = {
  EMPLOYEE:  "/employee",
  MANAGER:   "/manager/approvals",
  ADMIN:     "/admin",
  EXECUTIVE: "/executive",
};

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, department } = await req.json();

    if (!name || !email || !password || !role) {
      return Response.json({ error: "Name, email, password and role are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const result = await signup({ name, email, password, role, department });

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 409 });
    }

    const redirectTo = ROLE_REDIRECTS[result.role ?? "EMPLOYEE"] ?? "/employee";

    const response = NextResponse.json({ success: true, role: result.role, redirectTo });

    response.cookies.set("atomquest-session", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[POST /api/auth/signup]", err);
    return Response.json({ error: "Signup failed" }, { status: 500 });
  }
}
