// Session state machine for the Mock Interview Helper
// Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 5.3, 7.2

"use client";

import { useReducer, useMemo } from "react";
import type { Category, Question, Feedback, SessionEntry } from "@/types/index";
import { getQuestionsByCategory } from "@/lib/questions";

// ---------------------------------------------------------------------------
// Phase type
// ---------------------------------------------------------------------------

export type SessionPhase =
  | "IDLE"
  | "RECORDING"
  | "SUBMITTED"
  | "REVIEWING"
  | "FEEDBACK_SHOWN"
  | "SESSION_ENDED";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface SessionState {
  phase: SessionPhase;
  category: Category | null;
  questions: Question[];
  questionIndex: number;
  currentAnswer: string;
  sessionResults: SessionEntry[];
  error: string | null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type SessionAction =
  | { type: "START_SESSION"; payload: { category: Category } }
  | { type: "START_RECORDING" }
  | { type: "STOP_RECORDING"; payload: { answer: string } }
  | { type: "SUBMIT_ANSWER" }
  | { type: "RECEIVE_FEEDBACK"; payload: { feedback: Feedback } }
  | { type: "NEXT_QUESTION" }
  | { type: "END_SESSION" }
  | { type: "SET_ERROR"; payload: { error: string } }
  | { type: "RETRY_SUBMIT" };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: SessionState = {
  phase: "IDLE",
  category: null,
  questions: [],
  questionIndex: 0,
  currentAnswer: "",
  sessionResults: [],
  error: null,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function sessionReducer(
  state: SessionState,
  action: SessionAction
): SessionState {
  switch (action.type) {
    case "START_SESSION": {
      const questions = getQuestionsByCategory(action.payload.category);
      return {
        ...initialState,
        phase: "RECORDING",
        category: action.payload.category,
        questions,
        questionIndex: 0,
      };
    }

    case "START_RECORDING": {
      if (state.phase !== "IDLE" && state.phase !== "FEEDBACK_SHOWN") {
        return state;
      }
      return { ...state, phase: "RECORDING", error: null };
    }

    case "STOP_RECORDING": {
      if (state.phase !== "RECORDING") return state;
      return {
        ...state,
        phase: "SUBMITTED",
        currentAnswer: action.payload.answer,
        error: null,
      };
    }

    case "SUBMIT_ANSWER": {
      if (state.phase !== "SUBMITTED") return state;
      return { ...state, phase: "REVIEWING", error: null };
    }

    case "RECEIVE_FEEDBACK": {
      if (state.phase !== "REVIEWING") return state;
      const currentQuestion = state.questions[state.questionIndex];
      if (!currentQuestion) return state;

      const newEntry: SessionEntry = {
        question: currentQuestion,
        answer: state.currentAnswer,
        feedback: action.payload.feedback,
      };

      return {
        ...state,
        phase: "FEEDBACK_SHOWN",
        sessionResults: [...state.sessionResults, newEntry],
        error: null,
      };
    }

    case "NEXT_QUESTION": {
      if (state.phase !== "FEEDBACK_SHOWN") return state;
      const nextIndex = state.questionIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, phase: "SESSION_ENDED" };
      }
      return {
        ...state,
        phase: "RECORDING",
        questionIndex: nextIndex,
        currentAnswer: "",
        error: null,
      };
    }

    case "END_SESSION": {
      return { ...state, phase: "SESSION_ENDED" };
    }

    case "SET_ERROR": {
      return { ...state, error: action.payload.error };
    }

    case "RETRY_SUBMIT": {
      if (state.phase !== "REVIEWING") return state;
      return { ...state, phase: "REVIEWING", error: null };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Utility — exported for independent testing (Property 3)
// ---------------------------------------------------------------------------

/**
 * Calculates the arithmetic mean of all entry scores, rounded to one decimal
 * place using the formula: Math.round((sum / count) * 10) / 10.
 *
 * Returns 0 for an empty array.
 */
export function calculateAverageScore(entries: SessionEntry[]): number {
  if (entries.length === 0) return 0;
  const sum = entries.reduce((acc, entry) => acc + entry.feedback.score, 0);
  return Math.round((sum / entries.length) * 10) / 10;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseInterviewSessionReturn {
  phase: SessionPhase;
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  sessionResults: SessionEntry[];
  averageScore: number;
  error: string | null;
  dispatch: React.Dispatch<SessionAction>;
}

export function useInterviewSession(): UseInterviewSessionReturn {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const currentQuestion = state.questions[state.questionIndex] ?? null;
  const totalQuestions = state.questions.length;

  const averageScore = useMemo(
    () => calculateAverageScore(state.sessionResults),
    [state.sessionResults]
  );

  return {
    phase: state.phase,
    currentQuestion,
    questionIndex: state.questionIndex,
    totalQuestions,
    sessionResults: state.sessionResults,
    averageScore,
    error: state.error,
    dispatch,
  };
}
