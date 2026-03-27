// ── NavigationBar ──
// Extracted from Index.tsx — handles primary + secondary tab navigation

import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { TranslationToggle } from "@/components/translation";
import { RankBadge } from "@/components/XPBar";

export type Tab = "dash" | "motiv" | "today" | "vocab" | "gram" | "iv" | "sim" | "tools" | "cal" | "stats" | "atelier" | "portfolio" | "questmap" | "hq" | "puzzles" | "lazarus" | "achievements" | "leaderboard" | "simulator";

export const NAV_PRIMARY: { id: Tab; icon: string; label: string }[] = [
  { id: "dash", icon: "🏠", label: "Mission" },
  { id: "simulator", icon: "🎯", label: "Entretien" },
  { id: "vocab", icon: "🔨", label: "Forge" },
  { id: "gram", icon: "🌳", label: "Arbre" },
  { id: "iv", icon: "🎙️", label: "Studio" },
  { id: "sim", icon: "🩺", label: "Clinique" },
];

export const NAV_SECONDARY: { id: Tab; icon: string; label: string }[] = [
  { id: "questmap", icon: "🗺️", label: "Carte" },
  { id: "atelier", icon: "⚗️", label: "Labo" },
  { id: "puzzles", icon: "🧩", label: "Enigmes" },
  { id: "portfolio", icon: "📚", label: "Archives" },
  { id: "lazarus", icon: "🔮", label: "Lazarus" },
  { id: "achievements", icon: "🏆", label: "Succes" },
  { id: "stats", icon: "📊", label: "Stats" },
  { id: "tools", icon: "🛠️", label: "Outils" },
  { id: "cal", icon: "📅", label: "Plan" },
  { id: "motiv", icon: "🔥", label: "Vision" },
  { id: "leaderboard", icon: "🥇", label: "Classement" },
];

export const NAV = [...NAV_PRIMARY, ...NAV_SECONDARY];

// Map tabs to atmosphere types
export const TAB_ATMOSPHERE: Record<string, "forge" | "grammar" | "studio" | "clinical" | "laboratory" | "archive" | "aerzterat" | "neutral"> = {
  dash: "neutral",
  questmap: "neutral",
  simulator: "studio",
  vocab: "forge",
  gram: "grammar",
  iv: "studio",
  sim: "clinical",
  atelier: "laboratory",
  portfolio: "archive",
  puzzles: "aerzterat",
  lazarus: "neutral",
  achievements: "neutral",
  leaderboard: "neutral",
  tools: "neutral",
  stats: "neutral",
  cal: "neutral",
  motiv: "neutral",
};

interface NavigationBarProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  xp: number;
  showFr: boolean;
  toggleFr: () => void;
  showMoreTabs: boolean;
  setShowMoreTabs: (show: boolean) => void;
  onSignOut: () => void;
  authUnavailable?: boolean;
}

export function NavigationBar({
  tab,
  onTabChange,
  xp,
  showFr,
  toggleFr,
  showMoreTabs,
  setShowMoreTabs,
  onSignOut,
  authUnavailable,
}: NavigationBarProps) {
  return (
    <nav className="sticky top-0 z-50 glass-nav border-b border-border/30">
      <div className="max-w-5xl mx-auto flex items-center gap-0.5 px-2 py-2 overflow-x-auto scrollbar-hide">
        <div className="shrink-0 mr-1 flex items-center gap-1.5">
          <RankBadge xp={xp} size="sm" />
        </div>
        {NAV_PRIMARY.map(n => (
          <button
            key={n.id}
            onClick={() => onTabChange(n.id)}
            className={`flex flex-col items-center gap-0.5 px-2.5 sm:px-4 py-1.5 rounded-xl text-[10px] sm:text-[11px] transition-all duration-200 shrink-0 relative ${
              tab === n.id
                ? "font-bold text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            }`}
          >
            {tab === n.id && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="text-sm sm:text-base relative z-10">{n.icon}</span>
            <span className="relative z-10">{n.label}</span>
          </button>
        ))}
        <button
          onClick={() => setShowMoreTabs(!showMoreTabs)}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[10px] sm:text-[11px] transition-all duration-200 shrink-0 relative ${
            showMoreTabs || NAV_SECONDARY.some(n => n.id === tab)
              ? "font-bold text-foreground"
              : "text-muted-foreground hover:text-foreground/70"
          }`}
        >
          <span className="text-sm sm:text-base relative z-10">...</span>
          <span className="relative z-10">Plus</span>
        </button>
        <div className="shrink-0 ml-1">
          <TranslationToggle active={showFr} onToggle={toggleFr} />
        </div>
        <button onClick={authUnavailable ? () => window.location.reload() : onSignOut} className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[10px] text-muted-foreground hover:text-foreground/70 shrink-0">
          <LogOut className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">Sortir</span>
        </button>
      </div>
      {showMoreTabs && (
        <div className="max-w-5xl mx-auto flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto scrollbar-hide border-t border-border/15">
          {NAV_SECONDARY.map(n => (
            <button
              key={n.id}
              onClick={() => { onTabChange(n.id); setShowMoreTabs(false); }}
              className={`flex flex-col items-center gap-0.5 px-2.5 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] transition-all duration-200 shrink-0 ${
                tab === n.id
                  ? "font-bold text-foreground bg-primary/10"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              <span className="text-xs sm:text-sm">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
