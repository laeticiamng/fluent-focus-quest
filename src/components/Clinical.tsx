import { useState } from "react";
import { safeClean } from "@/utils/safeClean";
import { SCENARIOS, DECKS } from "@/data/content";
import { Check, Languages, Sparkles, FileText, HeartPulse, Stethoscope, AlertTriangle } from "lucide-react";
import { useTranslationPreference } from "@/hooks/useTranslationPreference";
import { RevealTranslation, TranslationToggle } from "@/components/translation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCelebration } from "@/components/CelebrationProvider";
import { useAICoach } from "@/hooks/useAICoach";
import { toast } from "sonner";
import type { Artifact } from "@/hooks/useProgress";
import { XP_VALUES } from "@/hooks/useProgress";
import { AtmosphericSceneWrapper } from "./immersive/AtmosphericSceneWrapper";

const DE_FR_LOOKUP: Record<string, string> = {};
DECKS.forEach(dk => {
  dk.cards.forEach(c => {
    const normalized = c.de.replace(/^(der|die|das|die)\s+/i, "").toLowerCase();
    DE_FR_LOOKUP[c.de.toLowerCase()] = c.fr;
    DE_FR_LOOKUP[normalized] = c.fr;
  });
});

function lookupTranslation(term: string): string | null {
  const clean = safeClean(
    term,
    (t) => t.replace(/^(der|die|das)\s+/i, "").toLowerCase(),
    "lookupTranslation",
  );
  return DE_FR_LOOKUP[term.toLowerCase()] || DE_FR_LOOKUP[clean] || null;
}

const PATIENT_NARRATIVES = [
  "Le moniteur bipe regulierement... le patient attend votre diagnostic.",
  "Les constantes se stabilisent... mais quelque chose ne colle pas.",
  "L'urgence est calme ce soir. Vous consultez le dossier du patient...",
  "Le Oberarzt observe par-dessus votre epaule. Soyez precise.",
  "Le patient grimace de douleur. Chaque seconde compte.",
];

const OBERARZT_PERSONA = `Tu es l'Oberarzt, un medecin senior bienveillant mais exigeant. Tu encadres les jeunes medecins dans leur raisonnement clinique. Tu parles avec l'autorite d'un chef de service : "ton raisonnement est structure", "tu as bien identifie les symptomes cardinaux", "attention a ne pas oublier le diagnostic differentiel". Tu utilises des termes medicaux allemands quand c'est pertinent.`;

interface ClinicalProps {
  addArtifact?: (artifact: Omit<Artifact, "id" | "date">) => void;
  artifacts?: Artifact[];
  addXp?: (n: number) => void;
}

