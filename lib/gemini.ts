// Server-only Gemini client wrapper
// Requirements: 5.2, 5.7
// IMPORTANT: This file must only be imported from server-side code (Route Handlers, Server Components).
// Never add "use client" to this file.

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Feedback, ReviewRequest } from "@/types/index";
import { validateFeedback } from "@/lib/validation";

const MODEL_NAME = "gemini-1.5-flash";

/**
 * Builds the prompt string for the Gemini API from a ReviewRequest.
 */
function buildPrompt(request: ReviewRequest): string {
  return `You are an expert interview coach evaluating a candidate's answer to an interview question.

Category: ${request.category}
Question: ${request.question}
Candidate's Answer: ${request.answer}

Evaluate the answer and respond with a JSON object matching this exact schema:
{
  "score": <integer 1-10>,
  "strengths": [<1-5 strings>],
  "areasForImprovement": [<1-5 strings>],
  "summary": <string, max 100 words>
}

Be constructive, specific, and concise.`;
}

/**
 * Calls the Gemini API to evaluate an interview answer and returns validated Feedback.
 *
 * Reads GEMINI_API_KEY from process.env — never from NEXT_PUBLIC_ variables.
 * Throws an Error if the API key is missing, the API call fails, or the response
 * does not conform to the Feedback schema.
 *
 * Requirements: 5.2, 5.7
 */
export async function callGemini(request: ReviewRequest): Promise<Feedback> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

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

  // Validate and return the typed Feedback object; throws if schema is violated
  return validateFeedback(parsed);
}
