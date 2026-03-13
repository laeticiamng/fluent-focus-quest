import { motion } from "framer-motion";
import { PROG } from "@/data/content";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

type Tab = "dash" | "motiv" | "today" | "vocab" | "gram" | "iv" | "sim" | "tools" | "cal" | "stats" | "atelier";

interface JourneyStep {
  tab: Tab;
  icon: string;
  label: string;
  desc: string;
  duration: string;
  color: string;
  textColor: string;
}

const STEP_CONFIG: Record<string, JourneyStep> = {
  learn:   { tab: "vocab",   icon: "🧠", label: "Vocabulaire",  desc: "Flashcards + quiz du deck du jour", duration: "20 min", color: "from-info/12 to-info/5", textColor: "text-info" },
  grammar: { tab: "gram",    icon: "📐", label: "Grammaire",    desc: "Exercices interactifs du jour",     duration: "15 min", color: "from-grammar/12 to-grammar/5", textColor: "text-grammar" },
  speak:   { tab: "atelier", icon: "✨", label: "Créer",        desc: "Script Builder ou Studio",         duration: "20 min", color: "from-primary/12 to-primary/5", textColor: "text-primary" },
  write:   { tab: "atelier", icon: "✍️", label: "Rédiger",      desc: "Document Builder ou Cas patient",  duration: "25 min", color: "from-accent/12 to-accent/5", textColor: "text-accent" },
  listen:  { tab: "tools",   icon: "🎙️", label: "Écouter",      desc: "Podcast + Voice recorder",         duration: "30 min", color: "from-warning/12 to-warning/5", textColor: "text-warning" },
  review:  { tab: "vocab",   icon: "🔄", label: "Révision",     desc: "Revoir les mots difficiles",       duration: "15 min", color: "from-success/12 to-success/5", textColor: "text-success" },
  rest:    { tab: "motiv",   icon: "💆", label: "Repos actif",  desc: "VisionBoard + motivation",         duration: "10 min", color: "from-muted-foreground/8 to-transparent", textColor: "text-muted-foreground" },
};

interface DailyJourneyProps {
  onNavigate: (tab: Tab) => void;
  done: Record<string, boolean>;
}

export function DailyJourney({ onNavigate, done }: DailyJourneyProps) {
  const today = new Date().toISOString().split("T")[0];
  const todayProg = PROG.find(d => d.date === today) || PROG[0];

  // Build steps from today's tasks
  const steps: (JourneyStep & { key: string; taskDesc: string; isDone: boolean })[] = todayProg.tasks.map((task, i) => {
    const cfg = STEP_CONFIG[task.tp] || STEP_CONFIG.learn;
    return {
      ...cfg,
      key: `${todayProg.date}-${i}`,
      taskDesc: task.d,
      isDone: !!done[`${todayProg.date}-${i}`],
    };
  });

  const doneCount = steps.filter(s => s.isDone).length;
  const nextStep = steps.find(s => !s.isDone);
  const allDone = doneCount === steps.length;

  if (allDone) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-gradient-to-br from-success/15 to-success/5 border border-success/25 p-5 text-center"
      >
        <div className="text-3xl mb-2">🎉</div>
        <p className="text-sm font-black text-success tracking-tight">Parcours du jour terminé !</p>
        <p className="text-xs text-success/70 mt-1">Tu avances vers Bienne. Chaque jour compte.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground">Ton parcours du jour</p>
          <p className="text-sm font-black tracking-tight mt-0.5">{todayProg.title}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-success">{doneCount}/{steps.length}</p>
          <p className="text-[10px] text-muted-foreground">étapes</p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => {
          const isNext = step === nextStep;
          const isPast = step.isDone;

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <button
                onClick={() => onNavigate(step.tab)}
                className={`w-full rounded-2xl p-3.5 text-left transition-all group relative overflow-hidden ${
                  isPast
                    ? "bg-success/5 border border-success/15 opacity-60"
                    : isNext
                    ? `bg-gradient-to-r ${step.color} border border-current/20`
                    : "bg-secondary/40 border border-border/30 hover:border-border/50"
                }`}
              >
                {isNext && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/3 to-transparent pointer-events-none" />
                )}
                <div className="flex items-center gap-3 relative z-10">
                  {/* Status icon */}
                  <div className="shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : isNext ? (
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
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
                      <span className={`text-xs font-bold ${isPast ? "line-through text-muted-foreground" : isNext ? step.textColor : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                      {isNext && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-current/10 ${step.textColor}`}>
                          MAINTENANT
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">{step.duration}</span>
                    </div>
                    <p className={`text-[10px] mt-0.5 leading-relaxed truncate ${isPast ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                      {step.taskDesc}
                    </p>
                  </div>

                  {/* Arrow */}
                  {!isPast && (
                    <ArrowRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${isNext ? step.textColor : "text-muted-foreground/30"}`} />
                  )}
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* CTA for next step */}
      {nextStep && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate(nextStep.tab)}
          className={`w-full rounded-2xl bg-gradient-to-r ${nextStep.color} border border-current/20 p-4 text-center group`}
        >
          <span className="text-lg">{nextStep.icon}</span>
          <p className={`text-sm font-black mt-1 ${nextStep.textColor}`}>
            Continuer → {nextStep.label}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{nextStep.taskDesc}</p>
        </motion.button>
      )}
    </div>
  );
}