export function Clinical({ addArtifact, artifacts = [], addXp }: ClinicalProps) {
  const [sci, setSci] = useState(0);
  const [scs, setScs] = useState(0);
  const { showFr: showTranslations, toggleFr: toggleTranslations } = useTranslationPreference();
  const { celebrate } = useCelebration();
  const { response: aiResponse, isLoading: aiLoading, error: aiError, ask: aiAsk, reset: aiReset } = useAICoach();

  const [hypotheses, setHypotheses] = useState("");
  const [clinicalNote, setClinicalNote] = useState("");
  const [hypothesesSubmitted, setHypothesesSubmitted] = useState(false);
  const [noteSubmitted, setNoteSubmitted] = useState(false);
  const [showConstructionMode, setShowConstructionMode] = useState(true);

  const clinicalCreationCount = artifacts.filter(a =>
    a.type === "clinical_note" || a.type === "diagnostic"
  ).length;

  const resetForScenario = (idx: number) => {
    setSci(idx); setScs(0);
    setHypotheses(""); setClinicalNote("");
    setHypothesesSubmitted(false); setNoteSubmitted(false);
    aiReset();
  };

  const handleHypothesesSubmit = () => {
    if (hypotheses.trim().length < 10) return;
    setHypothesesSubmitted(true);
    setScs(Math.max(scs, 3));

    if (addArtifact) {
      addArtifact({
        type: "diagnostic",
        sourceModule: "clinical",
        content: hypotheses,
        xpEarned: XP_VALUES.DIAGNOSTIC_BUILT,
        metadata: { scenarioIdx: sci, scenarioTitle: SCENARIOS[sci].title, phase: "hypotheses" },
      });
    }

    celebrate("creation");
    toast("🏥 Hypotheses soumises a l'Oberarzt ! +40 XP", { description: "Le diagnostic prend forme..." });
  };

  const handleClinicalNoteSubmit = () => {
    if (clinicalNote.trim().length < 20) return;

    const scenario = SCENARIOS[sci];
    const prompt = `${OBERARZT_PERSONA}

Scenario : ${scenario.title} — ${scenario.sit}
Vocabulaire cle : ${scenario.vocab.join(", ")}
Hypotheses de la candidate : "${hypotheses}"
Note clinique construite : "${clinicalNote}"

Analyse sa construction clinique :
1. Le raisonnement est-il logique et structure ?
2. Les termes medicaux allemands sont-ils corrects ?
3. Manque-t-il des elements importants ?
4. Propose une version enrichie de sa note

Sois concis (max 100 mots). Commence par reconnaitre la qualite. Utilise le ton d'un Oberarzt bienveillant mais exigeant.`;

    aiAsk(prompt, "phrase-lab");
    setNoteSubmitted(true);
    setScs(scenario.steps.length);

    if (addArtifact) {
      addArtifact({
        type: "clinical_note",
        sourceModule: "clinical",
        content: clinicalNote,
        feedback: "",
        xpEarned: XP_VALUES.CLINICAL_NOTE,
        metadata: { scenarioIdx: sci, scenarioTitle: scenario.title, hypotheses },
      });
    }

    celebrate("creation");
    toast("📋 Note clinique validee par l'Oberarzt ! +35 XP", { description: "Dossier patient complete" });
  };

  const narrative = PATIENT_NARRATIVES[sci % PATIENT_NARRATIVES.length];

  return (
    <AtmosphericSceneWrapper atmosphere="clinical" intensity="medium">
      <div className="space-y-4">
        {/* Hospital header — immersive */}
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-6 room-3d"
          style={{
            background: "linear-gradient(145deg, hsl(346 77% 50% / 0.06), hsl(var(--card)), hsl(346 50% 35% / 0.03))",
            border: "1px solid hsl(346 77% 50% / 0.1)",
            boxShadow: "var(--shadow-3d-xl), 0 0 60px -16px hsl(346 77% 50% / 0.1)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/[0.03] blur-[50px] rounded-full translate-x-1/4 -translate-y-1/4" />
          </div>
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-rose-400/10 to-transparent" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="door-icon-3d w-14 h-14 rounded-2xl bg-rose-500/12 border border-rose-500/15 flex items-center justify-center"
                  style={{ boxShadow: "var(--shadow-3d-md), 0 0 20px -6px hsl(346 77% 50% / 0.2)" }}
                >
                  <HeartPulse className="w-7 h-7 text-rose-400" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">L'Hopital</h2>
                  <p className="text-[10px] text-rose-400/50 font-medium">Service de l'Oberarzt</p>
                </div>
              </div>
              <div className="flex gap-2">
                <TranslationToggle active={showTranslations} onToggle={toggleTranslations} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dossier stats */}
        {clinicalCreationCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="room-3d rounded-2xl p-3.5 flex items-center justify-between"
            style={{
              background: "linear-gradient(145deg, hsl(346 77% 50% / 0.06), hsl(var(--card)))",
              border: "1px solid hsl(346 77% 50% / 0.1)",
              boxShadow: "var(--shadow-3d-sm)",
            }}
          >
            <span className="text-xs font-bold text-rose-400/80 flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5" /> Dossiers construits
            </span>
            <span className="text-sm font-black text-rose-400">{clinicalCreationCount}</span>
          </motion.div>
        )}

        {/* Scenario selector — patient rooms */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {SCENARIOS.map((s, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.96 }}
              onClick={() => resetForScenario(i)}
              className={`shrink-0 flex-1 min-w-0 rounded-xl p-3 text-center transition-all room-3d ${
                sci === i
                  ? "room-in-progress"
                  : "room-accessible"
              }`}
              style={{
                border: sci === i ? "1px solid hsl(346 77% 50% / 0.25)" : "1px solid hsl(var(--border) / 0.3)",
                boxShadow: sci === i ? "var(--shadow-3d-md), 0 0 16px -4px hsl(346 77% 50% / 0.15)" : "var(--shadow-3d-sm)",
              }}
            >
              <div className="text-xl">{s.icon}</div>
              <div className={`text-[9px] mt-1 truncate font-medium ${sci === i ? "text-rose-400" : "text-muted-foreground"}`}>{s.title}</div>
            </motion.button>
          ))}
        </div>

        {/* Active scenario — patient card */}
        <motion.div
          key={sci}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="room-3d rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, hsl(346 77% 50% / 0.04), hsl(var(--card)))",
            border: "1px solid hsl(346 77% 50% / 0.12)",
            boxShadow: "var(--shadow-3d-lg)",
          }}
        >
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-rose-400/8 to-transparent" />

          {/* Patient narrative — ambient */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[10px] italic text-rose-400/35 mb-3"
          >
            {narrative}
          </motion.p>

          <h3 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2">
            {SCENARIOS[sci].icon} {SCENARIOS[sci].title}
          </h3>

          {/* Situation — patient briefing */}
          <div className="rounded-xl bg-blue-500/8 border-l-[3px] border-blue-400/40 px-4 py-3 mb-4">
            <p className="text-[10px] uppercase tracking-[2px] text-blue-400/60 mb-1">Briefing Patient</p>
            <p className="text-xs leading-relaxed">{SCENARIOS[sci].sit}</p>
            <RevealTranslation fr={(SCENARIOS[sci] as Record<string, unknown>).sitFr as string} globalShow={showTranslations} size="xs" />
          </div>

          {/* Vocab tags with monitor feel */}
          <div className="flex gap-1.5 flex-wrap mb-4">
            {SCENARIOS[sci].vocab.map((v, i) => {
              const vocabFrArr = (SCENARIOS[sci] as Record<string, unknown>).vocabFr as string[] | undefined;
              const fr = showTranslations ? (vocabFrArr?.[i] || lookupTranslation(v)) : null;
              return (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-[10px] bg-emerald-500/8 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/15 font-medium">
                    {v}
                  </span>
                  <AnimatePresence>
                    {fr && (
                      <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[9px] text-primary/70 mt-0.5 font-medium"
                      >
                        {fr}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* CONSTRUCTION MODE — Diagnostic Table */}
          {showConstructionMode && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 mb-4 space-y-4 relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, hsl(32 95% 55% / 0.04), hsl(var(--secondary) / 0.5))",
                border: "1px solid hsl(32 95% 55% / 0.1)",
              }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400/70" />
                <p className="text-xs font-bold text-amber-400/80">Construis ton raisonnement clinique</p>
              </div>

              {/* Phase 1: Hypotheses */}
              <div>
                <p className="text-[10px] uppercase tracking-[2px] text-muted-foreground/60 mb-2 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  Verdachtsdiagnosen — Tes hypotheses
                </p>
                <Textarea
                  value={hypotheses}
                  onChange={e => setHypotheses(e.target.value)}
                  placeholder="Quelles sont tes hypotheses ? Verdachtsdiagnosen: ..."
                  className="min-h-[70px] bg-secondary/40 border-border/30 rounded-xl text-sm resize-none focus:border-rose-500/25"
                  disabled={hypothesesSubmitted}
                />
                {!hypothesesSubmitted ? (
                  <Button
                    onClick={handleHypothesesSubmit}
                    disabled={hypotheses.trim().length < 10}
                    className="w-full rounded-xl text-xs mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white h-11"
                    style={{ boxShadow: "0 4px 16px -4px hsl(32 95% 55% / 0.3)" }}
                  >
                    <Stethoscope className="w-3.5 h-3.5 mr-1.5" /> Presenter a l'Oberarzt +40 XP
                  </Button>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] text-emerald-400 font-medium mt-2 flex items-center gap-1.5"
                  >
                    <Check className="w-3 h-3" /> Hypotheses acceptees — les etapes cliniques se revelent
                  </motion.p>
                )}
              </div>

              {/* Phase 2: Clinical note */}
              <AnimatePresence>
                {hypothesesSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                  >
                    <p className="text-[10px] uppercase tracking-[2px] text-muted-foreground/60 mb-2 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-rose-500/15 text-rose-400 flex items-center justify-center text-[10px] font-bold">2</span>
                      Klinische Notiz — Ta note clinique
                    </p>
                    <Textarea
                      value={clinicalNote}
                      onChange={e => setClinicalNote(e.target.value)}
                      placeholder="Redige ta note clinique : Anamnese, Untersuchung, Diagnose, Therapieplan..."
                      className="min-h-[100px] bg-secondary/40 border-border/30 rounded-xl text-sm resize-none focus:border-rose-500/25"
                      disabled={noteSubmitted}
                    />
                    {!noteSubmitted ? (
                      <Button
                        onClick={handleClinicalNoteSubmit}
                        disabled={clinicalNote.trim().length < 20 || aiLoading}
                        className="w-full rounded-xl text-xs mt-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white h-11"
                        style={{ boxShadow: "0 4px 16px -4px hsl(346 77% 50% / 0.3)" }}
                      >
                        {aiLoading ? (
                          <><Sparkles className="w-3.5 h-3.5 animate-spin mr-1.5" /> L'Oberarzt examine...</>
                        ) : (
                          <><FileText className="w-3.5 h-3.5 mr-1.5" /> Soumettre au Chef de Service +35 XP</>
                        )}
                      </Button>
                    ) : (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] text-emerald-400 font-medium mt-2 flex items-center gap-1.5"
                      >
                        <Check className="w-3 h-3" /> Note clinique validee par l'Oberarzt
                      </motion.p>
                    )}

                    {aiError && (
                      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400 mt-2">{aiError}</div>
                    )}

                    {/* AI feedback — Oberarzt */}
                    {aiResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="room-3d rounded-xl p-5 mt-3 relative overflow-hidden"
                        style={{
                          background: "linear-gradient(145deg, hsl(346 77% 50% / 0.06), hsl(var(--card)))",
                          border: "1px solid hsl(346 77% 50% / 0.12)",
                          boxShadow: "var(--shadow-3d-sm), 0 0 20px -6px hsl(346 77% 50% / 0.1)",
                        }}
                      >
                        <div className="flex items-center gap-2.5 mb-3 relative z-10">
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-lg"
                          >
                            🩺
                          </motion.div>
                          <div>
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[2px]">Oberarzt</p>
                            <p className="text-[9px] text-rose-400/40">Evaluation du Chef de Service</p>
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground/85 relative z-10">{aiResponse}</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Steps — progressive reveal with hospital monitor feel */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[2px] text-muted-foreground/50 mb-2">Protokoll — Etapes cliniques</p>
            {SCENARIOS[sci].steps.map((st, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: i <= scs ? 1 : 0.4, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  if (hypothesesSubmitted || !showConstructionMode) {
                    setScs(Math.max(scs, i + 1));
                  }
                }}
                className={`flex gap-2.5 items-start p-2 rounded-lg transition-all ${
                  (hypothesesSubmitted || !showConstructionMode) ? "cursor-pointer hover:bg-secondary/30" : "cursor-default"
                }`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold transition-colors ${
                  i < scs
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                    : "bg-secondary/60 text-foreground border border-border/20"
                }`}>
                  {i < scs ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <div>
                  <p className={`text-xs leading-relaxed transition-all ${i <= scs ? "" : "blur-sm"} ${i < scs ? "text-foreground" : "text-muted-foreground"}`}>
                    {st}
                  </p>
                  {i <= scs && (() => {
                    const stepsFrArr = (SCENARIOS[sci] as Record<string, unknown>).stepsFr as string[] | undefined;
                    return <RevealTranslation fr={stepsFrArr?.[i]} globalShow={showTranslations} size="xs" />;
                  })()}
                </div>
              </motion.div>
            ))}
          </div>

          {!showConstructionMode && (
            <button
              onClick={() => setShowConstructionMode(true)}
              className="w-full mt-4 rounded-xl bg-amber-500/8 border border-amber-500/15 p-3.5 text-xs font-bold text-amber-400 text-center hover:bg-amber-500/12 transition-all"
            >
              <Stethoscope className="w-3.5 h-3.5 inline mr-1.5" />
              Ouvrir la table de diagnostic
            </button>
          )}
        </motion.div>
      </div>
    </AtmosphericSceneWrapper>
  );
}
