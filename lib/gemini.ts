// Server-only Gemini client wrapper with built-in intelligent evaluation fallback
// Requirements: 5.2, 5.7
// IMPORTANT: This file must only be imported from server-side code (Route Handlers, Server Components).
// Never add "use client" to this file.

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Feedback, ReviewRequest } from "@/types/index";
import { validateFeedback } from "@/lib/validation";

const MODEL_NAME = "gemini-1.5-flash";

/**
 * Builds the prompt string for the Gemini API from a ReviewRequest.
 * Focuses on how they answered, tone analysis, and question connection.
 */
function buildPrompt(request: ReviewRequest): string {
  return `You are an expert interview coach evaluating a candidate's answer to an interview question.

Category: ${request.category}
Question: ${request.question}
Candidate's Answer: ${request.answer}
${request.mode ? `Delivery Mode: ${request.mode === "mic" ? "Spoken (Recorded via Microphone)" : "Written (Typed in Editor)"}` : ""}

Focus your evaluation on three core pillars:
1. "howTheyAnswered": Evaluate the structure, completeness, clarity, and logical organization (e.g. STAR method).
2. "toneAnalysis": Evaluate the candidate's tone, confidence level, assertiveness, and professional demeanour.
3. "questionConnection": Evaluate how directly, relevantly, and specifically the response addresses what was asked.

Respond with a JSON object matching this exact schema:
{
  "score": <integer 1-10>,
  "strengths": [<1-4 concise strings>],
  "areasForImprovement": [<1-4 concise strings>],
  "howTheyAnswered": <string, 1-2 concise sentences>,
  "toneAnalysis": <string, 1-2 concise sentences>,
  "questionConnection": <string, 1-2 concise sentences>,
  "summary": <string, max 100 words overall summary>
}

Be constructive, specific, and concise.`;
}

/**
 * Built-in AI Evaluation engine that runs automatically when GEMINI_API_KEY
 * is not configured or if external cloud AI is unreachable.
 * Analyzes:
 *   1. How they answered (structure, length, completeness, STAR markers)
 *   2. Tone (confidence, assertiveness, filler words, professionalism)
 *   3. Connection to the question (relevance, keyword matching, directness)
 */
