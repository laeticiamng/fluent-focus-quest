// ── Experience Event Bus ──
// Decoupled event system that connects domain events to experience responses.
// Domain code fires events; the experience layer listens and reacts.

import type { ExperienceEvent, ExperienceEventType } from "./experience-types";

type EventListener = (event: ExperienceEvent) => void;

class ExperienceEventBus {
  private listeners = new Map<ExperienceEventType | "*", Set<EventListener>>();

  /** Subscribe to a specific event type, or "*" for all */
  on(type: ExperienceEventType | "*", listener: EventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  /** Fire an experience event */
  emit(type: ExperienceEventType, payload?: Record<string, unknown>): void {
    const event: ExperienceEvent = {
      type,
      payload,
      timestamp: Date.now(),
    };

    // Notify specific listeners
    this.listeners.get(type)?.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.warn(`[ExperienceEvent] Error in listener for ${type}:`, e);
      }
    });

    // Notify wildcard listeners
    this.listeners.get("*")?.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.warn(`[ExperienceEvent] Error in wildcard listener:`, e);
      }
    });
  }

  /** Remove all listeners */
  clear(): void {
    this.listeners.clear();
  }
}

/** Singleton event bus for the experience layer */
export const experienceEvents = new ExperienceEventBus();
