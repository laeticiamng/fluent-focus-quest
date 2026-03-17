import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock, ChevronRight, KeyRound } from "lucide-react";
import { DAILY_CHAIN_STEPS, ZONES, type ZoneId } from "@/hooks/useProgress";
import { ZONE_TAB_MAP } from "@/data/escapeGame";

type Tab = "dash" | "motiv" | "today" | "vocab" | "gram" | "iv" | "sim" | "tools" | "cal" | "stats" | "atelier" | "portfolio" | "questmap" | "hq";

interface ChainStep {
  id: string;
  label: string;
  activeLabel: string;
  icon: string;
  zoneId: ZoneId;
  count: number;
  minCount: number;
  completed: boolean;
  active: boolean;
  locked: boolean;
}

interface DailyChainProps {
  chainStatus: ChainStep[];
  zoneStatus: Record<ZoneId, { unlocked: boolean; progress: number; rooms: { id: string; unlocked: boolean }[] }>;
  onNavigate: (tab: Tab) => void;
  completedChains: number;
}

const CHAIN_COLORS: Record<ZoneId, { text: string; bg: string; border: string }> = {
  forge: { text: "text-amber-400", bg: "from-amber-500/12 to-amber-500/5", border: "border-amber-500/20" },
  grammar: { text: "text-emerald-400", bg: "from-emerald-500/12 to-emerald-500/5", border: "border-emerald-500/20" },
  studio: { text: "text-violet-400", bg: "from-violet-500/12 to-violet-500/5", border: "border-violet-500/20" },
  clinical: { text: "text-rose-400", bg: "from-rose-500/12 to-rose-500/5", border: "border-rose-500/20" },
  atelier: { text: "text-blue-400", bg: "from-blue-500/12 to-blue-500/5", border: "border-blue-500/20" },
  archive: { text: "text-cyan-400", bg: "from-cyan-500/12 to-cyan-500/5", border: "border-cyan-500/20" },
};

export function DailyChain({ chainStatus, zoneStatus, onNavigate, completedChains }: DailyChainProps) {
  const doneCount = chainStatus.filter(s => s.completed).length;
  const allDone = doneCount === chainStatus.length;
  const nextStep = chainStatus.find(s => s.active);

  if (allDone) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl room-3d room-solved p-6 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, hsl(142 71% 45% / 0.1), hsl(var(--card)), hsl(32 95% 55% / 0.05))",
          border: "1px solid hsl(142 71% 45% / 0.2)",
          boxShadow: "var(--shadow-3d-xl), 0 0 40px -12px hsl(142 71% 45% / 0.15)",
        }}
      >
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
        <motion.div
          animate={{ rotateY: [0, 360], scale: [1, 1.15, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
          className="text-4xl mb-3 inline-block"
        >🔓</motion.div>
        <p className="text-sm font-black text-emerald-400 tracking-tight">Protocole quotidien complete</p>
        <p className="text-[10px] text-emerald-400/50 mt-1">
          {completedChains} protocole{completedChains > 1 ? "s" : ""} complete{completedChains > 1 ? "s" : ""}.
          Chaque protocole renforce ta progression dans le Complexe.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-[10px] uppercase tracking-[3px] text-amber-400/70">Protocole du jour</p>
          </div>
          <p className="text-xs font-black tracking-tight mt-0.5">Sequence de deblocage</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-amber-400">{doneCount}/{chainStatus.length}</p>
          <p className="text-[9px] text-muted-foreground">etapes</p>
        </div>
      </div>

      {/* Chain links */}
      <div className="relative">
        <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-border/30" />

        <div className="space-y-2">
          {chainStatus.map((step, i) => {
            const colors = CHAIN_COLORS[step.zoneId];
            const zone = ZONES.find(z => z.id === step.zoneId);
            const zoneUnlocked = zoneStatus[step.zoneId]?.unlocked;
            const isLocked = step.locked || !zoneUnlocked;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <button
                  onClick={() => {
                    if (!isLocked && !step.completed) {
                      onNavigate(ZONE_TAB_MAP[step.zoneId] as Tab);
                    }
                  }}
                  disabled={isLocked}
                  className={`w-full rounded-2xl p-3 text-left transition-all group relative overflow-hidden room-3d ${
                    step.completed
                      ? "room-solved"
                      : step.active
                      ? "room-in-progress"
                      : isLocked
                      ? "room-locked cursor-not-allowed"
                      : "room-accessible"
                  }`}
                  style={{
                    background: step.completed
                      ? "linear-gradient(145deg, hsl(142 71% 45% / 0.06), hsl(var(--card)))"
                      : step.active
                      ? `linear-gradient(145deg, ${colors.text.replace('text-', 'hsl(').replace('-400', ' 60% 55%')} / 0.08), hsl(var(--card)))`
                      : undefined,
                    border: step.completed ? "1px solid hsl(142 71% 45% / 0.12)" : undefined,
                    boxShadow: step.active ? "var(--shadow-3d-md)" : "var(--shadow-3d-sm)",
                    opacity: isLocked ? 0.4 : step.completed ? 0.7 : 1,
                  }}
                >
                  {step.active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/3 to-transparent pointer-events-none" />
                  )}
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="shrink-0 relative z-10">
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4 text-muted-foreground/30" />
                      ) : step.active ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-base"
                        >{step.icon}</motion.div>
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/30" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold ${
                          step.completed ? "line-through text-muted-foreground" :
                          step.active ? colors.text :
                          "text-muted-foreground"
                        }`}>
                          {step.label}
                        </span>
                        {step.active && (
                          <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-current/10 ${colors.text} animate-pulse`}>
                            ACTIF
                          </span>
                        )}
                        {!isLocked && !step.completed && step.count > 0 && (
                          <span className="text-[9px] font-bold text-amber-400 ml-auto">
                            {step.count}/{step.minCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {isLocked && !zoneUnlocked ? (zone?.unlockHint || `Aile ${zone?.name || ""} verrouillee`) :
                         isLocked ? "Complete l'etape precedente d'abord" :
                         step.completed ? "Mecanisme active" :
                         `Aile: ${zone?.name || ""}`}
                      </p>
                    </div>

                    {step.active && (
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${colors.text}`} />
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {nextStep && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate(ZONE_TAB_MAP[nextStep.zoneId] as Tab)}
          className={`w-full rounded-2xl bg-gradient-to-r ${CHAIN_COLORS[nextStep.zoneId].bg} border ${CHAIN_COLORS[nextStep.zoneId].border} p-3.5 text-center group`}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-base">{nextStep.icon}</span>
            <p className={`text-xs font-black ${CHAIN_COLORS[nextStep.zoneId].text}`}>
              Continuer → {nextStep.activeLabel}
            </p>
          </div>
        </motion.button>
      )}
    </div>
  );
}
