// ─── AWS SDK Configuration ────────────────────────────────────────────────────
// All AWS clients are server-side only. Never import in client components.

export const awsConfig = {
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
};

export const s3Config = {
  bucketName: process.env.AWS_S3_BUCKET_NAME ?? "atomquest-files",
  region: process.env.AWS_S3_REGION ?? "us-east-1",
};

export const dynamoConfig = {
  tables: {
    goals: process.env.DYNAMODB_TABLE_GOALS ?? "atomquest-goals",
    users: process.env.DYNAMODB_TABLE_USERS ?? "atomquest-users",
    activity: process.env.DYNAMODB_TABLE_ACTIVITY ?? "atomquest-activity",
    notifications: process.env.DYNAMODB_TABLE_NOTIFICATIONS ?? "atomquest-notifications",
  },
};

export const lambdaConfig = {
  functions: {
    analytics: process.env.LAMBDA_FUNCTION_ANALYTICS ?? "atomquest-analytics",
    aiBatch: process.env.LAMBDA_FUNCTION_AI_BATCH ?? "atomquest-ai-batch",
    notifications: process.env.LAMBDA_FUNCTION_NOTIFICATIONS ?? "atomquest-notifications-processor",
  },
};
