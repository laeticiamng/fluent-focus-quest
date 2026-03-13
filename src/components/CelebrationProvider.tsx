import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REINFORCEMENT_MESSAGES = [
  "Chaque point te rapproche de Bienne 🇨🇭",
  "Tu construis ta place en Suisse, pas à pas.",
  "Médecin assistant en angiologie : en cours ✓",
  "Tu avances vers une vraie transition de carrière.",
  "Bienne se rapproche. Continue.",
  "FMH angiologie — ton objectif prend forme.",
  "Un pas de plus vers le Gefäßzentrum 🏥",
  "Chaque effort compte. Le Dr. Attias-Widmer t'attend.",
  "Tu ne révises pas pour réviser. Tu prépares ta vie.",
  "Salaire x3, formation FMH, qualité de vie : tu y es presque.",
  "Les urgences t'ont forgée. La Suisse te récompensera.",
  "Encore un mot, encore un point, encore plus proche.",
  "Tu es exactement là où tu dois être. Continue.",
  "Ton profil est unique. Personne d'autre n'est toi.",
  "La prochaine étape de ta carrière se joue maintenant.",
];

interface CelebrationEvent {
  id: number;
  type: "task" | "day" | "quiz" | "grammar" | "level" | "streak" | "checklist";
  emoji: string;
  message: string;
  particles: { x: number; y: number; color: string; delay: number }[];
}

interface CelebrationContextType {
  celebrate: (type: CelebrationEvent["type"]) => void;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

const CelebrationContext = createContext<CelebrationContextType>({
  celebrate: () => {}, enabled: true, setEnabled: () => {},
});

export const useCelebration = () => useContext(CelebrationContext);

const CELEBRATION_CONFIG: Record<CelebrationEvent["type"], { emoji: string; messages: string[]; particleCount: number }> = {
  task: {
    emoji: "✅",
    messages: ["Tâche complétée !", "Encore une de faite 💪", "Bien joué !"],
    particleCount: 6,
  },
  day: {
    emoji: "🎉",
    messages: ["Journée COMPLÈTE ! Tu es une machine.", "100% aujourd'hui ! Incroyable.", "Journée parfaite. Bienne se rapproche."],
    particleCount: 20,
  },
  quiz: {
    emoji: "⚡",
    messages: ["Bonne réponse !", "Richtig! 🎯", "Ton allemand progresse !"],
    particleCount: 4,
  },
  grammar: {
    emoji: "📐",
    messages: ["Exercice réussi !", "Grammaire : check ✓", "Richtig! +10 XP"],
    particleCount: 5,
  },
  level: {
    emoji: "🏆",
    messages: ["LEVEL UP ! Tu montes en puissance.", "Nouveau niveau ! FMH en approche.", "Niveau supérieur atteint !"],
    particleCount: 25,
  },
  streak: {
    emoji: "🔥",
    messages: ["Streak ! La constance paie.", "Série en cours ! Ne lâche rien.", "Régularité = succès. Continue."],
    particleCount: 15,
  },
  checklist: {
    emoji: "🎯",
    messages: ["Checklist Jour J complète !", "Tu es prête pour le 30 mars.", "Tout est en ordre. Bienne t'attend."],
    particleCount: 20,
  },
};

const PARTICLE_COLORS = [
  "hsl(142, 71%, 45%)", "hsl(210, 100%, 52%)", "hsl(35, 100%, 55%)",
  "hsl(270, 60%, 60%)", "hsl(187, 100%, 42%)", "hsl(38, 92%, 50%)",
];

let eventId = 0;

function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 40 + 30,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    delay: Math.random() * 0.3,
  }));
}

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CelebrationEvent[]>([]);
  const [enabled, setEnabled] = useState(true);

  const celebrate = useCallback((type: CelebrationEvent["type"]) => {
    if (!enabled) return;
    const config = CELEBRATION_CONFIG[type];
    const reinforcement = REINFORCEMENT_MESSAGES[Math.floor(Math.random() * REINFORCEMENT_MESSAGES.length)];
    const mainMessage = config.messages[Math.floor(Math.random() * config.messages.length)];
    const id = ++eventId;

    const event: CelebrationEvent = {
      id,
      type,
      emoji: config.emoji,
      message: Math.random() > 0.5 ? mainMessage : reinforcement,
      particles: generateParticles(config.particleCount),
    };

    setEvents(prev => [...prev, event]);
    setTimeout(() => setEvents(prev => prev.filter(e => e.id !== id)), 2500);
  }, [enabled]);

  return (
    <CelebrationContext.Provider value={{ celebrate, enabled, setEnabled }}>
      {children}
      <CelebrationOverlay events={events} />
    </CelebrationContext.Provider>
  );
}

function CelebrationOverlay({ events }: { events: CelebrationEvent[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <AnimatePresence>
        {events.map(event => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Particles */}
            {event.particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ left: `${p.x}%`, top: `${p.y}%`, backgroundColor: p.color }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                  y: [0, -60 - Math.random() * 80],
                  x: [(Math.random() - 0.5) * 80],
                }}
                transition={{ duration: 1.2 + Math.random() * 0.5, delay: p.delay, ease: "easeOut" }}
              />
            ))}

            {/* Toast message */}
            <motion.div
              className="absolute top-16 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="glass rounded-2xl px-5 py-3 flex items-center gap-2.5 shadow-lg max-w-[320px]">
                <span className="text-xl">{event.emoji}</span>
                <span className="text-xs font-semibold text-foreground">{event.message}</span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
