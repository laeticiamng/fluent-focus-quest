import { useState, useCallback } from "react";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-coach`;

type Msg = { role: "user" | "assistant"; content: string };

export type AIStatus = "idle" | "loading" | "success" | "error" | "credits_exhausted" | "rate_limited" | "fallback";

// Basic offline feedback when AI is unavailable
function generateFallback(userMessage: string, mode: string): string {
  // Extract the word/phrase from the prompt
  const wordMatch = userMessage.match(/Mot a (?:forger|transmuter)\s*:\s*"?([^"(]+)"?\s*\(([^)]+)\)/i);
  const phraseMatch = userMessage.match(/(?:Phrase forgee|Formule creee)[^:]*:\s*"([^"]+)"/i);

  const word = wordMatch?.[1]?.trim() || "";
  const translation = wordMatch?.[2]?.trim() || "";
  const phrase = phraseMatch?.[1]?.trim() || "";

  if (mode === "phrase-lab" && word && phrase) {
    const hasWord = phrase.toLowerCase().includes(word.toLowerCase().replace(/^(der|die|das)\s+/i, ""));
    const hasCapital = /[A-ZÄÖÜ]/.test(phrase.charAt(0));
    const hasPeriod = phrase.endsWith(".");
    const wordCount = phrase.split(/\s+/).length;

    const tips: string[] = [];
    if (hasWord) tips.push(`✅ Tu as bien utilisé "${word}" dans ta phrase.`);
    else tips.push(`⚠️ Vérifie que "${word}" apparaît dans ta phrase.`);
    if (!hasCapital) tips.push("💡 En allemand, la phrase commence toujours par une majuscule.");
    if (!hasPeriod) tips.push("💡 N'oublie pas le point à la fin de ta phrase.");
    if (wordCount < 4) tips.push("💡 Essaie de construire une phrase plus complète (sujet + verbe + complément).");
    else if (wordCount >= 6) tips.push("👏 Belle construction ! Phrase bien développée.");

    tips.push(`\n📖 Rappel : "${word}" = ${translation}`);
    tips.push("\n⏳ Le coach IA est temporairement indisponible. Ces conseils sont générés localement. Tes XP sont bien comptabilisés !");

    return tips.join("\n");
  }

  // Generic fallback for other modes
  const genericTips: Record<string, string> = {
    "phrase-lab": "⏳ Coach IA indisponible. Conseils rapides :\n• Vérifie la majuscule en début de phrase\n• Les noms allemands prennent toujours une majuscule\n• Structure : Sujet + Verbe + Complément\n• Termine par un point\n\nTes XP sont bien comptabilisés !",
    "script-builder": "⏳ Coach IA indisponible. Conseils rapides :\n• Structure SBAR : Situation → Background → Assessment → Recommendation\n• Utilise le présent pour décrire l'état actuel\n• Sois précis dans les valeurs (Blutdruck, Puls...)\n\nTon script est sauvegardé !",
    "diagnostic-builder": "⏳ Coach IA indisponible. Conseils rapides :\n• Pense aux diagnostics différentiels\n• Vérifie les Red Flags\n• Structure : Anamnese → Untersuchung → Verdachtsdiagnose\n\nTon raisonnement est sauvegardé !",
    "case-creator": "⏳ Coach IA indisponible. Conseils rapides :\n• Anamnese complète : Hauptbeschwerde, Vorgeschichte, Medikamente\n• Untersuchung : systématique tête-pieds\n• Diagnose + Differentialdiagnosen\n\nTon cas est sauvegardé !",
  };

  return genericTips[mode] || "⏳ Coach IA temporairement indisponible. Ta création est sauvegardée et tes XP sont comptabilisés !";
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
          const fallback = generateFallback(userMessage, mode);
          setResponse(fallback);
          setError(null);
          setStatus("fallback");
          setIsLoading(false);
          return;
        }
        if (resp.status === 402) {
          const fallback = generateFallback(userMessage, mode);
          setResponse(fallback);
          setError(null);
          setStatus("fallback");
          setIsLoading(false);
          return;
        }
        setError("Connexion au coach interrompue. Ta création reste enregistrée et tes XP sont comptabilisés.");
        setStatus("error");
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        const fallback = generateFallback(userMessage, mode);
        setResponse(fallback);
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

      // Final flush
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
          } catch { /* ignore */ }
        }
      }

      setStatus("success");
      setIsLoading(false);
    } catch (e) {
      console.error("AI coach error:", e);
      const fallback = generateFallback(userMessage, mode);
      setResponse(fallback);
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
