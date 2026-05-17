// ─── AWS Lambda Invocation Service ───────────────────────────────────────────
import { LambdaClient, InvokeCommand, InvocationType } from "@aws-sdk/client-lambda";
import { awsConfig, lambdaConfig } from "./config";

const lambda = new LambdaClient(awsConfig);

type LambdaResponse<T = unknown> = {
  statusCode: number;
  body: T;
  error?: string;
};

/**
 * Invoke a Lambda function synchronously and return parsed response.
 */
async function invokeLambda<TPayload, TResponse>(
  functionName: string,
  payload: TPayload,
  invocationType: InvocationType = "RequestResponse"
): Promise<LambdaResponse<TResponse>> {
  const command = new InvokeCommand({
    FunctionName: functionName,
    InvocationType: invocationType,
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  const result = await lambda.send(command);

  if (result.FunctionError) {
    const errorBody = result.Payload
      ? JSON.parse(Buffer.from(result.Payload).toString())
      : { message: "Lambda function error" };
    return { statusCode: 500, body: null as TResponse, error: errorBody.errorMessage ?? "Lambda error" };
  }

  if (!result.Payload) {
    return { statusCode: 200, body: null as TResponse };
  }

  const parsed = JSON.parse(Buffer.from(result.Payload).toString());
  return {
    statusCode: parsed.statusCode ?? 200,
    body: typeof parsed.body === "string" ? JSON.parse(parsed.body) : parsed.body,
  };
}

/**
 * Invoke Lambda asynchronously (fire-and-forget) — for notifications, batch jobs.
 */
async function invokeLambdaAsync<TPayload>(
  functionName: string,
  payload: TPayload
): Promise<void> {
  await invokeLambda(functionName, payload, "Event");
}

// ─── Analytics Lambda ─────────────────────────────────────────────────────────

export type AnalyticsPayload = {
  action: "GET_DEPT_ANALYTICS" | "GET_ORG_SUMMARY" | "GET_USER_PRODUCTIVITY" | "GET_GOAL_TRENDS";
  params: Record<string, unknown>;
};

export type AnalyticsResult = {
  departments?: Array<{ name: string; productivity: number; goalsCompleted: number; riskLevel: string }>;
  orgScore?: number;
  trends?: Array<{ month: string; completed: number; submitted: number }>;
  userProductivity?: { score: number; trend: string; weeklyData: Array<{ day: string; score: number }> };
};

export async function invokeAnalyticsLambda(
  payload: AnalyticsPayload
): Promise<AnalyticsResult> {
  const result = await invokeLambda<AnalyticsPayload, AnalyticsResult>(
    lambdaConfig.functions.analytics,
    payload
  );
  if (result.error) throw new Error(result.error);
  return result.body;
}

// ─── AI Batch Lambda ──────────────────────────────────────────────────────────

export type AIBatchPayload = {
  action: "GENERATE_WEEKLY_INSIGHTS" | "BATCH_RISK_ANALYSIS" | "GENERATE_SUMMARIES";
  userIds?: string[];
  departmentId?: string;
};

export async function invokeAIBatchLambda(payload: AIBatchPayload): Promise<void> {
  await invokeLambdaAsync(lambdaConfig.functions.aiBatch, payload);
}

// ─── Notifications Lambda ─────────────────────────────────────────────────────

export type NotificationPayload = {
  action: "SEND_GOAL_APPROVED" | "SEND_GOAL_REJECTED" | "SEND_RISK_ALERT" | "SEND_WEEKLY_SUMMARY";
  userId: string;
  data: Record<string, unknown>;
};

export async function invokeNotificationsLambda(payload: NotificationPayload): Promise<void> {
  await invokeLambdaAsync(lambdaConfig.functions.notifications, payload);
}