export function evaluateAnswerFallback(request: ReviewRequest): Feedback {
  const { question, answer } = request;
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lowerAnswer = answer.toLowerCase();
  const lowerQuestion = question.toLowerCase();

  // 1. Connection to the Question
  const stopWords = new Set([
    "the", "and", "a", "an", "in", "on", "of", "to", "for", "with", "is", "was",
    "are", "about", "tell", "time", "you", "how", "what", "why", "your", "that", "this"
  ]);
  const questionKeywords = lowerQuestion
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  const matchedKeywords = questionKeywords.filter((kw) => lowerAnswer.includes(kw));
  const relevanceRatio = questionKeywords.length > 0 ? matchedKeywords.length / questionKeywords.length : 0.5;

  let questionConnection = "";
  if (relevanceRatio >= 0.5) {
    questionConnection = `Directly connects to the prompt by addressing key topics (${matchedKeywords.slice(0, 3).join(", ")}).`;
  } else if (relevanceRatio >= 0.25) {
    questionConnection = "Partially connects to the question, but could tie back more explicitly to the specific challenge asked.";
  } else {
    questionConnection = "Only loosely connected to the question. Make sure to directly address the specific scenario requested.";
  }

  // 2. Tone Analysis
  const confidentPhrases = [
    "achieved", "delivered", "led", "resolved", "succeeded", "confident",
    "collaborated", "managed", "designed", "built", "implemented", "spearheaded"
  ];
  const hesitantPhrases = ["i guess", "maybe", "probably", "sort of", "kind of", "um", "uh", "just", "i think maybe"];

  const confidentHits = confidentPhrases.filter((p) => lowerAnswer.includes(p)).length;
  const hesitantHits = hesitantPhrases.filter((p) => lowerAnswer.includes(p)).length;

  let toneAnalysis = "";
  if (confidentHits >= 2 && hesitantHits === 0) {
    toneAnalysis = "Assertive, professional, and confident. Strong ownership and proactive language demonstrated throughout.";
  } else if (hesitantHits > confidentHits) {
    toneAnalysis = "Slightly tentative or hesitant. Try replacing hedging words (e.g. 'kind of', 'maybe') with direct, active statements.";
  } else {
    toneAnalysis = "Constructive and calm, with a balanced professional tone. Could project higher confidence by highlighting personal contributions.";
  }

  // 3. How they answered (Structure & Depth)
  const starSignals = [
    lowerAnswer.includes("situation") || lowerAnswer.includes("when i") || lowerAnswer.includes("at my previous"),
    lowerAnswer.includes("task") || lowerAnswer.includes("goal") || lowerAnswer.includes("challenge") || lowerAnswer.includes("needed to"),
    lowerAnswer.includes("action") || lowerAnswer.includes("i decided") || lowerAnswer.includes("i implemented") || lowerAnswer.includes("steps"),
    lowerAnswer.includes("result") || lowerAnswer.includes("outcome") || lowerAnswer.includes("impact") || lowerAnswer.includes("improved"),
  ].filter(Boolean).length;

  let howTheyAnswered = "";
  let baseScore = 6;

  if (wordCount < 25) {
    howTheyAnswered = "Very brief. The answer lacks supporting details, background context, or measurable outcomes.";
    baseScore = 4;
  } else if (wordCount < 60) {
    howTheyAnswered = "Concise overview, but would benefit from a structured beginning, action steps, and concrete result.";
    baseScore = 5;
  } else if (starSignals >= 2) {
    howTheyAnswered = "Well-structured response showing clear progression from context to action taken and final outcome.";
    baseScore = 8;
  } else {
    howTheyAnswered = "Good level of detail with clear narrative flow. Structuring with the STAR framework would elevate it.";
    baseScore = 7;
  }

  // Adjust score based on relevance and tone
  if (relevanceRatio >= 0.5) baseScore += 1;
  if (relevanceRatio < 0.25) baseScore -= 1;
  if (hesitantHits >= 2) baseScore -= 1;
  const score = Math.max(1, Math.min(10, baseScore));

  const strengths: string[] = [];
  if (wordCount >= 40) strengths.push("Provided substantive explanations with relevant detail.");
  if (relevanceRatio >= 0.3) strengths.push("Directly tackled the core theme of the interview question.");
  if (confidentHits >= 1) strengths.push("Used proactive, action-oriented verbs to describe contributions.");
  if (strengths.length === 0) strengths.push("Clearly attempted the question with honest reflections.");

  const areasForImprovement: string[] = [];
  if (wordCount < 50) areasForImprovement.push("Expand on specific examples to illustrate your experience more vividly.");
  if (starSignals < 2) areasForImprovement.push("Adopt the STAR method: Situation, Task, Action, and measurable Result.");
  if (relevanceRatio < 0.5) areasForImprovement.push("Ensure every sentence directly supports the question being asked.");
  if (areasForImprovement.length === 0) areasForImprovement.push("Quantify results with measurable metrics or team impact.");

  const summary = `Solid ${request.category} response. Score: ${score}/10. ${howTheyAnswered} ${toneAnalysis}`;

  return {
    score,
    strengths: strengths.slice(0, 3),
    areasForImprovement: areasForImprovement.slice(0, 3),
    summary: summary.split(/\s+/).slice(0, 95).join(" "),
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

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Gemini returned non-JSON response: ${responseText.slice(0, 200)}`
      );
    }

    return validateFeedback(parsed);
  } catch (err: unknown) {
    // If external Gemini API call failed (e.g. invalid key or network error),
    // fallback gracefully to built-in evaluation so users are never interrupted
    console.warn("External Gemini API call failed, using built-in coach:", err);
    return evaluateAnswerFallback(request);
  }
}
