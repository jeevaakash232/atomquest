// ─── POST /api/auth/login ─────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";

export const runtime = "nodejs";

const ROLE_REDIRECTS: Record<string, string> = {
  EMPLOYEE:  "/employee",
  MANAGER:   "/manager/approvals",
  ADMIN:     "/admin",
  EXECUTIVE: "/executive",
};

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password required" }, { status: 400 });
    }

    const result = await login(email, password);

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 401 });
    }

    const redirectTo = ROLE_REDIRECTS[result.role ?? "EMPLOYEE"] ?? "/employee";

    const response = NextResponse.json({
      success: true,
      role: result.role,
      redirectTo,
    });

    response.cookies.set("atomquest-session", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
