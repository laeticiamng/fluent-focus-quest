import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock, ChevronRight, Zap } from "lucide-react";
import { DAILY_CHAIN_STEPS, ZONES, type ZoneId } from "@/hooks/useProgress";

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

const ZONE_TAB_MAP: Record<ZoneId, Tab> = {
  forge: "vocab",
  grammar: "gram",
  studio: "iv",
  clinical: "sim",
  atelier: "atelier",
  archive: "portfolio",
};

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
        className="rounded-2xl bg-gradient-to-br from-success/15 to-amber-500/8 border border-success/25 p-5 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          className="text-4xl mb-2"
        >🏛️</motion.div>
        <p className="text-sm font-black text-success tracking-tight">Chaine du jour completee !</p>
        <p className="text-xs text-success/70 mt-1">
          {completedChains} chaine{completedChains > 1 ? "s" : ""} completee{completedChains > 1 ? "s" : ""} au total.
          Ton empire grandit.
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
            <Zap className="w-4 h-4 text-amber-400" />
            <p className="text-[10px] uppercase tracking-[3px] text-amber-400/70">Chaine du jour</p>
          </div>
          <p className="text-sm font-black tracking-tight mt-0.5">Progression sequentielle</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-amber-400">{doneCount}/{chainStatus.length}</p>
          <p className="text-[10px] text-muted-foreground">maillons</p>
        </div>
      </div>

      {/* Chain links */}
      <div className="relative">
        {/* Connection line */}
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
                      onNavigate(ZONE_TAB_MAP[step.zoneId]);
                    }
                  }}
                  disabled={isLocked}
                  className={`w-full rounded-2xl p-3.5 text-left transition-all group relative overflow-hidden ${
                    step.completed
                      ? "bg-success/5 border border-success/15 opacity-70"
                      : step.active
                      ? `bg-gradient-to-r ${colors.bg} border ${colors.border}`
                      : isLocked
                      ? "bg-secondary/20 border border-border/15 opacity-40 cursor-not-allowed"
                      : "bg-secondary/40 border border-border/30"
                  }`}
                >
                  {step.active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/3 to-transparent pointer-events-none" />
                  )}
                  <div className="flex items-center gap-3 relative z-10">
                    {/* Status node */}
                    <div className="shrink-0 relative z-10">
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4 text-muted-foreground/30" />
                      ) : step.active ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-lg"
                        >{step.icon}</motion.div>
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/30" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${
                          step.completed ? "line-through text-muted-foreground" :
                          step.active ? colors.text :
                          "text-muted-foreground"
                        }`}>
                          {step.label}
                        </span>
                        {step.active && (
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full bg-current/10 ${colors.text} animate-pulse`}>
                            EN COURS
                          </span>
                        )}
                        {!isLocked && !step.completed && step.count > 0 && (
                          <span className="text-[9px] font-bold text-amber-400 ml-auto">
                            {step.count}/{step.minCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {isLocked && !zoneUnlocked ? `Zone ${zone?.name || ""} verrouillee` :
                         isLocked ? "Complete l'etape precedente" :
                         step.completed ? "Maillon forge ✓" :
                         `Zone: ${zone?.name || ""}`}
                      </p>
                    </div>

                    {/* Arrow */}
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

      {/* CTA for next step */}
      {nextStep && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate(ZONE_TAB_MAP[nextStep.zoneId])}
          className={`w-full rounded-2xl bg-gradient-to-r ${CHAIN_COLORS[nextStep.zoneId].bg} border ${CHAIN_COLORS[nextStep.zoneId].border} p-4 text-center group`}
        >
          <span className="text-lg">{nextStep.icon}</span>
          <p className={`text-sm font-black mt-1 ${CHAIN_COLORS[nextStep.zoneId].text}`}>
            Continuer → {nextStep.activeLabel}
          </p>
        </motion.button>
      )}
    </div>
  );
}
