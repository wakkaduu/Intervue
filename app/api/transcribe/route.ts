// Server-side Audio Transcription API using Whisper & Gemini
// Supports: Groq Whisper (free & ultra-fast), OpenAI Whisper, and Gemini 1.5 Flash Audio

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkApiRateLimit, getClientIp } from "@/lib/security/rate-limiter";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/** Picks a filename extension matching the real container (iOS Safari records MP4/AAC, not WebM). */
function audioFileName(type: string): string {
  const base = (type || "").split(";")[0].toLowerCase();
  if (base.includes("mp4") || base.includes("m4a") || base.includes("aac")) return "interview-answer.m4a";
  if (base.includes("ogg")) return "interview-answer.ogg";
  if (base.includes("wav")) return "interview-answer.wav";
  if (base.includes("mpeg") || base.includes("mp3")) return "interview-answer.mp3";
  return "interview-answer.webm";
}

export const maxDuration = 30;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const limit = checkApiRateLimit("transcribe", getClientIp(request.headers));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_AUDIO_BYTES + 1024 * 1024) {
    return NextResponse.json({ error: "Audio file is too large (max 10 MB)." }, { status: 413 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Audio file is required in 'file' form field." },
        { status: 400 }
      );
    }

    if (file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "Audio file is too large (max 10 MB)." }, { status: 413 });
    }
    if (file.type && !file.type.startsWith("audio/") && !file.type.startsWith("video/webm")) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });
    }

    const groqKey = request.headers.get("x-groq-key") || process.env.GROQ_API_KEY;
    const openaiKey = request.headers.get("x-openai-key") || process.env.OPENAI_API_KEY;
    const geminiKey = request.headers.get("x-gemini-key") || process.env.GEMINI_API_KEY;

    if (!groqKey && !openaiKey && !geminiKey) {
      return NextResponse.json(
        {
          error: "MISSING_API_KEY",
          message:
            "Speech transcription requires an API key. Please add GEMINI_API_KEY or GROQ_API_KEY to your .env.local file, or configure your key in the app settings.",
        },
        { status: 400 }
      );
    }

    // ── Method 1: Groq Whisper API (whisper-large-v3) ──
    if (groqKey) {
      try {
        const groqFormData = new FormData();
        groqFormData.append("file", file, audioFileName(file.type));
        groqFormData.append("model", "whisper-large-v3");
        groqFormData.append("temperature", "0");
        groqFormData.append("response_format", "json");

        const response = await fetch(
          "https://api.groq.com/openai/v1/audio/transcriptions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${groqKey}`,
            },
            body: groqFormData,
          }
        );

        if (response.ok) {
          const data = (await response.json()) as { text?: string };
          if (data.text) {
            return NextResponse.json({ text: data.text.trim() });
          }
        } else {
          const errData = await response.text();
          console.warn("Groq Whisper transcription API returned non-OK:", response.status, errData);
        }
      } catch (groqErr) {
        console.warn("Groq Whisper transcription failed, attempting fallback:", groqErr);
      }
    }

    // ── Method 2: OpenAI Whisper API (whisper-1) ──
    if (openaiKey) {
      try {
        const openaiFormData = new FormData();
        openaiFormData.append("file", file, audioFileName(file.type));
        openaiFormData.append("model", "whisper-1");
        openaiFormData.append("response_format", "json");

        const response = await fetch(
          "https://api.openai.com/v1/audio/transcriptions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openaiKey}`,
            },
            body: openaiFormData,
          }
        );

        if (response.ok) {
          const data = (await response.json()) as { text?: string };
          if (data.text) {
            return NextResponse.json({ text: data.text.trim() });
          }
        } else {
          const errData = await response.text();
          console.warn("OpenAI Whisper returned non-OK:", response.status, errData);
        }
      } catch (openaiErr) {
        console.warn("OpenAI Whisper transcription failed, attempting fallback:", openaiErr);
      }
    }

    // ── Method 3: Gemini Audio Transcription Fallback ──
    if (geminiKey) {
      try {
        const buffer = await file.arrayBuffer();
        const base64Audio = Buffer.from(buffer).toString("base64");
        const mimeType = (file.type || "audio/webm").split(";")[0];

        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Audio,
                  },
                },
                {
                  text: "Please transcribe this spoken interview response accurately word-for-word. Return only the transcription without timestamps, quotes, or conversational commentary.",
                },
              ],
            },
          ],
        });

        const text = result.response.text()?.trim();
        if (text) {
          return NextResponse.json({ text });
        }
      } catch (geminiErr) {
        console.warn("Gemini audio transcription failed:", geminiErr);
      }
    }

    // If all configured methods failed or returned empty text
    return NextResponse.json(
      {
        error: "TRANSCRIPTION_FAILED",
        message:
          "Could not transcribe the recorded audio with your configured API key. Please check your API key, ensure your microphone captured clear sound, or try re-recording.",
      },
      { status: 502 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Audio transcription error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
