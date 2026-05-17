// ─── GET/POST /api/schedule ───────────────────────────────────────────────────
import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

// In-memory store (replace with DynamoDB in production)
const scheduleStore = new Map<string, any[]>();

export async function GET() {
  const session = await getSession();
  if (!session?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const reminders = scheduleStore.get(session.id) ?? getDefaultReminders();
  return Response.json({ success: true, reminders });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, reminder } = body;

  const current = scheduleStore.get(session.id) ?? getDefaultReminders();

  if (action === "add") {
    const newReminder = { ...reminder, id: `rem_${Date.now()}`, createdAt: new Date().toISOString() };
    scheduleStore.set(session.id, [...current, newReminder]);
    return Response.json({ success: true, reminder: newReminder });
  }

  if (action === "toggle") {
    const updated = current.map((r: any) =>
      r.id === reminder.id ? { ...r, enabled: !r.enabled } : r
    );
    scheduleStore.set(session.id, updated);
    return Response.json({ success: true });
  }

  if (action === "delete") {
    scheduleStore.set(session.id, current.filter((r: any) => r.id !== reminder.id));
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}

function getDefaultReminders() {
  return [
    { id: "rem_1", title: "Morning Goal Check-in",   time: "09:00", days: ["Mon","Tue","Wed","Thu","Fri"], enabled: true,  type: "PROGRESS_UPDATE" },
    { id: "rem_2", title: "End-of-Day Progress Log",  time: "17:30", days: ["Mon","Tue","Wed","Thu","Fri"], enabled: true,  type: "PROGRESS_UPDATE" },
    { id: "rem_3", title: "Weekly Review",            time: "10:00", days: ["Mon"],                         enabled: false, type: "WEEKLY_REVIEW" },
    { id: "rem_4", title: "Daily Report",             time: "08:00", days: ["Mon","Tue","Wed","Thu","Fri"], enabled: true,  type: "DAILY_REPORT" },
  ];
}
