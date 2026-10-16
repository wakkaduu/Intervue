import { NextResponse } from "next/server";
import { getUserByEmail, setConfirmationCode } from "@/lib/db";
import { checkConfirmationResendRateLimit } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/logger";
import { validateEmail } from "@/lib/security/validation";
import {
  generateConfirmationCode,
  hashConfirmationCode,
  CONFIRMATION_CODE_TTL_MS,
} from "@/lib/security/confirmation";
import { sendConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip")) || "127.0.0.1";

  try {
    const body = await req.json();
    const { email } = body;

    const emailResult = validateEmail(email);
    if (!emailResult.valid || !emailResult.normalized) {
      return NextResponse.json(
        { error: emailResult.error || "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Rate limiting: 1 resend per 60 seconds
    const rateLimit = checkConfirmationResendRateLimit(ip, emailResult.normalized);
    if (!rateLimit.allowed) {
      logSecurityEvent({
        event: "AUTH_RATE_LIMITED",
        email: emailResult.normalized,
        ip,
        details: "Confirmation resend rate limit cooldown active",
      });

      return NextResponse.json(
        {
          error: `Please wait ${rateLimit.retryAfterSeconds} seconds before requesting a new code.`,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const user = await getUserByEmail(emailResult.normalized);
    if (!user) {
      // Return 200 to avoid email enumeration while not doing work
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a confirmation code has been dispatched.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "This email address is already verified.",
      });
    }

    // Generate new code and update expiration
    const confirmationCode = generateConfirmationCode();
    const confirmationCodeHash = hashConfirmationCode(confirmationCode);
    const confirmationCodeExpires = new Date(
      Date.now() + CONFIRMATION_CODE_TTL_MS
    ).toISOString();

    await setConfirmationCode(
      user.email,
      confirmationCodeHash,
      confirmationCodeExpires
    );

    // Send confirmation email
    const sent = await sendConfirmationEmail({
      email: user.email,
      name: user.name,
      code: confirmationCode,
    });
    if (!sent.success) {
      return NextResponse.json(
        { error: "We could not send the confirmation email. Please try again shortly." },
        { status: 502 }
      );
    }

    logSecurityEvent({
      event: "EMAIL_CONFIRMATION_RESENT",
      email: user.email,
      ip,
    });

    return NextResponse.json({
      success: true,
      message: "A fresh 6-digit confirmation code has been sent to your email.",
      cooldownSeconds: 60,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to resend confirmation code.";
    logSecurityEvent({
      event: "EMAIL_CONFIRMATION_FAILED",
      ip,
      details: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
