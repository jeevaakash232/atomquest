// ─── GET /api/user/dashboard ──────────────────────────────────────────────────
import { getSession } from "@/lib/auth";
import { getUser, getUserGoals, getRecentActivity } from "@/lib/aws/dynamodb";
import { users as mockUsers, goals as mockGoals, activityFeed as mockActivity } from "@/mock/data";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.id;

  const [userResult, goalsResult, activityResult] = await Promise.allSettled([
    getUser(userId),
    getUserGoals(userId),
    getRecentActivity(10),
  ]);

  const user =
    userResult.status === "fulfilled" && userResult.value
      ? userResult.value
      : mockUsers.find((u) => u.id === userId);

  const goals =
    goalsResult.status === "fulfilled" && goalsResult.value.length > 0
      ? goalsResult.value
      : mockGoals
          .filter((g) => g.userId === userId)
          .map((g) => ({
            ...g,
            goalId: g.id,
            description: g.description ?? "",
            aiGenerated: false,
            evidenceKeys: [],
            updatedAt: g.createdAt,
          }));

  const activity =
    activityResult.status === "fulfilled" && activityResult.value.length > 0
      ? activityResult.value
      : mockActivity.slice(0, 10).map((a) => ({
          activityId: a.id,
          userId,
          userName: a.user,
          userAvatar: a.avatar,
          action: a.action,
          target: a.target,
          type: a.type,
          createdAt: new Date().toISOString(),
        }));

  return Response.json({ success: true, user, goals, activity });
}
