import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp, Shield, Flame } from "lucide-react";
import { getBuilderRank } from "@/data/content";

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  streak: number;
  sigils: number;
  solvedRooms: number;
  totalArtifacts: number;
  isCurrentUser?: boolean;
}

// Simulated leaderboard data (in production, this would come from Supabase)
function generateLeaderboard(currentUserXp: number, currentUserStreak: number, currentUserSigils: number, currentUserRooms: number, currentUserArtifacts: number): LeaderboardEntry[] {
  const names = [
    "Dr. Schmidt", "Dr. Mueller", "Dr. Weber", "Dr. Fischer", "Dr. Wagner",
    "Dr. Becker", "Dr. Hofmann", "Dr. Schaefer", "Dr. Koch", "Dr. Bauer",
    "Dr. Richter", "Dr. Klein", "Dr. Wolf", "Dr. Neumann", "Dr. Schwarz",
    "Dr. Zimmermann", "Dr. Braun", "Dr. Krueger", "Dr. Hartmann", "Dr. Lange",
  ];

  const entries: LeaderboardEntry[] = names.map((name, i) => {
    // Create a distribution around the current user
    const variance = Math.random() * 0.8 + 0.3;
    const xpBase = Math.max(10, Math.round(currentUserXp * variance + (Math.random() - 0.5) * 200));
    return {
      id: `sim-${i}`,
      name,
      xp: xpBase,
      streak: Math.max(0, Math.round(currentUserStreak * variance + (Math.random() - 0.5) * 3)),
      sigils: Math.min(7, Math.max(0, Math.round(currentUserSigils * variance))),
      solvedRooms: Math.max(0, Math.round(currentUserRooms * variance)),
      totalArtifacts: Math.max(0, Math.round(currentUserArtifacts * variance)),
    };
  });

  // Add current user
  entries.push({
    id: "current-user",
    name: "Toi",
    xp: currentUserXp,
    streak: currentUserStreak,
    sigils: currentUserSigils,
    solvedRooms: currentUserRooms,
    totalArtifacts: currentUserArtifacts,
    isCurrentUser: true,
  });

  return entries;
}

type SortBy = "xp" | "streak" | "sigils" | "artifacts";

interface LeaderboardProps {
  currentXp: number;
  currentStreak: number;
  currentSigils: number;
  currentRooms: number;
  currentArtifacts: number;
}

export function Leaderboard({ currentXp, currentStreak, currentSigils, currentRooms, currentArtifacts }: LeaderboardProps) {
  const [sortBy, setSortBy] = useState<SortBy>("xp");

  const entries = useMemo(
    () => generateLeaderboard(currentXp, currentStreak, currentSigils, currentRooms, currentArtifacts),
    [currentXp, currentStreak, currentSigils, currentRooms, currentArtifacts]
  );

  const sorted = useMemo(() => {
    const copy = [...entries];
    switch (sortBy) {
      case "xp": return copy.sort((a, b) => b.xp - a.xp);
      case "streak": return copy.sort((a, b) => b.streak - a.streak);
      case "sigils": return copy.sort((a, b) => b.sigils - a.sigils);
      case "artifacts": return copy.sort((a, b) => b.totalArtifacts - a.totalArtifacts);
    }
  }, [entries, sortBy]);

  const currentUserRank = sorted.findIndex(e => e.isCurrentUser) + 1;

  const SORT_OPTIONS: { id: SortBy; label: string; icon: React.ReactNode }[] = [
    { id: "xp", label: "XP", icon: <TrendingUp className="w-3 h-3" /> },
    { id: "streak", label: "Serie", icon: <Flame className="w-3 h-3" /> },
    { id: "sigils", label: "Sigils", icon: <Shield className="w-3 h-3" /> },
    { id: "artifacts", label: "Creations", icon: <Trophy className="w-3 h-3" /> },
  ];

  const MEDAL_COLORS = ["text-amber-400", "text-zinc-300", "text-amber-600"];
  const MEDAL_ICONS = [
    <Crown className="w-4 h-4" key="crown" />,
    <Medal className="w-4 h-4" key="silver" />,
    <Medal className="w-4 h-4" key="bronze" />,
  ];

  return (
    <div className="space-y-4">
      {/* Simulated data disclaimer */}
      <div className="rounded-xl px-4 py-3 text-center"
        style={{
          background: "hsl(40 80% 50% / 0.08)",
          border: "1px solid hsl(40 80% 50% / 0.2)",
        }}
      >
        <p className="text-[10px] font-semibold" style={{ color: "hsl(40 80% 60%)" }}>
          Apercu — Donnees simulees
        </p>
        <p className="text-[9px] text-muted-foreground mt-0.5">
          Ce classement est genere localement a partir de ta progression. Le classement reel sera actif quand la communaute grandira.
        </p>
      </div>

      {/* Header */}
      <div className="rounded-2xl p-5 room-3d"
        style={{
          background: "linear-gradient(145deg, hsl(280 60% 50% / 0.08), hsl(var(--card)))",
          border: "1px solid hsl(280 60% 50% / 0.15)",
          boxShadow: "var(--shadow-3d-lg)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Classement</h2>
            <p className="text-[10px] text-muted-foreground">
              Ta position estimee : <span className="text-amber-400 font-bold">#{currentUserRank}</span> sur {sorted.length} apprenants (simule)
            </p>
          </div>
        </div>

        {/* Sort filters */}
        <div className="flex gap-2">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                sortBy === opt.id
                  ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                  : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="space-y-1.5">
        {sorted.map((entry, i) => {
          const isTop3 = i < 3;
          const { rank } = getBuilderRank(entry.xp);

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-xl border p-3 transition-all ${
                entry.isCurrentUser
                  ? "bg-amber-500/10 border-amber-500/25 ring-1 ring-amber-500/20"
                  : isTop3
                  ? "bg-white/[0.04] border-white/10"
                  : "bg-white/[0.02] border-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isTop3 ? MEDAL_COLORS[i] : "text-muted-foreground/50"
                }`}>
                  {isTop3 ? MEDAL_ICONS[i] : (
                    <span className="text-xs font-bold">#{i + 1}</span>
                  )}
                </div>

                {/* Name & rank */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold truncate ${
                      entry.isCurrentUser ? "text-amber-400" : "text-foreground/80"
                    }`}>
                      {entry.name}
                    </span>
                    {entry.isCurrentUser && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                        TOI
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-muted-foreground/60">{rank.icon} {rank.name}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-right">
                  {sortBy === "xp" && (
                    <span className="text-xs font-bold text-foreground/70">{entry.xp.toLocaleString()} XP</span>
                  )}
                  {sortBy === "streak" && (
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span className="text-xs font-bold text-foreground/70">{entry.streak}j</span>
                    </div>
                  )}
                  {sortBy === "sigils" && (
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-amber-400" />
                      <span className="text-xs font-bold text-foreground/70">{entry.sigils}/7</span>
                    </div>
                  )}
                  {sortBy === "artifacts" && (
                    <span className="text-xs font-bold text-foreground/70">{entry.totalArtifacts}</span>
                  )}

                  {/* Sigil count always visible as secondary info */}
                  {sortBy !== "sigils" && entry.sigils > 0 && (
                    <div className="flex gap-0.5">
                      {[...Array(Math.min(7, entry.sigils))].map((_, si) => (
                        <div key={si} className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500/40" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Note */}
      <p className="text-[9px] text-muted-foreground/40 text-center px-4">
        Classement simule — seule ta ligne (« Toi ») reflete tes vraies donnees. Les autres profils sont generes localement.
      </p>
    </div>
  );
}
