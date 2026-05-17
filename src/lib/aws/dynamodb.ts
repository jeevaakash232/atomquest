// ─── AWS DynamoDB Service ─────────────────────────────────────────────────────
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  TransactWriteCommand,
  type QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { awsConfig, dynamoConfig } from "./config";

const ddbClient = new DynamoDBClient(awsConfig);
export const ddb = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

// ─── Goal Operations ──────────────────────────────────────────────────────────

export type GoalRecord = {
  PK: string;          // USER#userId
  SK: string;          // GOAL#goalId
  goalId: string;
  userId: string;
  title: string;
  description: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "LOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  progress: number;
  deadline: string;
  kpis: string[];
  xpReward: number;
  aiGenerated: boolean;
  evidenceKeys: string[];  // S3 keys
  createdAt: string;
  updatedAt: string;
  GSI1PK?: string;     // STATUS#status  (for status-based queries)
  GSI1SK?: string;     // CREATED#timestamp
};

export async function putGoal(goal: GoalRecord): Promise<void> {
  await ddb.send(
    new PutCommand({ TableName: dynamoConfig.tables.goals, Item: goal })
  );
}

export async function getGoal(userId: string, goalId: string): Promise<GoalRecord | null> {
  const result = await ddb.send(
    new GetCommand({
      TableName: dynamoConfig.tables.goals,
      Key: { PK: `USER#${userId}`, SK: `GOAL#${goalId}` },
    })
  );
  return (result.Item as GoalRecord) ?? null;
}

export async function getUserGoals(userId: string): Promise<GoalRecord[]> {
  const result = await ddb.send(
    new QueryCommand({
      TableName: dynamoConfig.tables.goals,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":sk": "GOAL#",
      },
    })
  );
  return (result.Items as GoalRecord[]) ?? [];
}

export async function updateGoalProgress(
  userId: string,
  goalId: string,
  progress: number
): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: dynamoConfig.tables.goals,
      Key: { PK: `USER#${userId}`, SK: `GOAL#${goalId}` },
      UpdateExpression: "SET progress = :p, updatedAt = :u",
      ExpressionAttributeValues: {
        ":p": progress,
        ":u": new Date().toISOString(),
      },
    })
  );
}

export async function updateGoalStatus(
  userId: string,
  goalId: string,
  status: GoalRecord["status"]
): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: dynamoConfig.tables.goals,
      Key: { PK: `USER#${userId}`, SK: `GOAL#${goalId}` },
      UpdateExpression: "SET #s = :s, updatedAt = :u, GSI1PK = :gsi1pk",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: {
        ":s": status,
        ":u": new Date().toISOString(),
        ":gsi1pk": `STATUS#${status}`,
      },
    })
  );
}

export async function addEvidenceToGoal(
  userId: string,
  goalId: string,
  s3Key: string
): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: dynamoConfig.tables.goals,
      Key: { PK: `USER#${userId}`, SK: `GOAL#${goalId}` },
      UpdateExpression: "SET evidenceKeys = list_append(if_not_exists(evidenceKeys, :empty), :key), updatedAt = :u",
      ExpressionAttributeValues: {
        ":key": [s3Key],
        ":empty": [],
        ":u": new Date().toISOString(),
      },
    })
  );
}

// ─── User Operations ──────────────────────────────────────────────────────────

export type UserRecord = {
  PK: string;   // USER#userId
  SK: string;   // PROFILE
  userId: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN" | "EXECUTIVE";
  department: string;
  xp: number;
  streak: number;
  level: number;
  badges: string[];
  createdAt: string;
  updatedAt: string;
};

export async function putUser(user: UserRecord): Promise<void> {
  await ddb.send(
    new PutCommand({ TableName: dynamoConfig.tables.users, Item: user })
  );
}

export async function getUser(userId: string): Promise<UserRecord | null> {
  const result = await ddb.send(
    new GetCommand({
      TableName: dynamoConfig.tables.users,
      Key: { PK: `USER#${userId}`, SK: "PROFILE" },
    })
  );
  return (result.Item as UserRecord) ?? null;
}

export async function getAllUsers(): Promise<UserRecord[]> {
  const result = await ddb.send(
    new ScanCommand({ TableName: dynamoConfig.tables.users })
  );
  return (result.Items as UserRecord[]) ?? [];
}

export async function updateUserXP(userId: string, xpDelta: number): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: dynamoConfig.tables.users,
      Key: { PK: `USER#${userId}`, SK: "PROFILE" },
      UpdateExpression: "SET xp = xp + :delta, updatedAt = :u",
      ExpressionAttributeValues: {
        ":delta": xpDelta,
        ":u": new Date().toISOString(),
      },
    })
  );
}

// ─── Activity Feed Operations ─────────────────────────────────────────────────

export type ActivityRecord = {
  PK: string;   // ORG#default  (org-wide feed)
  SK: string;   // ACTIVITY#timestamp#activityId
  activityId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  target: string;
  type: string;
  createdAt: string;
  ttl?: number; // auto-expire after 30 days
};

export async function putActivity(activity: Omit<ActivityRecord, "PK" | "SK" | "ttl">): Promise<void> {
  const timestamp = new Date().toISOString();
  const ttl = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
  await ddb.send(
    new PutCommand({
      TableName: dynamoConfig.tables.activity,
      Item: {
        ...activity,
        PK: "ORG#default",
        SK: `ACTIVITY#${timestamp}#${activity.activityId}`,
        ttl,
      },
    })
  );
}

export async function getRecentActivity(limit = 20): Promise<ActivityRecord[]> {
  const result = await ddb.send(
    new QueryCommand({
      TableName: dynamoConfig.tables.activity,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": "ORG#default" },
      ScanIndexForward: false, // newest first
      Limit: limit,
    })
  );
  return (result.Items as ActivityRecord[]) ?? [];
}

// ─── Notification Operations ──────────────────────────────────────────────────

export type NotificationRecord = {
  PK: string;   // USER#userId
  SK: string;   // NOTIF#timestamp#notifId
  notifId: string;
  userId: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  read: boolean;
  createdAt: string;
  ttl?: number;
};

export async function putNotification(
  notif: Omit<NotificationRecord, "PK" | "SK" | "ttl">
): Promise<void> {
  const ttl = Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60; // 90 days
  await ddb.send(
    new PutCommand({
      TableName: dynamoConfig.tables.notifications,
      Item: {
        ...notif,
        PK: `USER#${notif.userId}`,
        SK: `NOTIF#${notif.createdAt}#${notif.notifId}`,
        ttl,
      },
    })
  );
}

export async function getUserNotifications(userId: string, limit = 30): Promise<NotificationRecord[]> {
  const result = await ddb.send(
    new QueryCommand({
      TableName: dynamoConfig.tables.notifications,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": `USER#${userId}` },
      ScanIndexForward: false,
      Limit: limit,
    })
  );
  return (result.Items as NotificationRecord[]) ?? [];
}

export async function markNotificationRead(userId: string, sk: string): Promise<void> {
  await ddb.send(
    new UpdateCommand({
      TableName: dynamoConfig.tables.notifications,
      Key: { PK: `USER#${userId}`, SK: sk },
      UpdateExpression: "SET #r = :r",
      ExpressionAttributeNames: { "#r": "read" },
      ExpressionAttributeValues: { ":r": true },
    })
  );
}
