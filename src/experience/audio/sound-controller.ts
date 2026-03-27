// ── Sound Controller ──
// Procedural audio system using Web Audio API.
// All sounds are opt-in. No audio plays unless user enables it.
// Enhanced with multi-oscillator layering, filters, and ambient drones.

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
  | "ui_hover"
  | "ambient_zone_forge"
  | "ambient_zone_clinical"
  | "ambient_zone_studio"
  | "ambient_zone_grammar"
  | "ambient_zone_neutral";

interface OscLayer {
  frequency: number;
  type: OscillatorType;
  volume: number;
  detune?: number;
  /** Delay before this layer starts (seconds) */
  delay?: number;
}

interface SoundDefinition {
  layers: OscLayer[];
  duration: number;
  envelope?: { attack: number; decay: number; sustain: number; release: number };
  /** Low-pass filter cutoff in Hz */
  filterFreq?: number;
  /** Filter Q factor */
  filterQ?: number;
}

// ── Rich procedural sound definitions ──
const SOUND_DEFS: Record<SoundId, SoundDefinition> = {
  forge_strike: {
    layers: [
      { frequency: 220, type: "triangle", volume: 0.25, detune: -50 },
      { frequency: 440, type: "sine", volume: 0.08, delay: 0.02 },
    ],
    duration: 0.18,
    filterFreq: 2000,
  },
  forge_complete: {
    layers: [
      { frequency: 440, type: "sine", volume: 0.2 },
      { frequency: 660, type: "sine", volume: 0.1, delay: 0.08 },
      { frequency: 880, type: "sine", volume: 0.06, delay: 0.16 },
    ],
    duration: 0.8,
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.35 },
  },
  tree_grow: {
    layers: [
      { frequency: 330, type: "sine", volume: 0.12 },
      { frequency: 495, type: "sine", volume: 0.06, delay: 0.15 },
    ],
    duration: 1.0,
    envelope: { attack: 0.3, decay: 0.2, sustain: 0.5, release: 0.3 },
    filterFreq: 1200,
  },
  unlock_door: {
    layers: [
      { frequency: 392, type: "sine", volume: 0.15 },
      { frequency: 523, type: "sine", volume: 0.12, delay: 0.1 },
      { frequency: 659, type: "sine", volume: 0.1, delay: 0.2 },
    ],
    duration: 0.7,
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.5, release: 0.33 },
  },
  unlock_sigil: {
    layers: [
      { frequency: 523, type: "sine", volume: 0.15 },
      { frequency: 660, type: "sine", volume: 0.12, delay: 0.12 },
      { frequency: 784, type: "sine", volume: 0.1, delay: 0.24 },
      { frequency: 1047, type: "sine", volume: 0.06, delay: 0.36 },
    ],
    duration: 1.2,
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.5 },
  },
  quiz_correct: {
    layers: [
      { frequency: 660, type: "sine", volume: 0.12 },
      { frequency: 880, type: "sine", volume: 0.08, delay: 0.04 },
    ],
    duration: 0.15,
  },
  quiz_incorrect: {
    layers: [
      { frequency: 180, type: "square", volume: 0.06, detune: 20 },
      { frequency: 160, type: "square", volume: 0.04, detune: -15 },
    ],
    duration: 0.25,
    filterFreq: 800,
    filterQ: 2,
  },
  timer_warning: {
    layers: [
      { frequency: 440, type: "square", volume: 0.1 },
      { frequency: 880, type: "square", volume: 0.04 },
    ],
    duration: 0.08,
    filterFreq: 1500,
  },
  simulation_start: {
    layers: [
      { frequency: 220, type: "sine", volume: 0.1 },
      { frequency: 330, type: "sine", volume: 0.08, delay: 0.1 },
      { frequency: 440, type: "sine", volume: 0.06, delay: 0.2 },
    ],
    duration: 0.6,
    envelope: { attack: 0.15, decay: 0.1, sustain: 0.5, release: 0.25 },
  },
  simulation_success: {
    layers: [
      { frequency: 523, type: "sine", volume: 0.15 },
      { frequency: 659, type: "sine", volume: 0.12, delay: 0.1 },
      { frequency: 784, type: "sine", volume: 0.1, delay: 0.2 },
      { frequency: 1047, type: "sine", volume: 0.06, delay: 0.35 },
    ],
    duration: 1.0,
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.35 },
  },
  level_up: {
    layers: [
      { frequency: 440, type: "sine", volume: 0.15 },
      { frequency: 554, type: "sine", volume: 0.12, delay: 0.1 },
      { frequency: 659, type: "sine", volume: 0.12, delay: 0.2 },
      { frequency: 880, type: "sine", volume: 0.15, delay: 0.35 },
    ],
    duration: 1.5,
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.3, release: 0.5 },
  },
  ambient_hum: {
    layers: [
      { frequency: 80, type: "sine", volume: 0.025 },
      { frequency: 120, type: "sine", volume: 0.015, detune: 3 },
    ],
    duration: 4.0,
    envelope: { attack: 1.0, decay: 0.5, sustain: 0.7, release: 1.5 },
    filterFreq: 300,
  },
  transition_whoosh: {
    layers: [
      { frequency: 150, type: "sawtooth", volume: 0.04, detune: -100 },
      { frequency: 300, type: "sawtooth", volume: 0.02, detune: 50 },
    ],
    duration: 0.25,
    filterFreq: 600,
    filterQ: 3,
  },
  ui_click: {
    layers: [{ frequency: 1200, type: "sine", volume: 0.06 }],
    duration: 0.03,
  },
  ui_hover: {
    layers: [{ frequency: 1400, type: "sine", volume: 0.03 }],
    duration: 0.02,
  },

  // ── Zone ambient drones ──
  ambient_zone_forge: {
    layers: [
      { frequency: 110, type: "sawtooth", volume: 0.02 },
      { frequency: 165, type: "sine", volume: 0.015, detune: 5 },
      { frequency: 55, type: "sine", volume: 0.02 },
    ],
    duration: 6.0,
    envelope: { attack: 2.0, decay: 1.0, sustain: 0.6, release: 2.0 },
    filterFreq: 250,
    filterQ: 1,
  },
  ambient_zone_clinical: {
    layers: [
      { frequency: 130, type: "sine", volume: 0.02 },
      { frequency: 196, type: "sine", volume: 0.01 },
      { frequency: 65, type: "sine", volume: 0.015 },
    ],
    duration: 6.0,
    envelope: { attack: 2.0, decay: 1.0, sustain: 0.6, release: 2.0 },
    filterFreq: 280,
    filterQ: 0.8,
  },
  ambient_zone_studio: {
    layers: [
      { frequency: 147, type: "sine", volume: 0.018 },
      { frequency: 220, type: "sine", volume: 0.012, detune: -2 },
      { frequency: 73, type: "sine", volume: 0.015 },
    ],
    duration: 6.0,
    envelope: { attack: 2.0, decay: 1.0, sustain: 0.6, release: 2.0 },
    filterFreq: 300,
    filterQ: 0.7,
  },
  ambient_zone_grammar: {
    layers: [
      { frequency: 165, type: "sine", volume: 0.015 },
      { frequency: 247, type: "sine", volume: 0.01 },
      { frequency: 82, type: "sine", volume: 0.012 },
    ],
    duration: 6.0,
    envelope: { attack: 2.0, decay: 1.0, sustain: 0.6, release: 2.0 },
    filterFreq: 320,
    filterQ: 0.6,
  },
  ambient_zone_neutral: {
    layers: [
      { frequency: 100, type: "sine", volume: 0.015 },
      { frequency: 150, type: "sine", volume: 0.008 },
    ],
    duration: 6.0,
    envelope: { attack: 2.0, decay: 1.0, sustain: 0.5, release: 2.0 },
    filterFreq: 200,
    filterQ: 0.5,
  },
};

