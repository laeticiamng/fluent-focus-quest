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
import { ArrowLeft, Zap, ChevronRight } from "lucide-react";

type AtelierMode = "hub" | "phrase" | "script" | "diagnostic" | "case" | "interview" | "identity" | "document" | "beat" | "career";

const ATELIERS = [
  {
    id: "phrase" as AtelierMode,
    icon: "🧪",
    title: "Mini-forge de precision",
    roomName: "Labo de phrases",
    desc: "Tire un mot, forge une phrase medicale — l'IA affine instantanement",
    output: "Phrases medicales forgees",
    xpReward: "+20 XP / phrase",
    level: "Tous niveaux",
    color: "from-primary/15 to-info/8",
    border: "border-primary/25",
    accent: "text-primary",
    tag: "Phrase",
  },
  {
    id: "script" as AtelierMode,
    icon: "✍️",
    title: "Salle de redaction tactique",
    roomName: "Script Builder",
    desc: "Presentation patient, Ubergabe, Selbstvorstellung — ecris ton script medical",
    output: "Scripts medicaux structures",
    xpReward: "+50 XP / script",
    level: "Intermediaire",
    color: "from-accent/15 to-warning/8",
    border: "border-accent/25",
    accent: "text-accent",
    tag: "Script",
  },
  {
    id: "diagnostic" as AtelierMode,
    icon: "🧠",
    title: "Salle de raisonnement clinique",
    roomName: "Diagnostic Builder",
    desc: "Construis ton diagnostic etape par etape en allemand medical",
    output: "Diagnostics structures",
    xpReward: "+40 XP / diagnostic",
    level: "Avance",
    color: "from-clinical/15 to-info/8",
    border: "border-clinical/25",
    accent: "text-clinical",
    tag: "Clinique",
  },
  {
    id: "case" as AtelierMode,
    icon: "🧾",
    title: "Atelier de simulation complete",
    roomName: "Createur de cas",
    desc: "Redige un dossier patient complet — Anamnese, Befund, Therapie",
    output: "Cas patients complets",
    xpReward: "+45 XP / cas",
    level: "Avance",
    color: "from-grammar/15 to-primary/8",
    border: "border-grammar/25",
    accent: "text-grammar",
    tag: "Dossier",
  },
  {
    id: "interview" as AtelierMode,
    icon: "🎙️",
    title: "Chambre de simulation orale",
    roomName: "Studio d'entretien",
    desc: "Enregistre, ecoute-toi, perfectionne ta voix en allemand",
    output: "Reponses d'entretien",
    xpReward: "+20 XP / enreg.",
    level: "Tous niveaux",
    color: "from-accent/15 to-primary/8",
    border: "border-accent/25",
    accent: "text-accent",
    tag: "Audio",
  },
  {
    id: "identity" as AtelierMode,
    icon: "🇨🇭",
    title: "Salle d'identite professionnelle",
    roomName: "Vision Builder",
    desc: "Construis ton identite de medecin suisse — qui tu es, qui tu deviens",
    output: "Profil professionnel",
    xpReward: "Motivation",
    level: "Tous niveaux",
    color: "from-success/15 to-info/8",
    border: "border-success/25",
    accent: "text-success",
    tag: "Identite",
  },
  {
    id: "document" as AtelierMode,
    icon: "📄",
    title: "Bureau des documents medicaux",
    roomName: "Documents pro",
    desc: "Befundbericht, SBAR, Arztbrief, Konsilanforderung — tous les formats",
    output: "Documents professionnels",
    xpReward: "+40 XP / document",
    level: "Intermediaire",
    color: "from-info/15 to-primary/8",
    border: "border-info/25",
    accent: "text-info",
    tag: "Document",
  },
  {
    id: "beat" as AtelierMode,
    icon: "🎵",
    title: "Studio rythmique cognitif",
    roomName: "Beat Learning",
    desc: "Memorise le vocabulaire au rythme — ancrage musical",
    output: "Memorisation renforcee",
    xpReward: "Apprentissage",
    level: "Tous niveaux",
    color: "from-warning/15 to-accent/8",
    border: "border-warning/25",
    accent: "text-warning",
    tag: "Musique",
  },
  {
    id: "career" as AtelierMode,
    icon: "🏔️",
    title: "Tour de progression medicale",
    roomName: "Builder de carriere",
    desc: "France → Suisse, etape par etape — visualise ta trajectoire FMH",
    output: "Vision de carriere",
    xpReward: "Motivation",
    level: "Tous niveaux",
    color: "from-warning/15 to-success/8",
    border: "border-warning/25",
    accent: "text-warning",
    tag: "Carriere",
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
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Les Ateliers</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            9 salles de creation specialisees. Chaque artefact produit te rapproche du Gefäßzentrum.
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
          💡 <strong>Production active</strong> — Chaque creation forge des connexions neuronales 3x plus solides que la revision passive.
        </p>
      </motion.div>

      {/* Section label */}
      <div>
        <p className="text-[10px] uppercase tracking-[4px] text-muted-foreground mb-4 px-1">9 salles specialisees · Choisis ta mission</p>

        {/* Atelier cards — immersive room style */}
        <div className="space-y-3">
          {ATELIERS.map((a, i) => (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -2, scale: 1.005 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode(a.id)}
              className={`w-full rounded-2xl bg-gradient-to-r ${a.color} border ${a.border} p-4 sm:p-5 text-left transition-all group relative overflow-hidden`}
            >
              {/* Hover shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative z-10 flex items-center gap-4">
                {/* Room icon */}
                <div className={`w-14 h-14 rounded-xl bg-background/30 border border-border/20 flex items-center justify-center text-2xl sm:text-3xl shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                  {a.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-black tracking-tight leading-tight">{a.title}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${a.accent} opacity-60 bg-background/20 rounded-full px-2 py-0.5 shrink-0`}>
                      {a.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-1">{a.desc}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[9px] font-bold text-amber-400">{a.xpReward}</span>
                    <span className="text-[9px] text-muted-foreground/60">·</span>
                    <span className="text-[9px] text-muted-foreground">{a.level}</span>
                    <span className="text-[9px] text-muted-foreground/60">·</span>
                    <span className="text-[9px] text-muted-foreground italic">{a.output}</span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className={`w-5 h-5 shrink-0 ${a.accent} opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
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
        <p className="text-xs font-bold text-muted-foreground mb-4">⚡ Boucle de creation</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { n: "1", t: "Choisis ta salle", d: "Un atelier parmi 9 modes de creation" },
            { n: "2", t: "Construis", d: "Phrases, scripts, cas, documents en allemand medical" },
            { n: "3", t: "Le coach affine", d: "L'IA corrige, enrichit et propose des variantes" },
            { n: "4", t: "Gagne et debloque", d: "XP + artefacts + progression vers de nouvelles zones" },
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
