// Server-only: produces the consolidated session debrief using the same
// provider chain as per-answer evaluation (Gemini -> Groq -> local fallback).
import { SchemaType, type ObjectSchema } from "@google/generative-ai";
import type { SessionDebrief, SessionEntry } from "@/types/index";
import { buildDebriefFallback, buildDebriefPrompt, validateDebrief } from "@/lib/debrief";
import { requestGeminiJson } from "@/lib/gemini";
import { requestGroqJson } from "@/lib/groq-llm";
import { withTimeout, PROVIDER_TIMEOUT_MS, type EvaluatorKeys } from "@/lib/evaluator";

const strings = { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } } as const;

const DEBRIEF_SCHEMA: ObjectSchema = {
  type: SchemaType.OBJECT,
  properties: {
    headline: { type: SchemaType.STRING },
    summary: { type: SchemaType.STRING },
    recurringStrengths: strings,
    priorityFixes: strings,
    nextSteps: strings,
  },
  required: ["headline", "summary", "recurringStrengths", "priorityFixes", "nextSteps"],
};

export async function generateDebrief(
  entries: SessionEntry[],
  keys: EvaluatorKeys = {}
): Promise<SessionDebrief> {
  const geminiKey = keys.geminiKey || process.env.GEMINI_API_KEY;
  const groqKey = keys.groqKey || process.env.GROQ_API_KEY;
  const prompt = buildDebriefPrompt(entries);
  const local = buildDebriefFallback(entries);

  const providers: { name: string; run: () => Promise<unknown> }[] = [];
  if (geminiKey) providers.push({ name: "gemini", run: () => requestGeminiJson(prompt, geminiKey, DEBRIEF_SCHEMA) });
  if (groqKey) providers.push({ name: "groq", run: () => requestGroqJson(prompt, groqKey) });

  for (const provider of providers) {
    try {
      const debrief = validateDebrief(await withTimeout(provider.run(), PROVIDER_TIMEOUT_MS, provider.name));
      // Keep the locally computed best/weakest indexes: they are exact, not model-guessed.
      return {
        ...debrief,
        bestQuestionIndex: local.bestQuestionIndex,
        weakestQuestionIndex: local.weakestQuestionIndex,
        source: "ai",
      };
    } catch (err) {
      console.warn(`[debrief] ${provider.name} failed, trying next provider:`, err);
    }
  }
  return local;
}
