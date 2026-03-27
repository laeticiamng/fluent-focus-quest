import { useState } from "react";
import { type ContextBundle } from "@/services/contextBundle";
import { extractFullPlatformContent, splitIntoPdfGroups, type PdfGroup, type FullContentBlock } from "@/services/fullContentExport";
import { useProgress } from "@/hooks/useProgress";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, Loader2, Package, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface PdfGeneratorProps {
  bundle: ContextBundle;
}

type PdfType = "resume" | "preparation" | "conversations" | "detail" | "all";
type ExportMode = "full" | "summary";

const SUMMARY_TYPES: { id: PdfType; label: string; icon: string; desc: string }[] = [
  { id: "resume", label: "Résumé plateforme", icon: "📋", desc: "Vue synthétique" },
  { id: "preparation", label: "Notes préparation IA", icon: "🧠", desc: "Indices + contexte" },
  { id: "conversations", label: "Synthèse conversations", icon: "💬", desc: "Historique chat" },
  { id: "detail", label: "Contexte détaillé", icon: "📖", desc: "Tout le contenu" },
  { id: "all", label: "Tout en un PDF", icon: "📦", desc: "Export complet" },
];

export function PdfGenerator({ bundle }: PdfGeneratorProps) {
  const progress = useProgress();
  const [generating, setGenerating] = useState<string | null>(null);
  const [mode, setMode] = useState<ExportMode>("full");
  const [fullGroups, setFullGroups] = useState<PdfGroup[] | null>(null);

  // Build full content groups on demand
  const buildFullContent = () => {
    const blocks = extractFullPlatformContent({
      artifacts: progress.artifacts,
      notes: progress.notes,
      done: progress.done,
      quizScores: progress.quizScores,
    });
    const groups = splitIntoPdfGroups(blocks);
    setFullGroups(groups);
    toast.success(`${blocks.length} blocs de contenu extraits → ${groups.length} PDF`);
  };

  // Download a single full-content PDF group
  const downloadFullGroup = async (group: PdfGroup, totalGroups: number) => {
    const key = `full-${group.id}`;
    setGenerating(key);
    try {
      const { data, error } = await supabase.functions.invoke("generate-pdf", {
        body: {
          mode: "full",
          blocks: group.blocks,
          groupTitle: group.title,
          groupIndex: group.id,
          totalGroups,
        },
      });
      if (error) throw error;

      const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const filename = `${String(group.id).padStart(2, "0")}_${group.title.replace(/[^a-zA-Z0-9àéèêëîïôùûüæœ]/g, "_").toLowerCase()}.pdf`;
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${filename} téléchargé`);
    } catch (err) {
      console.error("Full PDF error:", err);
      toast.error("Erreur lors de la génération du PDF complet");
    } finally {
      setGenerating(null);
    }
  };

  // Download all full-content PDFs sequentially
  const downloadAllFull = async () => {
    if (!fullGroups) return;
    setGenerating("full-all");
    for (const group of fullGroups) {
      await downloadFullGroup(group, fullGroups.length);
    }
    setGenerating(null);
    toast.success("Tous les PDF téléchargés !");
  };

  // Legacy summary PDF
  const generateSummaryPdf = async (type: PdfType) => {
    setGenerating(`summary-${type}`);
    try {
      const { data, error } = await supabase.functions.invoke("generate-pdf", {
        body: {
          type,
          bundle: {
            projectSummary: bundle.projectSummary,
            preparationNotes: bundle.preparationNotes,
            platformElements: bundle.platformElements,
            conversationSummaries: bundle.conversationSummaries,
            uploadedFiles: bundle.uploadedFiles,
            aiHints: bundle.aiHints,
            generatedAt: bundle.generatedAt,
            language: bundle.language,
          },
          language: bundle.language,
        },
      });
      if (error) throw error;

      const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const filenameMap: Record<PdfType, string> = {
        resume: "01_resume_plateforme.pdf",
        preparation: "02_notes_preparation_ia.pdf",
        conversations: "03_synthese_conversations.pdf",
        detail: "04_contexte_detaille.pdf",
        all: "export_complet_plateforme.pdf",
      };
      const a = document.createElement("a");
      a.href = url;
      a.download = filenameMap[type];
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${filenameMap[type]} téléchargé`);
    } catch (err) {
      console.error("Summary PDF error:", err);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div
      className="rounded-xl p-3 space-y-3"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border) / 0.3)",
      }}
    >
      {/* Header + mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold">Exporter en PDF</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setMode("full")}
            className={`px-2 py-1 rounded-md text-[9px] font-bold transition-colors ${
              mode === "full"
                ? "bg-primary/15 text-primary border border-primary/20"
                : "bg-muted/50 text-muted-foreground border border-transparent"
            }`}
          >
            📦 Contenu intégral
          </button>
          <button
            onClick={() => setMode("summary")}
            className={`px-2 py-1 rounded-md text-[9px] font-bold transition-colors ${
              mode === "summary"
                ? "bg-primary/15 text-primary border border-primary/20"
                : "bg-muted/50 text-muted-foreground border border-transparent"
            }`}
          >
            📋 Résumé IA
          </button>
        </div>
      </div>

      {/* FULL CONTENT MODE */}
      {mode === "full" && (
        <div className="space-y-2">
          <p className="text-[9px] text-muted-foreground">
            Exporte tout le contenu textuel réel de la plateforme : vocabulaire complet, grammaire, 
            questions d'entretien avec réponses, cas cliniques, escape game, puzzles, templates, 
            artefacts créés et notes — <span className="font-bold text-foreground">sans résumé, sans perte</span>.
          </p>

          {!fullGroups ? (
            <button
              onClick={buildFullContent}
              disabled={generating !== null}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[11px] font-bold bg-primary/10 hover:bg-primary/20 text-primary transition-colors border border-primary/15"
            >
              <Package className="w-4 h-4" />
              Extraire tout le contenu de la plateforme
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground">
                  {fullGroups.reduce((a, g) => a + g.blocks.length, 0)} blocs → {fullGroups.length} PDF
                </span>
                <button
                  onClick={downloadAllFull}
                  disabled={generating !== null}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                >
                  {generating === "full-all" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  Tout télécharger
                </button>
              </div>

              {fullGroups.map(group => (
                <button
                  key={group.id}
                  onClick={() => downloadFullGroup(group, fullGroups.length)}
                  disabled={generating !== null}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-muted/30 transition-colors disabled:opacity-40 border border-border/20"
                >
                  {generating === `full-${group.id}` ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold truncate">
                      PDF {group.id} — {group.title}
                    </p>
                    <p className="text-[8px] text-muted-foreground">
                      {group.blocks.length} blocs de contenu intégral
                    </p>
                  </div>
                </button>
              ))}

              <button
                onClick={buildFullContent}
                className="w-full text-[9px] text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                ↻ Recalculer le contenu
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUMMARY MODE (legacy) */}
      {mode === "summary" && (
        <div className="space-y-2">
          <p className="text-[9px] text-muted-foreground">
            Export résumé avec indices IA et synthèse — version courte pour prompt ou lecture rapide.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {SUMMARY_TYPES.map(pt => (
              <button
                key={pt.id}
                onClick={() => generateSummaryPdf(pt.id)}
                disabled={generating !== null}
                className="flex items-center gap-2 p-2 rounded-lg text-left hover:bg-muted/30 transition-colors disabled:opacity-40"
              >
                {generating === `summary-${pt.id}` ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <span className="text-sm">{pt.icon}</span>
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-bold truncate">{pt.label}</p>
                  <p className="text-[8px] text-muted-foreground">{pt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
