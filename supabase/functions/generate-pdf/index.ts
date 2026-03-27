import "https://esm.sh/jspdf@2.5.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// We load jsPDF from the global scope (UMD)
declare const jspdf: { jsPDF: any };

interface PdfRequest {
  type: "resume" | "preparation" | "conversations" | "detail" | "all";
  bundle: {
    projectSummary: string;
    preparationNotes: string;
    platformElements: Array<{
      type: string;
      title: string;
      content: string;
      source: string;
    }>;
    conversationSummaries: Array<{
      title: string;
      summary: string;
    }>;
    uploadedFiles: Array<{
      name: string;
      size: number;
    }>;
    aiHints: string[];
    generatedAt: string;
    language: string;
  };
  language: string;
}

const COLORS = {
  primary: [30, 64, 175] as [number, number, number],    // blue-800
  secondary: [71, 85, 105] as [number, number, number],   // slate-500
  accent: [147, 51, 234] as [number, number, number],     // purple-600
  text: [15, 23, 42] as [number, number, number],         // slate-900
  muted: [100, 116, 139] as [number, number, number],     // slate-400
  bg: [248, 250, 252] as [number, number, number],        // slate-50
  white: [255, 255, 255] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],    // slate-200
};

function createPdf(req: PdfRequest): Uint8Array {
  const { jsPDF } = jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const lang = req.language || "de";
  const bundle = req.bundle;
  const pageW = 210;
  const pageH = 297;
  const marginL = 20;
  const marginR = 20;
  const marginT = 25;
  const marginB = 25;
  const contentW = pageW - marginL - marginR;
  let y = marginT;
  let pageNum = 1;

  const labels = lang === "de"
    ? {
        resume: "Plattform-Zusammenfassung",
        preparation: "KI-Vorbereitungsnotizen",
        conversations: "Gesprächssynthese",
        detail: "Detaillierter Projektkontext",
        all: "Vollständiger Export",
        generatedOn: "Generiert am",
        page: "Seite",
        platformSummary: "Plattform-Zusammenfassung",
        preparationNotes: "Vorbereitungsnotizen",
        aiHints: "KI-Hinweise",
        platformElements: "Plattform-Elemente",
        conversationSummaries: "Gesprächszusammenfassungen",
        attachedFiles: "Angehängte Dateien",
        noConversations: "Keine Gespräche aufgezeichnet.",
        source: "Quelle",
        fileName: "Dateiname",
        fileSize: "Größe",
      }
    : {
        resume: "Résumé plateforme",
        preparation: "Notes de préparation IA",
        conversations: "Synthèse conversations",
        detail: "Contexte projet détaillé",
        all: "Export complet",
        generatedOn: "Généré le",
        page: "Page",
        platformSummary: "Résumé plateforme",
        preparationNotes: "Notes de préparation",
        aiHints: "Indices IA",
        platformElements: "Éléments de la plateforme",
        conversationSummaries: "Synthèse des conversations",
        attachedFiles: "Fichiers joints",
        noConversations: "Aucune conversation enregistrée.",
        source: "Source",
        fileName: "Fichier",
        fileSize: "Taille",
      };

  const titleMap: Record<string, string> = {
    resume: labels.resume,
    preparation: labels.preparation,
    conversations: labels.conversations,
    detail: labels.detail,
    all: labels.all,
  };

  // ── Helper: add footer ──
  function addFooter() {
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `${labels.page} ${pageNum}`,
      pageW / 2,
      pageH - 10,
      { align: "center" }
    );
    doc.text(
      "Even REALITIES",
      pageW - marginR,
      pageH - 10,
      { align: "right" }
    );
    doc.setDrawColor(...COLORS.border);
    doc.line(marginL, pageH - 15, pageW - marginR, pageH - 15);
  }

  // ── Helper: new page ──
  function newPage() {
    addFooter();
    doc.addPage();
    pageNum++;
    y = marginT;
  }

  // ── Helper: check space ──
  function ensureSpace(needed: number) {
    if (y + needed > pageH - marginB) {
      newPage();
    }
  }

  // ── Helper: write wrapped text ──
  function writeText(text: string, fontSize: number, color: [number, number, number], bold = false, indent = 0) {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines: string[] = doc.splitTextToSize(text, contentW - indent);
    const lineH = fontSize * 0.45;
    for (const line of lines) {
      ensureSpace(lineH + 1);
      doc.text(line, marginL + indent, y);
      y += lineH;
    }
    y += 1;
  }

  // ── Helper: section title ──
  function sectionTitle(title: string) {
    ensureSpace(14);
    y += 4;
    // Accent bar
    doc.setFillColor(...COLORS.primary);
    doc.rect(marginL, y - 4, 3, 8, "F");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.primary);
    doc.setFont("helvetica", "bold");
    doc.text(title, marginL + 6, y + 1);
    y += 10;
    // Separator
    doc.setDrawColor(...COLORS.border);
    doc.line(marginL, y, pageW - marginR, y);
    y += 4;
  }

  // ── Helper: subsection ──
  function subSection(title: string) {
    ensureSpace(10);
    y += 2;
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.accent);
    doc.setFont("helvetica", "bold");
    doc.text(`▸ ${title}`, marginL + 4, y);
    y += 6;
  }

  // ── Header block ──
  function drawHeader() {
    // Top bar
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageW, 18, "F");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.white);
    doc.setFont("helvetica", "bold");
    doc.text("EVEN REALITIES", marginL, 12);

    // Title
    y = 28;
    doc.setFontSize(20);
    doc.setTextColor(...COLORS.text);
    doc.setFont("helvetica", "bold");
    doc.text(titleMap[req.type] || labels.all, marginL, y);
    y += 8;

    // Date
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    const dateStr = new Date(bundle.generatedAt || Date.now()).toLocaleDateString(
      lang === "de" ? "de-DE" : "fr-FR",
      { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    );
    doc.text(`${labels.generatedOn}: ${dateStr}`, marginL, y);
    y += 8;

    // Divider
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(marginL, y, pageW - marginR, y);
    doc.setLineWidth(0.2);
    y += 8;
  }

  // ── Render sections by type ──
  drawHeader();

  const renderSummary = () => {
    sectionTitle(labels.platformSummary);
    writeText(bundle.projectSummary || "—", 10, COLORS.text);
  };

  const renderPreparation = () => {
    sectionTitle(labels.preparationNotes);
    writeText(bundle.preparationNotes || "—", 10, COLORS.text);
  };

  const renderHints = () => {
    if (bundle.aiHints && bundle.aiHints.length > 0) {
      sectionTitle(labels.aiHints);
      for (const hint of bundle.aiHints) {
        ensureSpace(6);
        doc.setFillColor(...COLORS.bg);
        const hintLines: string[] = doc.splitTextToSize(`• ${hint}`, contentW - 8);
        const blockH = hintLines.length * 4.5 + 3;
        ensureSpace(blockH + 2);
        doc.roundedRect(marginL, y - 2, contentW, blockH, 2, 2, "F");
        writeText(`• ${hint}`, 9, COLORS.text, false, 4);
        y += 1;
      }
    }
  };

  const renderElements = () => {
    if (bundle.platformElements && bundle.platformElements.length > 0) {
      sectionTitle(labels.platformElements);
      for (const el of bundle.platformElements) {
        subSection(`${el.title} (${labels.source}: ${el.source})`);
        writeText(el.content, 9, COLORS.text, false, 6);
        y += 2;
      }
    }
  };

  const renderConversations = () => {
    sectionTitle(labels.conversationSummaries);
    if (!bundle.conversationSummaries || bundle.conversationSummaries.length === 0) {
      writeText(labels.noConversations, 10, COLORS.muted, true);
    } else {
      for (const conv of bundle.conversationSummaries) {
        subSection(conv.title);
        writeText(conv.summary, 9, COLORS.text, false, 6);
        y += 2;
      }
    }
  };

  const renderFiles = () => {
    if (bundle.uploadedFiles && bundle.uploadedFiles.length > 0) {
      sectionTitle(labels.attachedFiles);
      for (const f of bundle.uploadedFiles) {
        const sizeMb = (f.size / (1024 * 1024)).toFixed(2);
        writeText(`📎 ${f.name} — ${sizeMb} Mo`, 9, COLORS.secondary, false, 4);
      }
    }
  };

  switch (req.type) {
    case "resume":
      renderSummary();
      break;
    case "preparation":
      renderPreparation();
      renderHints();
      break;
    case "conversations":
      renderConversations();
      break;
    case "detail":
      renderSummary();
      renderPreparation();
      renderHints();
      renderElements();
      renderFiles();
      break;
    case "all":
      renderSummary();
      renderPreparation();
      renderHints();
      renderElements();
      renderConversations();
      renderFiles();
      break;
  }

  // Final footer
  addFooter();

  // Return as Uint8Array
  return doc.output("arraybuffer") as Uint8Array;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: PdfRequest = await req.json();

    if (!body.type || !body.bundle) {
      return new Response(
        JSON.stringify({ error: "Missing type or bundle" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pdfBytes = createPdf(body);

    const filenameMap: Record<string, string> = {
      resume: "01_resume_plateforme",
      preparation: "02_notes_preparation_ia",
      conversations: "03_synthese_conversations",
      detail: "04_contexte_detaille",
      all: "export_complet",
    };

    const filename = `${filenameMap[body.type] || "export"}.pdf`;

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return new Response(
      JSON.stringify({ error: "PDF generation failed", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
