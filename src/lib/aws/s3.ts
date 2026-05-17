// ─── AWS S3 Service ───────────────────────────────────────────────────────────
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { awsConfig, s3Config } from "./config";

const s3 = new S3Client(awsConfig);

export type S3UploadResult = {
  key: string;
  url: string;
  bucket: string;
  size: number;
  contentType: string;
};

/**
 * Generate a presigned URL for direct browser → S3 upload.
 * The frontend calls this endpoint, gets the URL, then PUTs directly to S3.
 */
export async function getPresignedUploadUrl(params: {
  key: string;
  contentType: string;
  expiresIn?: number; // seconds, default 300
}): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const { key, contentType, expiresIn = 300 } = params;

  const command = new PutObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
    ContentType: contentType,
    Metadata: {
      uploadedAt: new Date().toISOString(),
      app: "atomquest",
    },
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn });
  const publicUrl = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;

  return { uploadUrl, key, publicUrl };
}

/**
 * Generate a presigned URL for reading a private S3 object.
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

/**
 * Upload a Buffer/string directly from the server (for small files, AI outputs, etc.)
 */
export async function uploadToS3(params: {
  key: string;
  body: Buffer | string;
  contentType: string;
  metadata?: Record<string, string>;
}): Promise<S3UploadResult> {
  const { key, body, contentType, metadata = {} } = params;
  const bodyBuffer = typeof body === "string" ? Buffer.from(body, "utf-8") : body;

  await s3.send(
    new PutObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key,
      Body: bodyBuffer,
      ContentType: contentType,
      Metadata: { ...metadata, uploadedAt: new Date().toISOString() },
    })
  );

  return {
    key,
    url: `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`,
    bucket: s3Config.bucketName,
    size: bodyBuffer.length,
    contentType,
  };
}

/**
 * Delete an object from S3.
 */
export async function deleteFromS3(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({ Bucket: s3Config.bucketName, Key: key })
  );
}

/**
 * List objects under a prefix (e.g. all files for a goal).
 */
export async function listS3Objects(prefix: string) {
  const result = await s3.send(
    new ListObjectsV2Command({
      Bucket: s3Config.bucketName,
      Prefix: prefix,
    })
  );
  return result.Contents ?? [];
}

/**
 * Check if an object exists.
 */
export async function s3ObjectExists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: s3Config.bucketName, Key: key }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Build a structured S3 key for goal evidence files.
 */
export function buildGoalEvidenceKey(params: {
  userId: string;
  goalId: string;
  fileName: string;
}): string {
  const { userId, goalId, fileName } = params;
  const timestamp = Date.now();
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `evidence/${userId}/${goalId}/${timestamp}_${sanitized}`;
}

/**
 * Build a structured S3 key for AI-generated reports.
 */
export function buildAiReportKey(params: {
  type: "goal" | "analytics" | "summary";
  entityId: string;
}): string {
  const { type, entityId } = params;
  const date = new Date().toISOString().split("T")[0];
  return `ai-reports/${type}/${date}/${entityId}.json`;
}
