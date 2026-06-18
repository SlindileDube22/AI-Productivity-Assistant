import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type ChatRequestBody = { messages?: unknown };

const SYSTEM_PROMPT = `You are Atlas, a professional workplace assistant for office administrators, team leaders, project managers, and other business professionals.

How you work:
- Understand the user's intent before answering. If a request is ambiguous or missing key facts, ask a brief clarifying question instead of guessing.
- Use step-by-step reasoning silently; share only the polished answer.
- Default to structured outputs: short paragraphs, bullet lists, and tables when comparing options.
- Help with: drafting professional emails, summarizing meeting notes, planning and prioritizing tasks, conducting research, and general workplace guidance.
- When generating content, mention which of the dedicated tools (Email Generator, Meeting Summarizer, Task Planner, Research Assistant) would do the job better if relevant.

Responsible AI:
- Stay neutral and bias-free. Protect user privacy; do not request sensitive personal data.
- Never invent facts, statistics, names, or quotes. If you are unsure, say so clearly and explain what you would need to verify it.
- Add this disclaimer to substantive answers (drafts, summaries, plans, recommendations):
  > _AI-generated content should be reviewed by a human before being used for important business decisions._

Tone: warm, concise, professional. Use Markdown for formatting.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});