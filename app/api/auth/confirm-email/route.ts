import { NextResponse } from "next/server";
import { verifyConfirmationCode } from "@/lib/db";
import { checkConfirmationVerifyRateLimit } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/logger";
import { validateEmail } from "@/lib/security/validation";

export async function POST(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip")) || "127.0.0.1";

  try {
    const body = await req.json();
    const { email, code } = body;

    const emailResult = validateEmail(email);
    if (!emailResult.valid || !emailResult.normalized) {
      return NextResponse.json(
        { error: emailResult.error || "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!code || typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
      return NextResponse.json(
        { error: "Confirmation code must be 6 numeric digits." },
        { status: 400 }
      );
    }

    // Rate limiting: max 10 verification attempts per 15 minutes
    const rateLimit = checkConfirmationVerifyRateLimit(ip, emailResult.normalized);
    if (!rateLimit.allowed) {
      logSecurityEvent({
        event: "AUTH_RATE_LIMITED",
        email: emailResult.normalized,
        ip,
        details: "Confirmation verification rate limit exceeded",
      });

      return NextResponse.json(
        {
          error: `Too many verification attempts. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const result = await verifyConfirmationCode(
      emailResult.normalized,
      code.trim()
    );

    if (!result.success) {
      logSecurityEvent({
        event: "EMAIL_CONFIRMATION_FAILED",
        email: emailResult.normalized,
        ip,
        details: result.error,
      });

      return NextResponse.json(
        { error: result.error || "Failed to confirm email." },
        { status: 400 }
      );
    }

    logSecurityEvent({
      event: "EMAIL_CONFIRMATION_SUCCESS",
      email: emailResult.normalized,
      ip,
      details: result.alreadyVerified ? "Email was already verified" : "Email confirmed successfully",
    });

    return NextResponse.json({
      success: true,
      message: result.alreadyVerified
        ? "Email is already verified."
        : "Email successfully confirmed! Your account is now verified.",
      emailVerified: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to verify confirmation code.";
    logSecurityEvent({
      event: "EMAIL_CONFIRMATION_FAILED",
      ip,
      details: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
