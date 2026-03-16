import { motion } from "framer-motion";
import { Lock, ChevronRight, Sparkles, Shield } from "lucide-react";
import { ZONES, type ZoneId } from "@/hooks/useProgress";
import { getBuilderRank } from "@/data/content";

interface QuestMapProps {
  zoneStatus: Record<ZoneId, { unlocked: boolean; progress: number; rooms: { id: string; unlocked: boolean }[] }>;
  currentZoneId: ZoneId;
  onSelectZone: (zoneId: ZoneId) => void;
  onNavigate: (tab: string) => void;
  xp?: number;
}

const ZONE_TAB_MAP: Record<ZoneId, string> = {
  forge: "vocab",
  grammar: "gram",
  studio: "iv",
  clinical: "sim",
  atelier: "atelier",
  archive: "portfolio",
};

const ZONE_FLAVOR: Record<ZoneId, { tagline: string; atmosphere: string }> = {
  forge: { tagline: "Construis ton arsenal linguistique", atmosphere: "L'enclume attend tes premieres phrases" },
  grammar: { tagline: "Deverrouille l'architecture de ta grammaire", atmosphere: "Chaque branche est un pouvoir grammatical" },
  studio: { tagline: "Forge tes reponses comme un professionnel", atmosphere: "Ta voix prend forme ici" },
  clinical: { tagline: "Raisonnement clinique en allemand medical", atmosphere: "Chaque patient est une mission" },
  atelier: { tagline: "9 salles de creation avancee", atmosphere: "Ton laboratoire de production" },
  archive: { tagline: "Ta collection d'artefacts et ta progression", atmosphere: "Tout ce que tu as construit, rassemble ici" },
};

const ZONE_COLORS: Record<string, { bg: string; border: string; text: string; glow: string; accent: string }> = {
  amber: { bg: "from-amber-500/15 to-amber-500/5", border: "border-amber-500/25", text: "text-amber-400", glow: "shadow-amber-500/20", accent: "bg-amber-500" },
  grammar: { bg: "from-emerald-500/15 to-emerald-500/5", border: "border-emerald-500/25", text: "text-emerald-400", glow: "shadow-emerald-500/20", accent: "bg-emerald-500" },
  accent: { bg: "from-violet-500/15 to-violet-500/5", border: "border-violet-500/25", text: "text-violet-400", glow: "shadow-violet-500/20", accent: "bg-violet-500" },
  clinical: { bg: "from-rose-500/15 to-rose-500/5", border: "border-rose-500/25", text: "text-rose-400", glow: "shadow-rose-500/20", accent: "bg-rose-500" },
  primary: { bg: "from-blue-500/15 to-blue-500/5", border: "border-blue-500/25", text: "text-blue-400", glow: "shadow-blue-500/20", accent: "bg-blue-500" },
  info: { bg: "from-cyan-500/15 to-cyan-500/5", border: "border-cyan-500/25", text: "text-cyan-400", glow: "shadow-cyan-500/20", accent: "bg-cyan-500" },
};

