// Server-only: second AI provider (Groq-hosted open model) used when Gemini fails.
import type { Feedback, ReviewRequest } from "@/types/index";
import { validateFeedback } from "@/lib/validation";
import { buildPrompt } from "@/lib/gemini";

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/**
 * Evaluates an answer with a Groq-hosted chat model (OpenAI-compatible API).
 * Throws on any failure so the caller can fall back further.
 */
export async function requestGroq(
  request: ReviewRequest,
  apiKey: string
): Promise<Feedback> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: buildPrompt(request) }],
        }),
      });
      if (!res.ok) {
        throw new Error(`Groq returned HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Groq returned an empty response");
      return validateFeedback(JSON.parse(content));
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
