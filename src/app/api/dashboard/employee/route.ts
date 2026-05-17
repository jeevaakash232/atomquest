import { getSession } from "@/lib/auth";
import { getEmployeeDashboard } from "@/services/employeeDashboard.service";
export const runtime = "nodejs";
export async function GET() {
  const session = await getSession();
  if (!session?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "EMPLOYEE" && session.role !== "MANAGER" && session.role !== "ADMIN" && session.role !== "EXECUTIVE")
    return Response.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = await getEmployeeDashboard(session.id);
    return Response.json({ success: true, ...data });
  } catch (err) {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
