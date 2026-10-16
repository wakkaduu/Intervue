// Server-only Gemini client wrapper with built-in intelligent evaluation fallback
// Requirements: 5.2, 5.7
// IMPORTANT: This file must only be imported from server-side code (Route Handlers, Server Components).
// Never add "use client" to this file.

import { GoogleGenerativeAI, SchemaType, type ObjectSchema } from "@google/generative-ai";
import type { Feedback, ReviewRequest } from "@/types/index";
import { validateFeedback } from "@/lib/validation";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/** JSON schema enforced by Gemini's structured-output mode (mirrors validateFeedback). */
const FEEDBACK_SCHEMA: ObjectSchema = {
  type: SchemaType.OBJECT,
  properties: {
    score: { type: SchemaType.INTEGER, description: "Integer 1-10" },
    strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    areasForImprovement: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    howTheyAnswered: { type: SchemaType.STRING },
    toneAnalysis: { type: SchemaType.STRING },
    questionConnection: { type: SchemaType.STRING },
    summary: { type: SchemaType.STRING, description: "Max 95 words" },
  },
  required: ["score", "strengths", "areasForImprovement", "howTheyAnswered", "toneAnalysis", "questionConnection", "summary"],
};

/**
 * Builds the prompt string for the Gemini API from a ReviewRequest.
 * Enforces an uncompromising, strict, bar-raiser evaluation standard.
 * Strictly avoids sugar-coating or participation praise.
 */
function buildPrompt(request: ReviewRequest): string {
  return `You are an exacting, senior hiring committee bar-raiser evaluating a candidate's answer to an interview question.
CRITICAL MANDATE: AVOID SUGAR-COATING. DO NOT FLATTER OR LIE TO THE CANDIDATE.
Be candid, demanding, and uncompromisingly rigorous. Your critique must mirror the high standards of top-tier hiring managers (Google, Meta, Tier-1 investment banks, top medical/graduate programs). Giving empty praise or inflated scores hurts candidates by leaving them unprepared for real competitive interviews.

Candidate Context:
- Category / Role: ${request.category}
- Question: ${request.question}
- Candidate's Answer: ${request.answer}
${request.mode ? `- Delivery Mode: ${request.mode === "mic" ? "Spoken (Recorded via Microphone)" : "Written (Typed in Editor)"}` : ""}

Strict Scoring Rubric (Integer 1-10):
- 1 to 3 (Strong No Hire / Unacceptable): Very brief (< 30 words), evasive, incoherent, irrelevant, or fails to answer the question.
- 4 to 5 (No Hire / Substandard): High-level generalities, buzzwords without substance, no measurable results, no STAR structure, ambiguous personal ownership ("we" instead of "I"), or timid/hedging tone.
- 6 to 7 (Borderline / Weak Hire): Baseline competent answer that addresses the question, but lacks deep technical nuance, trade-offs, or quantified metrics.
- 8 to 9 (Strong Hire / Advanced): Crisp STAR structure, clear personal contribution, quantifiable metrics/outcomes, clear technical trade-offs or leadership presence, high conviction.
- 10 (Bar-Raiser / World-Class): Exceptional, executive-level precision, comprehensive trade-off analysis, definitive metrics, pristine delivery.

Strict Evaluation Pillars:
1. "howTheyAnswered": Ruthlessly critique structural organization, depth, and method. Did they use STAR (Situation, Task, Action, Result)? Did they explain specific mechanisms or hand-wave?
2. "toneAnalysis": Candid critique of professional poise. Call out hedging ("I guess", "kind of", "maybe", "I think"), passive language, filler words, or collective hiding ("we" instead of personal "I" ownership).
3. "questionConnection": Audit directness. Did they directly answer the specific scenario asked, or ramble and skirt around the question?
4. "strengths": List 1 to 3 GENUINE, earned strengths only. If the response was weak, state only what minimal factual concepts they acknowledged without flattering praise.
5. "areasForImprovement": List 1 to 4 BLUNT, actionable critiques detailing what was missing (e.g. "Missing quantifiable metrics: no data, percentages, or KPIs provided", "Vague personal ownership: relied on 'we' without detailing personal contributions", "Failed to address the resolution step").
6. "summary": Concise executive hiring verdict (under 95 words). Must start with a clear, un-sugar-coated assessment (e.g., "Below hiring bar:...", "Borderline response:...", "Hire-ready answer:..."). Never use empty praise like "Great attempt!" or "Solid answer!" unless score is 8+.

Respond with a JSON object matching this exact schema:
{
  "score": <integer 1-10>,
  "strengths": [<1-4 concise strings>],
  "areasForImprovement": [<1-4 concise strings>],
  "howTheyAnswered": <string, 1-2 concise sentences>,
  "toneAnalysis": <string, 1-2 concise sentences>,
  "questionConnection": <string, 1-2 concise sentences>,
  "summary": <string, max 95 words unvarnished hiring verdict>
}`;
}

