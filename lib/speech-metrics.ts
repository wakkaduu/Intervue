/**
 * Speech metrics and delivery analysis engine.
 * Computes words-per-minute (WPM), pace categorization,
 * and identifies filler words/phrases in spoken answers.
 */

export interface FillerMatch {
  word: string;
  count: number;
}

export type PaceCategory =
  | "too-slow"
  | "slow"
  | "optimal"
  | "fast"
  | "too-fast"
  | "unmeasured";

export interface SpeechDeliveryMetrics {
  totalWords: number;
  durationSeconds: number;
  wpm: number;
  paceCategory: PaceCategory;
  paceLabel: string;
  fillerCount: number;
  fillerMatches: FillerMatch[];
  fillerFrequencyPercent: number; // percentage of words that are fillers
  coachTip: string;
  annotatedWords: { text: string; isFiller: boolean }[];
}

/** Common conversational English filler words and hesitation phrases */
export const COMMON_FILLER_WORDS = [
  "um",
  "uh",
  "er",
  "ah",
  "like",
  "you know",
  "literally",
  "basically",
  "sort of",
  "kind of",
  "i mean",
  "actually",
];

/** Regex patterns for accurate whole-word and phrase matching */
const FILLER_PATTERNS: { regex: RegExp; phrase: string }[] = COMMON_FILLER_WORDS.map(
  (word) => ({
    regex: new RegExp(`\\b${word}\\b`, "gi"),
    phrase: word.toLowerCase(),
  })
);

/**
 * Categorize speech cadence based on Words Per Minute (WPM).
 * Standard professional interview conversational cadence: 120 - 160 WPM.
 */
export function categorizePace(wpm: number): {
  category: PaceCategory;
  label: string;
  tip: string;
} {
  if (wpm <= 0) {
    return {
      category: "unmeasured",
      label: "Not Measured",
      tip: "Deliver an answer to measure speech pacing.",
    };
  }

  if (wpm < 100) {
    return {
      category: "too-slow",
      label: "Very Deliberate (< 100 WPM)",
      tip: "Your pace was quite slow. Practice transitioning between points more fluidly to keep the interviewer fully engaged.",
    };
  }

  if (wpm < 120) {
    return {
      category: "slow",
      label: "Thoughtful (100–120 WPM)",
      tip: "Good clarity, but slightly conservative in speed. Increasing your cadence slightly can project greater confidence.",
    };
  }

  if (wpm <= 165) {
    return {
      category: "optimal",
      label: "Optimal Professional Pace (120–165 WPM)",
      tip: "Outstanding conversational cadence. Your speed allows interviewers to follow your ideas clearly without losing momentum.",
    };
  }

  if (wpm <= 190) {
    return {
      category: "fast",
      label: "Brisk (165–190 WPM)",
      tip: "Slightly rapid cadence. Remember to introduce purposeful pauses after key achievements to let your impact land.",
    };
  }

  return {
    category: "too-fast",
    label: "Rushed (> 190 WPM)",
    tip: "You spoke very rapidly. Slow down and breathe between sentences to avoid sounding rushed or nervous.",
  };
}

/**
 * Analyze transcript and duration to produce comprehensive delivery metrics.
 */
export function analyzeSpeechDelivery(
  transcript: string,
  durationSeconds: number
): SpeechDeliveryMetrics {
  const cleanText = transcript.trim();
  if (!cleanText) {
    return {
      totalWords: 0,
      durationSeconds: Math.max(0, durationSeconds),
      wpm: 0,
      paceCategory: "unmeasured",
      paceLabel: "No Speech Recorded",
      fillerCount: 0,
      fillerMatches: [],
      fillerFrequencyPercent: 0,
      coachTip: "Provide a spoken response to receive delivery coaching.",
      annotatedWords: [],
    };
  }

  // Count total words
  const rawWords = cleanText.split(/\s+/).filter(Boolean);
  const totalWords = rawWords.length;

  // Calculate WPM based on valid speech duration (minimum 2s to prevent division spikes)
  const effectiveDuration = Math.max(durationSeconds, 2);
  const minutes = effectiveDuration / 60;
  const wpm = minutes > 0 ? Math.round(totalWords / minutes) : 0;

  const { category: paceCategory, label: paceLabel, tip: paceTip } = categorizePace(wpm);

  // Detect filler words and counts
  const fillerCounts: Record<string, number> = {};
  let totalFillers = 0;

  for (const { regex, phrase } of FILLER_PATTERNS) {
    const matches = cleanText.match(regex);
    if (matches && matches.length > 0) {
      fillerCounts[phrase] = matches.length;
      totalFillers += matches.length;
    }
  }

  const fillerMatches: FillerMatch[] = Object.entries(fillerCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  const fillerFrequencyPercent =
    totalWords > 0 ? Math.round((totalFillers / totalWords) * 100 * 10) / 10 : 0;

  // Synthesize coach tip
  let coachTip = paceTip;
  if (totalFillers > 0) {
    const topFillers = fillerMatches
      .slice(0, 2)
      .map((f) => `"${f.word}"`)
      .join(" and ");

    if (fillerFrequencyPercent > 5) {
      coachTip += ` Frequent filler words detected (${topFillers}). Replace filler pauses with 1-2 seconds of confident silence.`;
    } else {
      coachTip += ` Good filler control, with only minor occurrences of ${topFillers}.`;
    }
  } else if (totalWords >= 20) {
    coachTip += " Excellent polish: no filler words detected!";
  }

  // Tokenize and annotate words for UI display
  const singleWordFillers = new Set(
    COMMON_FILLER_WORDS.filter((w) => !w.includes(" "))
  );

  const annotatedWords = rawWords.map((word) => {
    const stripped = word.toLowerCase().replace(/[^a-z']/g, "");
    const isFiller = singleWordFillers.has(stripped);
    return {
      text: word,
      isFiller,
    };
  });

  return {
    totalWords,
    durationSeconds: Math.round(durationSeconds),
    wpm,
    paceCategory,
    paceLabel,
    fillerCount: totalFillers,
    fillerMatches,
    fillerFrequencyPercent,
    coachTip,
    annotatedWords,
  };
}
