"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CheckState = "idle" | "testing" | "ok" | "denied" | "error";

/**
 * MicCheck — lets the user confirm the microphone works (live level meter)
 * before the interview starts, so recording problems surface early.
 */
export default function MicCheck() {
  const [state, setState] = useState<CheckState>("idle");
  const [level, setLevel] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const heardRef = useRef(0);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    stop();
    heardRef.current = 0;
    setLevel(0);
    setState("testing");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);

      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (const v of data) peak = Math.max(peak, Math.abs(v - 128));
        const normalized = Math.min(1, peak / 64);
        setLevel(normalized);
        heardRef.current = normalized > 0.12 ? heardRef.current + 1 : heardRef.current;
        if (heardRef.current > 8) {
          setState("ok");
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      const name = (err as { name?: string })?.name;
      setState(name === "NotAllowedError" || name === "PermissionDeniedError" ? "denied" : "error");
    }
  }, [stop]);

  return (
    <div className="rounded-xl border border-sage-300/80 bg-[#F0F5F1] p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-forest-950">Check your microphone</p>
          <p className="text-xs text-darkslate-600">Optional, takes about 5 seconds.</p>
        </div>
        <button
          type="button"
          onClick={state === "testing" || state === "ok" ? () => { stop(); setState("idle"); setLevel(0); } : start}
          className="min-h-[44px] rounded-lg border border-forest-600 bg-white px-4 py-2 text-xs font-bold text-forest-800 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
        >
          {state === "testing" || state === "ok" ? "Stop test" : "Test microphone"}
        </button>
      </div>

      {(state === "testing" || state === "ok") && (
        <div className="space-y-1.5">
          <div
            role="meter"
            aria-label="Microphone level"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(level * 100)}
            className="h-3 w-full overflow-hidden rounded-full bg-[#CFDFD4]"
          >
            <div
              className={`h-full rounded-full ${state === "ok" ? "bg-forest-600" : "bg-gold-500"}`}
              style={{ width: `${Math.round(level * 100)}%` }}
            />
          </div>
          <p role="status" className="text-xs font-medium text-darkslate-700">
            {state === "ok"
              ? "✓ We can hear you. Your microphone works."
              : "Say a few words. The bar should move."}
          </p>
        </div>
      )}

      {state === "denied" && (
        <p role="alert" className="text-xs font-medium text-red-700">
          Microphone access is blocked. Allow it in your browser&apos;s site settings, then test again, or use
          Written Mode.
        </p>
      )}
      {state === "error" && (
        <p role="alert" className="text-xs font-medium text-red-700">
          We couldn&apos;t find a working microphone. Check that one is connected, or use Written Mode.
        </p>
      )}
    </div>
  );
}
