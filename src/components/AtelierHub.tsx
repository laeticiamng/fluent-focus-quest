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
import { ArrowLeft } from "lucide-react";

type AtelierMode = "hub" | "phrase" | "script" | "diagnostic" | "case" | "interview" | "identity" | "document" | "beat" | "career";

const ATELIERS = [
  { id: "phrase" as AtelierMode, icon: "🧪", title: "Labo de phrases", desc: "Crée des phrases médicales, l'IA corrige", color: "from-primary/12 to-info/6", border: "border-primary/20" },
  { id: "script" as AtelierMode, icon: "✍️", title: "Script Builder", desc: "Construis tes scripts médicaux", color: "from-accent/12 to-warning/6", border: "border-accent/20" },
  { id: "diagnostic" as AtelierMode, icon: "🧠", title: "Diagnostic Builder", desc: "Raisonnement clinique actif", color: "from-clinical/12 to-info/6", border: "border-clinical/20" },
  { id: "case" as AtelierMode, icon: "🧾", title: "Créer ton cas", desc: "Rédige un dossier patient complet", color: "from-grammar/12 to-primary/6", border: "border-grammar/20" },
  { id: "interview" as AtelierMode, icon: "🎙", title: "Studio d'entretien", desc: "Enregistre, écoute, améliore", color: "from-accent/12 to-primary/6", border: "border-accent/20" },
  { id: "identity" as AtelierMode, icon: "🇨🇭", title: "Vision Board", desc: "Construis ton identité médicale suisse", color: "from-success/12 to-info/6", border: "border-success/20" },
  { id: "document" as AtelierMode, icon: "📄", title: "Builder de documents", desc: "Befundbericht, SBAR, emails pro", color: "from-info/12 to-primary/6", border: "border-info/20" },
  { id: "beat" as AtelierMode, icon: "🎵", title: "Beat Learning", desc: "Apprends au rythme musical", color: "from-warning/12 to-accent/6", border: "border-warning/20" },
  { id: "career" as AtelierMode, icon: "🏔️", title: "Builder de carrière", desc: "France → Suisse, niveau par niveau", color: "from-warning/12 to-success/6", border: "border-warning/20" },
];

interface AtelierHubProps {
  addXp: (n: number) => void;
  xp?: number;
}

export function AtelierHub({ addXp, xp = 0 }: AtelierHubProps) {
  const [mode, setMode] = useState<AtelierMode>("hub");

  const back = () => setMode("hub");
  const wrap = (child: React.ReactNode) => <div><BackButton onClick={back} />{child}</div>;

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
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">🏗️ Ateliers de création</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Tu ne révises pas. Tu <span className="text-foreground font-semibold">construis</span> ton futur médecin suisse.
        </p>
      </div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-gradient-to-r from-accent/8 to-warning/5 border border-accent/15 p-4 text-center"
      >
        <p className="text-xs italic text-accent/80">"La production active crée des connexions neuronales 3x plus fortes que la révision passive."</p>
        <p className="text-[10px] text-muted-foreground mt-1">— Csíkszentmihályi, Flow State</p>
      </motion.div>

      {/* Atelier cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ATELIERS.map((a, i) => (
          <motion.button
            key={a.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setMode(a.id)}
            className={`rounded-2xl bg-gradient-to-br ${a.color} border ${a.border} p-5 text-left transition-all group`}
          >
            <div className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform">{a.icon}</div>
            <div className="text-xs sm:text-sm font-bold tracking-tight">{a.title}</div>
            <div className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{a.desc}</div>
            <div className="mt-2 text-[9px] sm:text-[10px] font-semibold text-foreground/50 group-hover:text-foreground/70 transition-colors">
              Commencer →
            </div>
          </motion.button>
        ))}
      </div>

      {/* How it works */}
      <div className="card-elevated rounded-2xl p-5">
        <p className="text-xs font-bold text-muted-foreground mb-3">💡 Comment ça marche</p>
        <div className="space-y-2 text-xs text-foreground/70">
          <p>1. Tu choisis un atelier</p>
          <p>2. Tu <span className="text-foreground font-semibold">crées</span> du contenu en allemand médical</p>
          <p>3. L'IA coach corrige, améliore et propose des variantes</p>
          <p>4. Tu gagnes des XP à chaque soumission</p>
        </div>
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors mb-4">
      <ArrowLeft className="w-4 h-4" /> Retour aux ateliers
    </button>
  );
}
