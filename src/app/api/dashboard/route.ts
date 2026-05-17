// ─── GET /api/dashboard ───────────────────────────────────────────────────────
// Auto-detects role and returns the correct dashboard payload
import { getSession } from "@/lib/auth";
import { getEmployeeDashboard }  from "@/services/employeeDashboard.service";
import { getManagerDashboard }   from "@/services/managerDashboard.service";
import { getAdminDashboard }     from "@/services/adminDashboard.service";
import { getExecutiveDashboard } from "@/services/executiveDashboard.service";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId, role } = session;

  try {
    let data: any;
    switch (role) {
      case "MANAGER":   data = await getManagerDashboard(userId);   break;
      case "ADMIN":     data = await getAdminDashboard(userId);     break;
      case "EXECUTIVE": data = await getExecutiveDashboard(userId); break;
      default:          data = await getEmployeeDashboard(userId);  break;
    }
    return Response.json({ success: true, ...data });
  } catch (err) {
    console.error("[GET /api/dashboard]", err);
    return Response.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