export function QuestMap({ zoneStatus, currentZoneId, onSelectZone, onNavigate, xp = 0 }: QuestMapProps) {
  const totalZones = ZONES.length;
  const unlockedCount = Object.values(zoneStatus).filter(z => z.unlocked).length;
  const totalRooms = ZONES.reduce((a, z) => a + z.rooms.length, 0);
  const unlockedRooms = Object.values(zoneStatus).reduce((a, z) => a + z.rooms.filter(r => r.unlocked).length, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-3xl"
          >🗺️</motion.span>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Carte des Quetes</h2>
            <p className="text-xs text-muted-foreground">
              {unlockedCount}/{totalZones} zones · {unlockedRooms}/{totalRooms} salles explorees
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5">
          <Shield className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400">{Math.round((unlockedRooms / totalRooms) * 100)}%</span>
        </div>
      </div>

      {/* Global progress */}
      <div className="h-1.5 bg-secondary/40 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(unlockedRooms / totalRooms) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-amber-500/60 to-amber-400/40"
        />
      </div>

      {/* Zone path — vertical connected nodes */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-amber-500/30 via-border/30 to-border/10" />

        <div className="space-y-3">
          {ZONES.map((zone, i) => {
            const status = zoneStatus[zone.id];
            const colors = ZONE_COLORS[zone.color] || ZONE_COLORS.amber;
            const flavor = ZONE_FLAVOR[zone.id];
            const isCurrent = currentZoneId === zone.id;
            const isLocked = !status.unlocked;
            const isComplete = status.progress === 1;

            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <button
                  onClick={() => {
                    if (!isLocked) {
                      onSelectZone(zone.id);
                      onNavigate(ZONE_TAB_MAP[zone.id]);
                    }
                  }}
                  disabled={isLocked}
                  className={`w-full relative rounded-2xl p-4 sm:p-5 text-left transition-all group ${
                    isLocked
                      ? "opacity-50 cursor-not-allowed bg-secondary/30 border border-border/20"
                      : isCurrent
                      ? `bg-gradient-to-r ${colors.bg} border ${colors.border} shadow-lg ${colors.glow}`
                      : `bg-gradient-to-r ${colors.bg} border border-border/30 hover:${colors.border} hover:shadow-md`
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Zone icon node */}
                    <div className={`relative z-10 w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110 ${
                      isLocked ? "bg-secondary border border-border/40" :
                      isCurrent ? `bg-gradient-to-br ${colors.bg} border ${colors.border}` :
                      "bg-card border border-border/40"
                    }`}>
                      {isLocked ? <Lock className="w-5 h-5 text-muted-foreground/50" /> : zone.icon}
                      {isCurrent && !isLocked && (
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-1 -right-1"
                        >
                          <Sparkles className={`w-4 h-4 ${colors.text}`} />
                        </motion.div>
                      )}
                    </div>

                    {/* Zone info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-black tracking-tight ${isLocked ? "text-muted-foreground" : ""}`}>
                          {zone.name}
                        </span>
                        {isComplete && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-success/15 text-success uppercase tracking-wider">Complete</span>
                        )}
                        {isCurrent && !isLocked && !isComplete && (
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-current/10 ${colors.text} uppercase tracking-wider`}>Active</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        {isLocked ? `🔒 ${zone.unlockHint}` : flavor.tagline}
                      </p>

                      {/* Room progress chips */}
                      {!isLocked && (
                        <div className="flex gap-1.5 mt-2.5 flex-wrap">
                          {status.rooms.map((room, ri) => {
                            const roomDef = zone.rooms[ri];
                            return (
                              <div
                                key={room.id}
                                className={`flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 rounded-full transition-all ${
                                  room.unlocked
                                    ? `bg-background/50 ${colors.text}`
                                    : "bg-secondary/50 text-muted-foreground/50"
                                }`}
                                title={roomDef?.unlockHint || ""}
                              >
                                {room.unlocked ? roomDef?.icon : <Lock className="w-2.5 h-2.5" />}
                                <span>{roomDef?.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Arrow / Status */}
                    {!isLocked && (
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <span className={`text-xs font-black ${colors.text}`}>{Math.round(status.progress * 100)}%</span>
                        <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${colors.text} opacity-50 group-hover:opacity-100`} />
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {!isLocked && (
                    <div className="mt-3 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${status.progress * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${colors.bg.replace("/15", "/60").replace("/5", "/30")}`}
                      />
                    </div>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="card-elevated rounded-2xl p-4">
        <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-3">Comment debloquer</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="w-5 text-center">🔨</span>
            <span>Chaque creation (phrase, regle, reponse, diagnostic) te rapproche du deblocage suivant</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="w-5 text-center">🔓</span>
            <span>Les zones se debloquent en sequence — la progression dans une zone ouvre la suivante</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="w-5 text-center">⭐</span>
            <span>Chaque salle a ses propres conditions — construis pour explorer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
