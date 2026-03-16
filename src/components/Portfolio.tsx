import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown } from "lucide-react";
import type { Artifact, ArtifactType } from "@/hooks/useProgress";
import { CREATION_BADGES } from "@/hooks/useProgress";

interface PortfolioProps {
  artifacts: Artifact[];
  earnedBadges: string[];
}

const TYPE_CONFIG: Record<ArtifactType, { icon: string; label: string; color: string }> = {
  phrase_forged:      { icon: "✍️", label: "Phrase forgee",      color: "text-amber-400" },
  definition_written: { icon: "📖", label: "Definition",         color: "text-info" },
  phrase_assembled:   { icon: "🧩", label: "Phrase assemblee",   color: "text-primary" },
  grammar_phrase:     { icon: "⚙️", label: "Construction gram.", color: "text-grammar" },
  grammar_rule:       { icon: "🌳", label: "Regle construite",   color: "text-grammar" },
  grammar_transform:  { icon: "🔄", label: "Transformation",     color: "text-grammar" },
  interview_answer:   { icon: "💬", label: "Reponse entretien",  color: "text-accent" },
  script:             { icon: "📋", label: "Script",             color: "text-warning" },
  diagnostic:         { icon: "🏥", label: "Diagnostic",         color: "text-clinical" },
  clinical_note:      { icon: "📝", label: "Note clinique",      color: "text-clinical" },
  case_patient:       { icon: "🗂️", label: "Cas patient",        color: "text-success" },
  document:           { icon: "📄", label: "Document",           color: "text-info" },
  recording:          { icon: "🎙️", label: "Enregistrement",     color: "text-accent" },
};

const FILTER_OPTIONS: { key: string; label: string; types: ArtifactType[] }[] = [
  { key: "all", label: "Tout", types: [] },
  { key: "phrases", label: "Phrases", types: ["phrase_forged", "definition_written", "phrase_assembled"] },
  { key: "grammar", label: "Grammaire", types: ["grammar_phrase", "grammar_rule", "grammar_transform"] },
  { key: "interview", label: "Entretien", types: ["interview_answer"] },
  { key: "clinical", label: "Clinique", types: ["diagnostic", "clinical_note", "case_patient"] },
  { key: "docs", label: "Documents", types: ["script", "document", "recording"] },
];

function relativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function Portfolio({ artifacts, earnedBadges }: PortfolioProps) {
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const types = FILTER_OPTIONS.find(f => f.key === filter)?.types || [];
    const list = types.length === 0 ? artifacts : artifacts.filter(a => types.includes(a.type));
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [artifacts, filter]);

  // Stats by type
  const stats = useMemo(() => {
    const map: Partial<Record<ArtifactType, number>> = {};
    for (const a of artifacts) {
      map[a.type] = (map[a.type] || 0) + 1;
    }
    return map;
  }, [artifacts]);

  const totalXp = artifacts.reduce((a, b) => a + b.xpEarned, 0);

  // Earned badges
  const badges = CREATION_BADGES.filter(b => earnedBadges.includes(b.id));

  return (
    <div className="space-y-5">
      {/* Header — L'Archiviste */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-5 room-3d"
        style={{
          background: "linear-gradient(145deg, hsl(187 100% 42% / 0.08), hsl(var(--card)), hsl(270 60% 60% / 0.04))",
          border: "1px solid hsl(187 100% 42% / 0.12)",
          boxShadow: "var(--shadow-3d-lg), 0 0 40px -12px hsl(187 100% 42% / 0.12)",
        }}
      >
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="door-icon-3d w-12 h-12 rounded-xl bg-cyan-500/12 border border-cyan-500/15 flex items-center justify-center text-2xl"
            style={{ boxShadow: "var(--shadow-3d-sm), 0 0 14px -4px hsl(187 100% 42% / 0.2)" }}
          >
            📚
          </motion.div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Les Archives</h2>
            <p className="text-[10px] text-cyan-400/50 font-medium">Coffre de l'Archiviste</p>
          </div>
        </div>
      </motion.div>

      {/* Global stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="room-3d rounded-2xl p-3.5 text-center" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
          <div className="text-xl font-black text-amber-400">{artifacts.length}</div>
          <div className="text-[9px] font-medium text-muted-foreground mt-0.5">creations</div>
        </div>
        <div className="room-3d rounded-2xl p-3.5 text-center" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
          <div className="text-xl font-black text-accent">{totalXp}</div>
          <div className="text-[9px] font-medium text-muted-foreground mt-0.5">XP de creation</div>
        </div>
        <div className="room-3d rounded-2xl p-3.5 text-center" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
          <div className="text-xl font-black text-success">{badges.length}</div>
          <div className="text-[9px] font-medium text-muted-foreground mt-0.5">badges</div>
        </div>
      </div>

      {/* Production breakdown */}
      {artifacts.length > 0 && (
        <div className="room-3d rounded-2xl p-4" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
          <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-3">Ma production</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats).map(([type, count]) => {
              const cfg = TYPE_CONFIG[type as ArtifactType];
              if (!cfg) return null;
              return (
                <div key={type} className="flex items-center gap-2">
                  <span className="text-sm">{cfg.icon}</span>
                  <span className={`text-xs font-medium ${cfg.color}`}>{count}</span>
                  <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div className="room-3d rounded-2xl p-4" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
          <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-3">Badges de creation</p>
          <div className="flex flex-wrap gap-2">
            {badges.map(b => (
              <div key={b.id} className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5">
                <span className="text-sm">{b.emoji}</span>
                <span className="text-[10px] font-bold text-amber-400">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTER_OPTIONS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
              filter === f.key
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                : "bg-secondary text-muted-foreground border border-border/30 hover:text-foreground"
            }`}
          >
            {f.label}
            {f.key !== "all" && (
              <span className="ml-1.5 text-[10px] opacity-70">
                {f.types.length === 0 ? artifacts.length : artifacts.filter(a => f.types.includes(a.type)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Artifact list */}
      {filtered.length === 0 ? (
        <div className="room-3d rounded-2xl p-10 text-center" style={{ boxShadow: "var(--shadow-3d-md)" }}>
          <div className="text-5xl mb-4">{artifacts.length === 0 ? "📚" : "🔍"}</div>
          {artifacts.length === 0 ? (
            <>
              <p className="text-sm font-bold text-foreground mb-1">Tes Archives sont vides — pour l'instant</p>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Chaque phrase forgee, chaque diagnostic construit, chaque reponse creee apparaitra ici.
                Ton premier artefact t'attend dans La Forge ou dans un atelier.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 rounded-full px-4 py-2 border border-amber-500/15">
                ⚡ Lance ta premiere mission pour remplir tes Archives
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun artefact dans cette categorie.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a, i) => {
            const cfg = TYPE_CONFIG[a.type];
            const isExpanded = expandedId === a.id;

            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  className="w-full room-3d rounded-2xl p-4 text-left transition-all hover:border-border/60"
                  style={{ boxShadow: "var(--shadow-3d-sm)" }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">{cfg?.icon || "📝"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold ${cfg?.color || "text-foreground"}`}>
                          {cfg?.label || a.type}
                        </span>
                        {a.version && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                            v{a.version}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-auto">{relativeDate(a.date)}</span>
                      </div>
                      <p className={`text-xs text-foreground/80 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                        {a.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-bold text-amber-400/70">+{a.xpEarned}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && a.feedback && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-b-2xl bg-secondary/30 px-4 py-3 -mt-1 border-t border-border/20">
                        <p className="text-[10px] font-bold text-muted-foreground mb-1">Feedback coach</p>
                        <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap">{a.feedback}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
