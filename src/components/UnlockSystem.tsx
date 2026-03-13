import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, ChevronRight } from "lucide-react";
import { ZONES, type ZoneId } from "@/hooks/useProgress";

// ===== UNLOCK REVEAL OVERLAY =====
interface UnlockRevealProps {
  newUnlocks: string[];
  onDismiss: () => void;
}

const PARTICLE_COLORS = [
  "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)", "hsl(270, 60%, 60%)",
  "hsl(187, 100%, 42%)", "hsl(210, 100%, 52%)", "hsl(35, 100%, 55%)",
];

export function UnlockReveal({ newUnlocks, onDismiss }: UnlockRevealProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (newUnlocks.length > 0) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [newUnlocks, onDismiss]);

  // Resolve names from IDs
  const unlockNames = newUnlocks.map(id => {
    const zone = ZONES.find(z => z.id === id);
    if (zone) return { type: "zone" as const, name: zone.name, icon: zone.icon };
    for (const z of ZONES) {
      const room = z.rooms.find(r => r.id === id);
      if (room) return { type: "room" as const, name: room.name, icon: room.icon };
    }
    return { type: "unknown" as const, name: id, icon: "✨" };
  });

  return (
    <AnimatePresence>
      {visible && unlockNames.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-auto"
          onClick={() => { setVisible(false); onDismiss(); }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />

          {/* Particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${30 + Math.random() * 40}%`,
                backgroundColor: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                y: [0, -80 - Math.random() * 100],
                x: [(Math.random() - 0.5) * 120],
              }}
              transition={{ duration: 1.5, delay: Math.random() * 0.5, ease: "easeOut" }}
            />
          ))}

          {/* Content */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative z-10 max-w-sm mx-4"
          >
            <div className="rounded-3xl bg-gradient-to-b from-amber-500/15 via-card to-card border border-amber-500/25 p-6 text-center shadow-2xl shadow-amber-500/10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-5xl mb-3"
              >
                🔓
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-black tracking-tight text-amber-400 mb-2"
              >
                {unlockNames[0].type === "zone" ? "Nouvelle zone !" : "Nouvelle salle !"}
              </motion.p>

              {unlockNames.map((u, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.15 }}
                  className="flex items-center justify-center gap-2 mt-2"
                >
                  <span className="text-2xl">{u.icon}</span>
                  <span className="text-sm font-bold">{u.name}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold uppercase">
                    {u.type === "zone" ? "Zone" : "Salle"}
                  </span>
                </motion.div>
              ))}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-[10px] text-muted-foreground mt-4"
              >
                Tape pour continuer
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ===== LOCKED ZONE PREVIEW =====
interface LockedZonePreviewProps {
  zoneId: ZoneId;
  unlockHint: string;
}

export function LockedZonePreview({ zoneId, unlockHint }: LockedZonePreviewProps) {
  const zone = ZONES.find(z => z.id === zoneId);
  if (!zone) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-secondary/20 border border-border/20 p-5 text-center relative overflow-hidden"
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-background/30 z-10" />

      <div className="relative z-20">
        <Lock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm font-black text-muted-foreground/50">{zone.name}</p>
        <p className="text-[10px] text-muted-foreground/40 mt-1 leading-relaxed">{zone.description}</p>
        <div className="mt-3 rounded-full bg-amber-500/10 border border-amber-500/15 px-4 py-1.5 inline-block">
          <p className="text-[10px] font-bold text-amber-400/70">
            🔒 {unlockHint}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ===== NEXT UNLOCK CARD =====
interface NextUnlockCardProps {
  artifacts: { length: number };
  zoneStatus: Record<ZoneId, { unlocked: boolean; progress: number; rooms: { id: string; unlocked: boolean }[] }>;
}

export function NextUnlockCard({ artifacts, zoneStatus }: NextUnlockCardProps) {
  // Find next locked zone
  const nextZone = ZONES.find(z => !zoneStatus[z.id]?.unlocked);
  if (!nextZone) {
    // Find next locked room
    for (const zone of ZONES) {
      if (!zoneStatus[zone.id]?.unlocked) continue;
      const nextRoom = zone.rooms.find(r => !zoneStatus[zone.id]?.rooms.find(rr => rr.id === r.id && rr.unlocked));
      if (nextRoom) {
        return (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-r from-amber-500/8 to-transparent border border-amber-500/15 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-lg">
                🔒
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[2px] text-amber-400/60">Prochaine salle</p>
                <p className="text-xs font-bold">{nextRoom.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{nextRoom.unlockHint}</p>
              </div>
              <Sparkles className="w-4 h-4 text-amber-400/40" />
            </div>
          </motion.div>
        );
      }
    }
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-500/3 border border-amber-500/20 p-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-lg">
          🔒
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[2px] text-amber-400/60">Prochaine zone</p>
          <p className="text-xs font-bold">{nextZone.name} {nextZone.icon}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{nextZone.unlockHint}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-amber-400/40" />
      </div>
    </motion.div>
  );
}
