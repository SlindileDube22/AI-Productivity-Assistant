import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const MODEL = "google/gemini-3-flash-preview";

async function gateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
  return createLovableAiGatewayProvider(key)(MODEL);
}

const RESPONSIBLE_AI_RULES = `
Responsible AI rules:
- Be accurate, neutral, and free of bias. Avoid stereotypes.
- Do not invent facts, names, dates, numbers, or quotes. If information is missing, say so.
- Protect privacy: do not request or store personal/sensitive data beyond what the user provides.
- Explain uncertainty clearly when confidence is low.
- End every response with this disclaimer on its own line:
  > _AI-generated content should be reviewed by a human before being used for important business decisions._
`.trim();

// ---------- Email Generator ----------
const EmailInput = z.object({
  purpose: z.string().min(3).max(2000),
  recipient: z.enum(["Client", "Manager", "Team Member", "Supplier"]),
  tone: z.enum(["Formal", "Professional", "Friendly", "Persuasive"]),
  senderName: z.string().max(120).optional(),
  extraContext: z.string().max(2000).optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: gateway(),
      system: `You are an executive communication assistant. Write professional emails using clear structure.

Workflow:
1. Identify the goal of the email from the user's purpose.
2. Adapt vocabulary and formality to the recipient and tone.
3. Reason step-by-step about what the recipient needs to know and do.
4. Output ONLY valid Markdown with these exact section headings, nothing else before or after:

## Subject
<one concise subject line>

## Email Body
<greeting + 1-3 short paragraphs>

## Call to Action
<one direct sentence telling the recipient what to do next>

## Closing
<professional sign-off + sender placeholder>

If critical information is missing (e.g. dates, names, numbers), use clearly marked placeholders like [DATE] and add a short "Notes for sender" list at the bottom.

${RESPONSIBLE_AI_RULES}`,
      prompt: `Recipient type: ${data.recipient}
Tone: ${data.tone}
Sender: ${data.senderName ?? "[Your Name]"}

Purpose:
${data.purpose}

${data.extraContext ? `Extra context:\n${data.extraContext}` : ""}`,
    });
    return { text };
  });

// ---------- Meeting Summarizer ----------
const MeetingInput = z.object({
  notes: z.string().min(20).max(20000),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MeetingInput.parse(input))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: gateway(),
      system: `You turn raw meeting notes into structured summaries.

Think step-by-step: identify topics, decisions, owners, and dates from the source text only. Do not invent attendees, dates, or commitments. If a field is unclear, write "Not stated".

Output ONLY valid Markdown using these exact headings in order:

## Executive Summary
(2-3 sentences)

## Key Discussion Points
- bullet list

## Decisions Made
- bullet list (or "None recorded")

## Action Items
| Action | Owner | Deadline |
|---|---|---|
| ... | ... | ... |

## Open Questions / Risks
- bullet list (or "None")

${RESPONSIBLE_AI_RULES}`,
      prompt: `Meeting notes:\n\n${data.notes}`,
    });
    return { text };
  });

// ---------- Task Planner ----------
const TasksInput = z.object({
  tasks: z.string().min(5).max(10000),
  horizon: z.enum(["day", "week"]).default("day"),
  workingHours: z.string().max(120).optional(),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TasksInput.parse(input))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: gateway(),
      system: `You are a productivity coach. Take a raw list of tasks and produce a clear plan.

Reasoning steps (do them silently, do not output them):
1. Parse each task; estimate effort in minutes if not given.
2. Score each task on Urgent vs Important (Eisenhower matrix).
3. Group with time-blocking; respect the user's working hours if provided.
4. Recommend 2-3 productivity tips relevant to the actual task mix.

Output ONLY valid Markdown in this exact structure:

## Priority Matrix
| Task | Urgent | Important | Quadrant | Est. time |
|---|---|---|---|---|

## ${"${HORIZON_LABEL}"} Plan
| Time block | Task | Focus type |
|---|---|---|

## Productivity Tips
- bullet list (2-3 items)

If information is missing, mark "Assumed" next to estimates.

${RESPONSIBLE_AI_RULES}`.replace("${HORIZON_LABEL}", data.horizon === "week" ? "Weekly" : "Daily"),
      prompt: `Horizon: ${data.horizon}
Working hours: ${data.workingHours ?? "9:00 - 17:00 (assumed)"}

Tasks:
${data.tasks}`,
    });
    return { text };
  });

// ---------- Research Assistant ----------
const ResearchInput = z.object({
  source: z.string().min(10).max(30000),
  audience: z.string().max(200).optional(),
});

export const researchSummary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: gateway(),
      system: `You are a research analyst. Given an article, report, or topic, produce a structured briefing in plain language.

Rules:
- Only use information present in the provided source; do not fabricate sources or statistics.
- If the input is just a topic without source material, say so in "Limitations" and produce only what can be reasoned from general, well-established knowledge with a low-confidence note.
- Use clear, everyday language. Avoid jargon; explain technical terms briefly.

Output ONLY valid Markdown using these exact headings:

## Summary
(3-5 sentences in plain English)

## Key Insights
- bullet list

## Recommendations
- bullet list

## Risks
- bullet list

## Opportunities
- bullet list

## Limitations
(one short paragraph about what you could not determine from the source)

${RESPONSIBLE_AI_RULES}`,
      prompt: `Target audience: ${data.audience ?? "general business reader"}

Source material:
${data.source}`,
    });
    return { text };
  });