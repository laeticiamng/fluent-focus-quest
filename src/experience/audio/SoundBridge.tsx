// ── Sound Bridge ──
// Connects the experience event bus to the SoundController.
// Listens for domain events and triggers appropriate procedural sounds.
// Also manages zone ambient drones when sound is enabled.

import { useEffect, useRef } from "react";
import { useExperience } from "../core/experience-store";
import { experienceEvents } from "../core/experience-events";
import { soundController, type SoundId } from "./sound-controller";

const EVENT_SOUND_MAP: Partial<Record<string, SoundId>> = {
  ARTIFACT_FORGED: "forge_complete",
  QUIZ_CORRECT: "quiz_correct",
  QUIZ_INCORRECT: "quiz_incorrect",
  TASK_COMPLETED: "forge_strike",
  ZONE_ENTERED: "transition_whoosh",
  ZONE_UNLOCKED: "unlock_door",
  SIGIL_COLLECTED: "unlock_sigil",
  ROOM_SOLVED: "unlock_door",
  SIMULATION_START: "simulation_start",
  SIMULATION_SUCCESS: "simulation_success",
  LEVEL_UP: "level_up",
  INTERVIEW_TIMER_LOW: "timer_warning",
  STREAK_CONTINUED: "forge_strike",
  PHRASE_GATE_SOLVED: "forge_complete",
  PROTOCOL_ACTIVATED: "unlock_sigil",
};

// Map atmosphere types to ambient zone sounds
const ZONE_AMBIENT_MAP: Record<string, string> = {
  forge: "forge",
  grammar: "grammar",
  studio: "studio",
  clinical: "clinical",
  laboratory: "clinical",
  archive: "neutral",
  aerzterat: "studio",
  neutral: "neutral",
};

export function SoundBridge() {
  const { state } = useExperience();
  const prevZone = useRef<string | null>(null);

  // Sync sound controller enabled state
  useEffect(() => {
    if (state.soundEnabled) {
      soundController.enable();
    } else {
      soundController.disable();
    }
  }, [state.soundEnabled]);

  // Listen to all experience events and play matching sounds
  useEffect(() => {
    const unsub = experienceEvents.on("*", (event) => {
      const soundId = EVENT_SOUND_MAP[event.type];
      if (soundId) {
        soundController.play(soundId);
      }
    });
    return unsub;
  }, []);

  // Manage zone ambient drones
  useEffect(() => {
    if (!state.soundEnabled) return;

    const currentZone = state.atmosphere.type;
    if (currentZone !== prevZone.current) {
      prevZone.current = currentZone;
      const ambientZone = ZONE_AMBIENT_MAP[currentZone] || "neutral";
      soundController.startAmbient(ambientZone);
    }

    return () => {
      soundController.stopAmbient();
    };
  }, [state.soundEnabled, state.atmosphere.type]);

  return null;
}
