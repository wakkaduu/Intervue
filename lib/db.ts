import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import type { SessionEntry, Category } from "@/types";
import { validateEmail, validatePassword, sanitizeName } from "./security/validation";
import { isSupabaseConfigured, getSupabaseClient } from "./supabase";
import { verifyConfirmationCodeHash } from "./security/confirmation";

// Precomputed dummy bcrypt hash to ensure constant-time verification and prevent timing attacks / user enumeration
const DUMMY_HASH = "$2b$10$7EqJtq98hPqEX7fNZaFWoO5d6Uq6e2nN7zR1o1a7b3c4d5e6f7g8h";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  image?: string;
  createdAt: string;
  emailVerified?: boolean;
  confirmationCodeHash?: string;
  confirmationCodeExpires?: string;
  confirmationAttempts?: number;
}

export interface StoredSession {
  id: string;
  userId: string;
  userEmail: string;
  category: Category;
  mode: "mic" | "typed";
  averageScore: number;
  questionCount: number;
  createdAt: string;
  entries: SessionEntry[];
}

export interface UserAnalytics {
  totalSessions: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  completedCategories: string[];
  recentScores: { date: string; score: number; category: string }[];
  topStrengths: string[];
  areasForImprovement: string[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

/**
 * Ensures the local data directory and base files exist when in fallback mode.
 */
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    const demoUser: User = {
      id: "usr_demo_1",
      name: "Alex Rivera",
      email: "demo@intervue.io",
      passwordHash: "$2b$10$OD9.IBLYiBYOE97UdY6CyezUa01h8xdkTg9j9tg6PQGzmTw5Zq7tG", // intervue123
      image: undefined,
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify([demoUser], null, 2), "utf-8");
  }

  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

// ── Local Fallback Helpers ──

function getLocalUsers(): User[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: User[]): void {
  ensureDataFiles();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

function getLocalSessions(): StoredSession[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
    return JSON.parse(raw) as StoredSession[];
  } catch {
    return [];
  }
}

function saveLocalSessions(sessions: StoredSession[]): void {
  ensureDataFiles();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(sessions, null, 2), "utf-8");
}

// ── Public User Operations (Dual Supabase / Local) ──

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .ilike("email", normalized)
        .maybeSingle();

      if (!error && data) {
        const localMirror = getLocalUsers().find((u) => u.email.toLowerCase() === normalized);
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          passwordHash: data.password_hash || undefined,
          image: data.image || undefined,
          createdAt: data.created_at,
          emailVerified: data.email_verified !== undefined
            ? Boolean(data.email_verified)
            : (localMirror?.emailVerified ?? (data.email === "demo@intervue.io")),
          confirmationCodeHash: data.confirmation_code_hash || localMirror?.confirmationCodeHash || undefined,
          confirmationCodeExpires: data.confirmation_code_expires || localMirror?.confirmationCodeExpires || undefined,
          confirmationAttempts: data.confirmation_attempts || localMirror?.confirmationAttempts || 0,
        };
      }
    }
  }

  // Local fallback
  const users = getLocalUsers();
  const found = users.find((u) => u.email.toLowerCase() === normalized);
  if (!found) return null;
  return {
    ...found,
    emailVerified: found.emailVerified ?? (found.email === "demo@intervue.io"),
  };
}

export async function getUserById(id: string): Promise<User | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          passwordHash: data.password_hash || undefined,
          image: data.image || undefined,
          createdAt: data.created_at,
          emailVerified: data.email_verified !== undefined ? Boolean(data.email_verified) : data.email === "demo@intervue.io",
          confirmationCodeHash: data.confirmation_code_hash || undefined,
          confirmationCodeExpires: data.confirmation_code_expires || undefined,
          confirmationAttempts: data.confirmation_attempts || 0,
        };
      }
    }
  }

  const users = getLocalUsers();
  const found = users.find((u) => u.id === id);
  if (!found) return null;
  return {
    ...found,
    emailVerified: found.emailVerified ?? (found.email === "demo@intervue.io"),
  };
}

