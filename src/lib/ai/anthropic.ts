// ─── AWS Bedrock Claude Service ───────────────────────────────────────────────
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION ?? process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MODEL = process.env.BEDROCK_MODEL_ID ?? "anthropic.claude-opus-4-5-20251101-v1:0";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Mistral expects messages with system prepended as a user turn
function buildBody(params: {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  max_tokens: number;
}) {
  // Mistral: prepend system prompt into the first user message
  const messages = [...params.messages];
  if (messages.length > 0 && messages[0].role === "user") {
    messages[0] = {
      role: "user",
      content: `${params.system}\n\n${messages[0].content}`,
    };
  } else {
    messages.unshift({ role: "user", content: params.system });
  }

  return JSON.stringify({
    prompt: messages
      .map((m) =>
        m.role === "user"
          ? `<s>[INST] ${m.content} [/INST]`
          : ` ${m.content}</s>`
      )
      .join(""),
    max_tokens: params.max_tokens,
    temperature: 0.7,
  });
}

async function invokeModel(params: {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  max_tokens: number;
}): Promise<string> {
  const command = new InvokeModelCommand({
    modelId: MODEL,
    contentType: "application/json",
    accept: "application/json",
    body: buildBody(params),
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  // Mistral response: { outputs: [{ text: "..." }] }
  return result.outputs?.[0]?.text ?? result.generation ?? "";
}

async function* invokeModelStream(params: {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  max_tokens: number;
}): AsyncGenerator<string> {
  const command = new InvokeModelWithResponseStreamCommand({
    modelId: MODEL,
    contentType: "application/json",
    accept: "application/json",
    body: buildBody(params),
  });

  const response = await client.send(command);
  if (!response.body) return;

  for await (const event of response.body) {
    if (event.chunk?.bytes) {
      const decoded = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
      // Mistral streaming: { outputs: [{ text: "..." }] }
      const text = decoded.outputs?.[0]?.text ?? decoded.generation ?? "";
      if (text) yield text as string;
    }
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type SmartGoalResult = {
  title: string;
  description: string;
  kpis: string[];
  timeline: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  xpReward: number;
  confidence: number;
};

export type RiskAnalysisResult = {
  riskLevel: "HEALTHY" | "WARNING" | "CRITICAL";
  score: number;
  factors: string[];
  recommendation: string;
  confidence: number;
};

export type ProductivityInsightResult = {
  summary: string;
  highlights: string[];
  suggestions: string[];
  score: number;
  trend: "improving" | "stable" | "declining";
};

export type ExecutiveSummaryResult = {
  headline: string;
  body: string;
  strengths: string[];
  watchItems: string[];
  opportunities: string[];
  forecast: string;
};

// ─── SMART Goal Generator ─────────────────────────────────────────────────────

export async function generateSmartGoal(params: {
  input: string;
  department: string;
  role: string;
  existingGoals?: string[];
}): Promise<SmartGoalResult> {
  const { input, department, role, existingGoals = [] } = params;

  const text = await invokeModel({
    max_tokens: 1024,
    system: `You are an expert OKR and goal-setting coach for enterprise teams. 
You convert vague objectives into precise SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound).
Always respond with valid JSON only — no markdown, no explanation outside the JSON.`,
    messages: [
      {
        role: "user",
        content: `Convert this objective into a SMART goal for a ${role} in the ${department} department.

Objective: "${input}"

${existingGoals.length > 0 ? `Existing goals to avoid duplication:\n${existingGoals.map((g) => `- ${g}`).join("\n")}` : ""}

Respond with this exact JSON structure:
{
  "title": "Concise SMART goal title (max 100 chars)",
  "description": "Detailed description explaining the goal, context, and expected impact",
  "kpis": ["KPI 1", "KPI 2", "KPI 3"],
  "timeline": "e.g. Q3 2026 or By August 2026",
  "priority": "LOW|MEDIUM|HIGH|CRITICAL",
  "xpReward": 100-1000,
  "confidence": 70-99
}`,
      },
    ],
  });

  return JSON.parse(text) as SmartGoalResult;
}

// ─── Streaming SMART Goal Generator ──────────────────────────────────────────

export async function* generateSmartGoalStream(params: {
  input: string;
  department: string;
  role: string;
}): AsyncGenerator<string> {
  const { input, department, role } = params;

  yield* invokeModelStream({
    max_tokens: 1024,
    system: `You are an expert OKR coach. Convert vague objectives into precise SMART goals.
Be conversational and explain your reasoning as you build the goal.`,
    messages: [
      {
        role: "user",
        content: `Create a SMART goal for a ${role} in ${department}: "${input}"
        
Walk me through the goal you're creating, then provide the final structured goal.`,
      },
    ],
  });
}

// ─── Risk Analysis ────────────────────────────────────────────────────────────

export async function analyzeGoalRisk(params: {
  goalTitle: string;
  progress: number;
  deadline: string;
  daysSinceUpdate: number;
  department: string;
}): Promise<RiskAnalysisResult> {
  const { goalTitle, progress, deadline, daysSinceUpdate, department } = params;
  const daysUntilDeadline = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const text = await invokeModel({
    max_tokens: 512,
    system: `You are an enterprise risk analyst specializing in goal and project risk assessment.
Respond with valid JSON only.`,
    messages: [
      {
        role: "user",
        content: `Analyze the risk for this goal:

Goal: "${goalTitle}"
Department: ${department}
Current progress: ${progress}%
Days until deadline: ${daysUntilDeadline}
Days since last update: ${daysSinceUpdate}

Respond with:
{
  "riskLevel": "HEALTHY|WARNING|CRITICAL",
  "score": 0-100,
  "factors": ["factor 1", "factor 2"],
  "recommendation": "Specific actionable recommendation",
  "confidence": 70-99
}`,
      },
    ],
  });

  return JSON.parse(text) as RiskAnalysisResult;
}

// ─── Productivity Insights ────────────────────────────────────────────────────

export async function generateProductivityInsight(params: {
  userName: string;
  department: string;
  goalsCompleted: number;
  goalsActive: number;
  streak: number;
  weeklyScores: number[];
  topGoal?: string;
}): Promise<ProductivityInsightResult> {
  const { userName, department, goalsCompleted, goalsActive, streak, weeklyScores, topGoal } = params;
  const avgScore =
    weeklyScores.length > 0
      ? Math.round(weeklyScores.reduce((a, b) => a + b, 0) / weeklyScores.length)
      : 0;

  const text = await invokeModel({
    max_tokens: 768,
    system: `You are a productivity coach providing personalized insights for enterprise employees.
Be encouraging, specific, and actionable. Respond with valid JSON only.`,
    messages: [
      {
        role: "user",
        content: `Generate a productivity insight for ${userName} in ${department}:

- Goals completed this month: ${goalsCompleted}
- Active goals: ${goalsActive}
- Current streak: ${streak} days
- Weekly productivity scores: ${weeklyScores.join(", ")}
- Average score: ${avgScore}%
${topGoal ? `- Top priority goal: "${topGoal}"` : ""}

Respond with:
{
  "summary": "2-3 sentence personalized summary",
  "highlights": ["highlight 1", "highlight 2"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "score": 0-100,
  "trend": "improving|stable|declining"
}`,
      },
    ],
  });

  return JSON.parse(text) as ProductivityInsightResult;
}

// ─── Executive Summary ────────────────────────────────────────────────────────

export async function generateExecutiveSummary(params: {
  orgProductivity: number;
  departments: Array<{ name: string; productivity: number; riskLevel: string }>;
  totalGoalsCompleted: number;
  totalGoalsActive: number;
  aiAdoptionRate: number;
  period: string;
}): Promise<ExecutiveSummaryResult> {
  const { orgProductivity, departments, totalGoalsCompleted, totalGoalsActive, aiAdoptionRate, period } = params;

  const text = await invokeModel({
    max_tokens: 1024,
    system: `You are a Chief of Staff writing executive briefings for C-suite leaders.
Be concise, data-driven, and strategic. Respond with valid JSON only.`,
    messages: [
      {
        role: "user",
        content: `Write an executive summary for ${period}:

Organization Productivity: ${orgProductivity}%
Total Goals Completed: ${totalGoalsCompleted}
Active Goals: ${totalGoalsActive}
AI Adoption Rate: ${aiAdoptionRate}%

Department breakdown:
${departments.map((d) => `- ${d.name}: ${d.productivity}% productivity, Risk: ${d.riskLevel}`).join("\n")}

Respond with:
{
  "headline": "One powerful headline sentence",
  "body": "2-3 paragraph executive narrative",
  "strengths": ["strength 1", "strength 2"],
  "watchItems": ["watch item 1", "watch item 2"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "forecast": "One sentence Q3/Q4 forecast"
}`,
      },
    ],
  });

  return JSON.parse(text) as ExecutiveSummaryResult;
}

// ─── AI Chat (streaming) ──────────────────────────────────────────────────────

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function* chatWithClaude(params: {
  messages: ChatMessage[];
  userRole: string;
  department: string;
}): AsyncGenerator<string> {
  const { messages, userRole, department } = params;

  yield* invokeModelStream({
    max_tokens: 1024,
    system: `You are AtomQuest AI, an intelligent productivity and goal management assistant for enterprise teams.
You help ${userRole}s in the ${department} department with:
- Creating and refining SMART goals
- Analyzing productivity trends
- Identifying risks and blockers
- Providing actionable recommendations
- Summarizing team performance

Be concise, professional, and data-driven. Use markdown formatting for clarity.
Current date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
}
