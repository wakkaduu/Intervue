import { describe, it, expect } from "vitest";
import {
  generateConfirmationCode,
  hashConfirmationCode,
  verifyConfirmationCodeHash,
  CONFIRMATION_CODE_TTL_MS,
} from "../security/confirmation";
import {
  checkConfirmationVerifyRateLimit,
  checkConfirmationResendRateLimit,
} from "../security/rate-limiter";
import {
  createUser,
  verifyConfirmationCode,
  getUserByEmail,
} from "../db";

describe("Email Confirmation Security & Cryptography", () => {
  describe("generateConfirmationCode", () => {
    it("generates a 6-digit numeric string", () => {
      for (let i = 0; i < 20; i++) {
        const code = generateConfirmationCode();
        expect(code).toMatch(/^\d{6}$/);
        const num = parseInt(code, 10);
        expect(num).toBeGreaterThanOrEqual(100000);
        expect(num).toBeLessThanOrEqual(999999);
      }
    });

    it("generates distinct codes across calls (cryptographic entropy)", () => {
      const codes = new Set();
      for (let i = 0; i < 50; i++) {
        codes.add(generateConfirmationCode());
      }
      expect(codes.size).toBeGreaterThan(45);
    });
  });

  describe("hashConfirmationCode and verifyConfirmationCodeHash", () => {
    it("correctly verifies matching confirmation code against SHA-256 hash", () => {
      const code = "543210";
      const hash = hashConfirmationCode(code);
      expect(hash).toHaveLength(64); // SHA-256 hex length
      expect(verifyConfirmationCodeHash(code, hash)).toBe(true);
    });

    it("rejects non-matching confirmation codes", () => {
      const code = "123456";
      const hash = hashConfirmationCode(code);
      expect(verifyConfirmationCodeHash("654321", hash)).toBe(false);
      expect(verifyConfirmationCodeHash("123457", hash)).toBe(false);
    });

    it("rejects malformed candidate codes without crashing", () => {
      const hash = hashConfirmationCode("123456");
      expect(verifyConfirmationCodeHash("", hash)).toBe(false);
      expect(verifyConfirmationCodeHash("abc", hash)).toBe(false);
      expect(verifyConfirmationCodeHash("12345", hash)).toBe(false);
      expect(verifyConfirmationCodeHash("1234567", hash)).toBe(false);
      expect(verifyConfirmationCodeHash("      ", hash)).toBe(false);
    });
  });

  describe("Rate Limiting for Email Confirmation", () => {
    it("enforces cooldown on confirmation code resends (1 per 60s)", () => {
      const testEmail = `resend_${Date.now()}@example.com`;
      const ip = `192.168.1.${Math.floor(Math.random() * 200)}`;

      const first = checkConfirmationResendRateLimit(ip, testEmail);
      expect(first.allowed).toBe(true);

      const second = checkConfirmationResendRateLimit(ip, testEmail);
      expect(second.allowed).toBe(false);
      expect(second.retryAfterSeconds).toBeGreaterThan(0);
      expect(second.retryAfterSeconds).toBeLessThanOrEqual(60);
    });

    it("enforces max attempt limit for code verification", () => {
      const testEmail = `verify_limit_${Date.now()}@example.com`;
      const ip = `10.0.0.${Math.floor(Math.random() * 200)}`;

      for (let i = 0; i < 10; i++) {
        const res = checkConfirmationVerifyRateLimit(ip, testEmail);
        expect(res.allowed).toBe(true);
      }

      const blocked = checkConfirmationVerifyRateLimit(ip, testEmail);
      expect(blocked.allowed).toBe(false);
    });
  });

  describe("End-to-End User Confirmation Lifecycle in db.ts", () => {
    const email = `confirm_test_${Date.now()}@example.com`;
    const code = "889900";
    const codeHash = hashConfirmationCode(code);
    const futureExpiry = new Date(Date.now() + CONFIRMATION_CODE_TTL_MS).toISOString();

    it("creates an unverified user with confirmation code", async () => {
      const user = await createUser({
        name: "Security Candidate",
        email,
        password: "securepassword123",
        emailVerified: false,
        confirmationCodeHash: codeHash,
        confirmationCodeExpires: futureExpiry,
      });

      expect(user.emailVerified).toBe(false);
      expect(user.confirmationCodeHash).toBe(codeHash);

      const fetched = await getUserByEmail(email);
      expect(fetched?.emailVerified).toBe(false);
    });

    it("rejects incorrect code and decrements remaining attempts", async () => {
      const res = await verifyConfirmationCode(email, "111111");
      expect(res.success).toBe(false);
      expect(res.error).toContain("remaining");

      const user = await getUserByEmail(email);
      expect(user?.confirmationAttempts).toBe(1);
      expect(user?.emailVerified).toBe(false);
    });

    it("successfully confirms account when correct 6-digit code is provided", async () => {
      const res = await verifyConfirmationCode(email, code);
      expect(res.success).toBe(true);

      const user = await getUserByEmail(email);
      expect(user?.emailVerified).toBe(true);
      expect(user?.confirmationCodeHash).toBeUndefined();
    });

    it("handles already-verified users gracefully without error", async () => {
      const res = await verifyConfirmationCode(email, code);
      expect(res.success).toBe(true);
      expect(res.alreadyVerified).toBe(true);
    });

    it("rejects expired confirmation codes", async () => {
      const expiredEmail = `expired_${Date.now()}@example.com`;
      const pastExpiry = new Date(Date.now() - 1000).toISOString();
      const testCode = "445566";

      await createUser({
        name: "Expired Candidate",
        email: expiredEmail,
        password: "securepassword123",
        emailVerified: false,
        confirmationCodeHash: hashConfirmationCode(testCode),
        confirmationCodeExpires: pastExpiry,
      });

      const res = await verifyConfirmationCode(expiredEmail, testCode);
      expect(res.success).toBe(false);
      expect(res.error).toContain("expired");
    });
  });
});
