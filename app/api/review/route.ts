// POST /api/review — Server-side AI evaluation proxy (Gemini → Groq → built-in grader)
// Requirements: 5.1, 5.2, 5.5, 5.7
// IMPORTANT: GEMINI_API_KEY is only accessed server-side and is never returned to the client.

import { NextRequest, NextResponse } from "next/server";
import { validateReviewRequest } from "@/lib/validation";
import { evaluateAnswer } from "@/lib/evaluator";
import { checkApiRateLimit, getClientIp } from "@/lib/security/rate-limiter";

// Serverless function execution timeout (seconds)
export const maxDuration = 30;

const TIMEOUT_MS = 28_000; // overall budget; each AI provider also has its own shorter timeout

export async function POST(request: NextRequest): Promise<NextResponse> {
  const limit = checkApiRateLimit("review", getClientIp(request.headers));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  // Validate the request fields (Req 5.1, 5.8)
  let reviewRequest;
  try {
    reviewRequest = validateReviewRequest(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Call Gemini with a 15-second timeout (Req 5.5)
  // AbortController races against evaluateAnswer so the handler returns 504 if Gemini is too slow.
  const controller = new AbortController();
  const timeoutPromise = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      controller.abort();
      const err = new Error("Gemini request timed out.");
      err.name = "AbortError";
      reject(err);
    }, TIMEOUT_MS);
    // Allow Node.js to exit even if the timer is still pending
    if (typeof id === "object" && "unref" in id) {
      (id as NodeJS.Timeout).unref();
    }
  });

  const clientGeminiKey = request.headers.get("x-gemini-key") || undefined;
  const clientGroqKey = request.headers.get("x-groq-key") || undefined;

  try {
    const feedback = await Promise.race([
      evaluateAnswer(reviewRequest, { geminiKey: clientGeminiKey, groqKey: clientGroqKey }),
      timeoutPromise,
    ]);
    return NextResponse.json({ feedback }, { status: 200 });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      // Gemini did not respond within 15 seconds (Req 5.5)
      return NextResponse.json(
        { error: "Review service unavailable. Please try again." },
        { status: 504 }
      );
    }

    // Distinguish upstream/parsing errors (502) from unexpected server errors (500)
    const message = "Review service unavailable. Please try again.";
    const isUpstreamError =
      err instanceof Error &&
      (err.message.includes("Gemini") ||
        err.message.includes("non-JSON") ||
        err.message.includes("GEMINI_API_KEY"));

    return NextResponse.json(
      { error: message },
      { status: isUpstreamError ? 502 : 500 }
    );
  }
}
