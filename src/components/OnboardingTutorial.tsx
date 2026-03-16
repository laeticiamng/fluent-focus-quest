import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  highlight?: string; // tab to highlight
  tip?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Bienvenue dans le Complexe Medical",
    description: "Le Spitalzentrum Biel est verrouille. Tu es la seule personne capable de reactiver chaque aile. Chaque creation que tu fais deverrouille une nouvelle porte.",
    icon: "🏥",
  },
  {
    id: "forge",
    title: "La Forge Linguistique",
    description: "Commence par forger des phrases medicales en allemand. Chaque phrase creee reactive un systeme du complexe. C'est ta premiere mission.",
    icon: "🔨",
    highlight: "vocab",
    tip: "Astuce : retourne les flashcards et forge des phrases pour gagner des fragments de cle.",
  },
  {
    id: "progression",
    title: "Progression & Fragments",
    description: "Chaque salle resolue te donne un fragment. Assemble-les pour forger des cles qui ouvrent de nouvelles zones. Consulte ta carte pour voir ta progression.",
    icon: "🗺️",
    highlight: "questmap",
    tip: "La carte montre toutes les ailes du complexe et les portes verrouillees.",
  },
  {
    id: "inventory",
    title: "Ton Inventaire",
    description: "Les fragments, cles et Sigils de Maitrise sont stockes dans ton inventaire. Clique sur l'icone dans la barre de navigation pour les consulter.",
    icon: "📦",
    tip: "Il y a 7 Sigils de Maitrise a collecter pour activer le Protocole Lazarus.",
  },
  {
    id: "puzzles",
    title: "Enigmes du Complexe",
    description: "Des enigmes medicales sont cachees dans chaque zone. Resous-les pour gagner de l'XP bonus. Des indices sont disponibles si tu es bloque.",
    icon: "🧩",
    highlight: "puzzles",
    tip: "Utilise les indices avec parcimonie — chaque indice reduit l'XP gagne.",
  },
  {
    id: "timer",
    title: "Pression Temporelle",
    description: "Chaque mission a un timer. Plus tu resous vite, plus tu gagnes d'XP bonus. Le timer n'empeche pas de terminer, mais recompense la rapidite.",
    icon: "⏱️",
  },
  {
    id: "achievements",
    title: "Succes & Classement",
    description: "Debloque des succes en accomplissant des objectifs speciaux. Compare ta progression avec d'autres apprenants dans le classement.",
    icon: "🏆",
  },
  {
    id: "ready",
    title: "Pret a reactiver le Complexe ?",
    description: "Tu as toutes les informations. Le Protocole Lazarus attend. Commence par la Forge et progresse aile par aile. Bonne chance, Assistenzarztin !",
    icon: "🔮",
    tip: "Le complexe se souviendra de ta progression meme si tu quittes.",
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
  isFirstVisit: boolean;
}

export function OnboardingTutorial({ onComplete, isFirstVisit }: OnboardingTutorialProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(isFirstVisit);

  useEffect(() => {
    setVisible(isFirstVisit);
  }, [isFirstVisit]);

  if (!visible) return null;

  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;
  const isFirst = step === 0;

  const handleNext = () => {
    if (isLast) {
      setVisible(false);
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    setVisible(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/85 backdrop-blur-md" />

          {/* Card */}
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-10 w-full max-w-md mx-4 rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, hsl(var(--card)), hsl(225 18% 9%))",
              border: "1px solid hsl(32 95% 55% / 0.15)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 60px -12px hsl(32 95% 55% / 0.15)",
            }}
          >
            {/* Skip button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors z-20"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 pt-5 px-6">
              {TUTORIAL_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-6 bg-amber-400"
                      : i < step
                      ? "w-2 bg-amber-400/40"
                      : "w-2 bg-white/10"
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="p-6 pt-4 text-center">
              <motion.div
                key={current.id + "-icon"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="text-5xl mb-4"
              >
                {current.icon}
              </motion.div>

              <h2 className="text-lg font-black tracking-tight mb-2">{current.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {current.description}
              </p>

              {current.tip && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left mb-4"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-400/80">{current.tip}</p>
                </motion.div>
              )}
            </div>

            {/* Navigation */}
            <div className="px-6 pb-6 flex items-center justify-between">
              <button
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={isFirst}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isFirst
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <ChevronLeft className="w-3 h-3" />
                Retour
              </button>

              <span className="text-[10px] text-muted-foreground/50">
                {step + 1} / {TUTORIAL_STEPS.length}
              </span>

              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25 transition-all"
              >
                {isLast ? "Commencer" : "Suivant"}
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
