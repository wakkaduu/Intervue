// Prevents one finished interview from being saved twice (for example when the
// results page is refreshed). The "saved" marker lives in sessionStorage, next to
// the results themselves, so it disappears with them.
import type { SessionEntry } from "@/types/index";

export type SaveKind = "guest" | "account";

/** Identifies one finished session. Prefer the id written when the results were stored. */
export function resultsKey(entries: SessionEntry[]): string {
  try {
    const id = sessionStorage.getItem("sessionResultsId");
    if (id) return id;
  } catch {
    // ignore
  }
  return `${entries.length}:${entries[0]?.question?.id ?? ""}:${entries.map((e) => e.feedback.score).join(",")}`;
}

export function wasSaved(kind: SaveKind, key: string): boolean {
  try {
    return sessionStorage.getItem(`sessionSaved_${kind}`) === key;
  } catch {
    return false;
  }
}

export function markSaved(kind: SaveKind, key: string): void {
  try {
    sessionStorage.setItem(`sessionSaved_${kind}`, key);
  } catch {
    // ignore
  }
}
