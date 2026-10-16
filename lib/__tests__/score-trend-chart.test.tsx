import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ScoreTrendChart from "@/components/ScoreTrendChart";
import { buildTrendPoints } from "../progress-trend";

const points = buildTrendPoints([
  { id: "a", category: "Behavioral", averageScore: 4.5, questionCount: 5, createdAt: "2026-10-01T10:00:00Z" },
  { id: "b", category: "Behavioral", averageScore: 6, questionCount: 6, createdAt: "2026-10-05T10:00:00Z" },
  { id: "c", category: "Cultural Fit", averageScore: 7.5, questionCount: 4, createdAt: "2026-10-09T10:00:00Z" },
]);

describe("ScoreTrendChart", () => {
  it("describes the chart for assistive tech and exposes a table alternative", () => {
    render(<ScoreTrendChart points={points} />);
    expect(screen.getByLabelText(/Average score per session/).getAttribute("aria-label")).toMatch(/3 sessions, from 4\.5 to 7\.5/);
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(4); // header + 3 sessions
    expect(screen.getByText("Cultural Fit")).toBeTruthy();
  });

  it("shows a tooltip for the session chosen with the arrow keys", () => {
    render(<ScoreTrendChart points={points} />);
    const chart = screen.getByLabelText(/Average score per session/);
    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.keyDown(chart, { key: "End" });
    expect(screen.getByRole("status").textContent).toContain("7.5");
    fireEvent.keyDown(chart, { key: "ArrowLeft" });
    expect(screen.getByRole("status").textContent).toContain("6.0");
    fireEvent.keyDown(chart, { key: "Escape" });
    expect(screen.queryByRole("status")).toBeNull();
  });
});
