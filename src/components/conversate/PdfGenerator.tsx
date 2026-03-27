import { useState } from "react";
import { type ContextBundle, buildExtendedContext } from "@/services/contextBundle";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PdfGeneratorProps {
  bundle: ContextBundle;
}

type PdfType = "resume" | "preparation" | "conversations" | "detail" | "all";

const PDF_TYPES: { id: PdfType; label: string; icon: string; desc: string }[] = [
  { id: "resume", label: "Resume plateforme", icon: "📋", desc: "Vue synthetique" },
  { id: "preparation", label: "Notes de preparation IA", icon: "🧠", desc: "Indices + contexte" },
  { id: "conversations", label: "Synthese conversations", icon: "💬", desc: "Historique chat" },
  { id: "detail", label: "Contexte detaille", icon: "📖", desc: "Tout le contenu" },
  { id: "all", label: "Tout en un PDF", icon: "📦", desc: "Export complet" },
];

export function PdfGenerator({ bundle }: PdfGeneratorProps) {
  const [generating, setGenerating] = useState<PdfType | null>(null);

  const generatePdf = async (type: PdfType) => {
    setGenerating(type);
    try {
      let content = "";
      let filename = "";

      switch (type) {
        case "resume":
          content = `RESUME PLATEFORME\n${"=".repeat(50)}\n\n${bundle.projectSummary}\n\nGenere le: ${new Date().toLocaleDateString("fr-FR")}`;
          filename = "01_resume_plateforme.txt";
          break;
        case "preparation":
          content = `NOTES DE PREPARATION IA\n${"=".repeat(50)}\n\n${bundle.preparationNotes}\n\nINDICES IA:\n${bundle.aiHints.map(h => `• ${h}`).join("\n")}`;
          filename = "02_notes_preparation_ia.txt";
          break;
        case "conversations":
          content = `SYNTHESE CONVERSATIONS\n${"=".repeat(50)}\n\n${bundle.conversationSummaries.length > 0
            ? bundle.conversationSummaries.map(c => `## ${c.title}\n${c.summary}`).join("\n\n")
            : "Aucune conversation enregistree."}`;
          filename = "03_synthese_conversations.txt";
          break;
        case "detail":
        case "all":
          content = buildExtendedContext(bundle);
          filename = type === "all" ? "export_complet_plateforme.txt" : "04_contexte_detaille.txt";
          break;
      }

      // Generate downloadable text file (PDF generation would need server-side)
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`${filename} telecharge`);
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Erreur lors de la generation");
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
        <span className="text-[10px] font-bold">Exporter en fichier</span>
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