export async function createUser(params: {
  name: string;
  email: string;
  password?: string;
  image?: string;
  emailVerified?: boolean;
  confirmationCodeHash?: string;
  confirmationCodeExpires?: string;
}): Promise<User> {
  const emailCheck = validateEmail(params.email);
  if (!emailCheck.valid || !emailCheck.normalized) {
    throw new Error(emailCheck.error || "Invalid email address.");
  }

  const nameCheck = sanitizeName(params.name);
  if (!nameCheck.valid || !nameCheck.sanitized) {
    throw new Error(nameCheck.error || "Invalid name.");
  }

  if (params.password) {
    const passCheck = validatePassword(params.password);
    if (!passCheck.valid) {
      throw new Error(passCheck.error || "Password does not meet security requirements.");
    }
  }

  const existing = await getUserByEmail(emailCheck.normalized);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const passwordHash = params.password
    ? await bcrypt.hash(params.password, 10)
    : undefined;

  const newUser: User = {
    id,
    name: nameCheck.sanitized,
    email: emailCheck.normalized,
    passwordHash,
    image: params.image || undefined,
    createdAt: new Date().toISOString(),
    emailVerified: params.emailVerified ?? false,
    confirmationCodeHash: params.confirmationCodeHash,
    confirmationCodeExpires: params.confirmationCodeExpires,
    confirmationAttempts: 0,
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const insertPayload: Record<string, unknown> = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        password_hash: newUser.passwordHash,
        image: newUser.image,
        created_at: newUser.createdAt,
      };

      if (newUser.emailVerified !== undefined) insertPayload.email_verified = newUser.emailVerified;
      if (newUser.confirmationCodeHash) insertPayload.confirmation_code_hash = newUser.confirmationCodeHash;
      if (newUser.confirmationCodeExpires) insertPayload.confirmation_code_expires = newUser.confirmationCodeExpires;

      const { error } = await supabase.from("users").insert(insertPayload);

      if (error) {
        if (error.message.includes("column") || error.code === "PGRST204") {
          const { error: fallbackErr } = await supabase.from("users").insert({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            password_hash: newUser.passwordHash,
            image: newUser.image,
            created_at: newUser.createdAt,
          });
          if (fallbackErr) {
            throw new Error(`Database error: ${fallbackErr.message}`);
          }
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }
    }
  }

  // Always mirror into local users cache for resilience
  const users = getLocalUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === newUser.email.toLowerCase());
  if (idx >= 0) {
    users[idx] = newUser;
  } else {
    users.push(newUser);
  }
  saveLocalUsers(users);

  return newUser;
}

/**
 * Sets or updates the email confirmation code hash and expiration for a user.
 */
export async function setConfirmationCode(
  email: string,
  codeHash: string,
  expiresAt: string
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase
        .from("users")
        .update({
          confirmation_code_hash: codeHash,
          confirmation_code_expires: expiresAt,
          confirmation_attempts: 0,
        })
        .ilike("email", normalized);

      if (!error) return true;
    }
  }

  const users = getLocalUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalized);
  if (!user) return false;

  user.confirmationCodeHash = codeHash;
  user.confirmationCodeExpires = expiresAt;
  user.confirmationAttempts = 0;
  saveLocalUsers(users);
  return true;
}

/**
 * Verifies an entered confirmation code against stored hash, enforcing
 * max attempt limits and expiration timestamps.
 */
export async function verifyConfirmationCode(
  email: string,
  candidateCode: string
): Promise<{ success: boolean; error?: string; alreadyVerified?: boolean }> {
  const normalized = email.trim().toLowerCase();
  const user = await getUserByEmail(normalized);

  if (!user) {
    return { success: false, error: "No account found matching this email address." };
  }

  if (user.emailVerified) {
    return { success: true, alreadyVerified: true };
  }

  if (!user.confirmationCodeHash || !user.confirmationCodeExpires) {
    return {
      success: false,
      error: "No active confirmation code found. Please request a new code.",
    };
  }

  const attempts = (user.confirmationAttempts || 0) + 1;

  if (attempts > 5) {
    await setConfirmationCode(normalized, "", new Date(0).toISOString());
    return {
      success: false,
      error: "Too many failed confirmation attempts. This code is invalidated. Please request a new one.",
    };
  }

  const now = new Date();
  const expires = new Date(user.confirmationCodeExpires);
  if (now > expires) {
    return {
      success: false,
      error: "This confirmation code has expired. Please request a new one.",
    };
  }

  const matches = verifyConfirmationCodeHash(candidateCode, user.confirmationCodeHash);

  if (!matches) {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase
          .from("users")
          .update({ confirmation_attempts: attempts })
          .ilike("email", normalized);
      }
    }

    const users = getLocalUsers();
    const u = users.find((x) => x.email.toLowerCase() === normalized);
    if (u) {
      u.confirmationAttempts = attempts;
      saveLocalUsers(users);
    }

    const remaining = 5 - attempts;
    return {
      success: false,
      error: `Invalid confirmation code. ${remaining > 0 ? `${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` : "Please request a new code."}`,
    };
  }

  return await markUserEmailVerified(normalized);
}

/**
 * Marks a user's email as verified and cleans up any confirmation codes.
 */
