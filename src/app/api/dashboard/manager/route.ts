import { getSession } from "@/lib/auth";
import { getManagerDashboard } from "@/services/managerDashboard.service";
export const runtime = "nodejs";
export async function GET() {
  const session = await getSession();
  if (!session?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!["MANAGER","ADMIN","EXECUTIVE"].includes(session.role))
    return Response.json({ error: "Forbidden — Manager role required" }, { status: 403 });
  try {
    const data = await getManagerDashboard(session.id);
    return Response.json({ success: true, ...data });
  } catch (err) {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
