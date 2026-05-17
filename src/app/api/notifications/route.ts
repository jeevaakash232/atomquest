// ─── Notifications API Routes ─────────────────────────────────────────────────
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import {
  getUserNotifications,
  putNotification,
  markNotificationRead,
  type NotificationRecord,
} from "@/lib/aws/dynamodb";

export const runtime = "nodejs";

// GET /api/notifications?userId=usr_1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") ?? "30", 10);

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const notifications = await getUserNotifications(userId, Math.min(limit, 50));
    return Response.json({ success: true, notifications });
  } catch (err) {
    console.error("[GET /api/notifications]", err);
    return Response.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// POST /api/notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title, message, type = "info", priority = "MEDIUM" } = body as {
      userId: string;
      title: string;
      message: string;
      type: NotificationRecord["type"];
      priority: NotificationRecord["priority"];
    };

    if (!userId || !title || !message) {
      return Response.json({ error: "userId, title, and message are required" }, { status: 400 });
    }

    const notification: Omit<NotificationRecord, "PK" | "SK" | "ttl"> = {
      notifId: randomUUID(),
      userId,
      title,
      message,
      type,
      priority,
      read: false,
      createdAt: new Date().toISOString(),
    };

    await putNotification(notification);
    return Response.json({ success: true, notification });
  } catch (err) {
    console.error("[POST /api/notifications]", err);
    return Response.json({ error: "Failed to create notification" }, { status: 500 });
  }
}