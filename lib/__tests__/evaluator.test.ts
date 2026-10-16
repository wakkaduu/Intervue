import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReviewRequest } from "@/types";
import { CATEGORIES } from "../questions";

vi.mock("../gemini", async (orig) => ({
  ...(await orig<typeof import("../gemini")>()),
  requestGemini: vi.fn(),
}));
vi.mock("../groq-llm", () => ({ requestGroq: vi.fn() }));

import { evaluateAnswer } from "../evaluator";
import { requestGemini } from "../gemini";
import { requestGroq } from "../groq-llm";

const request: ReviewRequest = {
  category: CATEGORIES[0],
  question: "Tell me about a time you led a project.",
  answer: "I led a migration and reduced latency by 30 percent.",
};
const fb = { score: 7, strengths: ["a"], areasForImprovement: ["b"], summary: "ok" };

describe("evaluateAnswer provider chain", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
  });

  it("uses Gemini first and marks the result as ai", async () => {
    vi.mocked(requestGemini).mockResolvedValue(fb);
    const r = await evaluateAnswer(request, { geminiKey: "g", groqKey: "q" });
    expect(r.source).toBe("ai");
    expect(requestGroq).not.toHaveBeenCalled();
  });

  it("falls back to Groq when Gemini fails", async () => {
    vi.mocked(requestGemini).mockRejectedValue(new Error("quota"));
    vi.mocked(requestGroq).mockResolvedValue({ ...fb, score: 5 });
    const r = await evaluateAnswer(request, { geminiKey: "g", groqKey: "q" });
    expect(r.score).toBe(5);
    expect(r.source).toBe("ai");
  });

  it("uses the built-in grader, marked basic, when no provider works", async () => {
    vi.mocked(requestGemini).mockRejectedValue(new Error("down"));
    vi.mocked(requestGroq).mockRejectedValue(new Error("down"));
    const r = await evaluateAnswer(request, { geminiKey: "g", groqKey: "q" });
    expect(r.source).toBe("basic");
  });

  it("goes straight to the built-in grader with no keys", async () => {
    const r = await evaluateAnswer(request);
    expect(r.source).toBe("basic");
    expect(requestGemini).not.toHaveBeenCalled();
  });
});
