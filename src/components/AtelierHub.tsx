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
import { ArrowLeft, ChevronRight, Lock, KeyRound } from "lucide-react";

type AtelierMode = "hub" | "phrase" | "script" | "diagnostic" | "case" | "interview" | "identity" | "document" | "beat" | "career";

const ATELIERS = [
  {
    id: "phrase" as AtelierMode,
    icon: "🧪",
    title: "Chambre de Forge Linguistique",
    roomName: "Labo de phrases",
    desc: "Forge une phrase medicale — chaque phrase validee cree un fragment de cle",
    output: "Fragments de cle",
    reward: "Fragment par phrase forgee",
    level: "Tous niveaux",
    color: "from-primary/15 to-info/8",
    border: "border-primary/25",
    accent: "text-primary",
    tag: "Forge",
  },
  {
    id: "script" as AtelierMode,
    icon: "✍️",
    title: "Salle de Transmission",
    roomName: "Transmission medicale",
    desc: "Ecris un script medical — chaque script reussi revele une ligne de code",
    output: "Codes de transmission",
    reward: "Code par script valide",
    level: "Intermediaire",
    color: "from-accent/15 to-warning/8",
    border: "border-accent/25",
    accent: "text-accent",
    tag: "Code",
  },
  {
    id: "diagnostic" as AtelierMode,
    icon: "🧠",
    title: "Salle d'Investigation Clinique",
    roomName: "Investigation",
    desc: "Construis un diagnostic — chaque bon raisonnement revele un indice medical strategique",
    output: "Indices cliniques",
    reward: "Indice par diagnostic",
    level: "Avance",
    color: "from-clinical/15 to-info/8",
    border: "border-clinical/25",
    accent: "text-clinical",
    tag: "Indice",
  },
  {
    id: "case" as AtelierMode,
    icon: "🧾",
    title: "Salle des Archives Patients",
    roomName: "Archives",
    desc: "Reconstitue un dossier patient — un dossier complet debloque un artefact clinique",
    output: "Artefacts cliniques",
    reward: "Artefact par dossier",
    level: "Avance",
    color: "from-grammar/15 to-primary/8",
    border: "border-grammar/25",
    accent: "text-grammar",
    tag: "Artefact",
  },
  {
    id: "interview" as AtelierMode,
    icon: "🎙️",
    title: "Chambre d'Oral Clinique",
    roomName: "Oral clinique",
    desc: "Enregistre et perfectionne — chaque validation forge un sceau vocal",
    output: "Sceaux vocaux",
    reward: "Sceau par enregistrement",
    level: "Tous niveaux",
    color: "from-accent/15 to-primary/8",
    border: "border-accent/25",
    accent: "text-accent",
    tag: "Sceau",
  },
  {
    id: "identity" as AtelierMode,
    icon: "🇨🇭",
    title: "Salle d'Identite Professionnelle",
    roomName: "Identite",
    desc: "Construis ton identite de medecin suisse — chaque bloc forge un element de ta vision",
    output: "Vision professionnelle",
    reward: "Progression narrative",
    level: "Tous niveaux",
    color: "from-success/15 to-info/8",
    border: "border-success/25",
    accent: "text-success",
    tag: "Vision",
  },
  {
    id: "document" as AtelierMode,
    icon: "📄",
    title: "Bureau des Protocoles",
    roomName: "Protocoles medicaux",
    desc: "Befundbericht, SBAR, Arztbrief — chaque document restaure un protocole du complexe",
    output: "Protocoles restaures",
    reward: "Fragment par document",
    level: "Intermediaire",
    color: "from-info/15 to-primary/8",
    border: "border-info/25",
    accent: "text-info",
    tag: "Protocole",
  },
  {
    id: "beat" as AtelierMode,
    icon: "🎵",
    title: "Salle Rythmique",
    roomName: "Memorisation sonore",
    desc: "Memorise au rythme — chaque synchronisation revele une rune sonore",
    output: "Runes sonores",
    reward: "Rune par session",
    level: "Tous niveaux",
    color: "from-warning/15 to-accent/8",
    border: "border-warning/25",
    accent: "text-warning",
    tag: "Rune",
  },
  {
    id: "career" as AtelierMode,
    icon: "🏔️",
    title: "Tour de Commandement",
    roomName: "Vue strategique",
    desc: "France → Suisse — chaque etape ouvre un nouveau niveau de la tour",
    output: "Niveaux debloques",
    reward: "Progression de rang",
    level: "Tous niveaux",
    color: "from-warning/15 to-success/8",
    border: "border-warning/25",
    accent: "text-warning",
    tag: "Rang",
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
    <div className="space-y-5">
      {/* Hero banner — escape game style */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/12 via-card to-grammar/8 border border-blue-500/15 p-5 sm:p-7"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">⚗️</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Laboratoire de Creation</h2>
              <p className="text-[10px] text-muted-foreground">9 salles specialisees — chaque creation debloque la suite</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Escape game loop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-gradient-to-r from-amber-500/8 to-transparent border border-amber-500/15 px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-[10px] text-amber-400/80 leading-relaxed">
            <strong>Boucle de resolution</strong> — Explorer → Comprendre → Creer → Valider → Obtenir un fragment → Debloquer la suite
          </p>
        </div>
      </motion.div>

      {/* Section label */}
      <div>
        <p className="text-[10px] uppercase tracking-[4px] text-muted-foreground mb-4 px-1">9 chambres · Choisis ton epreuve</p>

        {/* Atelier cards — escape room style */}
        <div className="space-y-2.5">
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
              <div className="absolute inset-0 bg-gradient-to-r from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-background/30 border border-border/20 flex items-center justify-center text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform duration-200">
                  {a.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-black tracking-tight leading-tight">{a.title}</span>
                    <span className={`text-[7px] font-bold uppercase tracking-wider ${a.accent} opacity-60 bg-background/20 rounded-full px-2 py-0.5 shrink-0`}>
                      {a.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-1">{a.desc}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-bold text-amber-400/80 flex items-center gap-1">
                      <KeyRound className="w-2.5 h-2.5" /> {a.reward}
                    </span>
                    <span className="text-[9px] text-muted-foreground/40">·</span>
                    <span className="text-[9px] text-muted-foreground">{a.level}</span>
                  </div>
                </div>

                <ChevronRight className={`w-5 h-5 shrink-0 ${a.accent} opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Escape game loop visualization */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card-elevated rounded-2xl p-5"
      >
        <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-4">Mecanisme de deblocage</p>
        <div className="flex items-center justify-between gap-2">
          {[
            { icon: "🔍", label: "Explorer" },
            { icon: "🧠", label: "Comprendre" },
            { icon: "✍️", label: "Creer" },
            { icon: "✓", label: "Valider" },
            { icon: "🔑", label: "Fragment" },
            { icon: "🔓", label: "Debloquer" },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className="text-lg">{step.icon}</div>
              <span className="text-[8px] font-bold text-muted-foreground text-center">{step.label}</span>
              {i < 5 && <span className="text-[10px] text-muted-foreground/30 absolute" style={{ marginLeft: '100%' }}>→</span>}
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
      Retour au Laboratoire
    </button>
  );
}
