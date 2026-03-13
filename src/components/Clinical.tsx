import { useState } from "react";
import { SCENARIOS, DECKS } from "@/data/content";
import { Check, Languages, Sparkles, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCelebration } from "@/components/CelebrationProvider";
import { useAICoach } from "@/hooks/useAICoach";
import { toast } from "sonner";
import type { Artifact } from "@/hooks/useProgress";
import { XP_VALUES } from "@/hooks/useProgress";

// Build a lookup: German term → French translation from all DECKS
const DE_FR_LOOKUP: Record<string, string> = {};
DECKS.forEach(dk => {
  dk.cards.forEach(c => {
    const normalized = c.de.replace(/^(der|die|das|die)\s+/i, "").toLowerCase();
    DE_FR_LOOKUP[c.de.toLowerCase()] = c.fr;
    DE_FR_LOOKUP[normalized] = c.fr;
  });
});

function lookupTranslation(term: string): string | null {
  const clean = term.replace(/^(der|die|das)\s+/i, "").toLowerCase();
  return DE_FR_LOOKUP[term.toLowerCase()] || DE_FR_LOOKUP[clean] || null;
}

interface ClinicalProps {
  addArtifact?: (artifact: Omit<Artifact, "id" | "date">) => void;
  artifacts?: Artifact[];
  addXp?: (n: number) => void;
}

