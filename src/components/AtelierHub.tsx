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
import { ArrowLeft, ChevronRight, KeyRound } from "lucide-react";
import { AtmosphericSceneWrapper } from "./immersive/AtmosphericSceneWrapper";
import { CameraTransitionLayer } from "./immersive/CameraTransitionLayer";

type AtelierMode = "hub" | "phrase" | "script" | "diagnostic" | "case" | "interview" | "identity" | "document" | "beat" | "career";

const ATELIERS: Array<{
  id: AtelierMode;
  icon: string;
  title: string;
  roomName: string;
  desc: string;
  output: string;
  reward: string;
  level: string;
  color: string;
  border: string;
  accent: string;
  tag: string;
  atmosphere: "forge" | "grammar" | "studio" | "clinical" | "laboratory" | "archive";
  centerObject: string;
  themeDesc: string;
}> = [
  {
    id: "phrase", icon: "🧪", title: "Le Laboratoire", roomName: "Alchimiste des Mots",
    desc: "Transmute les mots en phrases d'or — chaque formule validee cree un fragment de cle",
    output: "Formules alchimiques", reward: "Fragment par transmutation", level: "Tous niveaux",
    color: "from-emerald-500/15 to-teal-500/8", border: "border-emerald-500/25", accent: "text-emerald-400", tag: "Alchimie",
    atmosphere: "laboratory", centerObject: "⚗️", themeDesc: "Fioles & reactifs verbaux",
  },
  {
    id: "script", icon: "✍️", title: "Le Scriptorium", roomName: "Scribe Royal",
    desc: "Redige les parchemins medicaux — chaque script scelle revele un code sacre",
    output: "Parchemins scelles", reward: "Sceau par script valide", level: "Intermediaire",
    color: "from-violet-500/15 to-purple-500/8", border: "border-violet-500/25", accent: "text-violet-400", tag: "Parchemin",
    atmosphere: "archive", centerObject: "📜", themeDesc: "Plumes & encriers",
  },
  {
    id: "diagnostic", icon: "🧠", title: "Salle de Diagnostic", roomName: "Bureau du Chefarzt",
    desc: "Presente ton raisonnement au Chefarzt — chaque diagnostic revele un indice strategique",
    output: "Indices cliniques", reward: "Indice par diagnostic", level: "Avance",
    color: "from-rose-500/15 to-pink-500/8", border: "border-rose-500/25", accent: "text-rose-400", tag: "Diagnostic",
    atmosphere: "clinical", centerObject: "🩺", themeDesc: "Bureau du chef de service",
  },
  {
    id: "case", icon: "📁", title: "Les Archives", roomName: "Archiviste Medical",
    desc: "Reconstitue un dossier patient — un dossier complet debloque un artefact clinique",
    output: "Dossiers archives", reward: "Artefact par dossier", level: "Avance",
    color: "from-cyan-500/15 to-teal-500/8", border: "border-cyan-500/25", accent: "text-cyan-400", tag: "Archive",
    atmosphere: "archive", centerObject: "📋", themeDesc: "Etageres & dossiers suspendus",
  },
  {
    id: "interview", icon: "🎙️", title: "Le Plateau", roomName: "Scene du Regisseur",
    desc: "Enregistre et perfectionne sous le regard du Regisseur — chaque prise forge un sceau vocal",
    output: "Sceaux vocaux", reward: "Sceau par enregistrement", level: "Tous niveaux",
    color: "from-amber-500/15 to-orange-500/8", border: "border-amber-500/25", accent: "text-amber-400", tag: "Scene",
    atmosphere: "studio", centerObject: "🎬", themeDesc: "Scene & projecteurs",
  },
  {
    id: "identity", icon: "🔮", title: "Le Miroir de l'Oracle", roomName: "Chambre de Reflexion",
    desc: "Construis ta vision de medecin suisse — chaque reflexion eclaire ton chemin",
    output: "Visions eclairees", reward: "Clarte par reflexion", level: "Tous niveaux",
    color: "from-emerald-500/15 to-teal-500/8", border: "border-emerald-500/25", accent: "text-emerald-400", tag: "Oracle",
    atmosphere: "grammar", centerObject: "🔮", themeDesc: "Miroir & cristaux",
  },
  {
    id: "document", icon: "📜", title: "La Chancellerie", roomName: "Bureau du Kanzler",
    desc: "Befundbericht, SBAR, Arztbrief — chaque document scelle par le Kanzler restaure un protocole",
    output: "Protocoles scelles", reward: "Sceau par document", level: "Intermediaire",
    color: "from-blue-500/15 to-indigo-500/8", border: "border-blue-500/25", accent: "text-blue-400", tag: "Chancellerie",
    atmosphere: "laboratory", centerObject: "📝", themeDesc: "Sceaux & protocoles officiels",
  },
  {
    id: "beat", icon: "🎵", title: "La Salle du Rythme", roomName: "Chambre du Metronome",
    desc: "Memorise au rythme du Metronome — chaque synchronisation revele une rune sonore",
    output: "Runes sonores", reward: "Rune par session", level: "Tous niveaux",
    color: "from-amber-500/15 to-orange-500/8", border: "border-amber-500/25", accent: "text-amber-400", tag: "Rythme",
    atmosphere: "studio", centerObject: "🎶", themeDesc: "Metronome & ondes sonores",
  },
  {
    id: "career", icon: "🏔️", title: "L'Ascension", roomName: "Sentier du Mentor",
    desc: "France → Suisse — chaque etape gravie avec le Mentor ouvre un nouveau camp de base",
    output: "Camps atteints", reward: "Progression de sommet", level: "Tous niveaux",
    color: "from-amber-500/15 to-emerald-500/8", border: "border-amber-500/25", accent: "text-amber-400", tag: "Sommet",
    atmosphere: "archive", centerObject: "⛰️", themeDesc: "Vue panoramique des Alpes",
  },
];

