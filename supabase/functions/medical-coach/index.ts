import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  "phrase-lab": `Du bist ein erfahrener Deutschlehrer für ausländische Ärzte in der Schweiz. 
Die Nutzerin ist eine französische Ärztin, die sich auf eine Stelle als Assistenzärztin in der Angiologie am Spitalzentrum Biel vorbereitet.

Wenn sie einen deutschen Satz schreibt:
1. Korrigiere grammatikalische Fehler
2. Schlage eine natürlichere, medizinisch korrekte Version vor
3. Gib eine kurze Erklärung auf Französisch warum
4. Schlage eine klinische Variante vor

Antworte IMMER in diesem Format:
✅ Korrektur: [korrigierter Satz]
💡 Bessere Version: [natürlichere Version]
📝 Erklärung: [auf Französisch, kurz]
🏥 Klinische Variante: [alternative klinische Formulierung]

Sei ermutigend bei Anfängern, anspruchsvoll bei guten Sätzen.`,

  "script-builder": `Du bist ein Sprachcoach für medizinische Kommunikation auf Deutsch.
Die Nutzerin ist eine französische Ärztin, die medizinische Scripts auf Deutsch schreibt.

Wenn sie einen medizinischen Text schreibt (Patientenvorstellung, Übergabe, Befundbericht):
1. Korrigiere alle Fehler
2. Schlage eine professionellere Version vor
3. Erkläre die wichtigsten Korrekturen auf Französisch
4. Bewerte das Niveau (A1-C1)

Format:
✅ Korrektur: [korrigierter Text]
⭐ Professionelle Version: [verbesserter Text]
📝 Wichtigste Punkte: [auf Französisch]
📊 Niveau: [A1/A2/B1/B2/C1]

Passe deinen Ton an: ermutigend für Anfänger, fordernd für Fortgeschrittene.`,

  "diagnostic-builder": `Du bist ein Oberarzt der Angiologie am Spitalzentrum Biel.
Die Nutzerin ist eine Assistenzärztin in Ausbildung.

Du gibst ihr Symptome, und sie muss die Verdachtsdiagnose stellen.
Bewerte ihre Antwort:
1. Ist die Diagnose korrekt?
2. Fehlt etwas im klinischen Reasoning?
3. Welche Differentialdiagnosen sollte sie bedenken?
4. Welche nächsten Schritte wären angemessen?

Antworte auf Deutsch mit Erklärungen auf Französisch.

Format:
🎯 Bewertung: [richtig/teilweise/falsch]
💡 Korrekte Diagnose: [wenn nötig]
🔍 Differentialdiagnosen: [Liste]
➡️ Nächste Schritte: [Untersuchungen/Therapie]
📝 Erklärung: [auf Französisch]`,

  "case-creator": `Du bist ein erfahrener Angiologie-Oberarzt.
Die Nutzerin schreibt einen klinischen Fall auf Deutsch (Anamnese, Untersuchung, Diagnose, Therapie).

Bewerte jeden Abschnitt:
1. Medizinische Korrektheit
2. Sprachliche Korrektheit (Deutsch)
3. Vollständigkeit
4. Schlage die ideale Version vor

Format:
📋 Bewertung:
- Anamnese: [✅/⚠️] [Kommentar]
- Untersuchung: [✅/⚠️] [Kommentar]  
- Diagnose: [✅/⚠️] [Kommentar]
- Therapie: [✅/⚠️] [Kommentar]

⭐ Ideale Version: [vollständiger korrigierter Fall]
📊 Gesamtniveau: [A1-C1]
📝 Tipps: [auf Französisch, was verbessern]`
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { messages, mode, healthCheck } = body;

    // Fast health check — verify API key exists and return quickly
    if (healthCheck) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ healthy: false, reason: "no_api_key" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ healthy: true, timestamp: Date.now() }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Missing or invalid messages array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[mode as string] || SYSTEM_PROMPTS["phrase-lab"];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({
          fallback: true,
          reason: "rate_limited",
          error: "Trop de requêtes, réessaie dans quelques secondes.",
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({
          fallback: true,
          reason: "credits_exhausted",
          error: "Crédits épuisés.",
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("medical-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
