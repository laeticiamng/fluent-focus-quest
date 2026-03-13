/**
 * GermanText — affiche du texte allemand avec un bouton discret
 * pour révéler la traduction en français.
 * Usage: <GermanText de="Thrombose" fr="Thrombose / caillot" />
 * Ou mode inline: <GermanText de="Der Patient klagt über..." fr="Le patient se plaint de..." />
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages } from "lucide-react";

interface GermanTextProps {
  de: string;
  fr: string;
  className?: string;
  /** Si true, affiche DE et FR côte à côte (mode bilingue permanent) */
  bilingual?: boolean;
  /** Si true, stylise comme un bloc plutôt qu'inline */
  block?: boolean;
}

export function GermanText({ de, fr, className = "", bilingual = false, block = false }: GermanTextProps) {
  const [shown, setShown] = useState(false);

  if (bilingual) {
    return (
      <span className={`inline-flex flex-col ${className}`}>
        <span>{de}</span>
        <span className="text-muted-foreground/70 text-[0.85em]">= {fr}</span>
      </span>
    );
  }

  if (block) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-start gap-2">
          <span className="flex-1">{de}</span>
          <button
            onClick={() => setShown(s => !s)}
            className={`shrink-0 flex items-center gap-1 text-[10px] font-semibold rounded-lg px-2 py-1 transition-all ${
              shown
                ? "bg-primary/15 text-primary"
                : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
            title="Voir la traduction française"
          >
            <Languages className="w-3 h-3" />
            {shown ? "FR" : "🇫🇷"}
          </button>
        </div>
        <AnimatePresence>
          {shown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="text-xs text-primary/80 bg-primary/8 border border-primary/15 rounded-lg px-3 py-2 leading-relaxed">
                🇫🇷 {fr}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Inline mode
  return (
    <span className={`inline-flex items-start gap-1 flex-wrap ${className}`}>
      <span>{de}</span>
      <button
        onClick={(e) => { e.stopPropagation(); setShown(s => !s); }}
        className={`inline-flex items-center gap-0.5 text-[9px] font-bold rounded px-1.5 py-0.5 transition-all align-middle self-center ${
          shown
            ? "bg-primary/15 text-primary"
            : "bg-secondary text-muted-foreground/60 hover:text-muted-foreground"
        }`}
        title="Traduction française"
      >
        <Languages className="w-2.5 h-2.5" />
        FR
      </button>
      <AnimatePresence>
        {shown && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="text-primary/80 font-medium"
          >
            = {fr}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/**
 * Bouton global de traduction — à placer en haut d'une section
 * pour activer/désactiver toutes les traductions à la fois.
 */
interface TranslationToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export function TranslationToggle({ enabled, onChange, label = "Traductions FR" }: TranslationToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border transition-all ${
        enabled
          ? "bg-primary/12 border-primary/25 text-primary"
          : "bg-secondary border-border/40 text-muted-foreground hover:text-foreground"
      }`}
    >
      <Languages className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
