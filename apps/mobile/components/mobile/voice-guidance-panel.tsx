"use client";

import { memo, useState } from "react";

import { DEFAULT_VOICE_INSTRUCTIONS, isSpeechSupported, pauseSpeech, resumeSpeech, speakInstruction, stopSpeech } from "../../lib/mobile/voice";
import { EmptyState } from "./empty-state";
import { GlassCard } from "./glass-card";

type VoiceGuidancePanelProps = {
  enabled: boolean;
  instructions?: string[];
  lastInstruction: string | null;
  onInstruction: (instruction: string) => void;
  rate: number;
  setRate: (rate: number) => void;
  toggleVoice: () => void;
};

export const VoiceGuidancePanel = memo(function VoiceGuidancePanel({ enabled, instructions = DEFAULT_VOICE_INSTRUCTIONS, lastInstruction, onInstruction, rate, setRate, toggleVoice }: VoiceGuidancePanelProps) {
  const [message, setMessage] = useState(isSpeechSupported() ? "Voice ready" : "Speech unsupported on this device");
  const activeInstruction = lastInstruction ?? instructions[0] ?? "Proceed to Exit B";

  const speak = (instruction = activeInstruction) => {
    onInstruction(instruction);
    const spoken = enabled && speakInstruction(instruction, rate);
    setMessage(spoken ? "Speaking guidance" : enabled ? "Speech unsupported on this device" : "Voice muted");
  };

  return (
    <GlassCard glow="safe">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/60">Voice guidance</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">{enabled ? "Guidance enabled" : "Guidance muted"}</h2>
        </div>
        <button className="min-h-10 rounded-full border border-white/10 bg-white/[0.06] px-3 text-xs font-bold text-slate-100" onClick={toggleVoice} type="button">
          {enabled ? "Mute" : "Enable"}
        </button>
      </div>

      {!isSpeechSupported() ? <EmptyState description="This browser does not expose speech synthesis. Text guidance remains available." title="Speech unavailable" tone="warning" /> : null}

      <div className="mt-4 rounded-3xl border border-white/10 bg-black/18 p-4">
        <p className="text-xs text-slate-400">Last instruction</p>
        <p className="mt-1 text-lg font-black tracking-[-0.04em] text-white">{activeInstruction}</p>
        <p className="mt-2 text-xs text-slate-500">{message}</p>
      </div>

      <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400" htmlFor="voice-rate">
        Speech speed: {rate.toFixed(1)}x
      </label>
      <input
        className="mt-2 w-full accent-cyan-300"
        id="voice-rate"
        max="1.4"
        min="0.7"
        onChange={(event) => setRate(Number(event.target.value))}
        step="0.1"
        type="range"
        value={rate}
      />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="min-h-12 rounded-2xl border border-emerald-300/20 bg-emerald-400/12 text-xs font-bold text-emerald-50" onClick={() => speak()} type="button">
          Start / Replay
        </button>
        <button className="min-h-12 rounded-2xl border border-amber-300/20 bg-amber-400/12 text-xs font-bold text-amber-50" onClick={pauseSpeech} type="button">
          Pause
        </button>
        <button className="min-h-12 rounded-2xl border border-blue-300/20 bg-blue-400/12 text-xs font-bold text-blue-50" onClick={resumeSpeech} type="button">
          Resume
        </button>
        <button className="min-h-12 rounded-2xl border border-red-300/20 bg-red-400/12 text-xs font-bold text-red-50" onClick={stopSpeech} type="button">
          Stop
        </button>
      </div>

      <div className="mt-4 grid gap-2">
        {instructions.slice(0, 4).map((instruction) => (
          <button className="min-h-11 rounded-2xl border border-white/10 bg-white/[0.045] px-3 text-left text-xs font-semibold text-slate-200" key={instruction} onClick={() => speak(instruction)} type="button">
            {instruction}
          </button>
        ))}
      </div>
    </GlassCard>
  );
});
