// Consolidated session debrief: prompt, validation, and a local (no-AI) fallback.
// Pure functions only, so it is safe to import from both server and client code.
import type { SessionDebrief, SessionEntry } from "@/types/index";

const MAX_ANSWER_CHARS_IN_PROMPT = 500;

function words(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function buildDebriefPrompt(entries: SessionEntry[]): string {
  const avg = entries.reduce((s, e) => s + e.feedback.score, 0) / entries.length;
  const body = entries
    .map((e, i) => {
      const answer =
        e.answer.length > MAX_ANSWER_CHARS_IN_PROMPT
          ? `${e.answer.slice(0, MAX_ANSWER_CHARS_IN_PROMPT)}…`
          : e.answer;
      return `Q${i + 1} [score ${e.feedback.score}/10] ${e.question.text}
Answer: ${answer}
Strengths noted: ${e.feedback.strengths.join("; ")}
Gaps noted: ${e.feedback.areasForImprovement.join("; ")}`;
    })
    .join("\n\n");

  return `You are a senior hiring-committee bar-raiser writing the FINAL DEBRIEF for a mock interview session.
Each answer was already reviewed individually. Do not repeat the per-question reviews. Instead find the PATTERNS across answers and tell the candidate what to do next. Be candid and specific; no flattery.

Category: ${entries[0].question.category}
Average score: ${avg.toFixed(1)}/10 across ${entries.length} answers

${body}

Respond with a JSON object matching this exact schema:
{
  "headline": <string, max 20 words, an unvarnished overall verdict>,
  "summary": <string, max 90 words, how the session went overall and the single biggest theme>,
  "recurringStrengths": [<1-3 strings, patterns that appeared in several answers>],
  "priorityFixes": [<1-3 strings, the most important recurring problems, most important first>],
  "nextSteps": [<2-4 strings, concrete practice actions, e.g. which question to redo and how>]
}`;
}

function stringList(value: unknown, field: string, min: number, max: number): string[] {
  if (
    !Array.isArray(value) ||
    value.length < min ||
    value.length > max ||
    !value.every((v) => typeof v === "string" && v.trim().length > 0 && v.length <= 400)
  ) {
    throw new Error(`Debrief '${field}' must be ${min}-${max} non-empty strings.`);
  }
  return value as string[];
}

/** Validates a model-produced debrief. Throws a descriptive Error when malformed. */
export function validateDebrief(obj: unknown): SessionDebrief {
  if (obj === null || typeof obj !== "object") {
    throw new Error("Debrief must be a JSON object.");
  }
  const raw = obj as Record<string, unknown>;
  if (typeof raw.headline !== "string" || raw.headline.trim() === "" || words(raw.headline) > 40) {
    throw new Error("Debrief 'headline' must be a short non-empty string.");
  }
  if (typeof raw.summary !== "string" || raw.summary.trim() === "" || words(raw.summary) > 130) {
    throw new Error("Debrief 'summary' must be a non-empty string of at most 130 words.");
  }
  return {
    headline: raw.headline.trim(),
    summary: raw.summary.trim(),
    recurringStrengths: stringList(raw.recurringStrengths, "recurringStrengths", 1, 3),
    priorityFixes: stringList(raw.priorityFixes, "priorityFixes", 1, 3),
    nextSteps: stringList(raw.nextSteps, "nextSteps", 2, 4),
  };
}

function uniqueTake(items: string[], n: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item.trim());
    if (out.length === n) break;
  }
  return out;
}

/**
 * Local debrief built only from the per-question reviews. Used instantly on
 * the summary page and whenever no AI provider is available.
 */
export function buildDebriefFallback(entries: SessionEntry[]): SessionDebrief {
  const scores = entries.map((e) => e.feedback.score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const bestIdx = scores.indexOf(Math.max(...scores));
  const weakIdx = scores.indexOf(Math.min(...scores));

  const headline =
    avg >= 8
      ? "Hire-ready overall: polish the details."
      : avg >= 6.5
      ? "Borderline overall: solid base, inconsistent depth."
      : avg >= 4.5
      ? "Below the hiring bar: clear, fixable gaps."
      : "Not interview-ready yet: rebuild the fundamentals.";

  const byScoreAsc = [...entries].sort((a, b) => a.feedback.score - b.feedback.score);
  const byScoreDesc = [...byScoreAsc].reverse();

  const priorityFixes = uniqueTake(
    byScoreAsc.flatMap((e) => e.feedback.areasForImprovement),
    3
  );
  const recurringStrengths = uniqueTake(
    byScoreDesc.flatMap((e) => e.feedback.strengths),
    3
  );

  const gapText = entries.flatMap((e) => e.feedback.areasForImprovement).join(" ").toLowerCase();
  const nextSteps: string[] = [
    `Redo your weakest question (Q${weakIdx + 1}) and aim to beat ${scores[weakIdx]}/10.`,
  ];
  if (/metric|quantif|number|data|kpi|measur/.test(gapText)) {
    nextSteps.push("Add at least one concrete number (percentage, time saved, scale) to every answer.");
  }
  if (/\bwe\b|ownership|personal/.test(gapText)) {
    nextSteps.push("Say what YOU did: replace 'we' with specific personal actions and decisions.");
  }
  if (/star|structure|situation|result/.test(gapText)) {
    nextSteps.push("Structure answers as Situation, Task, Action, Result, and always end on the result.");
  }
  if (nextSteps.length < 2) {
    nextSteps.push("Practice another session in this category and compare your average to today's.");
  }

  const spread = Math.max(...scores) - Math.min(...scores);
  const summary =
    `Average ${avg.toFixed(1)}/10 across ${entries.length} ${entries.length === 1 ? "answer" : "answers"}. ` +
    `Strongest: Q${bestIdx + 1} (${scores[bestIdx]}/10). Weakest: Q${weakIdx + 1} (${scores[weakIdx]}/10). ` +
    (spread >= 3
      ? "Your quality swings between answers, so consistency is the first thing to work on."
      : "Your answers were consistent in level, so improving depth will raise every score at once.");

  return {
    headline,
    summary,
    recurringStrengths: recurringStrengths.length ? recurringStrengths : ["No clear strengths stood out yet."],
    priorityFixes: priorityFixes.length ? priorityFixes : ["No recurring gaps were identified."],
    nextSteps: nextSteps.slice(0, 4),
    bestQuestionIndex: bestIdx,
    weakestQuestionIndex: weakIdx,
    source: "basic",
  };
}
