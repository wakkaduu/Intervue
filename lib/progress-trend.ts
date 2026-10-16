// Pure helpers for the History "progress trend": one point per practice session.

export interface TrendSessionInput {
  id: string;
  category: string;
  averageScore: number;
  questionCount: number;
  createdAt: string;
}

export interface TrendPoint {
  id: string;
  date: string; // ISO 8601
  score: number; // 0-10
  category: string;
  questionCount: number;
}

export interface TrendSummary {
  count: number;
  latest: number;
  best: number;
  /** Positive = improving. null when there are fewer than 2 points. */
  delta: number | null;
  /** What `delta` compares, e.g. "since your first session". */
  deltaLabel: string;
  direction: "up" | "down" | "flat" | "none";
}

export const MAX_TREND_POINTS = 30;
export const FLAT_THRESHOLD = 0.3;

/** "Frontend Engineer / UI Developer (Component lifecycle…)" -> "Frontend Engineer / UI Developer" */
export function shortCategory(category: string): string {
  const idx = category.indexOf(" (");
  return (idx > 0 ? category.slice(0, idx) : category).trim();
}

/**
 * Builds chart points, oldest -> newest, optionally limited to one track.
 * Keeps only the most recent `limit` sessions and ignores invalid scores/dates.
 */
export function buildTrendPoints(
  sessions: TrendSessionInput[],
  category: string | null = null,
  limit = MAX_TREND_POINTS
): TrendPoint[] {
  return sessions
    .filter(
      (s) =>
        (category === null || s.category === category) &&
        Number.isFinite(s.averageScore) &&
        !Number.isNaN(new Date(s.createdAt).getTime())
    )
    .map((s) => ({
      id: s.id,
      date: s.createdAt,
      score: Math.max(0, Math.min(10, s.averageScore)),
      category: s.category,
      questionCount: s.questionCount,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-limit);
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/**
 * Summarises the trend. With 4+ sessions it compares the average of the first
 * three to the average of the latest three, so one lucky or bad session
 * doesn't swing the message; with 2-3 it compares first to latest.
 */
export function summarizeTrend(points: TrendPoint[]): TrendSummary | null {
  if (points.length === 0) return null;
  const scores = points.map((p) => p.score);
  const latest = scores[scores.length - 1];
  const best = Math.max(...scores);

  if (points.length < 2) {
    return { count: 1, latest, best, delta: null, deltaLabel: "", direction: "none" };
  }

  let delta: number;
  let deltaLabel: string;
  if (points.length >= 4) {
    delta = round1(mean(scores.slice(-3)) - mean(scores.slice(0, 3)));
    deltaLabel = "vs your first 3 sessions";
  } else {
    delta = round1(latest - scores[0]);
    deltaLabel = "since your first session";
  }
  const direction = Math.abs(delta) < FLAT_THRESHOLD ? "flat" : delta > 0 ? "up" : "down";
  return { count: points.length, latest, best, delta, deltaLabel, direction };
}

/** Distinct tracks present in the sessions, most-practised first. */
export function trackOptions(sessions: TrendSessionInput[]): { category: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of sessions) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}
