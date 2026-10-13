import { describe, it, expect } from "vitest";
import {
  createUser,
  getUserByEmail,
  verifyUserCredentials,
  saveUserInterviewSession,
  getUserSessions,
  calculateUserAnalytics,
} from "../db";
import type { SessionEntry } from "@/types";

describe("Database layer (Users & History)", () => {
  const testEmail = `test_${Date.now()}@example.com`;

  it("creates a new user and normalizes email", async () => {
    const user = await createUser({
      name: "Taylor Swift",
      email: testEmail.toUpperCase(),
      password: "securepassword123",
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe(testEmail.toLowerCase());
    expect(user.name).toBe("Taylor Swift");
  });

  it("prevents creating duplicate users with same email", async () => {
    await expect(
      createUser({
        name: "Duplicate User",
        email: testEmail,
        password: "password123",
      })
    ).rejects.toThrow("already exists");
  });

  it("verifies credentials correctly with bcrypt", async () => {
    const valid = await verifyUserCredentials(testEmail, "securepassword123");
    expect(valid).not.toBeNull();
    expect(valid?.email).toBe(testEmail.toLowerCase());

    const invalid = await verifyUserCredentials(testEmail, "wrongpassword");
    expect(invalid).toBeNull();
  });

  it("finds user by email case-insensitively", async () => {
    const found = await getUserByEmail(testEmail.toUpperCase());
    expect(found).not.toBeNull();
    expect(found?.email).toBe(testEmail.toLowerCase());
  });

  it("saves interview session and computes user analytics", async () => {
    const mockEntry: SessionEntry = {
      question: {
        id: "mock_1",
        category: "Behavioral",
        text: "Explain database indexing.",
      },
      answer: "B-trees provide logarithmic lookup time.",
      feedback: {
        score: 9,
        strengths: ["Clear technical depth"],
        areasForImprovement: ["Add composite index example"],
        summary: "Excellent answer.",
      },
    };

    const session = await saveUserInterviewSession({
      userId: "usr_test_123",
      userEmail: testEmail,
      category: "Behavioral",
      mode: "typed",
      averageScore: 9,
      entries: [mockEntry],
    });

    expect(session.id).toBeDefined();
    expect(session.averageScore).toBe(9);

    const userSessions = await getUserSessions(testEmail);
    expect(userSessions.length).toBeGreaterThanOrEqual(1);

    const analytics = await calculateUserAnalytics(testEmail);
    expect(analytics.totalSessions).toBeGreaterThanOrEqual(1);
    expect(analytics.averageScore).toBeGreaterThanOrEqual(9);
    expect(analytics.completedCategories).toContain("Behavioral");
    expect(analytics.topStrengths).toContain("Clear technical depth");
  });
});
