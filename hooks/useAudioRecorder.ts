"use client";

// Cross-browser microphone audio recorder hook using HTML5 MediaRecorder.
// 100% compatible with Brave, Firefox, Chrome, Edge, Safari, Linux, Mac, and Windows.
// Audio is sent to the Whisper transcription endpoint upon stopping.

import { useState, useRef, useCallback, useEffect } from "react";

const MAX_RECORDING_SECONDS = 10 * 60; // 10 minutes

export interface UseAudioRecorderReturn {
  isSupported: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  recordingDuration: number;
  transcript: string;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  resetRecording: () => void;
  setTranscript: (text: string) => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecordingRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // Detect MediaRecorder support on mount
  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof window.MediaRecorder !== "undefined";
    setIsSupported(supported);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const stopTracks = useCallback(() => {
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const resetRecording = useCallback(() => {
    clearTimer();
    stopTracks();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setIsRecording(false);
    setIsTranscribing(false);
    setRecordingDuration(0);
    setTranscript("");
    setAudioBlob(null);
    setAudioUrl(null);
    setError(null);
  }, [clearTimer, stopTracks, audioUrl]);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError("Microphone recording is not supported in this browser. Please use Written Mode.");
      return;
    }

    resetRecording();
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Select best supported MIME type
      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Keep the screen awake on phones while recording (best-effort)
      try {
        const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinel> } };
        wakeLockRef.current = (await nav.wakeLock?.request("screen")) ?? null;
      } catch {
        wakeLockRef.current = null;
      }

      recorder.start(500); // 500ms time slices
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= MAX_RECORDING_SECONDS - 1) {
            // Auto-stop at 10 minutes
            stopRecordingRef.current();
            return MAX_RECORDING_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const mediaErr = err as { name?: string };
      if (
        mediaErr?.name === "NotAllowedError" ||
        mediaErr?.name === "PermissionDeniedError"
      ) {
        setError(
          "Microphone permission was denied. Please allow microphone access in your browser settings to record your answer."
        );
      } else if (
        mediaErr?.name === "NotFoundError" ||
        mediaErr?.name === "DevicesNotFoundError"
      ) {
        setError("No microphone was detected. Please connect a microphone and try again.");
      } else {
        setError("Could not start microphone recording. Please check your audio settings.");
      }
      setIsRecording(false);
    }
  }, [isSupported, resetRecording]);

  const stopRecording = useCallback(async () => {
    clearTimer();
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      setIsRecording(false);
      return;
    }

    setIsRecording(false);

    return new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        stopTracks();
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Send to Whisper transcription endpoint
        setIsTranscribing(true);
        try {
          const formData = new FormData();
          const baseType = (blob.type || "audio/webm").split(";")[0];
          const ext = baseType.includes("mp4") ? "m4a" : baseType.includes("ogg") ? "ogg" : baseType.includes("wav") ? "wav" : "webm";
          formData.append("file", blob, `answer.${ext}`);

          const customGeminiKey =
            typeof window !== "undefined" ? localStorage.getItem("mock_gemini_key") : null;
          const customGroqKey =
            typeof window !== "undefined" ? localStorage.getItem("mock_groq_key") : null;
          const customOpenaiKey =
            typeof window !== "undefined" ? localStorage.getItem("mock_openai_key") : null;

          const headers: Record<string, string> = {};
          if (customGeminiKey) headers["x-gemini-key"] = customGeminiKey;
          if (customGroqKey) headers["x-groq-key"] = customGroqKey;
          if (customOpenaiKey) headers["x-openai-key"] = customOpenaiKey;

          const response = await fetch("/api/transcribe", {
            method: "POST",
            headers,
            body: formData,
          });

          const data = (await response.json()) as {
            text?: string;
            error?: string;
            message?: string;
          };

          if (response.ok && data.text) {
            setTranscript(data.text);
          } else {
            const errorMsg =
              data.message || data.error || "Audio transcription failed. You can re-record your answer.";
            setError(errorMsg);
          }
        } catch (transcribeErr) {
          console.error("Transcription network error:", transcribeErr);
          setError("Network error while transcribing audio. Please try again.");
        } finally {
          setIsTranscribing(false);
          resolve();
        }
      };

      recorder.stop();
    });
  }, [clearTimer, stopTracks]);

  stopRecordingRef.current = stopRecording;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      stopTracks();
    };
  }, [clearTimer, stopTracks]);

  return {
    isSupported,
    isRecording,
    isTranscribing,
    recordingDuration,
    transcript,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    resetRecording,
    setTranscript,
  };
}
