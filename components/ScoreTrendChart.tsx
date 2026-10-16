"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TrendPoint } from "@/lib/progress-trend";
import { shortCategory } from "@/lib/progress-trend";

// Chart colors. The card is always the light sage surface (#E2ECE5) in both app
// themes, so these are fixed. Series/threshold hues were checked with the dataviz
// validator for contrast and lightness/chroma on this surface.
const SURFACE = "#E2ECE5";
const SERIES = "#1F7A4D";
const THRESHOLD = "#9E6600";
const GRID = "#CFDFD4";
const AXIS = "#B8CEBF";
const CROSSHAIR = "#7A9E8A";
const INK = "#1F2933";
const INK_MUTED = "#52606D";

const HIRE_READY = 8;
const MARGIN = { top: 14, right: 44, bottom: 30, left: 30 };
const HEIGHT = 220;
const TICKS = [0, 2, 4, 6, 8, 10];

function formatDate(iso: string, withYear = false): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

interface ScoreTrendChartProps {
  points: TrendPoint[];
}

/**
 * ScoreTrendChart — average score per practice session, oldest to newest.
 * One series, so no legend; the section title names what is plotted.
 * Hover/touch snaps a crosshair to the nearest session; arrow keys do the same.
 * A table alternative is always available below the chart.
 */
