/**
 * In-memory sliding-window rate limiter for authentication endpoints.
 * Defends against brute-force attacks, credential stuffing, and DoS.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory buckets for rate limiting
const ipBuckets = new Map<string, RateLimitRecord>();
const emailBuckets = new Map<string, RateLimitRecord>();

// Cleanup interval to avoid memory leaks (runs every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipBuckets.entries()) {
      if (now > record.resetAt) ipBuckets.delete(key);
    }
    for (const [key, record] of emailBuckets.entries()) {
      if (now > record.resetAt) emailBuckets.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Checks and records an attempt against a sliding window rate limit.
 *
 * @param key Unique identifier (IP address, email, etc.)
 * @param maxAttempts Maximum attempts permitted within the window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  store: Map<string, RateLimitRecord>,
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const normalizedKey = key.trim().toLowerCase();
  const existing = store.get(normalizedKey);

  if (!existing || now > existing.resetAt) {
    store.set(normalizedKey, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= maxAttempts) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxAttempts - existing.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Resets the rate limit counter for a key upon successful authentication.
 */
export function resetRateLimit(store: Map<string, RateLimitRecord>, key: string): void {
  store.delete(key.trim().toLowerCase());
}

/**
 * Rate limit check for login attempts (Max 5 attempts per 15 minutes per IP or email).
 */
export function checkLoginRateLimit(ip: string, email?: string): RateLimitResult {
  // Check IP limit
  const ipCheck = checkRateLimit(ipBuckets, `ip_${ip}`, 5, 15 * 60 * 1000);
  if (!ipCheck.allowed) return ipCheck;

  // Check email limit if provided
  if (email) {
    const emailCheck = checkRateLimit(emailBuckets, `email_${email}`, 5, 15 * 60 * 1000);
    if (!emailCheck.allowed) return emailCheck;
  }

  return ipCheck;
}

/**
 * Reset login failures after successful login.
 */
export function recordLoginSuccess(ip: string, email: string): void {
  resetRateLimit(ipBuckets, `ip_${ip}`);
  resetRateLimit(emailBuckets, `email_${email}`);
}

/**
 * Rate limit check for account registration (Max 3 registrations per 10 minutes per IP).
 */
export function checkRegisterRateLimit(ip: string): RateLimitResult {
  return checkRateLimit(ipBuckets, `reg_${ip}`, 3, 10 * 60 * 1000);
}

/**
 * Rate limit check for confirmation verification (Max 10 attempts per 15 minutes per IP or email).
 */
export function checkConfirmationVerifyRateLimit(ip: string, email: string): RateLimitResult {
  const ipCheck = checkRateLimit(ipBuckets, `verify_${ip}`, 10, 15 * 60 * 1000);
  if (!ipCheck.allowed) return ipCheck;

  return checkRateLimit(emailBuckets, `verify_${email.toLowerCase().trim()}`, 10, 15 * 60 * 1000);
}

/**
 * Rate limit check for confirmation code resends (Max 1 request per 60 seconds per email or IP).
 */
export function checkConfirmationResendRateLimit(ip: string, email: string): RateLimitResult {
  const ipCheck = checkRateLimit(ipBuckets, `resend_${ip}`, 1, 60 * 1000);
  if (!ipCheck.allowed) return ipCheck;

  return checkRateLimit(emailBuckets, `resend_${email.toLowerCase().trim()}`, 1, 60 * 1000);
}

