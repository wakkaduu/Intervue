// POST /api/review — Server-side Gemini proxy
// Requirements: 5.1, 5.2, 5.5, 5.7
// IMPORTANT: GEMINI_API_KEY is only accessed server-side and is never returned to the client.

import { NextRequest, NextResponse } from "next/server";
import { validateReviewRequest } from "@/lib/validation";
import { callGemini } from "@/lib/gemini";

// Serverless function execution timeout (seconds)
export const maxDuration = 30;

const TIMEOUT_MS = 15_000;

export async function POST(request: NextRequest): Promise<NextResponse> {
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
  // AbortController races against callGemini so the handler returns 504 if Gemini is too slow.
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

  try {
    const feedback = await Promise.race([
      callGemini(reviewRequest, clientGeminiKey),
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