export default function ScoreTrendChart({ points }: ScoreTrendChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWidth(Math.max(260, Math.floor(el.clientWidth)) || 640);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0]?.contentRect.width ?? 0);
      if (w > 0) setWidth(Math.max(260, w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = points.length;
  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;

  const xs = useMemo(
    () => points.map((_, i) => MARGIN.left + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW)),
    [points, n, plotW]
  );
  const yOf = (v: number) => MARGIN.top + plotH * (1 - v / 10);
  const ys = points.map((p) => yOf(p.score));

  const linePath = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${xs[n - 1].toFixed(1)},${yOf(0)} L${xs[0].toFixed(1)},${yOf(0)} Z`;

  const nearestIndex = (clientX: number): number => {
    const rect = wrapRef.current?.getBoundingClientRect();
    const x = clientX - (rect?.left ?? 0);
    let best = 0;
    for (let i = 1; i < n; i++) {
      if (Math.abs(xs[i] - x) < Math.abs(xs[best] - x)) best = i;
    }
    return best;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") setActive((a) => Math.min(n - 1, (a ?? -1) + 1));
    else if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? n) - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(n - 1);
    else if (e.key === "Escape") setActive(null);
    else return;
    e.preventDefault();
  };

  const activePoint = active !== null ? points[active] : null;
  const tooltipLeft =
    active !== null ? Math.min(Math.max(xs[active] - 80, 4), Math.max(4, width - 164)) : 0;

  const summary = `Average score per session across ${n} sessions, from ${points[0].score.toFixed(1)} to ${points[n - 1].score.toFixed(1)} out of 10.`;
  const xLabelIdx = n <= 1 ? [0] : n <= 4 ? points.map((_, i) => i) : [0, Math.floor((n - 1) / 2), n - 1];

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative w-full touch-pan-y select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
        tabIndex={0}
        role="group"
        aria-label={`${summary} Use the left and right arrow keys to inspect each session.`}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
        onPointerMove={(e) => setActive(nearestIndex(e.clientX))}
        onPointerDown={(e) => setActive(nearestIndex(e.clientX))}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setActive(null);
        }}
      >
        <svg width={width} height={HEIGHT} role="presentation" aria-hidden="true" className="block">
          {/* gridlines + y ticks: hairline, solid, recessive */}
          {TICKS.map((t) => (
            <g key={t}>
              <line
                x1={MARGIN.left}
                x2={width - MARGIN.right}
                y1={yOf(t)}
                y2={yOf(t)}
                stroke={t === 0 ? AXIS : GRID}
                strokeWidth={1}
              />
              <text x={MARGIN.left - 8} y={yOf(t) + 4} textAnchor="end" fontSize={11} fill={INK_MUTED}>
                {t}
              </text>
            </g>
          ))}

          {/* hire-ready reference line */}
          <line
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={yOf(HIRE_READY)}
            y2={yOf(HIRE_READY)}
            stroke={THRESHOLD}
            strokeWidth={1}
          />
          <text x={MARGIN.left + 4} y={yOf(HIRE_READY) - 5} fontSize={11} fill={INK_MUTED}>
            Interview-ready (8+)
          </text>

          {/* x labels: dates, first / middle / last */}
          {xLabelIdx.map((i) => (
            <text
              key={i}
              x={xs[i]}
              y={HEIGHT - 8}
              textAnchor={i === 0 && n > 1 ? "start" : i === n - 1 && n > 1 ? "end" : "middle"}
              fontSize={11}
              fill={INK_MUTED}
            >
              {formatDate(points[i].date)}
            </text>
          ))}

          {n > 1 && (
            <>
              <path d={areaPath} fill={SERIES} fillOpacity={0.1} />
              <path d={linePath} fill="none" stroke={SERIES} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}

          {/* crosshair */}
          {active !== null && (
            <line x1={xs[active]} x2={xs[active]} y1={MARGIN.top} y2={yOf(0)} stroke={CROSSHAIR} strokeWidth={1} />
          )}

          {/* markers with a 2px surface ring */}
          {points.map((p, i) => {
            const isLatest = i === n - 1;
            const isActive = i === active;
            const r = (isLatest || isActive ? 6.5 : 5);
            return <circle key={p.id} cx={xs[i]} cy={ys[i]} r={r} fill={SERIES} stroke={SURFACE} strokeWidth={2} />;
          })}

          {/* direct label: latest score only */}
          <text x={xs[n - 1] + 12} y={ys[n - 1] + 4} fontSize={13} fontWeight={700} fill={INK}>
            {points[n - 1].score.toFixed(1)}
          </text>
        </svg>

        {activePoint && (
          <div
            role="status"
            className="pointer-events-none absolute z-10 w-40 rounded-lg border border-sage-300 bg-white px-3 py-2 shadow-md"
            style={{ left: tooltipLeft, top: 0 }}
          >
            <p className="text-xl font-extrabold leading-none text-darkslate-900">
              {activePoint.score.toFixed(1)}
              <span className="text-xs font-semibold text-darkslate-500"> / 10</span>
            </p>
            <p className="mt-1 text-xs font-semibold text-darkslate-700">{formatDate(activePoint.date, true)}</p>
            <p className="text-[11px] leading-snug text-darkslate-600">{shortCategory(activePoint.category)}</p>
            <p className="text-[11px] text-darkslate-500">
              {activePoint.questionCount} {activePoint.questionCount === 1 ? "question" : "questions"}
            </p>
          </div>
        )}
      </div>

      <details className="mt-3 text-xs text-darkslate-700">
        <summary className="inline-flex min-h-[44px] cursor-pointer items-center font-bold text-forest-800 underline underline-offset-2">
          View as table
        </summary>
        <div className="mt-2 overflow-x-auto rounded-lg border border-sage-300 bg-[#F0F5F1]">
          <table className="w-full min-w-[420px] text-left">
            <caption className="sr-only">Average score for each practice session, oldest first</caption>
            <thead>
              <tr className="border-b border-sage-300 text-darkslate-600">
                <th scope="col" className="px-3 py-2 font-bold">Date</th>
                <th scope="col" className="px-3 py-2 font-bold">Track</th>
                <th scope="col" className="px-3 py-2 text-right font-bold">Questions</th>
                <th scope="col" className="px-3 py-2 text-right font-bold">Average score</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.id} className="border-b border-sage-200 last:border-0">
                  <td className="px-3 py-2">{formatDate(p.date, true)}</td>
                  <td className="px-3 py-2">{shortCategory(p.category)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.questionCount}</td>
                  <td className="px-3 py-2 text-right font-bold tabular-nums">{p.score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
