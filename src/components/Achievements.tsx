import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Lock, Star, Flame, Sparkles, Puzzle, BookOpen, Mic, Stethoscope, FlaskConical } from "lucide-react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "progression" | "creation" | "puzzle" | "streak" | "mastery" | "speed";
  rarity: "common" | "rare" | "epic" | "legendary";
  condition: (stats: AchievementStats) => boolean;
  xpReward: number;
}

export interface AchievementStats {
  totalArtifacts: number;
  totalXp: number;
  streak: number;
  solvedRooms: number;
  solvedPuzzles: number;
  sigilsCollected: number;
  phraseCount: number;
  grammarCount: number;
  interviewCount: number;
  clinicalCount: number;
  atelierCount: number;
  completedChains: number;
  pomodoroCount: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Progression
  { id: "first_steps", title: "Premiers Pas", description: "Cree ton premier artefact", icon: "👣", category: "progression", rarity: "common", condition: s => s.totalArtifacts >= 1, xpReward: 10 },
  { id: "room_breaker", title: "Briseur de Serrures", description: "Resous ta premiere salle", icon: "🔓", category: "progression", rarity: "common", condition: s => s.solvedRooms >= 1, xpReward: 20 },
  { id: "zone_explorer", title: "Explorateur d'Ailes", description: "Resous au moins 1 salle dans 3 zones differentes", icon: "🗺️", category: "progression", rarity: "rare", condition: s => s.solvedRooms >= 3, xpReward: 50 },
  { id: "half_complex", title: "Demi-Complexe", description: "Resous 9 salles du complexe", icon: "🏥", category: "progression", rarity: "epic", condition: s => s.solvedRooms >= 9, xpReward: 100 },
  { id: "full_complex", title: "Maitre du Complexe", description: "Resous toutes les salles", icon: "👑", category: "progression", rarity: "legendary", condition: s => s.solvedRooms >= 18, xpReward: 500 },

  // Creation
  { id: "creator_10", title: "Artisan", description: "Cree 10 artefacts", icon: "🧱", category: "creation", rarity: "common", condition: s => s.totalArtifacts >= 10, xpReward: 15 },
  { id: "creator_25", title: "Constructeur", description: "Cree 25 artefacts", icon: "🏗️", category: "creation", rarity: "rare", condition: s => s.totalArtifacts >= 25, xpReward: 30 },
  { id: "creator_50", title: "Architecte", description: "Cree 50 artefacts", icon: "🏛️", category: "creation", rarity: "epic", condition: s => s.totalArtifacts >= 50, xpReward: 75 },
  { id: "creator_100", title: "Legende", description: "Cree 100 artefacts", icon: "⭐", category: "creation", rarity: "legendary", condition: s => s.totalArtifacts >= 100, xpReward: 200 },
  { id: "forge_master", title: "Maitre Forgeron", description: "Forge 30 phrases", icon: "🔨", category: "creation", rarity: "epic", condition: s => s.phraseCount >= 30, xpReward: 60 },
  { id: "grammar_guru", title: "Guru Grammatical", description: "Complete 20 exercices de grammaire", icon: "🌳", category: "creation", rarity: "epic", condition: s => s.grammarCount >= 20, xpReward: 60 },
  { id: "voice_of_biel", title: "La Voix de Biel", description: "Prepare 15 reponses d'entretien", icon: "🎙️", category: "creation", rarity: "epic", condition: s => s.interviewCount >= 15, xpReward: 60 },
  { id: "clinical_expert", title: "Expert Clinique", description: "Construis 10 dossiers cliniques", icon: "🩺", category: "creation", rarity: "epic", condition: s => s.clinicalCount >= 10, xpReward: 60 },

  // Puzzle
  { id: "first_puzzle", title: "Premier Enigme", description: "Resous ta premiere enigme", icon: "🧩", category: "puzzle", rarity: "common", condition: s => s.solvedPuzzles >= 1, xpReward: 15 },
  { id: "puzzle_5", title: "Decodeur", description: "Resous 5 enigmes", icon: "🔍", category: "puzzle", rarity: "rare", condition: s => s.solvedPuzzles >= 5, xpReward: 40 },
  { id: "puzzle_15", title: "Maitre des Enigmes", description: "Resous 15 enigmes", icon: "🧠", category: "puzzle", rarity: "epic", condition: s => s.solvedPuzzles >= 15, xpReward: 100 },

  // Streak
  { id: "streak_3", title: "Regulier", description: "3 jours de suite", icon: "🔥", category: "streak", rarity: "common", condition: s => s.streak >= 3, xpReward: 20 },
  { id: "streak_7", title: "Dedicace", description: "7 jours de suite", icon: "💪", category: "streak", rarity: "rare", condition: s => s.streak >= 7, xpReward: 50 },
  { id: "streak_14", title: "Inarretable", description: "14 jours de suite", icon: "⚡", category: "streak", rarity: "epic", condition: s => s.streak >= 14, xpReward: 100 },
  { id: "streak_30", title: "Legendaire", description: "30 jours de suite", icon: "🌟", category: "streak", rarity: "legendary", condition: s => s.streak >= 30, xpReward: 300 },

  // Mastery (Sigils)
  { id: "first_sigil", title: "Premier Sigil", description: "Obtiens ton premier Sigil de Maitrise", icon: "🏅", category: "mastery", rarity: "rare", condition: s => s.sigilsCollected >= 1, xpReward: 50 },
  { id: "sigil_3", title: "Tri-Sigil", description: "Obtiens 3 Sigils", icon: "🏅", category: "mastery", rarity: "epic", condition: s => s.sigilsCollected >= 3, xpReward: 100 },
  { id: "all_sigils", title: "Protocole Lazarus", description: "Obtiens les 7 Sigils de Maitrise", icon: "🔮", category: "mastery", rarity: "legendary", condition: s => s.sigilsCollected >= 7, xpReward: 500 },

