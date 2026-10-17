import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import InterviewerVoiceControls from "@/components/InterviewerVoiceControls";

const MUTED_KEY = "intervue_interviewer_muted";

function installSpeech(voices: { name: string; lang: string; default?: boolean }[] = [{ name: "Test", lang: "en-US", default: true }]) {
  const speak = vi.fn();
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: {
      speak,
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: () => voices,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      speaking: false,
    },
  });
  (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = class {
    text: string;
    constructor(t: string) {
      this.text = t;
    }
  };
  return speak;
}

describe("InterviewerVoiceControls", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(window, "speechSynthesis");
  });

  // Runs first on purpose: lib/speech-synthesis caches the voice list at module level once any voice is seen.
  it("says so when no voices are installed, but keeps Listen usable", async () => {
    installSpeech([]);
    render(<InterviewerVoiceControls text="Tell me about yourself." autoPlay={false} />);
    await waitFor(() => expect(screen.getByText(/No voice installed/i)).toBeTruthy());
    expect((screen.getByRole("button", { name: /listen to question/i }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("shows the Listen button by default", () => {
    installSpeech();
    render(<InterviewerVoiceControls text="Tell me about yourself." autoPlay={false} />);
    expect(screen.getByRole("button", { name: /listen to question/i })).toBeTruthy();
  });

  it("keeps Listen visible when auto-read is muted, and Listen still speaks", async () => {
    const speak = installSpeech();
    localStorage.setItem(MUTED_KEY, "true");
    render(<InterviewerVoiceControls text="Tell me about yourself." autoPlay={false} />);

    const listen = await screen.findByRole("button", { name: /listen to question/i });
    expect(screen.getByText("Auto-read off")).toBeTruthy();
    fireEvent.click(listen);
    expect(speak).toHaveBeenCalledTimes(1);
  });

  it("does not auto-read while muted", async () => {
    const speak = installSpeech();
    localStorage.setItem(MUTED_KEY, "true");
    render(<InterviewerVoiceControls text="Tell me about yourself." />);
    await new Promise((r) => setTimeout(r, 600));
    expect(speak).not.toHaveBeenCalled();
  });

  it("explains itself when the browser has no speech support", async () => {
    render(<InterviewerVoiceControls text="Tell me about yourself." />);
    await waitFor(() => expect(screen.getByRole("note").textContent).toMatch(/aren't available in this browser/));
    expect(screen.queryByRole("button", { name: /listen/i })).toBeNull();
  });

});