interface AtelierHubProps {
  addXp: (n: number) => void;
  xp?: number;
}

export function AtelierHub({ addXp, xp = 0 }: AtelierHubProps) {
  const [mode, setMode] = useState<AtelierMode>("hub");

  const currentAtelier = ATELIERS.find(a => a.id === mode);

  const back = () => setMode("hub");
  const wrap = (child: React.ReactNode) => (
    <CameraTransitionLayer transitionKey={mode} direction="zoom-in">
      <AtmosphericSceneWrapper atmosphere={currentAtelier?.atmosphere || "laboratory"} intensity="medium">
        <div>
          <BackButton onClick={back} />
          {child}
        </div>
      </AtmosphericSceneWrapper>
    </CameraTransitionLayer>
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
    <CameraTransitionLayer transitionKey="hub" direction="zoom-out">
      <AtmosphericSceneWrapper atmosphere="laboratory" intensity="medium">
        <div className="space-y-5">
          {/* Hero banner — 3D laboratory entrance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 room-3d"
            style={{
              background: "linear-gradient(145deg, hsl(215 90% 58% / 0.08), hsl(var(--card)), hsl(265 55% 62% / 0.05))",
              border: "1px solid hsl(215 90% 58% / 0.15)",
              boxShadow: "var(--shadow-3d-lg), 0 0 60px -16px hsl(215 90% 58% / 0.12)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-48 h-48 bg-blue-500/[0.04] blur-[50px] rounded-full" />
              <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-violet-500/[0.04] blur-[40px] rounded-full" />
            </div>
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotateY: [0, 8, -8, 0], y: [0, -3, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="door-icon-3d w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-3xl"
                  style={{ boxShadow: "var(--shadow-3d-md)" }}
                >⚗️</motion.div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">Laboratoire de Creation</h2>
                  <p className="text-[10px] text-muted-foreground">9 salles specialisees — chaque creation debloque la suite</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Escape game loop banner */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-gradient-to-r from-amber-500/8 to-transparent border border-amber-500/15 px-4 py-3"
            style={{ boxShadow: "var(--shadow-3d-sm)" }}
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

            {/* Atelier cards — 3D themed chambers */}
            <div className="space-y-3">
              {ATELIERS.map((a, i) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, y: 16, rotateX: -2 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.12 + i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ y: -4, rotateX: 1, scale: 1.005 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode(a.id)}
                  className={`w-full rounded-2xl bg-gradient-to-r ${a.color} border ${a.border} p-4 sm:p-5 text-left transition-all group relative overflow-hidden room-3d`}
                >
                  {/* Volumetric inner light */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-[25%] rounded-full opacity-30 blur-[25px]"
                      style={{
                        background: a.accent.includes("primary") ? "hsl(var(--primary) / 0.1)" :
                          a.accent.includes("accent") ? "hsl(var(--accent) / 0.1)" :
                          a.accent.includes("clinical") ? "hsl(var(--clinical) / 0.1)" :
                          a.accent.includes("grammar") ? "hsl(var(--grammar) / 0.1)" :
                          a.accent.includes("success") ? "hsl(var(--success) / 0.1)" :
                          a.accent.includes("info") ? "hsl(var(--info) / 0.1)" :
                          a.accent.includes("warning") ? "hsl(var(--warning) / 0.1)" :
                          "hsl(var(--primary) / 0.1)"
                      }}
                    />
                  </div>

                  {/* Light sweep on hover */}
                  <div className="absolute inset-0 z-[4] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden">
                    <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent
                      translate-x-[-100%] group-hover:translate-x-[400%] transition-transform duration-1000 ease-out" />
                  </div>

                  <div className="relative z-10 flex items-center gap-4">
                    {/* Central object — themed icon with depth */}
                    <motion.div
                      animate={{ rotateY: [0, 5, -5, 0] }}
                      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                      className="door-icon-3d w-13 h-13 rounded-xl bg-background/30 border border-border/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
                      style={{
                        width: "52px", height: "52px",
                        boxShadow: "var(--shadow-3d-sm)",
                      }}
                    >
                      <span className="text-xl sm:text-2xl">{a.icon}</span>
                    </motion.div>

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
                        <span className="text-[9px] text-muted-foreground/60">{a.themeDesc}</span>
                      </div>
                    </div>

                    <ChevronRight className={`w-5 h-5 shrink-0 ${a.accent} opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Mechanism visualization — 3D pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl p-5 room-3d"
            style={{
              background: "linear-gradient(145deg, hsl(var(--card)), hsl(225 18% 9%))",
              border: "1px solid hsl(var(--border) / 0.4)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-4">Mecanisme de deblocage</p>
            <div className="flex items-center justify-between gap-1.5">
              {[
                { icon: "🔍", label: "Explorer" },
                { icon: "🧠", label: "Comprendre" },
                { icon: "✍️", label: "Creer" },
                { icon: "✓", label: "Valider" },
                { icon: "🔑", label: "Fragment" },
                { icon: "🔓", label: "Debloquer" },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.06 }}
                  className="flex flex-col items-center gap-1.5 flex-1"
                >
                  <div className="door-icon-3d w-8 h-8 rounded-lg bg-secondary/30 border border-border/20 flex items-center justify-center text-sm"
                    style={{ boxShadow: "var(--shadow-3d-sm)" }}>
                    {step.icon}
                  </div>
                  <span className="text-[8px] font-bold text-muted-foreground text-center">{step.label}</span>
                  {i < 5 && (
                    <div className="absolute" style={{ marginLeft: '100%' }}>
                      <span className="text-[10px] text-muted-foreground/20">→</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </AtmosphericSceneWrapper>
    </CameraTransitionLayer>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors mb-5 group"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      Retour au Laboratoire
    </motion.button>
  );
}
