import type { Category, SessionEntry } from "@/types";
import type { StoredSession, UserAnalytics } from "@/lib/db";

const GUEST_STORAGE_KEY = "intervue_guest_sessions";

export interface GuestSession extends StoredSession {
  synced?: boolean;
}

/**
 * Reads all guest sessions saved in localStorage.
 * Safe for SSR / Next.js client hydration.
 */
export function getGuestSessions(): GuestSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as GuestSession[];
  } catch {
    return [];
  }
}

/**
 * Saves a completed interview session to the browser's localStorage for guests.
 */
export function saveGuestSession(data: {
  category: Category;
  mode: "mic" | "typed";
  averageScore: number;
  entries: SessionEntry[];
}): GuestSession {
  const current = getGuestSessions();
  const id = `sess_guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newSession: GuestSession = {
    id,
    userId: "guest",
    userEmail: "guest@local",
    category: data.category,
    mode: data.mode,
    averageScore: data.averageScore,
    questionCount: data.entries.length,
    entries: data.entries,
    createdAt: new Date().toISOString(),
    synced: false,
  };

  // Prepend so the newest session appears first
  const updated = [newSession, ...current];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Handle quota error gracefully
    }
  }
  return newSession;
}

/**
 * Removes a specific guest session by id (e.g. after successful sync).
 */
export function removeGuestSession(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getGuestSessions();
    const filtered = current.filter((s) => s.id !== id);
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

/**
 * Clears all guest sessions from localStorage.
 */
export function clearGuestSessions(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Checks if there are any guest sessions waiting to be synced.
 */
export function hasUnsyncedGuestSessions(): boolean {
  const sessions = getGuestSessions();
  return sessions.some((s) => !s.synced);
}

/**
 * Calculates analytics across all guest sessions stored locally.
 */
export function calculateGuestAnalytics(): UserAnalytics {
  const sessions = getGuestSessions();
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      totalQuestionsAnswered: 0,
      completedCategories: [],
      recentScores: [],
      topStrengths: [],
      areasForImprovement: [],
    };
  }

  let totalQuestions = 0;
  let totalScoreSum = 0;
  const categoriesSet = new Set<string>();
  const recentScores: { date: string; score: number; category: string }[] = [];
  const strengthsCount: Record<string, number> = {};
  const improvementsCount: Record<string, number> = {};

  for (const s of sessions) {
    totalQuestions += s.questionCount;
    totalScoreSum += s.averageScore;
    categoriesSet.add(s.category);

    recentScores.push({
      date: new Date(s.createdAt).toLocaleDateString(),
      score: s.averageScore,
      category: s.category,
    });

    if (Array.isArray(s.entries)) {
      for (const entry of s.entries) {
        if (entry.feedback) {
          if (Array.isArray(entry.feedback.strengths)) {
            for (const str of entry.feedback.strengths) {
              strengthsCount[str] = (strengthsCount[str] || 0) + 1;
            }
          }
          if (Array.isArray(entry.feedback.areasForImprovement)) {
            for (const imp of entry.feedback.areasForImprovement) {
              improvementsCount[imp] = (improvementsCount[imp] || 0) + 1;
            }
          }
        }
      }
    }
  }

  const topStrengths = Object.entries(strengthsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s);

  const areasForImprovement = Object.entries(improvementsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s);

  const avg = Math.round((totalScoreSum / sessions.length) * 10) / 10;

  return {
    totalSessions: sessions.length,
    averageScore: avg,
    totalQuestionsAnswered: totalQuestions,
    completedCategories: Array.from(categoriesSet),
    recentScores: recentScores.slice(0, 10),
    topStrengths,
    areasForImprovement,
  };
}

/**
 * Synchronizes all pending local guest sessions to the authenticated account's database.
 * Once successfully saved to /api/history, removes them from localStorage.
 */
export async function syncGuestSessionsToAccount(): Promise<{
  syncedCount: number;
  errors: number;
}> {
  const sessions = getGuestSessions();
  if (sessions.length === 0) return { syncedCount: 0, errors: 0 };

  let syncedCount = 0;
  let errors = 0;

  for (const s of sessions) {
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: s.category,
          mode: s.mode,
          averageScore: s.averageScore,
          entries: s.entries,
        }),
      });

      if (res.ok) {
        removeGuestSession(s.id);
        syncedCount += 1;
      } else {
        errors += 1;
      }
    } catch {
      errors += 1;
    }
  }

  return { syncedCount, errors };
}
