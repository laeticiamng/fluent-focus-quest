// ── Sound Controller ──
// Optional, contextual audio system.
// Uses Web Audio API for low-latency, ambient sound cues.
// All sounds are opt-in. No audio plays unless user enables it.

export type SoundId =
  | "forge_strike"
  | "forge_complete"
  | "tree_grow"
  | "unlock_door"
  | "unlock_sigil"
  | "quiz_correct"
  | "quiz_incorrect"
  | "timer_warning"
  | "simulation_start"
  | "simulation_success"
  | "level_up"
  | "ambient_hum"
  | "transition_whoosh"
  | "ui_click"
  | "ui_hover";

interface SoundDefinition {
  frequency: number;
  type: OscillatorType;
  duration: number;
  volume: number;
  envelope?: { attack: number; decay: number; sustain: number; release: number };
  detune?: number;
}

// Procedural sound definitions — no external files needed
const SOUND_DEFS: Record<SoundId, SoundDefinition> = {
  forge_strike: { frequency: 220, type: "triangle", duration: 0.15, volume: 0.3, detune: -50 },
  forge_complete: { frequency: 440, type: "sine", duration: 0.6, volume: 0.25, envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.35 } },
  tree_grow: { frequency: 330, type: "sine", duration: 0.8, volume: 0.15, envelope: { attack: 0.3, decay: 0.2, sustain: 0.5, release: 0.3 } },
  unlock_door: { frequency: 523, type: "sine", duration: 0.5, volume: 0.2, envelope: { attack: 0.02, decay: 0.15, sustain: 0.5, release: 0.33 } },
  unlock_sigil: { frequency: 660, type: "sine", duration: 1.0, volume: 0.2, envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.5 } },
  quiz_correct: { frequency: 880, type: "sine", duration: 0.12, volume: 0.15 },
  quiz_incorrect: { frequency: 180, type: "square", duration: 0.2, volume: 0.1, detune: 20 },
  timer_warning: { frequency: 440, type: "square", duration: 0.08, volume: 0.15 },
  simulation_start: { frequency: 350, type: "sine", duration: 0.4, volume: 0.15, envelope: { attack: 0.15, decay: 0.1, sustain: 0.5, release: 0.25 } },
  simulation_success: { frequency: 523, type: "sine", duration: 0.8, volume: 0.2, envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.35 } },
  level_up: { frequency: 660, type: "sine", duration: 1.2, volume: 0.2, envelope: { attack: 0.1, decay: 0.3, sustain: 0.3, release: 0.5 } },
  ambient_hum: { frequency: 110, type: "sine", duration: 3.0, volume: 0.04 },
  transition_whoosh: { frequency: 200, type: "sawtooth", duration: 0.2, volume: 0.06, detune: -100 },
  ui_click: { frequency: 1200, type: "sine", duration: 0.03, volume: 0.08 },
  ui_hover: { frequency: 1400, type: "sine", duration: 0.02, volume: 0.04 },
};

class SoundController {
  private ctx: AudioContext | null = null;
  private enabled = false;
  private masterVolume = 0.5;

  enable(): void {
    this.enabled = true;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        this.enabled = false;
      }
    }
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  play(id: SoundId, volumeOverride?: number): void {
    if (!this.enabled || !this.ctx) return;

    const def = SOUND_DEFS[id];
    if (!def) return;

    try {
      // Resume context if suspended (autoplay policy)
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = def.type;
      osc.frequency.value = def.frequency;
      if (def.detune) osc.detune.value = def.detune;

      const vol = (volumeOverride ?? def.volume) * this.masterVolume;
      const now = this.ctx.currentTime;

      if (def.envelope) {
        const { attack, decay, sustain, release } = def.envelope;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol, now + attack);
        gain.gain.linearRampToValueAtTime(vol * sustain, now + attack + decay);
        gain.gain.setValueAtTime(vol * sustain, now + def.duration - release);
        gain.gain.linearRampToValueAtTime(0, now + def.duration);
      } else {
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + def.duration);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + def.duration);
    } catch {
      // Audio failure is never critical
    }
  }

  dispose(): void {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    this.enabled = false;
  }
}

/** Singleton sound controller */
export const soundController = new SoundController();
