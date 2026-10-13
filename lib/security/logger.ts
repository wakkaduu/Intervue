/**
 * Security Audit Logger for authentication and sensitive operations.
 * Excludes sensitive credentials (passwords, tokens, API keys) from all logs.
 */

export type SecurityEventType =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_RATE_LIMITED"
  | "AUTH_REGISTER_SUCCESS"
  | "AUTH_REGISTER_FAILED"
  | "AUTH_LOCKOUT_TRIGGERED"
  | "EMAIL_CONFIRMATION_SENT"
  | "EMAIL_CONFIRMATION_SUCCESS"
  | "EMAIL_CONFIRMATION_FAILED"
  | "EMAIL_CONFIRMATION_RESENT";

export interface SecurityEventPayload {
  event: SecurityEventType;
  email?: string;
  ip?: string;
  userAgent?: string;
  details?: string;
}

/**
 * Masks email address for privacy in audit logs (e.g. j***e@example.com).
 */
export function maskEmail(email?: string): string {
  if (!email || !email.includes("@")) return "anonymous";
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Logs a security event with structured metadata.
 */
export function logSecurityEvent(payload: SecurityEventPayload): void {
  const timestamp = new Date().toISOString();
  const masked = maskEmail(payload.email);
  const ip = payload.ip || "unknown";

  const entry = {
    timestamp,
    event: payload.event,
    target: masked,
    ip,
    details: payload.details || undefined,
  };

  // Structured security log
  if (process.env.NODE_ENV !== "test") {
    if (payload.event.includes("FAILED") || payload.event.includes("LIMITED")) {
      console.warn(`[SECURITY_AUDIT] ${JSON.stringify(entry)}`);
    } else {
      console.info(`[SECURITY_AUDIT] ${JSON.stringify(entry)}`);
    }
  }
}