/**
 * Built-in strict AI Evaluation engine that runs automatically when GEMINI_API_KEY
 * is not configured or if external cloud AI is unreachable.
 * Implements a bar-raiser evaluation standard:
 *   - No sugar-coating: flags weak depth, evasiveness, and missing metrics.
 *   - Realistic scoring: short or vague answers receive 1-4, not inflated 6-8.
 *   - Strict tone analysis: penalizes hedging language and ambiguous "we" ownership.
 *   - Actionable, unsparing critiques.
 */
export function evaluateAnswerFallback(request: ReviewRequest): Feedback {
  const { question, answer } = request;
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lowerAnswer = answer.toLowerCase();
  const lowerQuestion = question.toLowerCase();

  // 1. Connection to the Question (Strict Keyword & Stem Audit)
  const stopWords = new Set([
    "the", "and", "a", "an", "in", "on", "of", "to", "for", "with", "is", "was",
    "are", "about", "tell", "time", "you", "how", "what", "why", "your", "that", "this",
    "have", "from", "when", "describe", "explain", "where", "which", "into"
  ]);
  const questionKeywords = lowerQuestion
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  // Match root stems (e.g. "optimi" matches "optimize", "optimizing", "optimized")
  const matchedKeywords = questionKeywords.filter((kw) => {
    if (lowerAnswer.includes(kw)) return true;
    if (kw.length >= 6) {
      const stem = kw.slice(0, kw.length - 2);
      return lowerAnswer.includes(stem);
    }
    return false;
  });
  const relevanceRatio = questionKeywords.length > 0 ? matchedKeywords.length / questionKeywords.length : 0.5;

  let questionConnection = "";
  let relevanceScoreMod = 0;
  if (relevanceRatio >= 0.35 || (questionKeywords.length > 0 && matchedKeywords.length >= 2)) {
    questionConnection = `Directly addresses the prompt's core requirements (${matchedKeywords.slice(0, 3).join(", ")}).`;
    relevanceScoreMod = 1;
  } else if (relevanceRatio >= 0.15 && matchedKeywords.length >= 1) {
    questionConnection = "Partially touches the subject, but skirts around the specific core challenge and scenario asked.";
    relevanceScoreMod = 0;
  } else {
    questionConnection = "Fails to answer the prompt directly. Wanders into generalities without addressing the core question.";
    relevanceScoreMod = -2;
  }

  // 2. Tone & Ownership Analysis
  const confidentPhrases = [
    "achieved", "delivered", "led", "resolved", "succeeded", "confident",
    "collaborated", "managed", "designed", "built", "implemented", "spearheaded", "architected"
  ];
  const hesitantPhrases = [
    "i guess", "maybe", "probably", "sort of", "kind of", "um", "uh", "just",
    "i think maybe", "hopefully", "not sure", "i believe perhaps"
  ];

  const confidentHits = confidentPhrases.filter((p) => lowerAnswer.includes(p)).length;
  const hesitantHits = hesitantPhrases.filter((p) => lowerAnswer.includes(p)).length;

  // Personal Ownership Check ("I" vs "We")
  const weMatches = (lowerAnswer.match(/\b(we|we've|our|us)\b/g) || []).length;
  const iMatches = (lowerAnswer.match(/\b(i|i've|i'm|my|me)\b/g) || []).length;
  const hasAmbiguousOwnership = weMatches >= 3 && iMatches <= 1;

  let toneAnalysis = "";
  let toneScoreMod = 0;
  if (hesitantHits >= 2) {
    toneAnalysis = "Hesitant and unconvincing. Frequent hedging language ('maybe', 'kind of', 'i guess') weakens authority and professional presence.";
    toneScoreMod -= 1;
  } else if (hasAmbiguousOwnership) {
    toneAnalysis = "Ambiguous ownership. Relies heavily on collective 'we' language, obscuring your individual contributions and technical accountability.";
    toneScoreMod -= 1;
  } else if (confidentHits >= 1 && hesitantHits === 0 && iMatches >= 1) {
    toneAnalysis = "Assertive, decisive, and professional. Clear personal ownership and proactive leadership language throughout.";
    toneScoreMod += 1;
  } else {
    toneAnalysis = "Neutral and passive. Needs more proactive, assertive verbs and less hedging to project senior credibility.";
  }

  // 3. Structure, Depth & STAR Method Audit
  const starSignals = [
    lowerAnswer.includes("situation") || lowerAnswer.includes("when i was") || lowerAnswer.includes("at my previous") || lowerAnswer.includes("we faced") || lowerAnswer.includes("in my role"),
    lowerAnswer.includes("task") || lowerAnswer.includes("goal") || lowerAnswer.includes("objective") || lowerAnswer.includes("challenge") || lowerAnswer.includes("needed to") || lowerAnswer.includes("responsible for"),
    lowerAnswer.includes("action") || lowerAnswer.includes("i decided") || lowerAnswer.includes("i implemented") || lowerAnswer.includes("i designed") || lowerAnswer.includes("i led") || lowerAnswer.includes("i built") || lowerAnswer.includes("steps i took"),
    lowerAnswer.includes("result") || lowerAnswer.includes("outcome") || lowerAnswer.includes("impact") || lowerAnswer.includes("improved") || lowerAnswer.includes("reduced") || lowerAnswer.includes("increased") || lowerAnswer.includes("achieved"),
  ].filter(Boolean).length;

  // Check for quantifiable outcome/impact metric indicators
  const hasMetrics =
    /\b\d+(\.\d+)?%/.test(answer) || // percentages (e.g. 75%, 40%)
    /\b\d+\s*(ms|s|sec|rpm|qps|k|m|million|billion|users|customers|requests|transactions)\b/i.test(answer) || // scale/perf metrics
    /\$\s*\d+/.test(answer) || // dollar values
    lowerAnswer.includes("percent") ||
    lowerAnswer.includes("reduced by") ||
    lowerAnswer.includes("increased by") ||
    lowerAnswer.includes("improved by") ||
    lowerAnswer.includes("dropped from") ||
    lowerAnswer.includes("saving") ||
    lowerAnswer.includes("latency");

  let howTheyAnswered = "";
  let baseScore = 4;

  if (wordCount < 25) {
    howTheyAnswered = "Critically lacking depth. An answer under 25 words provides zero evidence of technical competence or context.";
    baseScore = 2;
  } else if (wordCount < 50) {
    howTheyAnswered = "Superficial overview. The response lacks concrete examples, structured execution, and measurable outcomes.";
    baseScore = 3;
  } else if (wordCount < 70) {
    if (starSignals >= 2) {
      howTheyAnswered = "Basic structure present, but lacks technical depth and measurable results.";
      baseScore = 5;
    } else {
      howTheyAnswered = "Unstructured narrative. Discusses the topic broadly without detailing specific actions taken or outcomes.";
      baseScore = 4;
    }
  } else {
    // wordCount >= 70
    if (starSignals >= 3 && hasMetrics) {
      howTheyAnswered = "Well-structured response following the STAR framework with concrete actions and quantifiable outcomes.";
      baseScore = 8;
    } else if (starSignals >= 2) {
      howTheyAnswered = "Good narrative progression, but lacks quantifiable business or technical metrics to substantiate claims.";
      baseScore = 6;
    } else {
      howTheyAnswered = "Verbose but unstructured. Lacks clear organization into Situation, Task, Action, and Result.";
      baseScore = 5;
    }
  }

  // Calculate final score with strict bounds
  let rawScore = baseScore + relevanceScoreMod + toneScoreMod;
  if (!hasMetrics && rawScore >= 8) {
    rawScore = 7; // Cannot score 8+ without verifiable outcomes/metrics
  }
  const score = Math.max(1, Math.min(10, rawScore));

  // Strengths: ONLY genuine, earned points (no participation trophies)
  const strengths: string[] = [];
  if (wordCount >= 70 && relevanceRatio >= 0.4) {
    strengths.push("Provided substantive contextual details relevant to the domain.");
  }
  if (starSignals >= 2) {
    strengths.push("Demonstrated logical progression from problem context to resolution.");
  }
  if (hasMetrics) {
    strengths.push("Included quantifiable metrics or measurable outcomes to substantiate results.");
  }
  if (confidentHits >= 2 && hesitantHits === 0) {
    strengths.push("Articulated contributions with decisive, assertive action verbs.");
  }
  if (strengths.length === 0) {
    // Un-sugar-coated fallback for weak responses
    strengths.push(
      wordCount >= 25
        ? "Identified high-level terminology relevant to the prompt."
        : "Attempted an initial response within the subject category."
    );
  }

  // Areas for Improvement: Blunt, pointed, and actionable
  const areasForImprovement: string[] = [];
  if (!hasMetrics) {
    areasForImprovement.push("Missing quantifiable impact: quantify results with percentages, dollar values, latency, or specific KPIs.");
  }
  if (starSignals < 3) {
    areasForImprovement.push("Lack of structured delivery: rigorously apply the STAR framework (Situation, Task, Action, Result).");
  }
  if (hasAmbiguousOwnership) {
    areasForImprovement.push("Ambiguous individual ownership: replace collective 'we' with 'I' to specify your personal contributions.");
  }
  if (hesitantHits >= 1) {
    areasForImprovement.push("Eliminate hedging words ('maybe', 'kind of', 'i guess') to project executive presence and conviction.");
  }
  if (relevanceRatio < 0.45) {
    areasForImprovement.push("Directly answer the question: avoid generic tangents and address the specific challenge asked.");
  }
  if (wordCount < 60) {
    areasForImprovement.push("Deepen technical substance: substantiate claims with concrete implementation mechanisms and trade-offs.");
  }
  if (areasForImprovement.length === 0) {
    areasForImprovement.push("Deepen architectural trade-offs: detail alternative approaches considered and why they were rejected.");
  }

  // Summary: Unvarnished, honest hiring bar assessment
  let verdictPrefix = "";
  if (score <= 3) {
    verdictPrefix = `Strong No Hire (Score: ${score}/10). Severely underdeveloped response that fails to demonstrate competence.`;
  } else if (score <= 5) {
    verdictPrefix = `Below Hiring Bar (Score: ${score}/10). High-level generalities without concrete examples or verified outcomes.`;
  } else if (score <= 7) {
    verdictPrefix = `Borderline Candidate (Score: ${score}/10). Baseline understanding shown, but lacks metric-driven impact and crisp structure.`;
  } else {
    verdictPrefix = `Strong Hire Candidate (Score: ${score}/10). Disciplined answer with structured execution and credible ownership.`;
  }

  const summary = `${verdictPrefix} ${howTheyAnswered} ${toneAnalysis}`
    .split(/\s+/)
    .slice(0, 95)
    .join(" ");

  return {
    score,
    strengths: strengths.slice(0, 3),
    areasForImprovement: areasForImprovement.slice(0, 4),
    summary,
    howTheyAnswered,
    toneAnalysis,
    questionConnection,
  };
}

/**
 * Calls Gemini API if GEMINI_API_KEY is configured; otherwise seamlessly
 * uses the built-in AI evaluation engine.
 */
export async function callGemini(
  request: ReviewRequest,
  clientKey?: string
): Promise<Feedback> {
  const apiKey = clientKey || process.env.GEMINI_API_KEY;

  // Seamless built-in evaluation when no API key is provided
  if (!apiKey) {
    return evaluateAnswerFallback(request);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = buildPrompt(request);

    // One retry: structured output occasionally violates a constraint (e.g. summary > 100 words)
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: FEEDBACK_SCHEMA,
            temperature: 0.2,
          },
        });
        const responseText = result.response.text();
        let parsed: unknown;
        try {
          parsed = JSON.parse(responseText);
        } catch {
          throw new Error(`Gemini returned non-JSON response: ${responseText.slice(0, 200)}`);
        }
        return validateFeedback(parsed);
      } catch (attemptErr) {
        lastError = attemptErr;
      }
    }
    throw lastError;
  } catch (err: unknown) {
    // If external Gemini API call failed (e.g. invalid key or network error),
    // fallback gracefully to built-in evaluation so users are never interrupted
    console.warn("External Gemini API call failed, using built-in coach:", err);
    return evaluateAnswerFallback(request);
  }
}
