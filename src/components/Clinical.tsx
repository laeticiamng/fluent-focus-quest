import { useState } from "react";
import { SCENARIOS, DECKS } from "@/data/content";
import { Check, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Build a lookup: German term → French translation from all DECKS
const DE_FR_LOOKUP: Record<string, string> = {};
DECKS.forEach(dk => {
  dk.cards.forEach(c => {
    // Normalize: strip articles (der/die/das/die), lowercase for matching
    const normalized = c.de.replace(/^(der|die|das|die)\s+/i, "").toLowerCase();
    DE_FR_LOOKUP[c.de.toLowerCase()] = c.fr;
    DE_FR_LOOKUP[normalized] = c.fr;
  });
});

function lookupTranslation(term: string): string | null {
  const clean = term.replace(/^(der|die|das)\s+/i, "").toLowerCase();
  return DE_FR_LOOKUP[term.toLowerCase()] || DE_FR_LOOKUP[clean] || null;
}

export function Clinical() {
  const [sci, setSci] = useState(0);
  const [scs, setScs] = useState(0);
  const [showTranslations, setShowTranslations] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">🏥 Cas cliniques</h2>
        <button
          onClick={() => setShowTranslations(v => !v)}
          className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border transition-all ${
            showTranslations
              ? "bg-primary/12 border-primary/25 text-primary"
              : "bg-secondary border-border/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          🇫🇷 Traductions
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => { setSci(i); setScs(0); }}
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

        {/* Steps */}
        <div className="space-y-2">
          {SCENARIOS[sci].steps.map((st, i) => (
            <div
              key={i}
              onClick={() => setScs(Math.max(scs, i + 1))}
              className="flex gap-2.5 items-start cursor-pointer"
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
      </div>
    </div>
  );
}
