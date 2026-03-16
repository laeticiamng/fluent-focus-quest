import { useState, useCallback } from "react";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-coach`;

type Msg = { role: "user" | "assistant"; content: string };

export type AIStatus = "idle" | "loading" | "success" | "error" | "credits_exhausted" | "rate_limited";

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
          setError("Coach momentanement occupe — reessaie dans quelques secondes. Ta creation est quand meme enregistree !");
          setStatus("rate_limited");
          setIsLoading(false);
          return;
        }
        if (resp.status === 402) {
          setError("Le coach IA est temporairement indisponible (credits epuises). Ta creation est sauvegardee — tu gagnes quand meme tes XP. Le feedback reviendra bientot.");
          setStatus("credits_exhausted");
          setIsLoading(false);
          return;
        }
        setError("Connexion au coach interrompue. Ta creation reste enregistree et tes XP sont comptabilises.");
        setStatus("error");
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        setError("Le coach n'a pas pu repondre cette fois. Ta creation est sauvegardee.");
        setStatus("error");
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
      setError("Connexion au coach interrompue. Pas de panique — ta creation est sauvegardee et tes XP sont comptabilises.");
      setStatus("error");
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
