import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, clamp } from "./theme";
import { Card, Logo, Rise, SceneFrame, ScoreRing, Typed, Waveform, ease, useSpring } from "./ui";

type SceneProps = { d: number };

/* 1 — Hook */
export const Hook: React.FC<SceneProps> = ({ d }) => {
  const frame = useCurrentFrame();
  const pulse = 0.5 + 0.5 * Math.sin(frame / 6);
  return (
    <SceneFrame duration={d} bg="#0A110D">
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 240px", gap: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#8aa595", fontSize: 28, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>
          <span style={{ width: 16, height: 16, borderRadius: 8, background: C.rose, opacity: 0.4 + pulse * 0.6 }} />
          Interviewer
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, color: C.white, lineHeight: 1.1, letterSpacing: -2 }}>
          <Typed text="“Tell me about a time you failed.”" start={12} cps={20} cursor />
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
          {["Nerves", "Ums", "Rambling"].map((t, i) => (
            <Rise key={t} delay={Math.round(d * 0.5) + i * 14}>
              <div style={{ fontSize: 44, fontWeight: 700, color: C.rose, border: `3px solid ${C.rose}`, borderRadius: 18, padding: "10px 30px" }}>{t}</div>
            </Rise>
          ))}
        </div>
      </div>
    </SceneFrame>
  );
};

/* 2 — Brand reveal */
export const Brand: React.FC<SceneProps> = ({ d }) => {
  const logo = useSpring(4);
  const dot = useSpring(52, 8);
  return (
    <SceneFrame duration={d} caption="Meet Intervue, your AI interview coach.">
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 44, paddingBottom: 100 }}>
        <div style={{ transform: `scale(${0.7 + logo * 0.3})`, opacity: logo }}>
          <Logo size={110} />
        </div>
        <Rise delay={16}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 26px", borderRadius: 999, background: "rgba(29,45,37,0.9)", border: `1px solid ${C.forest600}`, color: "#6EE7B7", fontSize: 28, fontWeight: 600 }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: C.emerald }} />
            AI interviewer · voice or written
          </div>
        </Rise>
        <div style={{ textAlign: "center", fontSize: 108, fontWeight: 800, color: C.white, lineHeight: 1.08, letterSpacing: -3 }}>
          <Rise delay={24}>Practice the interview.</Rise>
          <Rise delay={36}>
            <span style={{ color: C.emerald }}>Get coached like it’s real</span>
            <span style={{ color: C.gold, display: "inline-block", transform: `scale(${0.2 + dot * 0.8})`, opacity: dot }}>.</span>
          </Rise>
        </div>
      </div>
    </SceneFrame>
  );
};

