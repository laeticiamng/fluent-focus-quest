import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ESCAPE_ZONES } from "@/data/escapeGame";
import { ESCAPE_FEEDBACK } from "@/data/escapeGame";

interface EscapeRevealProps {
  newEscapeEvents: string[];
  newUnlocks: string[];
  onDismiss: () => void;
}

const PARTICLE_COLORS = [
  "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)", "hsl(270, 60%, 60%)",
  "hsl(187, 100%, 42%)", "hsl(210, 100%, 52%)", "hsl(35, 100%, 55%)",
];

function parseEvent(event: string): { type: string; name: string; icon: string; label: string } | null {
  const [prefix, value] = event.split(":");
  if (!prefix || !value) return null;

  if (prefix === "room_solved") {
    for (const zone of ESCAPE_ZONES) {
      const room = zone.rooms.find(r => r.id === value);
      if (room) return { type: "room", name: room.name, icon: room.icon, label: ESCAPE_FEEDBACK.roomSolved };
    }
  }
  if (prefix === "fragment") {
    return { type: "fragment", name: value, icon: "🔑", label: ESCAPE_FEEDBACK.fragmentObtained };
  }
  if (prefix === "sigil") {
    return { type: "sigil", name: value, icon: "🏅", label: ESCAPE_FEEDBACK.sigilObtained };
  }
  return null;
}

export function EscapeReveal({ newEscapeEvents, newUnlocks, onDismiss }: EscapeRevealProps) {
  const [visible, setVisible] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const allEvents = [
    ...newEscapeEvents.map(e => parseEvent(e)).filter(Boolean),
    ...newUnlocks.map(id => {
      const zone = ESCAPE_ZONES.find(z => z.id === id);
      if (zone) return { type: "zone_unlock", name: zone.name, icon: zone.icon, label: ESCAPE_FEEDBACK.doorUnlocked };
      for (const z of ESCAPE_ZONES) {
        const room = z.rooms.find(r => r.id === id);
        if (room) return { type: "room_unlock", name: room.name, icon: room.icon, label: ESCAPE_FEEDBACK.roomRevealed };
      }
      return null;
    }).filter(Boolean),
  ] as Array<{ type: string; name: string; icon: string; label: string }>;

  useEffect(() => {
    if (allEvents.length > 0) {
      setVisible(true);
      setCurrentEventIndex(0);
    }
  }, [newEscapeEvents.length, newUnlocks.length]);

  useEffect(() => {
    if (!visible || allEvents.length === 0) return;

    const timer = setTimeout(() => {
      if (currentEventIndex < allEvents.length - 1) {
        setCurrentEventIndex(i => i + 1);
      } else {
        setVisible(false);
        onDismiss();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [visible, currentEventIndex, allEvents.length, onDismiss]);

  const currentEvent = allEvents[currentEventIndex];

  if (!visible || !currentEvent) return null;

  const isSigil = currentEvent.type === "sigil";
  const isRoomSolved = currentEvent.type === "room";
  const isFragment = currentEvent.type === "fragment";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-auto"
        onClick={() => { setVisible(false); onDismiss(); }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-background/70 backdrop-blur-md"
        />

        {/* Particles */}
        {Array.from({ length: isSigil ? 30 : 18 }).map((_, i) => (
          <motion.div
            key={`p-${currentEventIndex}-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${30 + Math.random() * 40}%`,
              backgroundColor: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
              y: [0, -60 - Math.random() * 80],
              x: [(Math.random() - 0.5) * 100],
            }}
            transition={{ duration: 1.2, delay: Math.random() * 0.4, ease: "easeOut" }}
          />
        ))}

        {/* Content */}
        <motion.div
          key={currentEventIndex}
          initial={{ scale: 0.6, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 250, damping: 22 }}
          className="relative z-10 max-w-sm mx-4"
        >
          <div className={`rounded-3xl border p-6 text-center shadow-2xl ${
            isSigil
              ? "bg-gradient-to-b from-amber-500/20 via-card to-card border-amber-500/30 shadow-amber-500/15"
              : isRoomSolved
              ? "bg-gradient-to-b from-success/15 via-card to-card border-success/25 shadow-success/10"
              : "bg-gradient-to-b from-primary/15 via-card to-card border-primary/25 shadow-primary/10"
          }`}>
            {/* Mechanism animation */}
            <motion.div
              animate={isSigil
                ? { rotate: [0, 360], scale: [1, 1.3, 1] }
                : { rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }
              }
              transition={{ duration: isSigil ? 1.5 : 1, delay: 0.2 }}
              className="text-5xl mb-3"
            >
              {isSigil ? "🏅" : isRoomSolved ? "🔓" : isFragment ? "🔑" : "✨"}
            </motion.div>

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-2"
            >
              <span className={`text-[10px] font-bold uppercase tracking-[3px] ${
                isSigil ? "text-amber-400" : isRoomSolved ? "text-success" : "text-primary"
              }`}>
                {currentEvent.label}
              </span>
            </motion.div>

            {/* Event name */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2"
            >
              <span className="text-2xl">{currentEvent.icon}</span>
              <span className="text-sm font-black tracking-tight">{currentEvent.name}</span>
            </motion.div>

            {/* Sigil count */}
            {isSigil && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-3 flex justify-center gap-1"
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border text-[8px] flex items-center justify-center ${
                      i < 1 ? "bg-amber-500/20 border-amber-500/40" : "bg-secondary/30 border-border/20"
                    }`}
                  >
                    {i < 1 ? "🏅" : "·"}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Progress indicator */}
            {allEvents.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 flex justify-center gap-1"
              >
                {allEvents.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === currentEventIndex ? "bg-foreground" : i < currentEventIndex ? "bg-foreground/40" : "bg-foreground/15"
                    }`}
                  />
                ))}
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-[10px] text-muted-foreground mt-4"
            >
              Tape pour continuer
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
