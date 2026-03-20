// ── RewardReveal3D ──
// Bridge component: maps escape-game events to UnlockRevealV2's environmental reveals.
// Keeps the same external interface for backward compatibility.

import { useEffect, useState, useMemo } from "react";
import { ESCAPE_ZONES, ESCAPE_FEEDBACK } from "@/data/escapeGame";
import { UnlockRevealV2 } from "@/experience";

interface RewardReveal3DProps {
  newEscapeEvents: string[];
  newUnlocks: string[];
  onDismiss: () => void;
}

type UnlockEventType = "room" | "zone" | "sigil" | "fragment" | "achievement";

interface UnlockEvent {
  type: UnlockEventType;
  id: string;
  name: string;
  icon: string;
  label: string;
}

function parseEvent(event: string): UnlockEvent | null {
  const [prefix, value] = event.split(":");
  if (!prefix || !value) return null;
  if (prefix === "room_solved") {
    for (const zone of ESCAPE_ZONES) {
      const room = zone.rooms.find(r => r.id === value);
      if (room) return { type: "room", id: value, name: room.name, icon: room.icon, label: ESCAPE_FEEDBACK.roomSolved };
    }
  }
  if (prefix === "fragment") return { type: "fragment", id: value, name: value, icon: "🔑", label: ESCAPE_FEEDBACK.fragmentObtained };
  if (prefix === "sigil") return { type: "sigil", id: value, name: value, icon: "🏅", label: ESCAPE_FEEDBACK.sigilObtained };
  return null;
}

export function RewardReveal3D({ newEscapeEvents, newUnlocks, onDismiss }: RewardReveal3DProps) {
  const [visible, setVisible] = useState(false);

  const allEvents: UnlockEvent[] = useMemo(() => [
    ...newEscapeEvents.map(e => parseEvent(e)).filter(Boolean) as UnlockEvent[],
    ...newUnlocks.map(id => {
      const zone = ESCAPE_ZONES.find(z => z.id === id);
      if (zone) return { type: "zone" as const, id, name: zone.name, icon: zone.icon, label: ESCAPE_FEEDBACK.doorUnlocked };
      for (const z of ESCAPE_ZONES) {
        const room = z.rooms.find(r => r.id === id);
        if (room) return { type: "room" as const, id, name: room.name, icon: room.icon, label: ESCAPE_FEEDBACK.roomRevealed };
      }
      return null;
    }).filter(Boolean) as UnlockEvent[],
  ], [newEscapeEvents, newUnlocks]);

  useEffect(() => {
    if (allEvents.length > 0) setVisible(true);
  }, [newEscapeEvents.length, newUnlocks.length]);

  if (!visible || allEvents.length === 0) return null;

  return (
    <UnlockRevealV2
      events={allEvents}
      onComplete={() => {
        setVisible(false);
        onDismiss();
      }}
    />
  );
}