  // Speed / Daily
  { id: "chain_1", title: "Premiere Chaine", description: "Complete 1 Mission Quotidienne", icon: "⛓️", category: "speed", rarity: "common", condition: s => s.completedChains >= 1, xpReward: 15 },
  { id: "chain_5", title: "Enchaine", description: "Complete 5 Missions Quotidiennes", icon: "🔗", category: "speed", rarity: "rare", condition: s => s.completedChains >= 5, xpReward: 40 },
  { id: "pomodoro_5", title: "Concentre", description: "Complete 5 Pomodoros", icon: "🍅", category: "speed", rarity: "common", condition: s => s.pomodoroCount >= 5, xpReward: 20 },
  { id: "pomodoro_20", title: "Machine", description: "Complete 20 Pomodoros", icon: "🤖", category: "speed", rarity: "rare", condition: s => s.pomodoroCount >= 20, xpReward: 50 },
  { id: "xp_500", title: "500 XP", description: "Accumule 500 XP", icon: "💎", category: "mastery", rarity: "rare", condition: s => s.totalXp >= 500, xpReward: 25 },
  { id: "xp_2000", title: "2000 XP", description: "Accumule 2000 XP", icon: "💠", category: "mastery", rarity: "epic", condition: s => s.totalXp >= 2000, xpReward: 75 },
  { id: "xp_5000", title: "5000 XP", description: "Accumule 5000 XP", icon: "🌀", category: "mastery", rarity: "legendary", condition: s => s.totalXp >= 5000, xpReward: 200 },
];

const RARITY_COLORS = {
  common: { bg: "bg-zinc-500/10", border: "border-zinc-500/20", text: "text-zinc-400", label: "Commun" },
  rare: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", label: "Rare" },
  epic: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", label: "Epique" },
  legendary: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", label: "Legendaire" },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  progression: <Star className="w-3 h-3" />,
  creation: <FlaskConical className="w-3 h-3" />,
  puzzle: <Puzzle className="w-3 h-3" />,
  streak: <Flame className="w-3 h-3" />,
  mastery: <Sparkles className="w-3 h-3" />,
  speed: <Trophy className="w-3 h-3" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  progression: "Progression",
  creation: "Creation",
  puzzle: "Enigmes",
  streak: "Serie",
  mastery: "Maitrise",
  speed: "Quotidien",
};

interface AchievementsProps {
  stats: AchievementStats;
  unlockedIds: string[];
}

export function AchievementsPanel({ stats, unlockedIds }: AchievementsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categorized = useMemo(() => {
    const categories = new Map<string, { unlocked: Achievement[]; locked: Achievement[] }>();
    for (const ach of ACHIEVEMENTS) {
      if (!categories.has(ach.category)) {
        categories.set(ach.category, { unlocked: [], locked: [] });
      }
      const cat = categories.get(ach.category)!;
      if (unlockedIds.includes(ach.id) || ach.condition(stats)) {
        cat.unlocked.push(ach);
      } else {
        cat.locked.push(ach);
      }
    }
    return categories;
  }, [stats, unlockedIds]);

  const totalUnlocked = Array.from(categorized.values()).reduce((sum, c) => sum + c.unlocked.length, 0);
  const totalAchievements = ACHIEVEMENTS.length;

  const filteredAchievements = selectedCategory
    ? ACHIEVEMENTS.filter(a => a.category === selectedCategory)
    : ACHIEVEMENTS;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl p-5 room-3d"
        style={{
          background: "linear-gradient(145deg, hsl(45 93% 47% / 0.08), hsl(var(--card)))",
          border: "1px solid hsl(45 93% 47% / 0.15)",
          boxShadow: "var(--shadow-3d-lg)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Succes</h2>
            <p className="text-[10px] text-muted-foreground">
              {totalUnlocked} / {totalAchievements} debloques
            </p>
          </div>
        </div>
        <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(totalUnlocked / totalAchievements) * 100}%` }}
            transition={{ duration: 1 }}
            className="h-full rounded-full bg-gradient-to-r from-amber-500/60 to-emerald-500/40"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
            !selectedCategory
              ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
              : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10"
          }`}
        >
          Tous ({totalUnlocked}/{totalAchievements})
        </button>
        {Array.from(categorized.entries()).map(([cat, { unlocked, locked }]) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              selectedCategory === cat
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10"
            }`}
          >
            {CATEGORY_ICONS[cat]}
            {CATEGORY_LABELS[cat]} ({unlocked.length}/{unlocked.length + locked.length})
          </button>
        ))}
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredAchievements.map((ach, i) => {
          const isUnlocked = unlockedIds.includes(ach.id) || ach.condition(stats);
          const rarity = RARITY_COLORS[ach.rarity];

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-xl border p-3 transition-all ${
                isUnlocked
                  ? `${rarity.bg} ${rarity.border}`
                  : "bg-white/[0.02] border-white/5 opacity-50"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`text-xl shrink-0 ${!isUnlocked ? "grayscale opacity-30" : ""}`}>
                  {isUnlocked ? ach.icon : "🔒"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-xs font-bold truncate ${
                      isUnlocked ? rarity.text : "text-muted-foreground/50"
                    }`}>
                      {ach.title}
                    </span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full shrink-0 ${
                      isUnlocked ? `${rarity.bg} ${rarity.text}` : "bg-white/5 text-muted-foreground/30"
                    }`}>
                      {rarity.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 leading-tight">
                    {ach.description}
                  </p>
                  {isUnlocked && (
                    <span className="text-[9px] text-emerald-400 font-bold mt-1 inline-block">
                      +{ach.xpReward} XP
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
