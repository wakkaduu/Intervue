// POST /api/review/summary — consolidated end-of-session debrief
import { NextRequest, NextResponse } from "next/server";
import { validateSessionEntries } from "@/lib/validation";
import { generateDebrief } from "@/lib/debrief-evaluator";
import { checkApiRateLimit, getClientIp } from "@/lib/security/rate-limiter";

export const maxDuration = 30;

const TIMEOUT_MS = 20_000;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const limit = checkApiRateLimit("review", getClientIp(request.headers));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let entries;
  try {
    const body = (await request.json()) as { entries?: unknown };
    entries = validateSessionEntries(body?.entries);
  } catch (err) {
    const message =
      err instanceof SyntaxError
        ? "Request body must be valid JSON."
        : err instanceof Error
          ? err.message
          : "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const keys = {
    geminiKey: request.headers.get("x-gemini-key") || undefined,
    groqKey: request.headers.get("x-groq-key") || undefined,
  };

  try {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Debrief timed out.")), TIMEOUT_MS);
    });
    try {
      const debrief = await Promise.race([generateDebrief(entries, keys), timeout]);
      return NextResponse.json({ debrief }, { status: 200 });
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    console.error("[api/review/summary]", err);
    return NextResponse.json({ error: "Debrief service unavailable." }, { status: 502 });
  }
}
