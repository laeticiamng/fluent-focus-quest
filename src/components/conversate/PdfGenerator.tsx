import { useState } from "react";
import { type ContextBundle } from "@/services/contextBundle";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PdfGeneratorProps {
  bundle: ContextBundle;
}

type PdfType = "resume" | "preparation" | "conversations" | "detail" | "all";

const PDF_TYPES: { id: PdfType; label: string; icon: string; desc: string }[] = [
  { id: "resume", label: "Résumé plateforme", icon: "📋", desc: "Vue synthétique" },
  { id: "preparation", label: "Notes de préparation IA", icon: "🧠", desc: "Indices + contexte" },
  { id: "conversations", label: "Synthèse conversations", icon: "💬", desc: "Historique chat" },
  { id: "detail", label: "Contexte détaillé", icon: "📖", desc: "Tout le contenu" },
  { id: "all", label: "Tout en un PDF", icon: "📦", desc: "Export complet" },
];

export function PdfGenerator({ bundle }: PdfGeneratorProps) {
  const [generating, setGenerating] = useState<PdfType | null>(null);

  const generatePdf = async (type: PdfType) => {
    setGenerating(type);
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

      // data is an ArrayBuffer or Blob from the edge function
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
      console.error("PDF generation error:", err);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div
      className="rounded-xl p-3 space-y-2"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border) / 0.3)",
      }}
    >
      <div className="flex items-center gap-2">
        <Download className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-bold">Exporter en PDF</span>
        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
          PDF formaté
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {PDF_TYPES.map(pt => (
          <button
            key={pt.id}
            onClick={() => generatePdf(pt.id)}
            disabled={generating !== null}
            className="flex items-center gap-2 p-2 rounded-lg text-left hover:bg-muted/30 transition-colors disabled:opacity-40"
          >
            {generating === pt.id ? (
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
  );
}
