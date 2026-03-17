import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages } from "lucide-react";

interface RevealTranslationProps {
  /** French translation text. If undefined/empty the button is hidden. */
  fr?: string | null;
  /** Whether the global preference says "show translations" */
  globalShow?: boolean;
  /** Extra Tailwind classes on the outer wrapper */
  className?: string;
  /** Render inline (span) instead of block (div) */
  inline?: boolean;
  /** Size variant */
  size?: "xs" | "sm" | "md";
}

/**
 * A small, self-contained block that reveals a French translation.
 *
 * - Respects a `globalShow` prop (from the global preference).
 * - Also has its own local toggle so users can show/hide per-block.
 * - If `fr` is falsy, renders nothing.
 */
export function RevealTranslation({
  fr,
  globalShow = false,
  className = "",
  inline = false,
  size = "xs",
}: RevealTranslationProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = globalShow || localOpen;

  if (!fr) return null;

  const textSize =
    size === "md" ? "text-sm" : size === "sm" ? "text-xs" : "text-[11px]";
  const Tag = inline ? "span" : "div";

  return (
    <Tag className={`${className}`}>
      {!globalShow && !localOpen && (
        <button
          type="button"
          onClick={() => setLocalOpen(true)}
          className={`inline-flex items-center gap-1 ${textSize} text-blue-400/70 hover:text-blue-300 transition-colors mt-0.5`}
          aria-label="Voir la traduction française"
        >
          <Languages className="w-3 h-3" />
          <span>FR</span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.span
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15 }}
            className={`${inline ? "ml-1.5" : "block mt-0.5"} ${textSize} text-blue-300/80 italic`}
            onClick={() => {
              if (!globalShow) setLocalOpen(false);
            }}
            role="button"
            tabIndex={0}
            aria-label="Masquer la traduction"
          >
            {fr}
          </motion.span>
        )}
      </AnimatePresence>
    </Tag>
  );
}
