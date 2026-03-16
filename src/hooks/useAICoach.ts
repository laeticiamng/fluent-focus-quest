import { useState, useCallback } from "react";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-coach`;
let aiCreditsExhausted = false;

type Msg = { role: "user" | "assistant"; content: string };

export type AIStatus = "idle" | "loading" | "success" | "error" | "credits_exhausted" | "rate_limited" | "fallback";

function generateFallback(userMessage: string, mode: string): string {
  const wordMatch = userMessage.match(/Mot a (?:forger|transmuter)\s*:\s*"?([^"(]+)"?\s*\(([^)]+)\)/i);
  const phraseMatch = userMessage.match(/(?:Phrase forgee|Formule creee)[^:]*:\s*"([^"]+)"/i);

  const word = wordMatch?.[1]?.trim() || "";
  const translation = wordMatch?.[2]?.trim() || "";
  const phrase = phraseMatch?.[1]?.trim() || "";

  if (mode === "phrase-lab" && word && phrase) {
    const normalizedWord = word.toLowerCase().replace(/^(der|die|das)\s+/i, "");
    const hasWord = phrase.toLowerCase().includes(normalizedWord);
    const hasCapital = /[A-ZÄÖÜ]/.test(phrase.charAt(0));
    const hasPeriod = /[.!?]$/.test(phrase);
    const wordCount = phrase.trim().split(/\s+/).filter(Boolean).length;

    const tips: string[] = [];
    tips.push(hasWord ? `✅ Tu as bien intégré « ${word} » dans ta phrase.` : `⚠️ Vérifie que « ${word} » apparaît bien dans ta phrase.`);
    if (!hasCapital) tips.push("💡 Commence ta phrase par une majuscule.");
    if (!hasPeriod) tips.push("💡 Ajoute une ponctuation finale pour la rendre plus naturelle.");
    if (wordCount < 4) tips.push("💡 Essaie une structure plus complète : sujet + verbe + complément.");
    else tips.push("👏 Ta base est claire et exploitable.");
    tips.push(`📖 Rappel vocabulaire : ${word} = ${translation}`);
    tips.push("✍️ Version enrichie possible : essaie d'ajouter un contexte clinique (localisation, symptôme, examen).\nEx. : Die Arterie im linken Bein ist verengt.");

    return tips.join("\n");
  }

  const genericTips: Record<string, string> = {
    "phrase-lab": "✅ Vérifie la majuscule initiale et la présence du mot demandé.\n💡 Structure utile : sujet + verbe + complément.\n✍️ Essaie d'ajouter un détail clinique concret.",
    "script-builder": "✅ Garde une structure claire.\n💡 Pense SBAR : Situation → Background → Assessment → Recommendation.\n✍️ Rends ton texte plus précis avec des données cliniques.",
    "diagnostic-builder": "✅ Ta réponse est enregistrée.\n💡 Pense au diagnostic principal + diagnostics différentiels.\n✍️ Ajoute la prochaine étape clinique logique.",
    "case-creator": "✅ Ton cas est sauvegardé.\n💡 Vérifie : anamnèse, examen, diagnostic, conduite à tenir.\n✍️ Ajoute plus de détails médicaux concrets.",
  };

  return genericTips[mode] || "✅ Ta création est sauvegardée.\n💡 Le coach IA est indisponible, mais tu peux continuer avec un feedback local basique.";
}

export function useAICoach() {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AIStatus>("idle");

  const ask = useCallback(async (userMessage: string, mode: string) => {
    setIsLoading(true);
    setResponse("");
    setError(null);
    setStatus("loading");

    if (aiCreditsExhausted) {
      setResponse(generateFallback(userMessage, mode));
      setError("Le coach IA est temporairement indisponible (crédits épuisés). Feedback local activé.");
      setStatus("fallback");
      setIsLoading(false);
      return;
    }

    const messages: Msg[] = [{ role: "user", content: userMessage }];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages, mode }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          setResponse(generateFallback(userMessage, mode));
          setError("Le coach IA est momentanément occupé. Feedback local activé.");
          setStatus("fallback");
          setIsLoading(false);
          return;
        }
        if (resp.status === 402) {
          aiCreditsExhausted = true;
          setResponse(generateFallback(userMessage, mode));
          setError("Le coach IA est temporairement indisponible (crédits épuisés). Feedback local activé.");
          setStatus("fallback");
          setIsLoading(false);
          return;
        }
        setError("Connexion au coach interrompue. Ta création reste enregistrée et tes XP sont comptabilisés.");
        setStatus("error");
        setIsLoading(false);
        return;
      }

      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const payload = await resp.json().catch(() => null) as { fallback?: boolean; reason?: string; error?: string } | null;

        if (payload?.fallback) {
          if (payload.reason === "credits_exhausted") aiCreditsExhausted = true;
          setResponse(generateFallback(userMessage, mode));
          setError(
            payload.reason === "credits_exhausted"
              ? "Le coach IA est temporairement indisponible (crédits épuisés). Feedback local activé."
              : payload.reason === "rate_limited"
                ? "Le coach IA est momentanément occupé. Feedback local activé."
                : "Le coach IA est indisponible. Feedback local activé."
          );
          setStatus("fallback");
          setIsLoading(false);
          return;
        }
      }

      if (!resp.body) {
        setResponse(generateFallback(userMessage, mode));
        setError("Le coach IA n'a pas pu répondre. Feedback local activé.");
        setStatus("fallback");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullText = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setResponse(fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setResponse(fullText);
            }
          } catch {
            // ignore leftover partial chunks
          }
        }
      }

      setStatus("success");
      setIsLoading(false);
    } catch (e) {
      console.error("AI coach error:", e);
      setResponse(generateFallback(userMessage, mode));
      setError("Connexion au coach interrompue. Feedback local activé.");
      setStatus("fallback");
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResponse("");
    setError(null);
    setStatus("idle");
  }, []);

  return { response, isLoading, error, status, ask, reset };
}
