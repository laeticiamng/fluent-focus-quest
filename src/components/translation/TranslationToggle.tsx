import { Languages } from "lucide-react";

interface TranslationToggleProps {
  /** Current state */
  active: boolean;
  /** Toggle callback */
  onToggle: () => void;
  /** Optional label override */
  label?: string;
  /** Size variant */
  size?: "sm" | "md";
}

/**
 * A compact toggle button for "Afficher les traductions FR".
 * Used in module headers and in the global settings bar.
 */
export function TranslationToggle({
  active,
  onToggle,
  label,
  size = "sm",
}: TranslationToggleProps) {
  const isSmall = size === "sm";
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        inline-flex items-center gap-1.5 rounded-full border transition-all
        ${isSmall ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs"}
        ${
          active
            ? "bg-blue-500/15 border-blue-400/40 text-blue-300"
            : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
        }
      `}
      aria-pressed={active}
      aria-label={label ?? "Afficher les traductions françaises"}
    >
      <Languages className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span className="font-semibold">{label ?? (active ? "FR ON" : "FR")}</span>
    </button>
  );
}
