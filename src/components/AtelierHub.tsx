import { useState } from "react";
import { motion } from "framer-motion";
import { PhraseLab } from "./ateliers/PhraseLab";
import { ScriptBuilder } from "./ateliers/ScriptBuilder";
import { DiagnosticBuilder } from "./ateliers/DiagnosticBuilder";
import { CaseCreator } from "./ateliers/CaseCreator";
import { InterviewStudio } from "./ateliers/InterviewStudio";
import { IdentityBuilder } from "./ateliers/IdentityBuilder";
import { DocumentBuilder } from "./ateliers/DocumentBuilder";
import { BeatLearning } from "./ateliers/BeatLearning";
import { CareerBuilder } from "./ateliers/CareerBuilder";
import { ArrowLeft, Zap } from "lucide-react";

type AtelierMode = "hub" | "phrase" | "script" | "diagnostic" | "case" | "interview" | "identity" | "document" | "beat" | "career";

const ATELIERS = [
  {
    id: "phrase" as AtelierMode,
    icon: "🧪",
    title: "Labo de phrases",
    desc: "Tire un mot, construis une phrase médicale — l'IA corrige instantanément",
    color: "from-primary/15 to-info/8",
    border: "border-primary/25",
    accent: "text-primary",
    tag: "Phrase",
  },
  {
    id: "script" as AtelierMode,
    icon: "✍️",
    title: "Script Builder",
    desc: "Présentation patient, Übergabe, Selbstvorstellung — écris ton script",
    color: "from-accent/15 to-warning/8",
    border: "border-accent/25",
    accent: "text-accent",
    tag: "Script",
  },
  {
    id: "diagnostic" as AtelierMode,
    icon: "🧠",
    title: "Diagnostic Builder",
    desc: "Raisonnement clinique en allemand — construis ton diagnostic étape par étape",
    color: "from-clinical/15 to-info/8",
    border: "border-clinical/25",
    accent: "text-clinical",
    tag: "Clinique",
  },
  {
    id: "case" as AtelierMode,
    icon: "🧾",
    title: "Créer ton cas",
    desc: "Rédige un dossier patient complet — Anamnese, Befund, Therapie",
    color: "from-grammar/15 to-primary/8",
    border: "border-grammar/25",
    accent: "text-grammar",
    tag: "Dossier",
  },
  {
    id: "interview" as AtelierMode,
    icon: "🎙️",
    title: "Studio d'entretien",
    desc: "Enregistre ta réponse, écoute-toi, perfectionne ta voix en allemand",
    color: "from-accent/15 to-primary/8",
    border: "border-accent/25",
    accent: "text-accent",
    tag: "Audio",
  },
  {
    id: "identity" as AtelierMode,
    icon: "🇨🇭",
    title: "Vision Builder",
    desc: "Construis ton identité de médecin suisse — qui tu es, qui tu deviens",
    color: "from-success/15 to-info/8",
    border: "border-success/25",
    accent: "text-success",
    tag: "Identité",
  },
  {
    id: "document" as AtelierMode,
    icon: "📄",
    title: "Documents pro",
    desc: "Befundbericht, SBAR, Arztbrief, Konsilanforderung — tous les formats",
    color: "from-info/15 to-primary/8",
    border: "border-info/25",
    accent: "text-info",
    tag: "Document",
  },
  {
    id: "beat" as AtelierMode,
    icon: "🎵",
    title: "Beat Learning",
    desc: "Apprends le vocabulaire au rythme — mémorisation musicale",
    color: "from-warning/15 to-accent/8",
    border: "border-warning/25",
    accent: "text-warning",
    tag: "Musique",
  },
  {
    id: "career" as AtelierMode,
    icon: "🏔️",
    title: "Builder de carrière",
    desc: "France → Suisse, niveau par niveau — suis ta progression FMH",
    color: "from-warning/15 to-success/8",
    border: "border-warning/25",
    accent: "text-warning",
    tag: "Carrière",
  },
];

interface AtelierHubProps {
  addXp: (n: number) => void;
  xp?: number;
}

export function AtelierHub({ addXp, xp = 0 }: AtelierHubProps) {
  const [mode, setMode] = useState<AtelierMode>("hub");

  const back = () => setMode("hub");
  const wrap = (child: React.ReactNode) => (
    <div>
      <BackButton onClick={back} />
      {child}
    </div>
  );

  if (mode === "phrase") return wrap(<PhraseLab addXp={addXp} />);
  if (mode === "script") return wrap(<ScriptBuilder addXp={addXp} />);
  if (mode === "diagnostic") return wrap(<DiagnosticBuilder addXp={addXp} />);
  if (mode === "case") return wrap(<CaseCreator addXp={addXp} />);
  if (mode === "interview") return wrap(<InterviewStudio addXp={addXp} />);
  if (mode === "identity") return wrap(<IdentityBuilder addXp={addXp} />);
  if (mode === "document") return wrap(<DocumentBuilder addXp={addXp} />);
  if (mode === "beat") return wrap(<BeatLearning addXp={addXp} />);
  if (mode === "career") return wrap(<CareerBuilder addXp={addXp} xp={xp} />);

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-grammar/10 to-accent/12 border border-primary/20 p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent pointer-events-none" />
        <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-bold text-primary">{xp} XP</span>
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">✨</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Ateliers de création</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Tu ne révises pas. Tu <span className="text-foreground font-bold">construis</span> ton futur médecin suisse.
            Chaque mot écrit, chaque phrase créée — c'est du béton pour ton cerveau.
          </p>
        </div>
      </motion.div>

      {/* Neuroscience badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl bg-gradient-to-r from-accent/8 to-warning/5 border border-accent/15 px-4 py-3"
      >
        <p className="text-xs text-accent/85 italic leading-relaxed">
          💡 <strong>Production active</strong> — Chaque création forge des connexions neuronales 3× plus solides que la révision passive. C'est la science.
        </p>
      </motion.div>

      {/* Section label */}
      <div>
        <p className="text-[10px] uppercase tracking-[4px] text-muted-foreground mb-3 px-1">9 ateliers · Choisis ton terrain de jeu</p>

        {/* Atelier cards — 2 cols on mobile, 3 on tablet */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ATELIERS.map((a, i) => (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setMode(a.id)}
              className={`rounded-2xl bg-gradient-to-br ${a.color} border ${a.border} p-4 sm:p-5 text-left transition-all group relative overflow-hidden`}
            >
              {/* Hover shine */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2.5">
                  <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-200">{a.icon}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${a.accent} opacity-60 group-hover:opacity-100 transition-opacity bg-background/20 rounded-full px-2 py-0.5`}>
                    {a.tag}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold tracking-tight leading-tight">{a.title}</div>
                <div className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{a.desc}</div>
                <div className={`mt-3 text-[10px] font-bold ${a.accent} opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5`}>
                  Commencer →
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="card-elevated rounded-2xl p-5"
      >
        <p className="text-xs font-bold text-muted-foreground mb-4">⚡ Comment ça fonctionne</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { n: "1", t: "Tu choisis", d: "Un atelier parmi 9 formats de création" },
            { n: "2", t: "Tu crées", d: "Phrases, scripts, cas, documents en allemand médical" },
            { n: "3", t: "L'IA coach", d: "Corrige, améliore et propose des variantes en temps réel" },
            { n: "4", t: "Tu gagnes", d: "XP à chaque soumission — la création = la progression" },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0 mt-0.5">
                {s.n}
              </div>
              <div>
                <p className="text-xs font-bold">{s.t}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors mb-5 group"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      Retour aux ateliers
    </button>
  );
}
