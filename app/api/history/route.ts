import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getUserSessions,
  saveUserInterviewSession,
  calculateUserAnalytics,
} from "@/lib/db";
import { validateHistoryPayload } from "@/lib/validation";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to view interview history." },
        { status: 401 }
      );
    }

    const userIdentifier = session.user.id || session.user.email;
    const history = await getUserSessions(userIdentifier);
    const analytics = await calculateUserAnalytics(userIdentifier);

    return NextResponse.json({
      sessions: history,
      analytics,
    });
  } catch (err: unknown) {
    console.error("[api/history GET]", err);
    return NextResponse.json({ error: "Failed to load history." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to save interview results." },
        { status: 401 }
      );
    }

    let validated;
    try {
      validated = validateHistoryPayload(await req.json());
    } catch (validationErr) {
      const message =
        validationErr instanceof SyntaxError
          ? "Request body must be valid JSON."
          : validationErr instanceof Error
            ? validationErr.message
            : "Invalid session data provided.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const saved = await saveUserInterviewSession({
      userId: session.user.id || session.user.email,
      userEmail: session.user.email,
      category: validated.category,
      mode: validated.mode,
      averageScore: validated.averageScore,
      entries: validated.entries,
    });

    return NextResponse.json({ success: true, session: saved }, { status: 201 });
  } catch (err: unknown) {
    console.error("[api/history POST]", err);
    return NextResponse.json({ error: "Failed to save session." }, { status: 500 });
  }
}
