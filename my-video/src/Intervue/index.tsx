import React, { useEffect, useState } from "react";
import { Audio } from "@remotion/media";
import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { AbsoluteFill, CalculateMetadataFunction, Sequence, continueRender, delayRender, staticFile, useVideoConfig } from "remotion";
import { FONT, FPS } from "./theme";
import { Answer, Brand, Debrief, Feedback, HUD, Hook, Outro, Progress, Tracks, Voice } from "./scenes";

const SCENES = [
  { id: "s1-hook", min: 8, Comp: Hook },
  { id: "s2-brand", min: 6, Comp: Brand },
  { id: "s3-tracks", min: 7, Comp: Tracks },
  { id: "s4-voice", min: 7, Comp: Voice },
  { id: "s5-answer", min: 8, Comp: Answer },
  { id: "s6-hud", min: 9, Comp: HUD },
  { id: "s7-feedback", min: 14, Comp: Feedback },
  { id: "s8-debrief", min: 9, Comp: Debrief },
  { id: "s9-progress", min: 7, Comp: Progress },
  { id: "s10-outro", min: 6, Comp: Outro },
] as const;

const LEAD_IN = 0.3; // seconds before narration starts in each scene
const TAIL = 0.5; // seconds of breathing room after narration

export type IntervueProps = { durations: number[] };

const audioSrc = (id: string) => staticFile(`voiceover/intervue/${id}.mp3`);

const getAudioDuration = async (src: string) => {
  const input = new Input({ formats: ALL_FORMATS, source: new UrlSource(src) });
  return input.computeDuration();
};

export const calculateIntervueMetadata: CalculateMetadataFunction<IntervueProps> = async () => {
  const audio = await Promise.all(SCENES.map((s) => getAudioDuration(audioSrc(s.id))));
  const durations = SCENES.map((s, i) => Math.ceil(Math.max(s.min, audio[i] + LEAD_IN + TAIL) * FPS));
  return { durationInFrames: durations.reduce((a, b) => a + b, 0), props: { durations } };
};

export const Intervue: React.FC<IntervueProps> = ({ durations }) => {
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("font"));
  useEffect(() => {
    const font = new FontFace("Geist", `url(${staticFile("fonts/GeistVF.woff")})`, { weight: "100 900" });
    font.load().then((f) => { document.fonts.add(f); continueRender(handle); }).catch(() => continueRender(handle));
  }, [handle]);

  let start = 0;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: "#0A110D" }}>
      {SCENES.map(({ id, Comp }, i) => {
        const from = start;
        start += durations[i];
        return (
          <Sequence key={id} from={from} durationInFrames={durations[i]} premountFor={fps}>
            <Comp d={durations[i]} />
            <Sequence from={Math.round(LEAD_IN * fps)}>
              <Audio src={audioSrc(id)} />
            </Sequence>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
