// ─── GET /api/user/profile ────────────────────────────────────────────────────
import { getSession } from "@/lib/auth";
import { getUser } from "@/lib/aws/dynamodb";
import { users as mockUsers } from "@/mock/data";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUser(session.id);
    if (user) return Response.json({ success: true, user });

    const mock = mockUsers.find((u) => u.id === session.id);
    if (mock) return Response.json({ success: true, user: mock });

    return Response.json({ error: "User not found" }, { status: 404 });
  } catch {
    const mock = mockUsers.find((u) => u.id === session.id);
    if (mock) return Response.json({ success: true, user: mock });
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
