import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/db";
import { checkRegisterRateLimit } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/logger";
import { validateEmail, validatePassword, sanitizeName } from "@/lib/security/validation";
import { generateConfirmationCode, hashConfirmationCode, CONFIRMATION_CODE_TTL_MS } from "@/lib/security/confirmation";
import { sendConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip")) || "127.0.0.1";

  // Rate limiting check: prevent automated mass-registration
  const rateLimit = checkRegisterRateLimit(ip);
  if (!rateLimit.allowed) {
    logSecurityEvent({
      event: "AUTH_RATE_LIMITED",
      ip,
      details: "Registration rate limit exceeded",
    });

    return NextResponse.json(
      {
        error: `Too many registration attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Strict input validation & sanitization
    const emailResult = validateEmail(email);
    if (!emailResult.valid || !emailResult.normalized) {
      logSecurityEvent({
        event: "AUTH_REGISTER_FAILED",
        ip,
        details: "Invalid email format attempted",
      });
      return NextResponse.json(
        { error: emailResult.error || "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const nameResult = sanitizeName(name);
    if (!nameResult.valid || !nameResult.sanitized) {
      return NextResponse.json(
        { error: nameResult.error || "Please enter a valid full name." },
        { status: 400 }
      );
    }

    const passResult = validatePassword(password);
    if (!passResult.valid) {
      return NextResponse.json(
        { error: passResult.error || "Password does not meet complexity requirements." },
        { status: 400 }
      );
    }

    // Check existing email
    const existing = await getUserByEmail(emailResult.normalized);
    if (existing) {
      logSecurityEvent({
        event: "AUTH_REGISTER_FAILED",
        email: emailResult.normalized,
        ip,
        details: "Registration attempted on existing account",
      });
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Generate cryptographically secure 6-digit confirmation code (expires in 15 mins)
    const confirmationCode = generateConfirmationCode();
    const confirmationCodeHash = hashConfirmationCode(confirmationCode);
    const confirmationCodeExpires = new Date(
      Date.now() + CONFIRMATION_CODE_TTL_MS
    ).toISOString();

    const user = await createUser({
      name: nameResult.sanitized,
      email: emailResult.normalized,
      password,
      emailVerified: false,
      confirmationCodeHash,
      confirmationCodeExpires,
    });

    logSecurityEvent({
      event: "AUTH_REGISTER_SUCCESS",
      email: user.email,
      ip,
    });

    // Send confirmation email (or dev simulation)
    const emailResult2 = await sendConfirmationEmail({
      email: user.email,
      name: user.name,
      code: confirmationCode,
    });
    if (!emailResult2.success) {
      return NextResponse.json(
        {
          error:
            "Account created, but we could not send the confirmation email. Please use 'Resend code' shortly.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        requiresConfirmation: true,
        email: user.email,
        message: "Account created. A 6-digit confirmation code has been sent to your email.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: false,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create account.";
    logSecurityEvent({
      event: "AUTH_REGISTER_FAILED",
      ip,
      details: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
