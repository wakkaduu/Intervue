import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "./theme";
import { Logo, ScoreRing } from "./ui";

/** YouTube thumbnail (1280x720). Render with: npx remotion still Thumbnail out/thumbnail.png */
export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: C.canvas, fontFamily: FONT, padding: 70, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Logo size={64} />
      <div style={{ fontSize: 120, fontWeight: 800, color: C.white, lineHeight: 1.0, letterSpacing: -3 }}>
        Practice
        <br />
        <span style={{ color: C.emerald }}>like it’s real</span>
        <span style={{ color: C.gold }}>.</span>
      </div>
      <div style={{ fontSize: 38, fontWeight: 600, color: "#9bb5a5" }}>AI mock interview coach</div>
    </div>
    <div style={{ background: C.sage100, borderRadius: 40, padding: 36, boxShadow: "0 30px 70px rgba(0,0,0,0.45)" }}>
      <ScoreRing score={8} progress={1} size={300} />
    </div>
  </AbsoluteFill>
);
