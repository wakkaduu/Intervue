/**
 * Client-side Speech Synthesis (TTS) Engine for Intervue.
 * Wraps the Web Speech API with safe SSR guards, natural voice selection,
 * speed control, and local preference persistence.
 */

const MUTED_STORAGE_KEY = "intervue_interviewer_muted";
const SPEED_STORAGE_KEY = "intervue_interviewer_speed";

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voiceName?: string;
  /** True for an explicit user action (Listen/Replay): speak even when auto-read is muted. */
  ignoreMute?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

/** Check if SpeechSynthesis is supported in the current environment */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Retrieve persisted mute preference (defaults to false / unmuted) */
export function getInterviewerMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(MUTED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/** Persist mute preference */
export function setInterviewerMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MUTED_STORAGE_KEY, muted ? "true" : "false");
  } catch {
    // ignore
  }
}

/** Retrieve persisted interviewer speed (defaults to 1.0) */
export function getInterviewerSpeed(): number {
  if (typeof window === "undefined") return 1.0;
  try {
    const val = parseFloat(localStorage.getItem(SPEED_STORAGE_KEY) || "1.0");
    return isNaN(val) ? 1.0 : Math.max(0.75, Math.min(1.5, val));
  } catch {
    return 1.0;
  }
}

/** Persist interviewer speed */
export function setInterviewerSpeed(speed: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SPEED_STORAGE_KEY, speed.toString());
  } catch {
    // ignore
  }
}

/** Cache available voices */
let cachedVoices: SpeechSynthesisVoice[] = [];

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  if (cachedVoices.length > 0) return cachedVoices;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

/** Find the most natural English interviewer voice */
export function selectBestEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  if (voices.length === 0) return null;

  // Filter for English voices
  const enVoices = voices.filter((v) => v.lang.startsWith("en"));
  if (enVoices.length === 0) return voices[0] || null;

  // Prioritize high-quality neural / natural voices
  const priorityKeywords = ["natural", "neural", "google", "samantha", "daniel", "arthur", "oliver"];
  for (const kw of priorityKeywords) {
    const match = enVoices.find((v) => v.name.toLowerCase().includes(kw));
    if (match) return match;
  }

  // Fallback to default English voice
  const defaultEn = enVoices.find((v) => v.default);
  return defaultEn || enVoices[0];
}

/** Stop any currently active speech playback */
export function stopSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}

/** Pause currently active speech playback */
export function pauseSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.pause();
  } catch {
    // ignore
  }
}

/** Resume paused speech playback */
export function resumeSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.resume();
  } catch {
    // ignore
  }
}

/** Returns true if speech synthesis is currently speaking */
export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}

/**
 * Speak text aloud using the best available conversational interviewer voice.
 */
export function speakText(text: string, options: SpeakOptions = {}): void {
  if (!isSpeechSynthesisSupported()) {
    options.onEnd?.();
    return;
  }

  if (!options.ignoreMute && getInterviewerMuted()) {
    options.onEnd?.();
    return;
  }

  // Cancel any previous utterance
  stopSpeaking();

  const clean = text.trim();
  if (!clean) {
    options.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(clean);
  const voice = selectBestEnglishVoice();
  if (voice) {
    utterance.voice = voice;
  }

  const preferredSpeed = getInterviewerSpeed();
  utterance.rate = options.rate ?? preferredSpeed;
  utterance.pitch = options.pitch ?? 1.0;

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    // 'canceled' or 'interrupted' errors occur normally when advancing questions
    if (e.error !== "canceled" && e.error !== "interrupted") {
      options.onError?.(e);
    }
    options.onEnd?.();
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    options.onError?.(err);
    options.onEnd?.();
  }
}