/* 3 — 52 tracks */
const ROWS = [
  ["Behavioral", "Software Engineer", "Medical School", "MBA Admissions", "Product Manager", "Visa Interview", "Law (JD / LLB)", "Data Scientist"],
  ["Y Combinator Pitch", "Nursing", "Management Consultant", "Military Officer Board", "Frontend Engineer", "PhD Defense", "Customer Success", "Situational"],
  ["Multiple Mini Interviews", "DevOps / SRE", "Investment Banking", "Civil Service", "UX Designer", "Scholarship", "Cultural Fit", "Pageant Q&A"],
];
export const Tracks: React.FC<SceneProps> = ({ d }) => {
  const frame = useCurrentFrame();
  const count = Math.round(interpolate(frame, [10, 70], [0, 52], { ...clamp, easing: ease }));
  const q = Math.round(interpolate(frame, [10, 70], [0, 624], { ...clamp, easing: ease }));
  return (
    <SceneFrame duration={d} caption="From job interviews to medical school, visas and pitch day.">
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28, paddingBottom: 60 }}>
        {ROWS.map((row, r) => (
          <div key={r} style={{ display: "flex", gap: 24, whiteSpace: "nowrap", transform: `translateX(${(r % 2 ? -1 : 1) * -frame * (3 + r) - 200 + (r % 2 ? -600 : 0)}px)` }}>
            {[...row, ...row, ...row].map((t, i) => (
              <div key={i} style={{ padding: "22px 40px", borderRadius: 24, background: i % 5 === 2 ? C.gold : C.sage100, color: C.slate, fontSize: 40, fontWeight: 700 }}>
                {t}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 60 }}>
        <Rise delay={6}>
          <div style={{ background: "#131E19", padding: "44px 90px", borderRadius: 40, textAlign: "center", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", border: `1px solid ${C.forest600}` }}>
            <div style={{ fontSize: 170, fontWeight: 800, color: C.white, lineHeight: 1 }}>
              {count}
              <span style={{ color: C.emerald, fontSize: 70, marginLeft: 20 }}>tracks</span>
            </div>
            <div style={{ fontSize: 44, color: "#9bb5a5", fontWeight: 600, marginTop: 10 }}>{q} practice questions</div>
          </div>
        </Rise>
      </div>
    </SceneFrame>
  );
};

/* 4 — Answer out loud */
const ANSWER = "In my last role I pushed a release without a rollback plan, and checkout broke for about an hour. I owned it straight away";
export const Answer: React.FC<SceneProps> = ({ d }) => {
  const frame = useCurrentFrame();
  const toggle = interpolate(frame, [14, 30], [0, 1], { ...clamp, easing: ease });
  const split = Math.floor(((frame - 70) / 30) * 20);
  const shown = ANSWER.slice(0, Math.max(0, split));
  const cut = Math.max(0, shown.length - 18);
  return (
    <SceneFrame duration={d} caption="Speak naturally. Transcribed live.">
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 90 }}>
        <Rise>
          <Card style={{ width: 1500 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 3, color: "#283C32", textTransform: "uppercase" }}>Behavioral · Question 1</div>
              <div style={{ position: "relative", display: "flex", background: C.sage200, borderRadius: 18, padding: 6, width: 320 }}>
                <div style={{ position: "absolute", top: 6, bottom: 6, left: 6 + (1 - toggle) * 154, width: 154, borderRadius: 13, background: C.canvas }} />
                {["Voice", "Written"].map((l, i) => (
                  <div key={l} style={{ flex: 1, textAlign: "center", zIndex: 1, padding: "10px 0", fontSize: 28, fontWeight: 700, color: (i === 0) === toggle > 0.5 ? C.white : C.slate600 }}>
                    {l}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 58, fontWeight: 800, margin: "30px 0", lineHeight: 1.15 }}>Tell me about a time you failed.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 28, background: C.sage200, borderRadius: 24, padding: "14px 30px" }}>
              <Waveform active={frame > 50} />
              <div style={{ fontSize: 28, fontWeight: 700, color: C.slate600 }}>{frame > 50 ? "Listening…" : "Tap to start"}</div>
            </div>
            <div style={{ marginTop: 26, minHeight: 190, fontSize: 40, lineHeight: 1.4, background: C.white, borderRadius: 24, padding: 30, fontWeight: 500 }}>
              {shown.slice(0, cut)}
              <span style={{ color: "#7B8794", fontStyle: "italic" }}>{shown.slice(cut)}</span>
            </div>
          </Card>
        </Rise>
      </div>
    </SceneFrame>
  );
};

/* 5 — Live delivery HUD */
const K = 2.2; // stretch factor so the HUD plays at a readable pace
const SPOKEN: { t: string; filler?: boolean; at: number }[] = [
  { t: "So,", at: 6 }, { t: "um,", filler: true, at: 14 }, { t: "I", at: 22 }, { t: "basically", filler: true, at: 28 },
  { t: "shipped", at: 38 }, { t: "the", at: 44 }, { t: "release,", at: 50 }, { t: "like,", filler: true, at: 60 },
  { t: "too", at: 68 }, { t: "fast", at: 74 }, { t: "and", at: 82 }, { t: "you", filler: true, at: 90 }, { t: "know,", filler: true, at: 96 }, { t: "it", at: 104 }, { t: "broke.", at: 110 },
];
export const HUD: React.FC<SceneProps> = ({ d }) => {
  const frame = useCurrentFrame();
  const words = SPOKEN.filter((w) => frame >= w.at * K);
  const fillers = words.filter((w) => w.filler).length;
  const wpm = Math.round(interpolate(frame, [4 * K, 40 * K, 100 * K], [0, 188, 142], { ...clamp, easing: ease }));
  const ok = wpm >= 120 && wpm <= 160;
  const color = ok ? C.emerald : wpm > 160 ? C.amber : C.rose;
  const angle = interpolate(wpm, [0, 220], [-120, 120], clamp);
  const tip = useSpring(Math.round(100 * K));
  return (
    <SceneFrame duration={d} caption="See your pace and filler words as you talk.">
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 50, padding: "0 110px 90px" }}>
        <Card style={{ flex: 1.25 }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 3, color: "#283C32", textTransform: "uppercase", marginBottom: 20 }}>Live transcript</div>
          <div style={{ fontSize: 54, lineHeight: 1.5, fontWeight: 500 }}>
            {words.map((w, i) => (
              <span key={i} style={{ marginRight: 14, display: "inline-block", ...(w.filler ? { background: C.amberBg, color: "#92400E", borderRadius: 10, padding: "0 12px", boxShadow: `inset 0 0 0 2px ${C.amber}` } : {}) }}>
                {w.t}
              </span>
            ))}
          </div>
        </Card>
        <Card style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 3, color: "#283C32", textTransform: "uppercase" }}>Delivery</div>
          <svg width={440} height={330} viewBox="-220 -230 440 330" style={{ marginTop: 10 }}>
            <path d="M -160 80 A 190 190 0 1 1 160 80" stroke={C.sage300} strokeWidth={26} fill="none" strokeLinecap="round" transform="translate(0,0)" />
            <g transform={`rotate(${angle})`}>
              <line x1={0} y1={0} x2={0} y2={-150} stroke={color} strokeWidth={12} strokeLinecap="round" />
              <circle r={20} fill={color} />
            </g>
            <text y={85} textAnchor="middle" fontSize={84} fontWeight={800} fill={C.slate}>{wpm}</text>
          </svg>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.slate600, marginTop: -10 }}>words per minute</div>
          <div style={{ display: "inline-block", marginTop: 14, padding: "8px 26px", borderRadius: 999, fontSize: 30, fontWeight: 800, color: ok ? "#065F46" : "#92400E", background: ok ? "#D1FAE5" : C.amberBg }}>
            {ok ? "Optimal pace" : wpm > 160 ? "A bit fast" : "Warming up"}
          </div>
          <div style={{ marginTop: 22, fontSize: 38, fontWeight: 700 }}>
            Fillers: <span style={{ color: C.amber, fontSize: 56, fontWeight: 800 }}>{fillers}</span>
          </div>
          <div style={{ marginTop: 18, opacity: tip, transform: `translateY(${(1 - tip) * 20}px)`, background: C.canvas, color: C.white, borderRadius: 20, padding: "16px 22px", fontSize: 28, fontWeight: 600, lineHeight: 1.3 }}>
            Tip: pause instead of saying “um”.
          </div>
        </Card>
      </div>
    </SceneFrame>
  );
};

