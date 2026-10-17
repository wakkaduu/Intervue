import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp } from "./theme";

/** 0 -> 1 spring, starting `delay` frames into the scene. */
export const useSpring = (delay = 0, damping = 18) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 120 } });
};

export const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0,
  children,
  style,
}) => {
  const p = useSpring(delay);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${0.96 + p * 0.04})`, ...style }}>
      {children}
    </div>
  );
};

export const Typed: React.FC<{ text: string; start?: number; cps?: number; cursor?: boolean }> = ({
  text,
  start = 0,
  cps = 22,
  cursor = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.max(0, Math.min(text.length, Math.floor(((frame - start) / fps) * cps)));
  const blink = Math.floor(frame / 15) % 2 === 0;
  return (
    <>
      {text.slice(0, n)}
      {cursor && <span style={{ opacity: blink ? 1 : 0 }}>▌</span>}
    </>
  );
};

export const Logo: React.FC<{ size?: number; dark?: boolean }> = ({ size = 72, dark = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.28 }}>
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: `linear-gradient(135deg, ${C.emerald}, #10b981)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke={C.canvasDeep} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 11a7 7 0 01-14 0M12 18v4M8 22h8" />
        <rect x="9" y="2" width="6" height="12" rx="3" />
      </svg>
    </div>
    <span style={{ fontSize: size * 0.72, fontWeight: 800, letterSpacing: -1, color: dark ? C.slate : C.white }}>
      Intervue
    </span>
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      background: C.sage100,
      borderRadius: 36,
      padding: 44,
      color: C.slate,
      boxShadow: "0 40px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Caption: React.FC<{ text: string }> = ({ text }) => {
  const p = useSpring(10);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 70,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      <div
        style={{
          background: "rgba(10,18,14,0.78)",
          color: C.white,
          fontSize: 38,
          fontWeight: 600,
          padding: "16px 36px",
          borderRadius: 20,
          maxWidth: 1500,
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Scene wrapper: background + fade in/out. */
export const SceneFrame: React.FC<{
  duration: number;
  bg?: string;
  caption?: string;
  children: React.ReactNode;
}> = ({ duration, bg = C.canvas, caption, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, background: bg, opacity, overflow: "hidden" }}>
      {children}
      {caption && <Caption text={caption} />}
    </div>
  );
};

export const Waveform: React.FC<{ color?: string; bars?: number; active?: boolean; height?: number }> = ({
  color = C.emerald,
  bars = 28,
  active = true,
  height = 90,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, height }}>
      {Array.from({ length: bars }, (_, i) => {
        const h = active ? 0.25 + 0.75 * Math.abs(Math.sin(frame / 5 + i * 0.7) * Math.cos(frame / 11 + i * 0.3)) : 0.12;
        return <div key={i} style={{ width: 8, height: h * height, borderRadius: 4, background: color }} />;
      })}
    </div>
  );
};

export const ScoreRing: React.FC<{ score: number; progress: number; size?: number }> = ({ score, progress, size = 260 }) => {
  const r = size / 2 - 18;
  const circ = 2 * Math.PI * r;
  const shown = score * progress;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={C.sage300} strokeWidth={20} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={C.gold}
          strokeWidth={20}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - shown / 10)}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.34, fontWeight: 800, color: C.slate, lineHeight: 1 }}>{Math.round(shown)}</span>
        <span style={{ fontSize: size * 0.1, fontWeight: 600, color: C.slate600 }}>out of 10</span>
      </div>
    </div>
  );
};

export const ease = Easing.bezier(0.16, 1, 0.3, 1);