export async function markUserEmailVerified(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const normalized = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase
        .from("users")
        .update({
          email_verified: true,
          confirmation_code_hash: null,
          confirmation_code_expires: null,
          confirmation_attempts: 0,
        })
        .ilike("email", normalized);

      if (!error) return { success: true };
    }
  }

  const users = getLocalUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalized);
  if (!user) {
    return { success: false, error: "User not found." };
  }

  user.emailVerified = true;
  user.confirmationCodeHash = undefined;
  user.confirmationCodeExpires = undefined;
  user.confirmationAttempts = 0;
  saveLocalUsers(users);

  return { success: true };
}

export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const emailCheck = validateEmail(email);
  if (!emailCheck.valid || !emailCheck.normalized) {
    await bcrypt.compare(password || "", DUMMY_HASH);
    return null;
  }

  const user = await getUserByEmail(emailCheck.normalized);
  if (!user || !user.passwordHash) {
    await bcrypt.compare(password || "", DUMMY_HASH);
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}

// ── Public History & Analytics Operations ──

export async function getUserSessions(userIdOrEmail: string): Promise<StoredSession[]> {
  const normalized = userIdOrEmail.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("interview_sessions")
        .select("*")
        .or(`user_id.eq.${userIdOrEmail},user_email.ilike.${normalized}`)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((d) => ({
          id: d.id,
          userId: d.user_id,
          userEmail: d.user_email,
          category: d.category as Category,
          mode: d.mode as "mic" | "typed",
          averageScore: Number(d.average_score),
          questionCount: Number(d.question_count),
          createdAt: d.created_at,
          entries: d.entries as SessionEntry[],
        }));
      }
    }
  }

  // Local fallback
  const all = getLocalSessions();
  return all
    .filter(
      (s) =>
        s.userId === userIdOrEmail ||
        s.userEmail.toLowerCase() === normalized
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function saveUserInterviewSession(params: {
  userId: string;
  userEmail: string;
  category: Category;
  mode: "mic" | "typed";
  averageScore: number;
  entries: SessionEntry[];
}): Promise<StoredSession> {
  const newSession: StoredSession = {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: params.userId,
    userEmail: params.userEmail.toLowerCase(),
    category: params.category,
    mode: params.mode,
    averageScore: Math.round(params.averageScore * 10) / 10,
    questionCount: params.entries.length,
    createdAt: new Date().toISOString(),
    entries: params.entries,
  };

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from("interview_sessions").insert({
        id: newSession.id,
        user_id: newSession.userId,
        user_email: newSession.userEmail,
        category: newSession.category,
        mode: newSession.mode,
        average_score: newSession.averageScore,
        question_count: newSession.questionCount,
        entries: newSession.entries,
        created_at: newSession.createdAt,
      });

      if (!error) {
        return newSession;
      }
      console.warn("[SUPABASE_WARNING] Failed to insert session into Supabase:", error.message);
    }
  }

  // Local fallback
  const all = getLocalSessions();
  all.unshift(newSession);
  saveLocalSessions(all);
  return newSession;
}

export async function calculateUserAnalytics(userIdOrEmail: string): Promise<UserAnalytics> {
  const sessions = await getUserSessions(userIdOrEmail);

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      totalQuestionsAnswered: 0,
      completedCategories: [],
      recentScores: [],
      topStrengths: [],
      areasForImprovement: [],
    };
  }

  const totalQuestions = sessions.reduce((acc, s) => acc + s.questionCount, 0);
  const totalScoreSum = sessions.reduce((acc, s) => acc + s.averageScore, 0);
  const averageScore = Math.round((totalScoreSum / sessions.length) * 10) / 10;

  const categoriesSet = new Set<string>();
  sessions.forEach((s) => categoriesSet.add(s.category));

  const recentScores = sessions.slice(0, 10).map((s) => ({
    date: s.createdAt,
    score: s.averageScore,
    category: s.category,
  }));

  const strengthsMap = new Map<string, number>();
  const improvementMap = new Map<string, number>();

  sessions.forEach((s) => {
    s.entries.forEach((e) => {
      e.feedback.strengths.forEach((st) => {
        strengthsMap.set(st, (strengthsMap.get(st) || 0) + 1);
      });
      e.feedback.areasForImprovement.forEach((ai) => {
        improvementMap.set(ai, (improvementMap.get(ai) || 0) + 1);
      });
    });
  });

  const sortedStrengths = Array.from(strengthsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([st]) => st);

  const sortedImprovements = Array.from(improvementMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ai]) => ai);

  return {
    totalSessions: sessions.length,
    averageScore,
    totalQuestionsAnswered: totalQuestions,
    completedCategories: Array.from(categoriesSet),
    recentScores,
    topStrengths: sortedStrengths,
    areasForImprovement: sortedImprovements,
  };
}
