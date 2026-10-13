import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getUserSessions,
  saveUserInterviewSession,
  calculateUserAnalytics,
} from "@/lib/db";
import type { Category, SessionEntry } from "@/types";

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
    const message = err instanceof Error ? err.message : "Failed to load history.";
    return NextResponse.json({ error: message }, { status: 500 });
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

    const body = await req.json();
    const { category, mode, averageScore, entries } = body as {
      category: Category;
      mode: "mic" | "typed";
      averageScore: number;
      entries: SessionEntry[];
    };

    if (!category || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "Invalid session data provided." },
        { status: 400 }
      );
    }

    const saved = await saveUserInterviewSession({
      userId: session.user.id || session.user.email,
      userEmail: session.user.email,
      category,
      mode: mode || "typed",
      averageScore: typeof averageScore === "number" ? averageScore : 0,
      entries,
    });

    return NextResponse.json({ success: true, session: saved }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
