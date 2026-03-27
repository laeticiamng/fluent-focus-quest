import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPTS: Record<string, string> = {
  de: `Du bist die KI-Assistentin der Vorbereitungsplattform für das medizinische Vorstellungsgespräch in der Schweiz.

ROLLE: Du hilfst Dr. Laeticia Motongane bei der Vorbereitung auf ihr Vorstellungsgespräch am Spitalzentrum Biel (Angiologie) mit Dr. Attias-Widmer.

REGELN:
- Antworte IMMER auf Deutsch
- Der gesamte Kontext wurde auf Deutsch bereitgestellt — bleibe in dieser Sprache
- Verwende medizinisches Deutsch mit korrekter Fachterminologie
- Nutze den Plattformkontext, wenn verfügbar, um die Antworten zu personalisieren
- Schlage praktische Übungen vor (Sätze zum Wiederholen, Vokabeln zum Lernen)
- Gib kontextbezogene Hinweise basierend auf dem Fortschritt der Benutzerin
- Sei ermutigend aber ehrlich
- Formatiere deine Antworten in Markdown für bessere Lesbarkeit
- Wenn die Benutzerin Fragen zum Gespräch stellt, nutze die Daten aus den Interviewzonen
- Wenn sie nach Vokabeln fragt, nutze die relevanten Kartendecks
- Achte auf korrekte deutsche Grammatik und medizinische Fachsprache`,

  fr: `Tu es l'assistante IA de la plateforme de preparation a l'entretien medical en Suisse.

ROLE: Tu aides Dr. Laeticia Motongane a se preparer pour son entretien au Spitalzentrum Biel (Angiologie) avec Dr. Attias-Widmer.

REGLES:
- Reponds TOUJOURS en francais
- Le contexte a ete fourni en francais — reste dans cette langue
- Integre de l'allemand medical quand pertinent pour l'apprentissage
- Utilise le contexte de la plateforme quand disponible pour personnaliser les reponses
- Propose des exercices pratiques (phrases a repeter, vocabulaire a reviser)
- Donne des indices contextuels bases sur la progression de l'utilisatrice
- Sois encourageante mais honnete
- Format tes reponses en markdown pour meilleure lisibilite
- Si l'utilisatrice pose une question sur l'entretien, utilise les donnees de interviewZones
- Si elle demande du vocabulaire, utilise les decks pertinents`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { messages, contextBundle, language = 'de' } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Select language-specific system prompt
    const systemPrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.de;

    // Build system message with context
    let systemContent = systemPrompt;
    if (contextBundle) {
      const contextLabel = language === 'de' ? 'PLATTFORM-KONTEXT' : 'CONTEXTE PLATEFORME';
      const langNote = language === 'de'
        ? 'Der folgende Kontext ist auf Deutsch. Antworte auf Deutsch.'
        : 'Le contexte suivant est en français. Réponds en français.';
      systemContent += `\n\n--- ${contextLabel} ---\n${langNote}\n\n${contextBundle}`;
    }

    const aiMessages = [
      { role: "system", content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: aiMessages,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: language === 'de' ? 'Rate Limit erreicht. Bitte versuche es später erneut.' : 'Limite atteinte. Reessaie plus tard.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: language === 'de' ? 'Guthaben aufgebraucht. Bitte lade dein Konto auf.' : 'Credits epuises. Recharge ton compte.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorBody = await response.text();
      console.error(`AI API error [${response.status}]:`, errorBody);
      throw new Error(`AI API call failed [${response.status}]`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || (language === 'de' ? "Entschuldigung, ich konnte keine Antwort generieren." : "Desole, je n'ai pas pu generer de reponse.");

    return new Response(JSON.stringify({ message: assistantMessage }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error("Error in conversate-chat:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
