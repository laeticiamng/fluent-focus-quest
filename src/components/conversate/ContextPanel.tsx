import { useState } from "react";
import { type ContextBundle } from "@/services/contextBundle";
import { Check, Copy, Download, Send } from "lucide-react";

interface ContextPanelProps {
  bundle: ContextBundle;
  onInjectToChat?: () => void;
}

const TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  profile: { label: "Profil", icon: "👤" },
  project: { label: "Projet", icon: "🎯" },
  progress: { label: "Progression", icon: "📊" },
  conversation: { label: "Conversation", icon: "💬" },
  document: { label: "Document", icon: "📄" },
  setting: { label: "Parametre", icon: "⚙️" },
  file: { label: "Fichier", icon: "📎" },
  content: { label: "Contenu", icon: "📚" },
};

export function ContextPanel({ bundle }: ContextPanelProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(bundle.platformElements.map(e => e.type))
  );
  const [copied, setCopied] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const toggleType = (type: string) => {
    const next = new Set(selectedTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setSelectedTypes(next);
  };

  const filteredElements = bundle.platformElements.filter(e => selectedTypes.has(e.type));

  const handleCopy = async () => {
    const text = [
      bundle.projectSummary,
      bundle.preparationNotes,
      ...filteredElements.map(e => `## ${e.title}\n${e.content}`),
    ].join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Unique types
  const availableTypes = [...new Set(bundle.platformElements.map(e => e.type))];

  return (
    <div
      className="rounded-xl p-3 space-y-3"
      style={{
        background: "linear-gradient(145deg, hsl(var(--card)), hsl(var(--muted) / 0.3))",
        border: "1px solid hsl(var(--border) / 0.3)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-foreground/80">
          Contexte recupere — {filteredElements.length} elements
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copie" : "Copier contexte IA"}
        </button>
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-1">
        {availableTypes.map(type => {
          const info = TYPE_LABELS[type] || { label: type, icon: "📦" };
          const active = selectedTypes.has(type);
          const count = bundle.platformElements.filter(e => e.type === type).length;
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold transition-colors ${
                active
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "bg-muted/50 text-muted-foreground border border-transparent"
              }`}
            >
              <span>{info.icon}</span>
              {info.label} ({count})
            </button>
          );
        })}
      </div>

      {/* AI Hints */}
      {bundle.aiHints.length > 0 && (
        <div className="rounded-lg p-2 bg-amber-500/5 border border-amber-500/10">
          <p className="text-[9px] font-bold text-amber-400 mb-1">💡 Indices IA en direct</p>
          {bundle.aiHints.map((hint, i) => (
            <p key={i} className="text-[9px] text-muted-foreground">• {hint}</p>
          ))}
        </div>
      )}

      {/* Elements preview */}
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {filteredElements.map((el, i) => {
          const info = TYPE_LABELS[el.type] || { label: el.type, icon: "📦" };
          const expanded = expandedIdx === i;
          return (
            <button
              key={i}
              onClick={() => setExpandedIdx(expanded ? null : i)}
              className="w-full text-left rounded-lg p-2 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">{info.icon}</span>
                <span className="text-[10px] font-bold flex-1 truncate">{el.title}</span>
                <span className="text-[8px] text-muted-foreground">{info.label}</span>
              </div>
              {expanded && (
                <pre className="mt-2 text-[9px] text-muted-foreground whitespace-pre-wrap max-h-[150px] overflow-y-auto">
                  {el.content}
                </pre>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
