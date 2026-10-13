"use client";

import { useEffect, useState } from "react";

interface QueueLoadingAnimationProps {
  currentStep: number;
  totalSteps: number;
  currentItemText?: string;
  categoryTitle?: string;
  stageName?: string;
}

const EVALUATION_STAGES = [
  {
    id: 1,
    title: "Structure & STAR Depth",
    desc: "Analyzing Situation, Task, Action, and Result framing",
  },
  {
    id: 2,
    title: "Tone & Professional Delivery",
    desc: "Evaluating clarity, confidence, and conciseness",
  },
  {
    id: 3,
    title: "Role & Question Alignment",
    desc: "Scoring direct relevance to the target job position",
  },
  {
    id: 4,
    title: "Synthesizing Actionable Feedback",
    desc: "Compiling strengths, rubric ratings, and growth recommendations",
  },
];

export default function QueueLoadingAnimation({
  currentStep,
  totalSteps,
  currentItemText,
  categoryTitle = "Target Track",
  stageName: _stageName,
}: QueueLoadingAnimationProps) {
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStageIndex((prev) => (prev + 1) % EVALUATION_STAGES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const percentage = Math.min(
    100,
    Math.round(((currentStep || 1) / (totalSteps || 1)) * 100)
  );

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative overflow-hidden rounded-3xl border border-sage-300 bg-[#E2ECE5] p-6 sm:p-10 shadow-2xl space-y-8 animate-fade-in text-center max-w-2xl mx-auto"
    >
      {/* Ambient background decorative glow */}
      <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-forest-700/15 blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-forest-800 px-3.5 py-1 text-xs font-bold text-emerald-300 shadow-sm border border-emerald-500/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span>EVALUATION QUEUE ACTIVE</span>
        </span>
        {categoryTitle && (
          <span className="rounded-full bg-[#D4E3D8] border border-sage-300 px-3 py-1 text-xs font-semibold text-forest-900">
            {categoryTitle}
          </span>
        )}
      </div>

      {/* Main Animated Queue Orb */}
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-forest-600/20 animate-ping opacity-30" />
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 via-forest-600 to-emerald-400 opacity-30 blur-xs animate-pulse" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-850 shadow-xl border border-forest-700 text-white">
          <div className="flex items-end gap-1 h-6">
            <span className="w-1 bg-emerald-300 rounded-full animate-bounce [animation-duration:800ms]" style={{ height: "40%" }} />
            <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-duration:650ms]" style={{ height: "85%" }} />
            <span className="w-1 bg-white rounded-full animate-bounce [animation-duration:900ms]" style={{ height: "100%" }} />
            <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-duration:700ms]" style={{ height: "70%" }} />
            <span className="w-1 bg-emerald-300 rounded-full animate-bounce [animation-duration:850ms]" style={{ height: "35%" }} />
          </div>
        </div>
      </div>

      {/* Queue Titles */}
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-forest-950">
          Evaluating Interview Responses
        </h2>
        <p className="text-xs sm:text-sm text-darkslate-600 max-w-md mx-auto leading-relaxed">
          Your responses are being analyzed sequentially through the evaluation framework.
        </p>
      </div>

      {/* Visual Queue Stepper Items */}
      <div className="space-y-3 max-w-lg mx-auto">
        <div className="flex items-center justify-between text-xs font-bold text-darkslate-700">
          <span className="flex items-center gap-1.5">
            <span>Queue Position:</span>
            <span className="text-forest-800 font-extrabold">
              Question {currentStep} of {totalSteps}
            </span>
          </span>
          <span className="text-forest-800 font-black text-sm">{percentage}%</span>
        </div>

        {/* Queue Cards Bar */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${totalSteps || 1}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={idx}
                className={`relative rounded-xl p-2 text-center transition-all duration-300 border ${
                  isCompleted
                    ? "bg-forest-800 border-forest-600 text-emerald-200"
                    : isCurrent
                    ? "bg-[#D4E3D8] border-forest-600 ring-2 ring-forest-500/40 text-forest-950 shadow-md scale-105"
                    : "bg-[#CFDFD4]/70 border-sage-300/80 text-darkslate-400 opacity-60"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider">
                  Q{stepNum}
                </div>
                <div className="text-xs h-4 flex items-center justify-center">
                  {isCompleted ? (
                    <span className="font-bold text-emerald-300">✓</span>
                  ) : isCurrent ? (
                    <span className="inline-block h-2 w-2 rounded-full bg-forest-750 animate-ping" />
                  ) : (
                    <span className="text-darkslate-400 font-mono text-[10px]">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Shimmering Progress Bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#CFDFD4] shadow-inner relative">
          <div
            className="h-full bg-gradient-to-r from-forest-700 via-forest-600 to-emerald-500 transition-all duration-500 ease-out rounded-full relative"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </div>

      {/* Active Question Preview */}
      {currentItemText && (
        <div className="rounded-2xl bg-[#F0F5F1] border border-sage-300/80 p-3.5 text-xs text-darkslate-700 max-w-lg mx-auto shadow-xs text-left">
          <span className="font-bold text-forest-900 block mb-1">
            Analyzing Question {currentStep}:
          </span>
          <p className="text-darkslate-600 line-clamp-2">
            &quot;{currentItemText}&quot;
          </p>
        </div>
      )}

      {/* Pipeline Stage Indicators */}
      <div className="rounded-2xl border border-sage-300/90 bg-[#D8E6DC]/60 p-4 max-w-lg mx-auto text-left shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-darkslate-500">
          <span>Active Pipeline Phase</span>
          <span className="text-[11px] text-forest-800 font-extrabold">
            Phase {activeStageIndex + 1} of {EVALUATION_STAGES.length}
          </span>
        </div>

        <div className="space-y-1.5">
          {EVALUATION_STAGES.map((stage, idx) => {
            const isActive = idx === activeStageIndex;
            return (
              <div
                key={stage.id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all ${
                  isActive
                    ? "bg-[#E2ECE5] border border-forest-600/40 shadow-xs text-forest-950 font-bold"
                    : "opacity-50 text-darkslate-600 text-xs"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest-750 text-[10px] font-bold text-emerald-200 shrink-0">
                  {stage.id}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs truncate">{stage.title}</p>
                  {isActive && (
                    <p className="text-[11px] text-darkslate-500 font-normal truncate">
                      {stage.desc}
                    </p>
                  )}
                </div>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-forest-700 animate-ping shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Formal Footer notice */}
      <p className="text-[11px] text-darkslate-500">
        <strong className="text-darkslate-700 font-semibold">Note:</strong> Full evaluation results will be displayed upon queue completion without requiring an account.
      </p>
    </div>
  );
}
