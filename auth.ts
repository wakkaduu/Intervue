import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { verifyUserCredentials, getUserByEmail, createUser } from "@/lib/db";
import { checkLoginRateLimit, recordLoginSuccess } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/logger";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days session expiration
    updateAge: 24 * 60 * 60, // 24 hours rolling update
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        // Derive client IP for brute-force tracking
        let ip = "127.0.0.1";
        if (req && "headers" in req && req.headers) {
          const headers = req.headers as Headers | Record<string, string>;
          const forwarded = typeof headers.get === "function"
            ? headers.get("x-forwarded-for")
            : (headers as Record<string, string>)["x-forwarded-for"];
          if (forwarded) {
            ip = forwarded.split(",")[0].trim();
          }
        }

        // Brute force & credential stuffing protection
        const rateLimit = checkLoginRateLimit(ip, email);
        if (!rateLimit.allowed) {
          logSecurityEvent({
            event: "AUTH_LOCKOUT_TRIGGERED",
            email,
            ip,
            details: `Account/IP temporarily locked. Retry after ${rateLimit.retryAfterSeconds}s`,
          });
          throw new Error(`Too many failed login attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`);
        }

        const user = await verifyUserCredentials(email, password);

        if (!user) {
          logSecurityEvent({
            event: "AUTH_LOGIN_FAILED",
            email,
            ip,
            details: "Invalid credentials submitted",
          });
          return null;
        }

        // Reset rate limit counter upon successful authentication
        recordLoginSuccess(ip, email);
        logSecurityEvent({
          event: "AUTH_LOGIN_SUCCESS",
          email: user.email,
          ip,
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified ?? (user.email === "demo@intervue.io"),
        };
      },
    }),
    ...((process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID) &&
    (process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET)
      ? [
          GitHub({
            clientId: (process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID)!,
            clientSecret: (process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET)!,
          }),
        ]
      : []),
    ...((process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID) &&
    (process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET)
      ? [
          Google({
            clientId: (process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID)!,
            clientSecret: (process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET)!,
            authorization: {
              params: {
                prompt: "select_account",
                access_type: "offline",
                response_type: "code",
              },
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" || account?.provider === "google") {
        if (user.email) {
          const email = user.email.toLowerCase().trim();
          let existing = await getUserByEmail(email);
          if (!existing) {
            existing = await createUser({
              name: user.name || "Intervue Candidate",
              email,
              image: user.image || undefined,
              emailVerified: true,
            });
            logSecurityEvent({
              event: "AUTH_REGISTER_SUCCESS",
              email,
              details: `OAuth registered via ${account.provider}`,
            });
          } else {
            logSecurityEvent({
              event: "AUTH_LOGIN_SUCCESS",
              email,
              details: `OAuth login via ${account.provider}`,
            });
          }
          user.id = existing.id;
          (user as { id?: string; emailVerified?: boolean }).emailVerified = true;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        if (user.image) token.picture = user.image;
        token.emailVerified = Boolean(
          (user as { id?: string; emailVerified?: boolean }).emailVerified
        );
      }
      if (trigger === "update" && session?.emailVerified !== undefined) {
        token.emailVerified = session.emailVerified;
      } else if (!token.emailVerified && token.email) {
        try {
          const dbUser = await getUserByEmail(token.email);
          if (dbUser?.emailVerified) {
            token.emailVerified = true;
          }
        } catch {
          // fallback to current token status
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        (
          session.user as { id?: string; emailVerified?: boolean }
        ).emailVerified = Boolean(token.emailVerified);
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || "fallback-intervue-dev-secret-key-32chars!",
});
