// ─── POST /api/ai/generate-goal ───────────────────────────────────────────────
// Generates a SMART goal using Claude claude-opus-4-7.
// Optionally streams the response for real-time UI updates.
import { NextRequest } from "next/server";
import { generateSmartGoal, generateSmartGoalStream } from "@/lib/ai/anthropic";
import { putActivity } from "@/lib/aws/dynamodb";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      input,
      department = "Engineering",
      role = "EMPLOYEE",
      userId = "usr_1",
      stream: useStream = false,
      existingGoals = [],
    } = body as {
      input: string;
      department: string;
      role: string;
      userId: string;
      stream: boolean;
      existingGoals: string[];
    };

    if (!input?.trim()) {
      return Response.json({ error: "input is required" }, { status: 400 });
    }

    // ── Streaming mode ──────────────────────────────────────────────────────
    if (useStream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of generateSmartGoalStream({ input, department, role })) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
            }
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Stream error";
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // ── Non-streaming mode ──────────────────────────────────────────────────
    const result = await generateSmartGoal({ input, department, role, existingGoals });

    // Log to DynamoDB activity feed
    putActivity({
      activityId: randomUUID(),
      userId,
      userName: "User",
      userAvatar: "U",
      action: "generated a SMART goal with AI",
      target: result.title,
      type: "ai",
      createdAt: new Date().toISOString(),
    }).catch(console.error);

    return Response.json({ success: true, goal: result });
  } catch (err) {
    console.error("[/api/ai/generate-goal]", err);
    const message = err instanceof Error ? err.message : "Failed to generate goal";
    return Response.json({ error: message }, { status: 500 });
  }
}
