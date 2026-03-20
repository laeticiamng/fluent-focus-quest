// ── Sound Bridge ──
// Connects the experience event bus to the SoundController.
// Listens for domain events and triggers the appropriate procedural sounds.
// Must be rendered inside ExperienceProvider.

import { useEffect } from "react";
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
};

export function SoundBridge() {
  const { state } = useExperience();

  // Sync sound controller enabled state with experience store
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

  return null;
}