/* 6 — Feedback (hero) */
export const Feedback: React.FC<SceneProps> = ({ d }) => {
  const frame = useCurrentFrame();
  const f = (x: number) => Math.round(d * x); // timeline position as a fraction of the scene
  const ring = interpolate(frame, [8, 50], [0, 1], { ...clamp, easing: ease });
  const strike = interpolate(frame, [f(0.4), f(0.4) + 20], [0, 100], clamp);
  const bullet = (t: string, c: string, delay: number) => (
    <Rise delay={delay} style={{ display: "flex", gap: 14, fontSize: 32, fontWeight: 600, lineHeight: 1.3, marginBottom: 12 }}>
      <span style={{ color: c, fontWeight: 800 }}>{c === C.emerald ? "✓" : "→"}</span>
      <span>{t}</span>
    </Rise>
  );
  return (
    <SceneFrame duration={d} caption="Specific feedback · a stronger rewrite · the real follow-up">
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 44, padding: "0 90px 110px" }}>
        <Card style={{ width: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <ScoreRing score={7} progress={ring} />
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 3, color: "#283C32", textTransform: "uppercase" }}>Strengths</div>
              <div style={{ marginTop: 12 }}>
                {bullet("Owned the failure immediately", C.emerald, f(0.08))}
                {bullet("Clear, concrete outcome", C.emerald, f(0.11))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 3, color: "#283C32", textTransform: "uppercase", margin: "26px 0 12px" }}>To improve</div>
          {bullet("Say what you changed afterwards", C.gold, f(0.15))}
          {bullet("Cut filler: “basically”, “like”", C.gold, f(0.18))}
        </Card>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 28 }}>
          <Rise delay={f(0.3)}>
            <Card style={{ background: C.sage100 }}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 3, color: C.slate600, textTransform: "uppercase" }}>You said</div>
              <div style={{ position: "relative", fontSize: 40, fontWeight: 600, marginTop: 10, display: "inline-block" }}>
                “I shipped it too fast and it broke.”
                <div style={{ position: "absolute", left: 0, top: "52%", height: 5, width: `${strike}%`, background: C.rose }} />
              </div>
            </Card>
          </Rise>
          <Rise delay={f(0.5)}>
            <div style={{ background: "#064E3B", color: C.white, borderRadius: 36, padding: 40, boxShadow: `0 0 0 3px ${C.emerald}, 0 40px 80px rgba(0,0,0,0.4)` }}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 3, color: "#6EE7B7", textTransform: "uppercase" }}>Stronger version</div>
              <div style={{ fontSize: 40, fontWeight: 600, marginTop: 10, lineHeight: 1.3 }}>
                “I skipped the rollback plan. Since then, every release ships with one.”
              </div>
            </div>
          </Rise>
          <Rise delay={f(0.72)}>
            <div style={{ background: C.gold, color: C.canvasDeep, borderRadius: 36, padding: "30px 40px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", opacity: 0.75 }}>Interviewer would ask next</div>
              <div style={{ fontSize: 42, fontWeight: 800, marginTop: 8 }}>“What would you do differently?”</div>
            </div>
          </Rise>
        </div>
      </div>
    </SceneFrame>
  );
};

