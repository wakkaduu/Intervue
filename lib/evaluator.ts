// Server-only: evaluation orchestrator. Tries each configured AI provider in
// order, then the built-in grader, and records which one produced the result.
import type { Feedback, ReviewRequest } from "@/types/index";
import { evaluateAnswerFallback, requestGemini } from "@/lib/gemini";
import { requestGroq } from "@/lib/groq-llm";

/** Per-provider time budget, so one slow model cannot starve the next provider in the chain. */
export const PROVIDER_TIMEOUT_MS = 12_000;

export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export interface EvaluatorKeys {
  geminiKey?: string;
  groqKey?: string;
}

export async function evaluateAnswer(
  request: ReviewRequest,
  keys: EvaluatorKeys = {}
): Promise<Feedback> {
  const geminiKey = keys.geminiKey || process.env.GEMINI_API_KEY;
  const groqKey = keys.groqKey || process.env.GROQ_API_KEY;

  const providers: { name: string; run: () => Promise<Feedback> }[] = [];
  if (geminiKey) providers.push({ name: "gemini", run: () => requestGemini(request, geminiKey) });
  if (groqKey) providers.push({ name: "groq", run: () => requestGroq(request, groqKey) });

  for (const provider of providers) {
    try {
      return { ...(await withTimeout(provider.run(), PROVIDER_TIMEOUT_MS, provider.name)), source: "ai" };
    } catch (err) {
      console.warn(`[evaluator] ${provider.name} failed, trying next provider:`, err);
    }
  }

  return { ...evaluateAnswerFallback(request), source: "basic" };
}
