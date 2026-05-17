// ─── POST /api/upload/presigned-url ───────────────────────────────────────────
// Generates presigned S3 URLs for direct browser → S3 uploads.
import { NextRequest } from "next/server";
import { getPresignedUploadUrl, buildGoalEvidenceKey } from "@/lib/aws/s3";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, contentType, userId, goalId } = body as {
      fileName: string;
      contentType: string;
      userId: string;
      goalId?: string;
    };

    if (!fileName || !contentType || !userId) {
      return Response.json({ error: "fileName, contentType, and userId are required" }, { status: 400 });
    }

    // Build S3 key based on context
    const key = goalId
      ? buildGoalEvidenceKey({ userId, goalId, fileName })
      : `uploads/${userId}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const result = await getPresignedUploadUrl({
      key,
      contentType,
      expiresIn: 300, // 5 minutes
    });

    return Response.json({
      success: true,
      uploadUrl: result.uploadUrl,
      key: result.key,
      publicUrl: result.publicUrl,
    });
  } catch (err) {
    console.error("[POST /api/upload/presigned-url]", err);
    return Response.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}