class SoundController {
  private ctx: AudioContext | null = null;
  private enabled = false;
  private masterVolume = 0.5;
  private ambientInterval: ReturnType<typeof setInterval> | null = null;
  private currentAmbientZone: string | null = null;

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
    this.stopAmbient();
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
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      for (const layer of def.layers) {
        this.playLayer(layer, def, volumeOverride);
      }
    } catch {
      // Audio failure is never critical
    }
  }

  private playLayer(layer: OscLayer, def: SoundDefinition, volumeOverride?: number): void {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = layer.type;
    osc.frequency.value = layer.frequency;
    if (layer.detune) osc.detune.value = layer.detune;

    const vol = (volumeOverride ?? layer.volume) * this.masterVolume;
    const now = this.ctx.currentTime + (layer.delay || 0);

    // Optional filter
    let lastNode: AudioNode = gain;
    if (def.filterFreq) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = def.filterFreq;
      filter.Q.value = def.filterQ || 1;
      gain.connect(filter);
      filter.connect(this.ctx.destination);
      lastNode = filter;
    } else {
      gain.connect(this.ctx.destination);
    }

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
    osc.start(now);
    osc.stop(now + def.duration + 0.05);
  }

  /** Start ambient drone for a zone — loops automatically */
  startAmbient(zone: string): void {
    if (!this.enabled) return;
    
    const ambientId = `ambient_zone_${zone}` as SoundId;
    if (!SOUND_DEFS[ambientId]) return;
    if (this.currentAmbientZone === zone) return;

    this.stopAmbient();
    this.currentAmbientZone = zone;

    // Play immediately then loop
    this.play(ambientId);
    const def = SOUND_DEFS[ambientId];
    this.ambientInterval = setInterval(() => {
      if (this.enabled && this.currentAmbientZone === zone) {
        this.play(ambientId);
      } else {
        this.stopAmbient();
      }
    }, (def.duration - 1) * 1000); // Overlap slightly for seamless loop
  }

  stopAmbient(): void {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    this.currentAmbientZone = null;
  }

  dispose(): void {
    this.stopAmbient();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    this.enabled = false;
  }
}

/** Singleton sound controller */
export const soundController = new SoundController();
