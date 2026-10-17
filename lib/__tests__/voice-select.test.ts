import { describe, it, expect, vi, beforeEach } from "vitest";

type V = { name: string; lang: string; default?: boolean };

function setVoices(voices: V[]) {
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: { getVoices: () => voices },
  });
}

describe("selectBestEnglishVoice", () => {
  beforeEach(() => {
    vi.resetModules(); // the voice list is cached at module level
  });

  it("prefers a named high-quality voice", async () => {
    setVoices([
      { name: "English (America)", lang: "en-US", default: true },
      { name: "Google UK English Female", lang: "en-GB" },
    ]);
    const { selectBestEnglishVoice } = await import("../speech-synthesis");
    expect(selectBestEnglishVoice()?.name).toBe("Google UK English Female");
  });

  it("skips espeak-style variants and picks the plain US English voice", async () => {
    setVoices([
      { name: "Afrikaans", lang: "af" },
      { name: "English (Caribbean)+Adam", lang: "en-029" },
      { name: "English (Great Britain)", lang: "en-GB" },
      { name: "English (America)", lang: "en-US" },
      { name: "English (America)+Alex", lang: "en-US" },
    ]);
    const { selectBestEnglishVoice } = await import("../speech-synthesis");
    expect(selectBestEnglishVoice()?.name).toBe("English (America)");
  });

  it("falls back to the first voice when none is English, and to null when there are none", async () => {
    setVoices([{ name: "Deutsch", lang: "de" }]);
    let mod = await import("../speech-synthesis");
    expect(mod.selectBestEnglishVoice()?.name).toBe("Deutsch");

    vi.resetModules();
    setVoices([]);
    mod = await import("../speech-synthesis");
    expect(mod.selectBestEnglishVoice()).toBeNull();
  });
});
