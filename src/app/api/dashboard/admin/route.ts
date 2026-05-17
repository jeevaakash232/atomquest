import { getSession } from "@/lib/auth";
import { getAdminDashboard } from "@/services/adminDashboard.service";
export const runtime = "nodejs";
export async function GET() {
  const session = await getSession();
  if (!session?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!["ADMIN","EXECUTIVE"].includes(session.role))
    return Response.json({ error: "Forbidden — Admin role required" }, { status: 403 });
  try {
    const data = await getAdminDashboard(session.id);
    return Response.json({ success: true, ...data });
  } catch (err) {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
