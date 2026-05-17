import { getSession } from "@/lib/auth";
import { getExecutiveDashboard } from "@/services/executiveDashboard.service";
export const runtime = "nodejs";
export async function GET() {
  const session = await getSession();
  if (!session?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "EXECUTIVE")
    return Response.json({ error: "Forbidden — Executive role required" }, { status: 403 });
  try {
    const data = await getExecutiveDashboard(session.id);
    return Response.json({ success: true, ...data });
  } catch (err) {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
