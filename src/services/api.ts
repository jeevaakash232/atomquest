// ─── Frontend API Service Layer ──────────────────────────────────────────────
// Client-side functions to call our Next.js API routes.

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ─── AI Services ──────────────────────────────────────────────────────────────

export type SmartGoalResult = {
  title: string;
  description: string;
  kpis: string[];
  timeline: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  xpReward: number;
  confidence: number;
};

export async function generateSmartGoal(params: {
  input: string;
  department: string;
  role: string;
  userId: string;
  existingGoals?: string[];
}): Promise<SmartGoalResult> {
  const response = await fetch("/api/ai/generate-goal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.error ?? "Failed to generate goal");
  return result.goal;
}

export async function* streamSmartGoal(params: {
  input: string;
  department: string;
  role: string;
  userId: string;
}): AsyncGenerator<string> {
  const response = await fetch("/api/ai/generate-goal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, stream: true }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.error ?? `Request failed with status ${response.status}`);
  }

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) yield parsed.text;
            if (parsed.error) throw new Error(parsed.error);
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function* streamAIChat(params: {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  userRole: string;
  department: string;
  userId: string;
}): AsyncGenerator<string> {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  // Surface HTTP errors before touching the stream
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.error ?? `Request failed with status ${response.status}`);
  }

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) yield parsed.text;
            if (parsed.error) throw new Error(parsed.error);
          } catch (e) {
            if (e instanceof SyntaxError) continue; // skip malformed JSON
            throw e;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function generateProductivityInsight(params: {
  userName: string;
  department: string;
  goalsCompleted: number;
  goalsActive: number;
  streak: number;
  weeklyScores: number[];
  topGoal?: string;
}) {
  const response = await fetch("/api/ai/productivity-insight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.error ?? "Failed to generate insight");
  return result.insight;
}

export async function generateExecutiveSummary(params: {
  orgProductivity: number;
  departments: Array<{ name: string; productivity: number; riskLevel: string }>;
  totalGoalsCompleted: number;
  totalGoalsActive: number;
  aiAdoptionRate: number;
  period?: string;
}) {
  const response = await fetch("/api/ai/executive-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.error ?? "Failed to generate summary");
  return result.summary;
}

// ─── Goals Services ───────────────────────────────────────────────────────────

export type Goal = {
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
  evidenceKeys: string[];
  createdAt: string;
  updatedAt: string;
};

export async function getUserGoals(userId: string): Promise<Goal[]> {
  const response = await fetch(`/api/goals?userId=${userId}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error ?? "Failed to fetch goals");
  return result.goals;
}

export async function createGoal(params: {
  userId: string;
  title: string;
  description: string;
  priority?: Goal["priority"];
  deadline: string;
  kpis?: string[];
  xpReward?: number;
  aiGenerated?: boolean;
}): Promise<Goal> {
  const response = await fetch("/api/goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.error ?? "Failed to create goal");
  return result.goal;
}

export async function updateGoalProgress(params: {
  goalId: string;
  userId: string;
  progress: number;
}): Promise<void> {
  const response = await fetch(`/api/goals/${params.goalId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: params.userId, progress: params.progress }),
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.error ?? "Failed to update progress");
}

export async function updateGoalStatus(params: {
  goalId: string;
  userId: string;
  status: Goal["status"];
}): Promise<void> {
  const response = await fetch(`/api/goals/${params.goalId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: params.userId, status: params.status }),
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.error ?? "Failed to update status");
}

// ─── File Upload Services ─────────────────────────────────────────────────────

export type PresignedUploadResult = {
  uploadUrl: string;
  key: string;
  publicUrl: string;
};

export async function getPresignedUploadUrl(params: {
  fileName: string;
  contentType: string;
  userId: string;
  goalId?: string;
}): Promise<PresignedUploadResult> {
  const response = await fetch("/api/upload/presigned-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const result = await response.json();
  if (!result.success) throw new Error(result.error ?? "Failed to get upload URL");
  return {
    uploadUrl: result.uploadUrl,
    key: result.key,
    publicUrl: result.publicUrl,
  };
}

export async function uploadFileToS3(
  file: File,
  uploadUrl: string
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
}

// ─── Activity Services ────────────────────────────────────────────────────────

export type Activity = {
  activityId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  target: string;
  type: string;
  createdAt: string;
};

export async function getRecentActivity(limit = 20): Promise<Activity[]> {
  const response = await fetch(`/api/activity?limit=${limit}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error ?? "Failed to fetch activity");
  return result.activities;
}

// ─── Notifications Services ───────────────────────────────────────────────────

export type Notification = {
  notifId: string;
  userId: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  read: boolean;
  createdAt: string;
};

export async function getUserNotifications(userId: string, limit = 30): Promise<Notification[]> {
  const response = await fetch(`/api/notifications?userId=${userId}&limit=${limit}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error ?? "Failed to fetch notifications");
  return result.notifications;
}

// ─── Analytics Services ───────────────────────────────────────────────────────

export async function getAnalytics(params: {
  action: "GET_DEPT_ANALYTICS" | "GET_ORG_SUMMARY" | "GET_USER_PRODUCTIVITY" | "GET_GOAL_TRENDS";
  userId?: string;
  departmentId?: string;
  period?: string;
}) {
  const searchParams = new URLSearchParams({
    action: params.action,
    ...(params.userId && { userId: params.userId }),
    ...(params.departmentId && { departmentId: params.departmentId }),
    ...(params.period && { period: params.period }),
  });

  const response = await fetch(`/api/analytics?${searchParams}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.error ?? "Failed to fetch analytics");
  return result.data;
}