// Generates one MP3 per narration line into public/voiceover/intervue.
// Usage: ELEVENLABS_API_KEY=... node scripts/generate-voiceover.mjs [voiceId]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error("ELEVENLABS_API_KEY is not set");
const voiceId = process.argv[2] ?? process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";
const scenes = JSON.parse(readFileSync(new URL("./narration.json", import.meta.url), "utf8"));
mkdirSync("public/voiceover/intervue", { recursive: true });

for (const scene of scenes) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: scene.text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3 },
    }),
  });
  if (!res.ok) throw new Error(`${scene.id}: ${res.status} ${await res.text()}`);
  writeFileSync(`public/voiceover/intervue/${scene.id}.mp3`, Buffer.from(await res.arrayBuffer()));
  console.log("wrote", scene.id);
}
