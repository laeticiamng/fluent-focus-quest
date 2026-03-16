import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REINFORCEMENT_MESSAGES = [
  "Chaque creation te rapproche de Bienne 🇨🇭",
  "Tu construis ta place en Suisse, brique par brique.",
  "Medecin assistant en angiologie : en construction ✓",
  "Tu forges ta transition de carriere.",
  "Bienne se rapproche. Continue a creer.",
  "FMH angiologie — ton objectif prend forme.",
  "Un artefact de plus vers le Gefäßzentrum 🏥",
  "Chaque creation compte. Le Dr. Attias-Widmer t'attend.",
  "Tu ne revises pas. Tu construis ta vie.",
  "Salaire x3, formation FMH, qualite de vie : tu construis tout ca.",
  "Les urgences t'ont forgee. La Suisse te recompensera.",
  "Encore une creation, encore plus proche.",
  "Tu es exactement la ou tu dois etre. Continue.",
  "Ton profil est unique. Personne d'autre ne construit comme toi.",
  "La prochaine etape de ta carriere se forge maintenant.",
];

interface CelebrationEvent {
  id: number;
  type: "task" | "day" | "quiz" | "grammar" | "level" | "streak" | "checklist" | "creation" | "milestone";
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
    messages: ["Tache completee !", "Encore une de faite 💪", "Bien joue !"],
    particleCount: 6,
  },
  day: {
    emoji: "🏛️",
    messages: ["Journee de creation COMPLETE !", "100% aujourd'hui ! Incroyable.", "Atelier du jour termine. Bienne se rapproche."],
    particleCount: 20,
  },
  quiz: {
    emoji: "⚡",
    messages: ["Bonne reponse !", "Richtig! 🎯", "Ton allemand progresse !"],
    particleCount: 4,
  },
  grammar: {
    emoji: "🌳",
    messages: ["Construction validee !", "Grammaire forgee ✓", "Richtig! +5 XP"],
    particleCount: 5,
  },
  level: {
    emoji: "🏆",
    messages: ["LEVEL UP ! Tu montes en puissance.", "Nouveau niveau ! FMH en approche.", "Niveau superieur atteint !"],
    particleCount: 25,
  },
  streak: {
    emoji: "🔥",
    messages: ["Streak ! La constance forge le succes.", "Serie en cours ! Ne lache rien.", "Regularite = maitrise. Continue."],
    particleCount: 15,
  },
  checklist: {
    emoji: "🎯",
    messages: ["Checklist Jour J complete !", "Tu es prete pour le 30 mars.", "Tout est en ordre. Bienne t'attend."],
    particleCount: 20,
  },
  creation: {
    emoji: "🔨",
    messages: [
      "Nouvelle creation forgee !",
      "Artefact materialise ! Ta maitrise grandit.",
      "Bien construit ! Chaque creation compte.",
      "Production validee ! Continue a forger.",
      "Nouvelle brique posee dans ton edifice.",
      "Ta creation est enregistree. Portfolio enrichi.",
    ],
    particleCount: 8,
  },
  milestone: {
    emoji: "👑",
    messages: [
      "MILESTONE ! Tu as franchi un cap de creation.",
      "Badge debloque ! Tu forges ta legende.",
      "Nouveau palier atteint. Architecte en devenir !",
    ],
    particleCount: 30,
  },
};

const PARTICLE_COLORS = [
  "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)", "hsl(35, 100%, 55%)",
  "hsl(270, 60%, 60%)", "hsl(187, 100%, 42%)", "hsl(210, 100%, 52%)",
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
      message: Math.random() > 0.4 ? mainMessage : reinforcement,
      particles: generateParticles(config.particleCount),
    };

    setEvents(prev => {
      // Limit to 3 simultaneous events
      const recent = prev.slice(-2);
      return [...recent, event];
    });
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

            {/* Toast message — volumetric 3D */}
            <motion.div
              className="absolute top-16 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: -20, scale: 0.85, rotateX: 15 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: -10, scale: 0.95, rotateX: -5 }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="room-3d rounded-2xl px-5 py-3.5 flex items-center gap-3 max-w-[340px] relative overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, hsl(var(--card)), hsl(var(--card) / 0.95))",
                  border: "1px solid hsl(var(--border) / 0.3)",
                  boxShadow: "var(--shadow-3d-lg), 0 8px 32px -8px hsl(0 0% 0% / 0.4)",
                }}
              >
                <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                <motion.span
                  className="text-xl"
                  animate={{ scale: [1, 1.2, 1], rotateY: [0, 180, 360] }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                >
                  {event.emoji}
                </motion.span>
                <span className="text-xs font-semibold text-foreground relative z-10">{event.message}</span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
