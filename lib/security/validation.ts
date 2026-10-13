/**
 * Strict security input validation and sanitization utilities.
 * Follows OWASP and NIST guidelines for authentication parameters.
 */

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates and canonicalizes an email address.
 * Enforces RFC 5321 length limits and RFC 5322 syntax.
 */
export function validateEmail(email: unknown): { valid: boolean; normalized?: string; error?: string } {
  if (typeof email !== "string" || !email.trim()) {
    return { valid: false, error: "Email address is required." };
  }

  const trimmed = email.trim();

  if (trimmed.length > 254) {
    return { valid: false, error: "Email address cannot exceed 254 characters." };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: "Please enter a valid email address." };
  }

  return { valid: true, normalized: trimmed.toLowerCase() };
}

/**
 * Validates password strength and enforces upper/lower bounds.
 *
 * Rules:
 * 1. Minimum 8 characters (NIST standard).
 * 2. Maximum 128 characters (Prevents bcrypt quadratic DoS / CPU exhaustion attack).
 * 3. Must contain at least one letter and at least one number or special character.
 */
export function validatePassword(password: unknown): ValidationResult {
  if (typeof password !== "string" || !password) {
    return { valid: false, error: "Password is required." };
  }

  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long." };
  }

  if (password.length > 128) {
    return { valid: false, error: "Password cannot exceed 128 characters." };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);

  if (!hasLetter || !hasNumberOrSymbol) {
    return {
      valid: false,
      error: "Password must contain both letters and numbers or symbols.",
    };
  }

  return { valid: true };
}

/**
 * Sanitizes and validates user display name.
 * Strips HTML tags, trims control characters, and enforces length constraints.
 */
export function sanitizeName(name: unknown): { valid: boolean; sanitized?: string; error?: string } {
  if (typeof name !== "string" || !name.trim()) {
    return { valid: false, error: "Name is required." };
  }

  const stripped = name
    .replace(/<[^>]*>?/gm, "") // Strip HTML tags
    .replace(/[\x00-\x1F\x7F]/g, "") // Strip control characters
    .trim();

  if (stripped.length === 0) {
    return { valid: false, error: "Please provide a valid name." };
  }

  if (stripped.length > 80) {
    return { valid: false, error: "Name cannot exceed 80 characters." };
  }

  return { valid: true, sanitized: stripped };
}
