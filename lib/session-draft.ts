// Autosave for in-progress interview sessions so a refresh, phone call or tab
// switch doesn't lose the user's answers. Stored per browser in localStorage.
import type { AnswerMode } from "@/types/index";

const DRAFT_KEY = "intervue_session_draft_v1";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface SessionDraft {
  v: 1;
  category: string;
  mode: AnswerMode;
  answers: Record<number, string>;
  durations: Record<number, number>;
  questionIndex: number;
  savedAt: number;
}

export function countDraftAnswers(draft: Pick<SessionDraft, "answers">): number {
  return Object.values(draft.answers).filter((a) => a.trim().length > 0).length;
}

export function saveDraft(draft: Omit<SessionDraft, "v" | "savedAt">): void {
  try {
    if (countDraftAnswers(draft) === 0) return; // never overwrite a draft with an empty one
    const payload: SessionDraft = { ...draft, v: 1, savedAt: Date.now() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // storage unavailable or full — autosave is best-effort
  }
}

export function loadDraft(category: string, mode: AnswerMode, now = Date.now()): SessionDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<SessionDraft>;
    if (
      d.v !== 1 ||
      d.category !== category ||
      d.mode !== mode ||
      typeof d.savedAt !== "number" ||
      now - d.savedAt > MAX_AGE_MS ||
      typeof d.answers !== "object" ||
      d.answers === null ||
      typeof d.questionIndex !== "number"
    ) {
      return null;
    }
    const draft = d as SessionDraft;
    return countDraftAnswers(draft) > 0 ? draft : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
