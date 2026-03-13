import { useState } from "react";
import { motion } from "framer-motion";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { IVW } from "@/data/content";
import { Shuffle, ChevronDown, ChevronUp } from "lucide-react";

export function InterviewStudio({ addXp }: { addXp: (n: number) => void }) {
  const [questionIdx, setQuestionIdx] = useState<number | null>(null);
  const [showModel, setShowModel] = useState(false);
  const [versions, setVersions] = useState(0);

  const pickRandom = () => {
    setQuestionIdx(Math.floor(Math.random() * IVW.length));
    setShowModel(false);
    setVersions(0);
  };

  const pickQuestion = (i: number) => {
    setQuestionIdx(i);
    setShowModel(false);
    setVersions(0);
  };

  const q = questionIdx !== null ? IVW[questionIdx] : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🎙</span>
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Studio d'entretien</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Enregistre, écoute, améliore — vois ta progression</p>
        </div>
      </div>

      {!q ? (
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={pickRandom}
            className="w-full rounded-2xl bg-gradient-to-br from-accent/15 via-card to-warning/10 border border-accent/20 p-8 text-center"
          >
            <Shuffle className="w-8 h-8 mx-auto mb-3 text-accent" />
            <p className="text-lg font-bold">Question au hasard</p>
            <p className="text-xs text-muted-foreground mt-1">Entraîne-toi comme le jour J</p>
          </motion.button>

          <p className="text-xs text-muted-foreground">Ou choisis une question :</p>
          <div className="space-y-2">
            {IVW.map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => pickQuestion(i)}
                className="w-full rounded-xl card-elevated p-3 text-left hover:border-accent/30 transition-all"
              >
                <span className="text-sm font-bold">{item.q}</span>
                <span className="text-[10px] text-muted-foreground ml-2">{item.h}</span>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Question */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-gradient-to-r from-accent/12 to-warning/8 border border-accent/20 p-6 text-center"
          >
            <p className="text-[10px] uppercase tracking-[3px] text-accent/70 mb-2">Question d'entretien</p>
            <p className="text-lg sm:text-xl font-black tracking-tight">{q.q}</p>
            <p className="text-xs text-muted-foreground mt-2">💡 {q.h}</p>
          </motion.div>

          {/* Recording zone */}
          <div className="card-elevated rounded-2xl p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">
              🎙 Enregistre ta réponse — puis écoute et améliore :
            </p>
            <VoiceRecorder label={`Entretien: ${q.q}`} context={q.q} />
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  setVersions(v => v + 1);
                  addXp(10);
                }}
                className="text-xs text-primary font-semibold hover:underline"
              >
                ✅ Version {versions + 1} enregistrée
              </button>
              {versions > 0 && (
                <span className="text-[10px] text-success font-bold">🔥 {versions} version{versions > 1 ? "s" : ""}</span>
              )}
            </div>
          </div>

          {/* Model answer */}
          <div className="card-elevated rounded-2xl p-5">
            <button
              onClick={() => setShowModel(!showModel)}
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground w-full"
            >
              <span>📝 Réponse modèle</span>
              {showModel ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
            </button>
            {showModel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 rounded-xl bg-success/8 border border-success/15 p-4"
              >
                <p className="text-sm leading-relaxed">{q.r}</p>
              </motion.div>
            )}
          </div>

          <button
            onClick={pickRandom}
            className="text-xs text-primary font-semibold hover:underline"
          >
            → Autre question
          </button>
        </div>
      )}
    </div>
  );
}
