"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  speakText,
  stopSpeaking,
  pauseSpeaking,
  resumeSpeaking,
  getInterviewerMuted,
  setInterviewerMuted,
  getInterviewerSpeed,
  setInterviewerSpeed,
  isSpeechSynthesisSupported,
} from "@/lib/speech-synthesis";
import Button, { IconButton } from "@/components/ui/Button";

interface InterviewerVoiceControlsProps {
  /** The question text to read aloud */
  text: string;
  /** Whether to automatically start speaking when text changes (default: true) */
  autoPlay?: boolean;
  /** Optional callback fired when interviewer completes speaking */
  onFinished?: () => void;
}

export default function InterviewerVoiceControls({
  text,
  autoPlay = true,
  onFinished,
}: InterviewerVoiceControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [supported, setSupported] = useState(false);

  const prevTextRef = useRef<string>("");

  // Initialize client settings
  useEffect(() => {
    const isSup = isSpeechSynthesisSupported();
    setSupported(isSup);
    if (isSup) {
      setIsMuted(getInterviewerMuted());
      setSpeed(getInterviewerSpeed());
    }
  }, []);

  // Handle speaking the provided text
  const handleSpeak = useCallback(
    (customSpeed?: number) => {
      if (!text || !supported) return;
      if (getInterviewerMuted()) return;

      setIsPaused(false);
      setIsPlaying(true);

      speakText(text, {
        rate: customSpeed ?? speed,
        onStart: () => {
          setIsPlaying(true);
          setIsPaused(false);
        },
        onEnd: () => {
          setIsPlaying(false);
          setIsPaused(false);
          onFinished?.();
        },
        onError: () => {
          setIsPlaying(false);
          setIsPaused(false);
        },
      });
    },
    [text, supported, speed, onFinished]
  );

  // Auto-play when question text changes
  useEffect(() => {
    if (!supported || !autoPlay) return;

    if (text && text !== prevTextRef.current) {
      prevTextRef.current = text;
      // Slight delay so the user sees question transition first
      const timer = setTimeout(() => {
        handleSpeak();
      }, 350);

      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [text, supported, autoPlay, handleSpeak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  if (!supported) return null;

  function togglePlayPause() {
    if (isPlaying && !isPaused) {
      pauseSpeaking();
      setIsPaused(true);
    } else if (isPlaying && isPaused) {
      resumeSpeaking();
      setIsPaused(false);
    } else {
      handleSpeak();
    }
  }

  function handleReplay() {
    stopSpeaking();
    handleSpeak();
  }

  function handleToggleMute() {
    const next = !isMuted;
    setIsMuted(next);
    setInterviewerMuted(next);
    if (next) {
      stopSpeaking();
      setIsPlaying(false);
      setIsPaused(false);
    } else {
      handleSpeak();
    }
  }

  function cycleSpeed() {
    const speeds = [0.9, 1.0, 1.15];
    const currentIdx = speeds.indexOf(speed);
    const nextSpeed = speeds[(currentIdx + 1) % speeds.length] || 1.0;
    setSpeed(nextSpeed);
    setInterviewerSpeed(nextSpeed);

    if (isPlaying) {
      stopSpeaking();
      handleSpeak(nextSpeed);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-sage-300/90 bg-[#D4E3D8]/90 px-3.5 py-2 text-xs text-darkslate-800 shadow-xs transition-all">
      {/* Left side: Voice Status indicator & animated soundwave */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-forest-800 text-white shadow-xs">
          <svg
            className="h-3.5 w-3.5 text-emerald-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"
            />
          </svg>
        </span>

        <div className="flex items-center gap-2">
          <span className="font-bold text-forest-950 text-[11px] sm:text-xs">
            AI Interviewer:
          </span>

          {isMuted ? (
            <span className="text-[11px] font-medium text-darkslate-500">Muted</span>
          ) : isPlaying && !isPaused ? (
            <div className="flex items-center gap-1.5" aria-label="Speaking question">
              <span className="text-[11px] font-semibold text-emerald-800">Speaking...</span>
              {/* Animated Soundwave Bars */}
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-emerald-600 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
                <span className="w-0.5 bg-emerald-600 rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.1s] h-3" />
                <span className="w-0.5 bg-emerald-600 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.2s] h-1.5" />
                <span className="w-0.5 bg-emerald-600 rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.3s] h-2.5" />
              </div>
            </div>
          ) : isPaused ? (
            <span className="text-[11px] font-medium text-amber-800">Paused</span>
          ) : (
            <span className="text-[11px] font-medium text-darkslate-600">Ready</span>
          )}
        </div>
      </div>

      {/* Right side: Quick Audio Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Play / Pause Button */}
        {!isMuted && (
          <Button
            variant="primary"
            size="sm"
            onClick={togglePlayPause}
            aria-label={isPlaying && !isPaused ? "Pause voice" : "Listen to question"}
            className="gap-1.5"
          >            {isPlaying && !isPaused ? (
              <>
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                <span>Pause</span>
              </>
            ) : (
              <>
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>{isPaused ? "Resume" : "Listen"}</span>
              </>
            )}
          </Button>
        )}

        {/* Replay Button */}
        {!isMuted && (
          <IconButton label="Replay question from beginning" title="Replay from start" size="sm" onClick={handleReplay}>
            <svg className="h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </IconButton>
        )}

        {/* Speed Selector Pill */}
        {!isMuted && (
          <Button
            variant="secondary"
            size="sm"
            className="!min-w-[44px] !px-2"
            onClick={cycleSpeed}
            aria-label={`Current playback speed ${speed}x. Click to change.`}
            title="Adjust voice speed"
          >
            {speed}x
          </Button>
        )}

        {/* Mute Toggle Button */}
        <IconButton
          label={isMuted ? "Unmute AI Interviewer" : "Mute AI Interviewer"}
          title={isMuted ? "Unmute interviewer voice" : "Mute interviewer voice"}
          size="sm"
          active={isMuted}
          aria-pressed={isMuted}
          onClick={handleToggleMute}
        >
          {isMuted ? (
            <svg className="h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        
        </IconButton>
      </div>
    </div>
  );
}
