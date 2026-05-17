// ─── GET /api/auth/session ────────────────────────────────────────────────────
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ user: null });
  return Response.json({ user: session });
}