export function Clinical({ addArtifact, artifacts = [], addXp }: ClinicalProps) {
  const [sci, setSci] = useState(0);
  const [scs, setScs] = useState(0);
  const [showTranslations, setShowTranslations] = useState(false);
  const { celebrate } = useCelebration();
  const { response: aiResponse, isLoading: aiLoading, error: aiError, ask: aiAsk, reset: aiReset } = useAICoach();

  // Construction mode state
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
    // Reveal first 3 steps
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
    toast("🏥 Hypotheses construites ! +40 XP", { description: "Diagnostic en cours de construction" });
  };

  const handleClinicalNoteSubmit = () => {
    if (clinicalNote.trim().length < 20) return;

    const scenario = SCENARIOS[sci];
    const prompt = `Tu es un coach d'atelier clinique en medecine. Tu accompagnes la construction d'un raisonnement clinique.

Scenario : ${scenario.title} — ${scenario.sit}
Vocabulaire cle : ${scenario.vocab.join(", ")}
Hypotheses de l'utilisateur : "${hypotheses}"
Note clinique construite par l'utilisateur : "${clinicalNote}"

Analyse sa construction clinique :
1. Le raisonnement est-il logique et structure ?
2. Les termes medicaux allemands sont-ils corrects ?
3. Manque-t-il des elements importants ?
4. Propose une version enrichie de sa note

Sois concis (max 100 mots). Commence par reconnaitre la qualite de sa construction. Dis "ta construction clinique" et "version enrichie".`;

    aiAsk(prompt, "phrase-lab");
    setNoteSubmitted(true);
    // Reveal all steps
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
    toast("📝 Note clinique construite ! +35 XP", { description: "Ajoutee a ton dossier clinique" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black flex items-center gap-2">
          <FileText className="w-5 h-5 text-clinical" /> Atelier clinique
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTranslations(v => !v)}
            className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border transition-all ${
              showTranslations
                ? "bg-primary/12 border-primary/25 text-primary"
                : "bg-secondary border-border/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            🇫🇷
          </button>
        </div>
      </div>

      {/* Creation stats */}
      {clinicalCreationCount > 0 && (
        <div className="rounded-2xl bg-clinical/8 border border-clinical/15 p-3 flex items-center justify-between">
          <span className="text-xs font-bold text-clinical">🏥 Dossiers construits</span>
          <span className="text-sm font-black text-clinical">{clinicalCreationCount}</span>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => resetForScenario(i)}
            className={`shrink-0 flex-1 min-w-0 rounded-lg border p-2.5 text-center transition-all ${
              sci === i ? "border-primary bg-primary/10" : "border-border bg-card"
            }`}
          >
            <div className="text-xl">{s.icon}</div>
            <div className={`text-[9px] mt-1 truncate ${sci === i ? "text-primary" : "text-muted-foreground"}`}>{s.title}</div>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-primary/30 bg-card p-4">
        <h3 className="text-sm font-bold text-primary mb-3">{SCENARIOS[sci].icon} {SCENARIOS[sci].title}</h3>

        {/* Situation */}
        <div className="rounded-lg bg-info/10 border-l-[3px] border-info px-3 py-2.5 mb-4">
          <p className="text-xs leading-relaxed">{SCENARIOS[sci].sit}</p>
        </div>

        {/* Vocab tags with optional translations */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {SCENARIOS[sci].vocab.map((v, i) => {
            const fr = showTranslations ? lookupTranslation(v) : null;
            return (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[10px] bg-grammar/10 text-grammar px-2 py-0.5 rounded-full border border-grammar/20 font-medium">
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

        {/* CONSTRUCTION MODE — Hypotheses */}
        {showConstructionMode && (
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-4 mb-4 space-y-3">
            <p className="text-xs font-bold text-amber-400">🔨 Construis ton raisonnement</p>

            {/* Step 1: Hypotheses */}
            <div>
              <p className="text-[10px] uppercase tracking-[2px] text-muted-foreground mb-2">
                Etape 1 — Tes hypotheses diagnostiques
              </p>
              <Textarea
                value={hypotheses}
                onChange={e => setHypotheses(e.target.value)}
                placeholder="Quelles sont tes hypotheses ? (en allemand si possible) Verdachtsdiagnosen..."
                className="min-h-[70px] bg-secondary/50 border-border/40 rounded-xl text-sm resize-none"
                disabled={hypothesesSubmitted}
              />
              {!hypothesesSubmitted ? (
                <Button
                  onClick={handleHypothesesSubmit}
                  disabled={hypotheses.trim().length < 10}
                  className="w-full rounded-xl text-xs mt-2 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  🏥 Soumettre mes hypotheses +40 XP
                </Button>
              ) : (
                <p className="text-[10px] text-amber-400 font-medium mt-2">✓ Hypotheses soumises — les etapes se revelent</p>
              )}
            </div>

            {/* Step 2: Clinical note (only after hypotheses) */}
            {hypothesesSubmitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <p className="text-[10px] uppercase tracking-[2px] text-muted-foreground mb-2">
                  Etape 2 — Ta note clinique / synthese
                </p>
                <Textarea
                  value={clinicalNote}
                  onChange={e => setClinicalNote(e.target.value)}
                  placeholder="Redige ta note clinique : anamnese, examen, decision, plan... (en allemand)"
                  className="min-h-[100px] bg-secondary/50 border-border/40 rounded-xl text-sm resize-none"
                  disabled={noteSubmitted}
                />
                {!noteSubmitted ? (
                  <Button
                    onClick={handleClinicalNoteSubmit}
                    disabled={clinicalNote.trim().length < 20 || aiLoading}
                    className="w-full rounded-xl text-xs mt-2 bg-clinical hover:bg-clinical/80 text-white"
                  >
                    {aiLoading ? (
                      <><Sparkles className="w-3.5 h-3.5 animate-spin mr-1" /> Analyse en cours...</>
                    ) : (
                      "📝 Soumettre ma note clinique +35 XP"
                    )}
                  </Button>
                ) : (
                  <p className="text-[10px] text-clinical font-medium mt-2">✓ Note clinique construite</p>
                )}

                {aiError && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive mt-2">{aiError}</div>
                )}

                {/* AI feedback */}
                {aiResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-clinical/5 border border-clinical/15 p-4 mt-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-clinical" />
                      <span className="text-[10px] font-bold text-clinical uppercase tracking-wider">Coach clinique</span>
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground/85">{aiResponse}</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Steps — gradually revealed */}
        <div className="space-y-2">
          {SCENARIOS[sci].steps.map((st, i) => (
            <div
              key={i}
              onClick={() => {
                if (hypothesesSubmitted || !showConstructionMode) {
                  setScs(Math.max(scs, i + 1));
                }
              }}
              className={`flex gap-2.5 items-start ${(hypothesesSubmitted || !showConstructionMode) ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold ${
                i < scs ? "bg-success text-primary-foreground" : "bg-secondary text-foreground"
              }`}>
                {i < scs ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <p className={`text-xs leading-relaxed ${i <= scs ? "" : "blur-sm"} ${i < scs ? "text-foreground" : "text-muted-foreground"}`}>
                {st}
              </p>
            </div>
          ))}
        </div>

        {!showConstructionMode && (
          <button
            onClick={() => setShowConstructionMode(true)}
            className="w-full mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs font-bold text-amber-400 text-center"
          >
            🔨 Passer en mode construction
          </button>
        )}
      </div>
    </div>
  );
}
