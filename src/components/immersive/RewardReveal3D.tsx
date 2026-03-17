import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ESCAPE_ZONES, ESCAPE_FEEDBACK } from "@/data/escapeGame";

interface RewardReveal3DProps {
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
  if (prefix === "fragment") return { type: "fragment", name: value, icon: "🔑", label: ESCAPE_FEEDBACK.fragmentObtained };
  if (prefix === "sigil") return { type: "sigil", name: value, icon: "🏅", label: ESCAPE_FEEDBACK.sigilObtained };
  return null;
}

export function RewardReveal3D({ newEscapeEvents, newUnlocks, onDismiss }: RewardReveal3DProps) {
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
    if (allEvents.length > 0) { setVisible(true); setCurrentEventIndex(0); }
  }, [newEscapeEvents.length, newUnlocks.length]);

  // Auto-advance between multiple events, but let the user dismiss the last one manually
  useEffect(() => {
    if (!visible || allEvents.length === 0) return;
    // Only auto-advance if there are more events after this one
    if (currentEventIndex < allEvents.length - 1) {
      const timer = setTimeout(() => {
        setCurrentEventIndex(i => i + 1);
      }, 3500);
      return () => clearTimeout(timer);
    }
    // For the last event: no auto-dismiss — user must tap
  }, [visible, currentEventIndex, allEvents.length]);

  const currentEvent = allEvents[currentEventIndex];
  if (!visible || !currentEvent) return null;

  const isSigil = currentEvent.type === "sigil";
  const isRoomSolved = currentEvent.type === "room";
  const isFragment = currentEvent.type === "fragment";
  const isUnlock = currentEvent.type === "zone_unlock" || currentEvent.type === "room_unlock";

  const accentColor = isSigil ? "amber" : isRoomSolved ? "success" : isUnlock ? "primary" : "primary";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-auto"
        onClick={() => { setVisible(false); onDismiss(); }}
      >
        {/* Deep backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-lg"
        />

        {/* Radial glow behind reward */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.6, 0.3] }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, hsl(var(--${accentColor}) / 0.2), transparent 70%)`,
            filter: "blur(40px)",
          }}
        />

        {/* Glow ring animation */}
        <motion.div
          className="absolute w-48 h-48 rounded-full border-2 pointer-events-none reward-glow-ring"
          style={{
            borderColor: `hsl(var(--${accentColor}) / 0.3)`,
            boxShadow: `0 0 30px hsl(var(--${accentColor}) / 0.15)`,
          }}
        />

        {/* Particle burst */}
        {Array.from({ length: isSigil ? 40 : 24 }).map((_, i) => {
          const angle = (i / (isSigil ? 40 : 24)) * Math.PI * 2;
          const distance = 60 + Math.random() * 120;
          return (
            <motion.div
              key={`p-${currentEventIndex}-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                backgroundColor: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
              }}
              initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance - 30,
              }}
              transition={{ duration: 1.4, delay: 0.1 + Math.random() * 0.3, ease: "easeOut" }}
            />
          );
        })}

        {/* Content card */}
        <motion.div
          key={currentEventIndex}
          initial={{ scale: 0.5, opacity: 0, y: 40, rotateX: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.05 }}
          className="relative z-10 max-w-sm mx-4 perspective-card-3d"
        >
          <div className={`rounded-3xl border p-8 text-center relative overflow-hidden
            ${isSigil
              ? "bg-gradient-to-b from-amber-500/15 via-card to-card border-amber-500/25"
              : isRoomSolved
              ? "bg-gradient-to-b from-success/12 via-card to-card border-success/20"
              : "bg-gradient-to-b from-primary/12 via-card to-card border-primary/20"
            }`}
            style={{
              boxShadow: `var(--shadow-3d-xl), 0 0 80px -16px hsl(var(--${accentColor}) / 0.25)`,
            }}
          >
            {/* Top light reflection */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Volumetric inner light */}
            <div className="absolute inset-0 pointer-events-none">
              <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-[50px] opacity-20
                ${isSigil ? "bg-amber-500" : isRoomSolved ? "bg-emerald-500" : "bg-blue-500"}`}
              />
            </div>

            {/* Reward icon with 3D drop animation */}
            <motion.div
              className="reward-drop text-6xl mb-4 relative z-10 inline-block"
              animate={isSigil
                ? { rotateY: [0, 360], scale: [1, 1.2, 1] }
                : isRoomSolved
                ? { rotateZ: [0, -10, 10, -5, 5, 0], scale: [1, 1.1, 1] }
                : { y: [0, -8, 0], scale: [1, 1.08, 1] }
              }
              transition={{ duration: isSigil ? 2 : 1.5, delay: 0.4 }}
            >
              {isSigil ? "🏅" : isRoomSolved ? "🔓" : isFragment ? "🔑" : "✨"}
            </motion.div>

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-2 relative z-10"
            >
              <span className={`text-[10px] font-bold uppercase tracking-[4px] ${
                isSigil ? "text-amber-400" : isRoomSolved ? "text-success" : "text-primary"
              }`}>
                {currentEvent.label}
              </span>
            </motion.div>

            {/* Event name with icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 300 }}
              className="flex items-center justify-center gap-3 relative z-10"
            >
              <span className="text-2xl">{currentEvent.icon}</span>
              <span className="text-base font-black tracking-tight">{currentEvent.name}</span>
            </motion.div>

            {/* Sigil slots */}
            {isSigil && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 flex justify-center gap-2 relative z-10"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                    className={`w-5 h-5 rounded-full border text-[8px] flex items-center justify-center ${
                      i < 1 ? "sigil-3d bg-amber-500/25 border-amber-500/40" : "bg-secondary/20 border-border/20"
                    }`}
                  >
                    {i < 1 ? "🏅" : "·"}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Event counter */}
            {allEvents.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-5 flex justify-center gap-1.5 relative z-10"
              >
                {allEvents.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${
                    i === currentEventIndex ? "bg-foreground scale-110" : i < currentEventIndex ? "bg-foreground/40" : "bg-foreground/15"
                  }`} />
                ))}
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-[10px] text-muted-foreground mt-5 relative z-10"
            >
              {currentEventIndex < allEvents.length - 1 ? "Tape pour continuer" : "Tape pour avancer"}
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