/* — Voice: the interviewer asks out loud */
export const Voice: React.FC<SceneProps> = ({ d }) => {
  const frame = useCurrentFrame();
  const toggle = interpolate(frame, [Math.round(d * 0.55), Math.round(d * 0.55) + 16], [0, 1], { ...clamp, easing: ease });
  const speaking = frame > 20 && frame < d * 0.55;
  return (
    <SceneFrame duration={d} caption="Your interviewer asks out loud. Prefer typing? Switch any time.">
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 90 }}>
        <Rise>
          <Card style={{ width: 1500 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <div style={{ width: 110, height: 110, borderRadius: 55, background: C.canvas, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Waveform bars={7} height={56} color={C.emerald} active={speaking} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 3, color: "#283C32", textTransform: "uppercase" }}>
                  {speaking ? "Interviewer is speaking…" : "Your turn"}
                </div>
                <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.15, marginTop: 8 }}>Why should we hire you over other candidates?</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 34, alignItems: "stretch" }}>
              <div style={{ flex: 1, borderRadius: 24, padding: 30, background: toggle < 0.5 ? C.canvas : C.sage200, color: toggle < 0.5 ? C.white : C.slate600, fontSize: 40, fontWeight: 700, textAlign: "center" }}>Voice answer</div>
              <div style={{ flex: 1, borderRadius: 24, padding: 30, background: toggle >= 0.5 ? C.canvas : C.sage200, color: toggle >= 0.5 ? C.white : C.slate600, fontSize: 40, fontWeight: 700, textAlign: "center" }}>Written answer</div>
            </div>
          </Card>
        </Rise>
      </div>
    </SceneFrame>
  );
};

