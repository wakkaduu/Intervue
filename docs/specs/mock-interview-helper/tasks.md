# Implementation Plan: Mock Interview Helper

## Overview

Implement a Next.js 14 (App Router) application with TypeScript and Tailwind CSS that lets users practice job interviews by speaking answers aloud, receiving live transcription via the Web Speech API, and getting structured AI feedback from the Gemini API through a server-side proxy route. The build proceeds in layers: project scaffold → shared types and data → hooks → components → pages → API route → accessibility polish → property-based tests.

## Tasks

- [x] 1. Scaffold the Next.js 14 project with TypeScript and Tailwind CSS
  - Initialize a new Next.js 14 project using the App Router with TypeScript and Tailwind CSS enabled
  - Create the full directory structure: `app/`, `app/interview/`, `app/summary/`, `app/api/review/`, `components/`, `hooks/`, `lib/`, `data/`, `types/`
  - Add `.env.local` with a placeholder `GEMINI_API_KEY=` entry and add `.env.local` to `.gitignore`
  - Configure `next.config.ts` (no `NEXT_PUBLIC_` prefix for the API key)
  - Install project dependencies: `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `fast-check`, `msw`, `@axe-core/react`
  - Configure `vitest.config.ts` with jsdom environment and setup file
  - _Requirements: 5.7_

- [x] 2. Define shared TypeScript types and data models
  - [x] 2.1 Create `types/index.ts` with all shared interfaces
    - Define `Category` union type with all five valid values
    - Define `Question`, `Feedback`, `SessionEntry`, `Session` interfaces
    - Define `ReviewRequest`, `ReviewResponse`, `ReviewErrorResponse` interfaces
    - _Requirements: 1.1, 5.1, 5.2, 7.1_

  - [x] 2.2 Write unit tests for type guards and schema validation helpers
    - Test that `Feedback` objects with out-of-range scores, oversized arrays, or oversized summaries are rejected
    - _Requirements: 5.2_

- [x] 3. Build the static question bank
  - [x] 3.1 Create `data/questions.json` with at least 5 questions per category
    - Add ≥5 questions for each of the five categories: Behavioral, Technical, Cultural Fit, Situational, Communication & Presence
    - Each question object must have `id` (unique string), `category`, and `text` fields
    - _Requirements: 1.1, 2.1_

  - [x] 3.2 Create `lib/questions.ts` question bank loader
    - Implement `getQuestionsByCategory(category: Category): Question[]` that reads from `questions.json`
    - Implement `getCategories(): Category[]` returning all five category values
    - _Requirements: 1.1, 2.1_

  - [x] 3.3 Write unit tests for the question bank loader
    - Assert each category returns ≥5 questions
    - Assert returned questions have the correct `category` field
    - _Requirements: 1.1_

- [x] 4. Implement shared validation helpers
  - [x] 4.1 Create `lib/validation.ts` with all input validation functions
    - Implement `validateAnswer(answer: string): string | null` — returns an error string for empty/whitespace-only input, `null` otherwise
    - Implement `validateCategory(category: unknown): category is Category` — type guard for the five valid category values
    - Implement `validateReviewRequest(body: unknown): ReviewRequest` — throws on invalid input, returns typed request on success
    - Implement `validateFeedback(obj: unknown): Feedback` — validates score range [1,10], array lengths [1,5], summary word count ≤100
    - _Requirements: 1.4, 5.8_

  - [x] 4.2 Write property test for empty/whitespace answer rejection (Property 2)
    - **Property 2: Empty or whitespace-only answers are always rejected without an API call**
    - Generate arbitrary whitespace-only strings (spaces, tabs, newlines, Unicode whitespace, combinations) using `fc.string()` filtered to whitespace-only
    - Assert `validateAnswer()` returns a non-null error string for every generated input
    - Assert `fetch` is never called when `validateAnswer` returns an error
    - **Validates: Requirements 5.8**

  - [x]* 4.3 Write unit tests for validation helpers
    - Test `validateAnswer` with empty string, whitespace-only strings, and valid non-empty strings
    - Test `validateCategory` with all five valid values and invalid values
    - Test `validateFeedback` with boundary scores (1, 10, 0, 11), empty arrays, and oversized summaries
    - _Requirements: 1.4, 5.8_

- [x] 5. Implement the `useSpeechRecognition` hook
  - [x] 5.1 Create `hooks/useSpeechRecognition.ts`
    - Detect `window.SpeechRecognition` / `window.webkitSpeechRecognition` support on mount; set `isSupported` accordingly
    - Configure recognition with `continuous = true`, `interimResults = true`, `lang = "en-US"`
    - Implement `start()` and `stop()` functions managing the recognition lifecycle
    - Handle `onresult`: append `isFinal` results to `finalTranscript`; update `interimTranscript` with the latest non-final result
    - On `stop()`, append any remaining `interimTranscript` to `finalTranscript` to form the complete answer
    - Handle `onerror`: map `not-allowed`, `no-speech`, `audio-capture`, `network` codes to user-friendly messages; increment `retryCount`; trigger fallback after 3 consecutive failures
    - Handle `onend`: auto-restart if recording was not intentionally stopped (Chrome 60-second limit workaround)
    - Implement 10-minute auto-stop using `setTimeout`; set `autoStopped` flag and call `stop()` when timer fires
    - Implement `reset()` to clear all transcript state and retry count
    - Return `{ isSupported, isRecording, finalTranscript, interimTranscript, retryCount, autoStopped, error, start, stop, reset }`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3_

  - [ ]* 5.2 Write property test for transcript accumulation (Property 4)
    - **Property 4: Final transcript accumulation is strictly append-only**
    - Generate arbitrary sequences of `SpeechRecognitionResult`-shaped objects with `isFinal: true` using `fc.array(fc.record({ transcript: fc.string(), isFinal: fc.constant(true) }))`
    - Feed each sequence through the transcript accumulation logic extracted from `useSpeechRecognition`
    - Assert the resulting `finalTranscript` equals the exact concatenation of all `transcript` strings in order
    - **Validates: Requirements 3.3, 4.2**

  - [ ]* 5.3 Write unit tests for `useSpeechRecognition`
    - Test state transitions: idle → recording → stopped → finalized using fake `SpeechRecognition` mock
    - Test `onerror: not-allowed` triggers fallback immediately
    - Test three consecutive `no-speech` errors trigger fallback
    - Test 10-minute auto-stop using `vi.useFakeTimers()`
    - Test `reset()` clears all state
    - _Requirements: 3.1, 3.4, 3.5, 3.6, 3.7_

- [x] 6. Implement the `useInterviewSession` hook
  - [x] 6.1 Create `hooks/useInterviewSession.ts` with the session state machine
    - Define the `SessionPhase` type: `'IDLE' | 'RECORDING' | 'SUBMITTED' | 'REVIEWING' | 'FEEDBACK_SHOWN' | 'SESSION_ENDED'`
    - Define the `SessionState` interface and all action types: `START_SESSION`, `START_RECORDING`, `STOP_RECORDING`, `SUBMIT_ANSWER`, `RECEIVE_FEEDBACK`, `NEXT_QUESTION`, `END_SESSION`, `SET_ERROR`, `RETRY_SUBMIT`
    - Implement the reducer with all state transitions as defined in the design
    - Implement `calculateAverageScore(entries: SessionEntry[]): number` — returns `Math.round((sum / count) * 10) / 10`
    - Return `{ phase, currentQuestion, questionIndex, totalQuestions, sessionResults, averageScore, error, dispatch }`
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 5.3, 7.2_

  - [ ]* 6.2 Write property test for session average score (Property 3)
    - **Property 3: Session average score equals the arithmetic mean of entry scores rounded to one decimal place**
    - Generate arbitrary non-empty arrays of `SessionEntry` with random integer scores in [1, 10] using `fc.array(fc.record({ feedback: fc.record({ score: fc.integer({ min: 1, max: 10 }) }) }), { minLength: 1 })`
    - Assert `calculateAverageScore(entries)` equals `Math.round((sum / count) * 10) / 10`
    - **Validates: Requirements 7.2**

  - [ ]* 6.3 Write unit tests for `useInterviewSession` reducer
    - Test every action type produces the correct next state
    - Test `START_SESSION` loads questions and sets phase to `RECORDING`
    - Test `RECEIVE_FEEDBACK` stores feedback and sets phase to `FEEDBACK_SHOWN`
    - Test `NEXT_QUESTION` advances index or transitions to `SESSION_ENDED` when no more questions remain
    - Test `SET_ERROR` stores the error message without changing phase
    - _Requirements: 2.1, 2.4, 2.5, 2.6_

- [x] 7. Create utility components
  - [x] 7.1 Create `components/LoadingSpinner.tsx`
    - Render an animated spinner with `role="status"` and `aria-label="Loading feedback…"`
    - _Requirements: 5.3, 8.3_

  - [x] 7.2 Create `components/ErrorMessage.tsx`
    - Accept `message: string` and optional `onRetry?: () => void` props
    - Render in a `role="alert"` container so screen readers announce it immediately
    - Render a "Resubmit" / "Retry" button when `onRetry` is provided
    - Associate the message with `aria-describedby` when used inline
    - _Requirements: 1.4, 1.5, 3.5, 3.6, 5.5, 8.3_

- [x] 8. Create core UI components
  - [x] 8.1 Create `components/CategoryCard.tsx`
    - Render as a `<button>` with `aria-pressed` reflecting the `selected` prop
    - Accept `category: Category`, `selected: boolean`, `onSelect: (category: Category) => void` props
    - Apply Tailwind focus-visible ring styles for keyboard navigation
    - _Requirements: 1.1, 8.3, 8.4_

  - [x] 8.2 Create `components/QuestionDisplay.tsx`
    - Render question text in an `<h2>` element
    - Display progress indicator showing `questionNumber / totalQuestions`
    - Accept `question: Question`, `questionNumber: number`, `totalQuestions: number` props
    - _Requirements: 2.1, 2.2_

  - [x] 8.3 Create `components/TranscriptArea.tsx`
    - Accept `finalTranscript`, `interimTranscript`, `fallbackMode`, `onFallbackChange` props
    - In normal mode: render finalized text in default style and interim text in muted/italic style
    - In fallback mode: render a `<textarea>` with an associated `<label>` via `htmlFor`
    - Ensure the transcript area has a minimum height of 120px and is scrollable
    - _Requirements: 4.1, 4.3, 4.4, 3.5, 8.3_

  - [x] 8.4 Create `components/RecordingControls.tsx`
    - Accept `isRecording`, `isSupported`, `onStart`, `onStop`, `onSubmit`, `hasTranscript` props
    - Render "Start Recording" and "Stop Recording" buttons with `aria-label` attributes
    - Hide microphone buttons when `isSupported` is false (fallback mode)
    - Disable "Submit Answer" button when `hasTranscript` is false
    - Apply Tailwind focus-visible ring styles
    - _Requirements: 3.1, 3.4, 5.8, 8.3, 8.4_

  - [x] 8.5 Create `components/FeedbackPanel.tsx`
    - Accept `question: Question`, `answer: string`, `feedback: Feedback`, `onNext: () => void`, `onEndSession: () => void` props
    - Render score as the first element using a font size class at least 1.5× body text (e.g., `text-3xl`)
    - Render question text and answer text beneath the score, in that order
    - Render strengths and areas-for-improvement as separate labeled `<ul>` lists
    - When either list is empty, render the labeled section with "None identified" text
    - Render the summary paragraph beneath both lists
    - Provide "Next Question" and "End Session" controls with accessible names
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 8.3_

  - [ ]* 8.6 Write property test for FeedbackPanel rendering (Property 5)
    - **Property 5: FeedbackPanel always renders all required sections for any Feedback value**
    - Generate arbitrary `Feedback` objects including those with empty `strengths` and/or `areasForImprovement` arrays using `fc.record({ score: fc.integer({ min: 1, max: 10 }), strengths: fc.array(fc.string()), areasForImprovement: fc.array(fc.string()), summary: fc.string() })`
    - Render `<FeedbackPanel>` with React Testing Library for each generated value
    - Assert score element is present and rendered before other content
    - Assert labeled strengths section is present; assert "None identified" appears when `strengths` is empty
    - Assert labeled areas-for-improvement section is present; assert "None identified" appears when `areasForImprovement` is empty
    - Assert summary paragraph is present
    - **Validates: Requirements 6.1, 6.3, 6.4, 6.5**

  - [x] 8.7 Create `components/SessionSummaryCard.tsx`
    - Accept `entry: SessionEntry` and `index: number` props
    - Render question text, answer text, score, strengths, areas-for-improvement, and summary for the entry
    - _Requirements: 7.1_

- [x] 9. Checkpoint — Ensure all component and hook tests pass
  - Run `vitest --run` and confirm all tests written so far pass
  - Ask the user if any questions arise before proceeding to the API route and pages

- [ ] 10. Build the server-side Gemini proxy route
  - [x] 10.1 Create `lib/gemini.ts` server-only Gemini client wrapper
    - Implement `callGemini(request: ReviewRequest): Promise<Feedback>` using the `@google/generative-ai` SDK
    - Read `GEMINI_API_KEY` from `process.env` (never `NEXT_PUBLIC_`)
    - Build the prompt template with `category`, `question`, and `answer` interpolated
    - Set `responseMimeType: "application/json"` in the generation config
    - Parse and validate the JSON response against the `Feedback` schema using `validateFeedback`
    - _Requirements: 5.2, 5.7_

  - [-] 10.2 Create `app/api/review/route.ts` POST Route Handler
    - Parse and validate the request body using `validateReviewRequest` from `lib/validation.ts`
    - Return `400` with `{ error: "..." }` on validation failure
    - Use `AbortController` with a 15-second timeout; return `504` if Gemini does not respond in time
    - Call `callGemini` and return `200` with `{ feedback }` on success
    - Catch all errors and return `500` / `502` with `{ error: "Review service unavailable. Please try again." }`
    - Never return or log `GEMINI_API_KEY`
    - _Requirements: 5.1, 5.2, 5.5, 5.7_

  - [ ]* 10.3 Write property test for Feedback schema conformance (Property 1)
    - **Property 1: Valid answer submission always produces a schema-conformant Feedback object**
    - Generate arbitrary non-empty question strings, non-empty answer strings, and valid categories using `fc.record({ question: fc.string({ minLength: 1 }), answer: fc.string({ minLength: 1 }), category: fc.constantFrom(...categories) })`
    - Mock the Gemini client to return a valid `Feedback` object for each generated input
    - Call the route handler and assert the parsed response satisfies all `Feedback` schema constraints: `score` in [1,10], `strengths` length in [1,5], `areasForImprovement` length in [1,5], `summary` word count ≤100
    - Also render the Interview page with the feedback in state and assert the resubmit button is absent
    - **Validates: Requirements 5.2, 5.6, 5.7**

  - [ ]* 10.4 Write integration tests for the review route
    - Use `msw` to mock the Gemini API endpoint
    - Test `400` is returned for missing `question`, missing `answer`, and invalid `category`
    - Test `504` is returned when the mocked Gemini response is delayed beyond 15 seconds (use `vi.useFakeTimers()`)
    - Test `200` with a valid `Feedback` shape is returned for a well-formed request
    - _Requirements: 5.1, 5.2, 5.5_

- [x] 11. Implement the Home page
  - [x] 11.1 Create `app/page.tsx` — Category Selection screen
    - Render five `<CategoryCard>` components, one per category, in a responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
    - Track `selectedCategory: Category | null` in local state
    - Render a "Start Session" button that navigates to `/interview?category=<slug>` via `useRouter`
    - Display an inline `<ErrorMessage>` when "Start Session" is clicked with no category selected
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 11.2 Create `app/layout.tsx` — Root layout
    - Add a "Skip to main content" anchor as the first focusable element
    - Apply global Tailwind styles and font configuration
    - Include a visually-hidden `aria-live="polite"` region for phase-transition announcements
    - _Requirements: 8.3, 8.4_

- [ ] 12. Implement the Interview page
  - [-] 12.1 Create `app/interview/page.tsx` — Interview screen
    - Read `?category` from `useSearchParams`; redirect to `/` if category is missing or invalid
    - Initialize `useInterviewSession` and `useSpeechRecognition` hooks
    - Render `<QuestionDisplay>` with the current question and progress
    - Render `<TranscriptArea>` wired to speech recognition state; pass `fallbackMode` when `isSupported` is false or after 3 retries
    - Render `<RecordingControls>` wired to hook actions
    - Render `<LoadingSpinner>` while phase is `REVIEWING`
    - Render `<FeedbackPanel>` when phase is `FEEDBACK_SHOWN`
    - Render `<ErrorMessage>` with retry option when `error` is set in session state
    - On `END_SESSION` action, serialize `sessionResults` to `sessionStorage` and navigate to `/summary`
    - Display auto-stop notification using `aria-live="assertive"` when `autoStopped` is true
    - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 5.3, 5.4, 5.5, 5.6, 5.8_

  - [ ]* 12.2 Write unit tests for the Interview page
    - Test that `<LoadingSpinner>` is shown while reviewing and hidden otherwise
    - Test that `<FeedbackPanel>` is shown only when phase is `FEEDBACK_SHOWN`
    - Test that `<ErrorMessage>` with resubmit button appears on API error
    - Test that resubmit button is absent when feedback is successfully received
    - _Requirements: 5.3, 5.5, 5.6_

- [ ] 13. Implement the Summary page
  - [ ] 13.1 Create `app/summary/page.tsx` — Session Summary screen
    - Read `SessionEntry[]` from `sessionStorage`; redirect to `/` if data is missing
    - Render a `<SessionSummaryCard>` for each answered entry
    - When at least one entry exists, display the average score using `calculateAverageScore` rounded to one decimal place
    - When no entries exist, display a "No answers were submitted" message and hide the average score
    - Render a "New Session" button that navigates to `/`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 13.2 Write unit tests for the Summary page
    - Test average score is displayed and correct when entries exist
    - Test "no answers" message is shown and average score is absent when entries are empty
    - Test "New Session" button navigates to `/`
    - _Requirements: 7.2, 7.3, 7.4_

- [~] 14. Checkpoint — Ensure all tests pass
  - Run `vitest --run` and confirm all tests pass
  - Ask the user if any questions arise before proceeding to accessibility and property tests

- [ ] 15. Implement accessibility polish
  - [~] 15.1 Audit and fix ARIA attributes across all components and pages
    - Verify every `<button>` and `<a>` has a non-empty accessible name (visible text, `aria-label`, or `aria-labelledby`)
    - Verify every `<input>` and `<textarea>` has an associated `<label>` via `htmlFor` or `aria-labelledby`
    - Verify `<LoadingSpinner>` has `role="status"` and `aria-label`
    - Verify `<ErrorMessage>` has `role="alert"`
    - Verify `<CategoryCard>` buttons have `aria-pressed`
    - Add `aria-describedby` to inline validation error messages linking them to their controls
    - _Requirements: 8.3_

  - [~] 15.2 Implement focus management for phase transitions
    - When `<FeedbackPanel>` becomes visible, move focus to the score heading
    - When navigating to the next question, move focus to `<QuestionDisplay>`
    - Ensure the "Skip to main content" link in `layout.tsx` targets `<main id="main-content">`
    - _Requirements: 8.4_

  - [ ]* 15.3 Write property test for accessible names (Property 6)
    - **Property 6: All interactive elements have a non-empty accessible name**
    - For each page component (Home, Interview, Summary), render it with arbitrary valid props using `fc.record(...)` generators
    - Query all elements with ARIA roles `button`, `link`, `textbox`, `combobox`, `checkbox`
    - Assert every queried element has a non-empty accessible name derivable from visible label text, `aria-label`, or `aria-labelledby`
    - **Validates: Requirements 8.3**

  - [ ]* 15.4 Write axe-core accessibility tests
    - Run `@axe-core/react` on each rendered page (Home, Interview, Summary) and assert zero violations
    - _Requirements: 8.2, 8.3, 8.4_

- [~] 16. Final checkpoint — Ensure all tests pass
  - Run `vitest --run` and confirm all tests pass, including all six property-based tests
  - Ask the user if any questions arise before considering the implementation complete

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints (tasks 9, 14, 16) ensure incremental validation at natural boundaries
- The six property-based tests (tasks 4.2, 5.2, 6.2, 8.6, 10.3, 15.3) each correspond to a named correctness property in the design document
- `GEMINI_API_KEY` must never be prefixed with `NEXT_PUBLIC_` and must only be accessed inside `app/api/review/route.ts` and `lib/gemini.ts`
- The Web Speech API fallback (`<textarea>`) must be shown immediately when `isSupported` is false, without requiring the user to attempt recording first
- `calculateAverageScore` should be exported from `hooks/useInterviewSession.ts` so it can be tested independently

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "3.1"] },
    { "id": 1, "tasks": ["2.2", "3.2", "4.1"] },
    { "id": 2, "tasks": ["3.3", "4.2", "4.3", "5.1"] },
    { "id": 3, "tasks": ["5.2", "5.3", "6.1", "7.1", "7.2"] },
    { "id": 4, "tasks": ["6.2", "6.3", "8.1", "8.2", "8.3", "8.4", "8.5"] },
    { "id": 5, "tasks": ["8.6", "8.7", "10.1", "11.2"] },
    { "id": 6, "tasks": ["10.2", "11.1"] },
    { "id": 7, "tasks": ["10.3", "10.4", "12.1", "13.1"] },
    { "id": 8, "tasks": ["12.2", "13.2", "15.1"] },
    { "id": 9, "tasks": ["15.2"] },
    { "id": 10, "tasks": ["15.3", "15.4"] }
  ]
}
```
