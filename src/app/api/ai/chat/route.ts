// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
// Streams Claude responses back to the client via Server-Sent Events.
import { NextRequest } from "next/server";
import { chatWithClaude, type ChatMessage } from "@/lib/ai/anthropic";
import { putActivity } from "@/lib/aws/dynamodb";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userRole = "EMPLOYEE", department = "Engineering", userId = "usr_1" } = body as {
      messages: ChatMessage[];
      userRole: string;
      department: string;
      userId: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "messages array is required" }, { status: 400 });
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = "";

          for await (const chunk of chatWithClaude({ messages, userRole, department })) {
            fullResponse += chunk;
            // SSE format: data: <chunk>\n\n
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
          }

          // Signal completion
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();

          // Log activity to DynamoDB (fire-and-forget, don't await)
          putActivity({
            activityId: randomUUID(),
            userId,
            userName: "User",
            userAvatar: "U",
            action: "used AI assistant",
            target: messages[messages.length - 1]?.content?.slice(0, 80) ?? "AI chat",
            type: "ai",
            createdAt: new Date().toISOString(),
          }).catch(console.error);

        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[/api/ai/chat]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