/* — Debrief */
export const Debrief: React.FC<SceneProps> = ({ d }) => {
  const f = (x: number) => Math.round(d * x);
  const col = (title: string, color: string, items: string[], delay: number) => (
    <Rise delay={delay} style={{ flex: 1 }}>
      <div style={{ background: C.white, borderRadius: 28, padding: 34, height: "100%" }}>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 3, color, textTransform: "uppercase", marginBottom: 16 }}>{title}</div>
        {items.map((t) => (
          <div key={t} style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.3, marginBottom: 16 }}>{t}</div>
        ))}
      </div>
    </Rise>
  );
  return (
    <SceneFrame duration={d} caption="Patterns across every answer. Concrete drills, not generic tips.">
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 90 }}>
        <Rise>
          <Card style={{ width: 1640 }}>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 3, color: "#283C32", textTransform: "uppercase" }}>Session debrief</div>
            <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.15, margin: "14px 0 30px" }}>You answer well, but bury the decision at the end.</div>
            <div style={{ display: "flex", gap: 24 }}>
              {col("Recurring strengths", "#047857", ["Calm, structured openings", "Honest about mistakes"], f(0.25))}
              {col("Priority fixes", "#B45309", ["Lead with the decision (Q2, Q4)", "Cut “basically” and “like”"], f(0.42))}
              {col("Next steps", C.slate, ["Redo Q3 out loud in 90 seconds", "Open with what you decided"], f(0.6))}
            </div>
          </Card>
        </Rise>
      </div>
    </SceneFrame>
  );
};

/* — Progress */
const PTS = [4, 5, 6, 6, 8];
export const Progress: React.FC<SceneProps> = ({ d }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [20, d - 40], [0, 1], { ...clamp, easing: ease });
  const W = 1100, H = 420;
  const xy = PTS.map((v, i) => [70 + i * ((W - 140) / (PTS.length - 1)), H - 40 - ((v - 3) / 6) * (H - 100)]);
  const path = xy.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const len = 1500;
  return (
    <SceneFrame duration={d} caption="Every session saved. Watch your scores climb.">
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 90 }}>
        <Rise>
          <Card style={{ width: 1300 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 3, color: "#283C32", textTransform: "uppercase" }}>Your progress</div>
              <div style={{ fontSize: 44, fontWeight: 800, color: "#047857" }}>+{Math.round(4 * draw)} points</div>
            </div>
            <svg width={W} height={H} style={{ marginTop: 14 }}>
              <path d={path} fill="none" stroke={C.canvas} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
              {xy.map(([x, y], i) => (
                <g key={i} opacity={draw >= i / (PTS.length - 1) - 0.001 ? 1 : 0}>
                  <circle cx={x} cy={y} r={17} fill={C.gold} />
                  <text x={x} y={y - 30} textAnchor="middle" fontSize={38} fontWeight={800} fill={C.slate}>{PTS[i]}</text>
                  <text x={x} y={H - 6} textAnchor="middle" fontSize={26} fontWeight={600} fill={C.slate600}>Session {i + 1}</text>
                </g>
              ))}
            </svg>
          </Card>
        </Rise>
      </div>
    </SceneFrame>
  );
};

/* — Outro / CTA */
export const Outro: React.FC<SceneProps> = ({ d }) => {
  const dot = useSpring(30, 8);
  return (
    <SceneFrame duration={d}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
        <Rise><Logo size={130} /></Rise>
        <Rise delay={10}>
          <div style={{ fontSize: 120, fontWeight: 800, color: C.white, letterSpacing: -3 }}>
            Practice until it’s easy<span style={{ color: C.gold, display: "inline-block", transform: `scale(${0.2 + dot * 0.8})`, opacity: dot }}>.</span>
          </div>
        </Rise>
        <Rise delay={24}><div style={{ fontSize: 48, color: "#9bb5a5", fontWeight: 600 }}>Walk in ready.</div></Rise>
      </div>
    </SceneFrame>
  );
};
