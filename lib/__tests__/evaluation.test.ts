import { describe, it, expect } from "vitest";
import { evaluateAnswerFallback } from "../gemini";
import { validateFeedback } from "../validation";
import type { ReviewRequest } from "@/types";

describe("evaluateAnswerFallback (Bar-Raiser Strict Evaluation)", () => {
  it("strictly grades an extremely brief response (<= 25 words) as Strong No Hire", () => {
    const request: ReviewRequest = {
      category: "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
      question: "Explain database indexing and how it improves query performance.",
      answer: "I worked with databases before and used indexes.",
    };

    const feedback = evaluateAnswerFallback(request);
    expect(feedback.score).toBeLessThanOrEqual(3);
    expect(feedback.summary.toLowerCase()).toContain("no hire");
    expect(feedback.howTheyAnswered?.toLowerCase()).toContain("lacking depth");
    expect(feedback.areasForImprovement).toContain(
      "Missing quantifiable impact: quantify results with percentages, dollar values, latency, or specific KPIs."
    );
    expect(() => validateFeedback(feedback)).not.toThrow();
  });

  it("penalizes hedging language and ambiguous 'we' ownership", () => {
    const request: ReviewRequest = {
      category: "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
      question: "Describe a time you resolved a major production outage.",
      answer:
        "Well, we had a server issue and I guess we sort of restarted the service, and maybe our team fixed it.",
    };

    const feedback = evaluateAnswerFallback(request);
    expect(feedback.score).toBeLessThanOrEqual(4);
    expect(feedback.toneAnalysis?.toLowerCase()).toMatch(/(hedging|ambiguous ownership|hesitant)/);
    expect(feedback.areasForImprovement.some((a) => a.includes("hedging") || a.includes("ownership"))).toBe(true);
    expect(() => validateFeedback(feedback)).not.toThrow();
  });

  it("penalizes responses that deflect away from the prompt topic", () => {
    const request: ReviewRequest = {
      category: "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)",
      question: "Walk me through how a $10 increase in depreciation flows through the three financial statements.",
      answer:
        "I really like financial markets and follow stocks on Twitter every day. Wall Street has always been my dream since childhood.",
    };

    const feedback = evaluateAnswerFallback(request);
    expect(feedback.score).toBeLessThanOrEqual(3);
    expect(feedback.questionConnection?.toLowerCase()).toContain("fails to answer");
    expect(() => validateFeedback(feedback)).not.toThrow();
  });

  it("rewards a disciplined STAR response with verified metrics and assertive ownership", () => {
    const request: ReviewRequest = {
      category: "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
      question: "Tell me about a time you optimized a slow database query in production.",
      answer:
        "In my previous role as lead backend engineer, the situation was that our checkout query was timing out during peak traffic. The task was to reduce latency under 200ms within two days. The action I decided was to run EXPLAIN ANALYZE, discovering a missing compound B-tree index on user_id and created_at. I implemented composite indexing and connection pooling. The result was a 75% reduction in query latency, dropping from 850ms to 110ms, handling 15,000 requests per minute with zero downtime.",
    };

    const feedback = evaluateAnswerFallback(request);
    expect(feedback.score).toBeGreaterThanOrEqual(8);
    expect(feedback.summary.toLowerCase()).toContain("strong hire");
    expect(feedback.strengths.some((s) => s.toLowerCase().includes("quantifiable metrics"))).toBe(true);
    expect(feedback.toneAnalysis?.toLowerCase()).toContain("assertive");
    expect(() => validateFeedback(feedback)).not.toThrow();
  });

  it("limits scores to maximum 7 if quantifiable metrics are missing", () => {
    const request: ReviewRequest = {
      category: "Behavioral",
      question: "Tell me about a time you resolved a conflict with a teammate.",
      answer:
        "The situation was that my teammate and I disagreed on the API schema design. The task was to align before the sprint deadline. The action I took was scheduling a 30-minute whiteboard session where I walked through both options objectively and adopted their recommendation for caching while keeping my approach for error handling. The result was that we delivered the project on time and maintained a productive working relationship.",
    };

    const feedback = evaluateAnswerFallback(request);
    // Well structured STAR without numbers/metrics
    expect(feedback.score).toBeLessThanOrEqual(7);
    expect(feedback.areasForImprovement).toContain(
      "Missing quantifiable impact: quantify results with percentages, dollar values, latency, or specific KPIs."
    );
    expect(() => validateFeedback(feedback)).not.toThrow();
  });

  it("ensures summary does not exceed 100 words", () => {
    const request: ReviewRequest = {
      category: "Behavioral",
      question: "Describe your leadership style.",
      answer: "I try to lead by example and support my colleagues whenever possible.",
    };

    const feedback = evaluateAnswerFallback(request);
    const words = feedback.summary.trim().split(/\s+/).length;
    expect(words).toBeLessThanOrEqual(95);
  });
});
