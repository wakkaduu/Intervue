import crypto from "crypto";

/**
 * Expiration duration for email confirmation codes: 15 minutes.
 */
export const CONFIRMATION_CODE_TTL_MS = 15 * 60 * 1000;

/**
 * Maximum failed attempts allowed before a confirmation code is invalidated.
 */
export const MAX_CONFIRMATION_ATTEMPTS = 5;

/**
 * Minimum cooldown period between confirmation code resends: 60 seconds.
 */
export const RESEND_COOLDOWN_MS = 60 * 1000;

/**
 * Generates a cryptographically secure 6-digit numeric confirmation code.
 * Range: 100000 - 999999
 */
export function generateConfirmationCode(): string {
  // crypto.randomInt is cryptographically strong
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hashes a confirmation code using SHA-256 for secure storage.
 * Plaintext confirmation codes are never persisted to the database.
 */
export function hashConfirmationCode(code: string): string {
  return crypto.createHash("sha256").update(code.trim()).digest("hex");
}

/**
 * Verifies a candidate confirmation code against a stored SHA-256 hash
 * using constant-time comparison to protect against timing attacks.
 */
export function verifyConfirmationCodeHash(
  candidateCode: string,
  storedHash: string
): boolean {
  if (!candidateCode || !storedHash) return false;

  const trimmed = candidateCode.trim();
  // Valid codes are 6 numeric digits
  if (!/^\d{6}$/.test(trimmed)) return false;

  const candidateHash = hashConfirmationCode(trimmed);
  const candidateBuf = Buffer.from(candidateHash, "hex");
  const storedBuf = Buffer.from(storedHash, "hex");

  if (candidateBuf.length !== storedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidateBuf, storedBuf);
}
