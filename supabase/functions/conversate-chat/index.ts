import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `Tu es l'assistante IA de la plateforme de preparation a l'entretien medical en Suisse.

ROLE: Tu aides Dr. Laeticia Motongane a se preparer pour son entretien au Spitalzentrum Biel (Angiologie) avec Dr. Attias-Widmer.

REGLES:
- Reponds en francais par defaut, mais peux integrer de l'allemand medical quand pertinent
- Utilise le contexte de la plateforme quand disponible pour personnaliser les reponses
- Propose des exercices pratiques (phrases a repeter, vocabulaire a reviser)
- Donne des indices contextuels bases sur la progression de l'utilisatrice
- Sois encourageante mais honnete
- Format tes reponses en markdown pour meilleure lisibilite
- Si l'utilisatrice pose une question sur l'entretien, utilise les donnees de interviewZones
- Si elle demande du vocabulaire, utilise les decks pertinents`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { messages, contextBundle } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build system message with context
    let systemContent = SYSTEM_PROMPT;
    if (contextBundle) {
      systemContent += `\n\n--- CONTEXTE PLATEFORME ---\n${contextBundle}`;
    }

    const aiMessages = [
      { role: "system", content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`AI API error [${response.status}]:`, errorBody);
      throw new Error(`AI API call failed [${response.status}]`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "Desole, je n'ai pas pu generer de reponse.";

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
