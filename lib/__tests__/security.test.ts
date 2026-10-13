import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  sanitizeName,
} from "../security/validation";
import {
  checkRateLimit,
} from "../security/rate-limiter";
import { maskEmail } from "../security/logger";

describe("Security Validation & Sanitization", () => {
  describe("validateEmail", () => {
    it("accepts valid RFC 5322 emails", () => {
      const res = validateEmail("Candidate.Pro@company.co.uk");
      expect(res.valid).toBe(true);
      expect(res.normalized).toBe("candidate.pro@company.co.uk");
    });

    it("rejects invalid emails without proper domain", () => {
      expect(validateEmail("not-an-email").valid).toBe(false);
      expect(validateEmail("user@").valid).toBe(false);
      expect(validateEmail("@domain.com").valid).toBe(false);
      expect(validateEmail("").valid).toBe(false);
    });

    it("rejects emails exceeding RFC 5321 length (254 characters)", () => {
      const longEmail = "a".repeat(250) + "@domain.com";
      const res = validateEmail(longEmail);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("cannot exceed 254 characters");
    });
  });

  describe("validatePassword", () => {
    it("accepts strong passwords meeting NIST/OWASP criteria", () => {
      expect(validatePassword("SecurePass123!").valid).toBe(true);
      expect(validatePassword("intervue2026").valid).toBe(true);
    });

    it("rejects passwords under 8 characters", () => {
      const res = validatePassword("short1");
      expect(res.valid).toBe(false);
      expect(res.error).toContain("at least 8 characters");
    });

    it("rejects passwords exceeding 128 characters to prevent bcrypt DoS", () => {
      const hugePass = "A1!" + "x".repeat(150);
      const res = validatePassword(hugePass);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("cannot exceed 128 characters");
    });

    it("rejects passwords missing numbers or letters", () => {
      expect(validatePassword("onlyletters").valid).toBe(false);
      expect(validatePassword("1234567890").valid).toBe(false);
    });
  });

  describe("sanitizeName", () => {
    it("strips HTML tags to prevent stored XSS", () => {
      const res = sanitizeName("<script>alert(1)</script>Alex Rivera");
      expect(res.valid).toBe(true);
      expect(res.sanitized).toBe("alert(1)Alex Rivera");
      expect(res.sanitized).not.toContain("<script>");
    });

    it("trims control characters", () => {
      const res = sanitizeName("Alex\x00\x1F Rivera");
      expect(res.valid).toBe(true);
      expect(res.sanitized).toBe("Alex Rivera");
    });

    it("enforces maximum name length", () => {
      const longName = "A".repeat(100);
      const res = sanitizeName(longName);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("cannot exceed 80 characters");
    });
  });
});

describe("Security Rate Limiting & Protection", () => {
  it("enforces rate limits and computes retry-after seconds", () => {
    const testStore = new Map();
    const testKey = "user_attacker_1";

    // 3 allowed
    expect(checkRateLimit(testStore, testKey, 3, 60000).allowed).toBe(true);
    expect(checkRateLimit(testStore, testKey, 3, 60000).allowed).toBe(true);
    expect(checkRateLimit(testStore, testKey, 3, 60000).allowed).toBe(true);

    // 4th blocked
    const blocked = checkRateLimit(testStore, testKey, 3, 60000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("masks email in audit logger", () => {
    expect(maskEmail("alex@intervue.io")).toBe("a***x@intervue.io");
    expect(maskEmail("me@test.com")).toBe("m*@test.com");
    expect(maskEmail("")).toBe("anonymous");
  });
});
