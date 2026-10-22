import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const RUN_ID = "X-Lovable-AIG-Run-ID";
const MODEL = "openai/gpt-6-astra";

const BASE_RULES = `You are Workly AI, a careful workplace productivity assistant.
Constraints:
- Use only the information the user supplies. Never invent names, dates, owners, figures, facts, sources or citations.
- When something needed is missing, say so explicitly (e.g. "Unspecified") rather than guessing.
- Write clear, professional, plain-language output formatted in simple Markdown (headings with ##, bullet lists with -).
- Do not include preambles like "Sure!" — output only the requested content.`;

const TOOL_PROMPTS: Record<string, string> = {
  email: `Role: expert business communication writer.
Task: draft one professional email from the user's brief.
Output format exactly:
Subject: <subject line>

<email body with greeting, concise paragraphs, and sign-off using a placeholder like [Your name]>
Constraints: match the requested tone; include every key detail supplied; use the provided subject if given; use placeholders in [brackets] for anything unknown.`,
  notes: `Role: meticulous meeting analyst.
Task: analyse the meeting notes or transcript.
Output these sections in order:
## Summary
## Key discussion points
## Decisions made
## Action items
For each action item use: "- <task> — Owner: <name or Unspecified> — Deadline: <date or Unspecified>".
Constraints: only list owners and deadlines explicitly stated in the input. If there are no decisions, write "None recorded".`,
  planner: `Role: realistic time-management coach.
Task: build a schedule from the user's tasks, deadlines, durations, priorities and available hours.
Output sections:
## Schedule  (time blocks like "09:00–10:30 · Task", no overlaps, include short breaks roughly every 90 minutes and a lunch break for full days)
## Tasks that do not fit  (list with reason, or "All tasks fit")
## Why this order
Constraints: prioritise by deadline urgency and priority; never exceed available hours; never schedule two things at once; do not shorten user-estimated durations.`,
  research: `Role: balanced research analyst.
Task: analyse the user's research question or pasted material.
Output sections:
## Summary
## Key findings  (prefix items from the user's material with "[From your input]" and your own interpretations with "[AI interpretation]")
## Potential implications
## Practical recommendations
## Limitations and open questions
Constraints: do not invent facts, statistics, sources or citations. If the user only asked a question without material, state that your answer relies on general knowledge that should be verified. Note that pasted material has not been independently verified.`,
  chat: `Role: friendly, practical workplace assistant for productivity, communication and professional questions.
Constraints: be concise and actionable; ask a clarifying question when the request is ambiguous; remind users not to share confidential data if they appear to.`,
};

export async function handleAi(request: Request): Promise<Response> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    return Response.json({ demo: true, error: "AI is not configured." }, { status: 503 });
  }
  let body: { tool?: string; messages?: { role: "user" | "assistant"; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const tool = body.tool ?? "";
  const prompt = TOOL_PROMPTS[tool];
  const msgs = (body.messages ?? []).filter(
    (m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim(),
  );
  if (!prompt || msgs.length === 0) {
    return Response.json({ error: "Please provide some input." }, { status: 400 });
  }
  if (msgs.reduce((n, m) => n + m.content.length, 0) > 60000) {
    return Response.json({ error: "Input is too long. Please shorten it." }, { status: 400 });
  }

  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set(RUN_ID, runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get(RUN_ID) ?? undefined;
      return res;
    },
  });

  let upstreamError: { status: number; message: string } | null = null;
  const result = streamText({
    model: provider.responses(MODEL),
    instructions: `${BASE_RULES}\n\n${prompt}`,
    messages: msgs as ModelMessage[],
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
    onError: ({ error }) => {
      const e = error as { statusCode?: number; message?: string };
      upstreamError = { status: e.statusCode ?? 500, message: e.message ?? "AI request failed" };
    },
  });

  // Read the first chunk so upstream errors can be returned with a proper status.
  const reader = result.textStream[Symbol.asyncIterator]();
  let first: IteratorResult<string>;
  try {
    first = await reader.next();
  } catch (err) {
    const e = err as { statusCode?: number; message?: string };
    upstreamError ??= { status: e.statusCode ?? 500, message: e.message ?? "AI request failed" };
    first = { done: true, value: undefined };
  }
  if (first.done && upstreamError) {
    const { status, message } = upstreamError as { status: number; message: string };
    const friendly =
      status === 429
        ? "Too many requests right now. Please wait a moment and try again."
        : status === 402
          ? "AI credits have run out for this workspace. Please add credits to continue."
          : message;
    return Response.json({ error: friendly }, { status });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!first.done) controller.enqueue(encoder.encode(first.value));
        while (true) {
          const n = await reader.next();
          if (n.done) break;
          controller.enqueue(encoder.encode(n.value));
        }
      } catch {
        // stream aborted
      }
      controller.close();
    },
  });
  const headers = new Headers({ "Content-Type": "text/plain; charset=utf-8" });
  if (runId) headers.set(RUN_ID, runId);
  return new Response(stream, { headers });
}
