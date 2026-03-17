import { useState, useCallback } from "react";
import { reportAIFailure, reportAIRecovery, isAIInFallback } from "./useAIStatus";
import { supabaseAvailable } from "@/integrations/supabase/client";

const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

const CHAT_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-coach`
  : null;

type Msg = { role: "user" | "assistant"; content: string };

export type AIStatus = "idle" | "loading" | "success" | "error" | "credits_exhausted" | "rate_limited" | "fallback";

// ── AI Response Cache ──────────────────────────────────────────────
interface CacheEntry {
  response: string;
  timestamp: number;
}

const aiCache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_SIZE = 100;

function getCacheKey(message: string, mode: string): string {
  // Normalize: trim, lowercase, collapse whitespace
  return `${mode}::${message.trim().toLowerCase().replace(/\s+/g, " ")}`;
}

function getCachedResponse(message: string, mode: string): string | null {
  const key = getCacheKey(message, mode);
  const entry = aiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    aiCache.delete(key);
    return null;
  }
  return entry.response;
}

function setCachedResponse(message: string, mode: string, response: string) {
  // Evict oldest if full
  if (aiCache.size >= MAX_CACHE_SIZE) {
    const oldest = aiCache.keys().next().value;
    if (oldest) aiCache.delete(oldest);
  }
  aiCache.set(getCacheKey(message, mode), { response, timestamp: Date.now() });
}

// ── Enhanced Fallback System ───────────────────────────────────────
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
    const hasVerb = /\b(ist|hat|wird|kann|soll|muss|darf|mag|war|wurde|sein|haben|werden)\b/i.test(phrase);

    const tips: string[] = [];
    tips.push(hasWord ? `✅ Tu as bien intégré « ${word} » dans ta phrase.` : `⚠️ Vérifie que « ${word} » apparaît bien dans ta phrase.`);
    if (!hasCapital) tips.push("💡 Commence ta phrase par une majuscule.");
    if (!hasPeriod) tips.push("💡 Ajoute une ponctuation finale pour la rendre plus naturelle.");
    if (wordCount < 4) tips.push("💡 Essaie une structure plus complète : sujet + verbe + complément.");
    else tips.push("👏 Ta base est claire et exploitable.");
    if (!hasVerb) tips.push("💡 Vérifie qu'il y a un verbe conjugué (ist, hat, wird...).");
    tips.push(`📖 Rappel vocabulaire : ${word} = ${translation}`);
    tips.push("✍️ Version enrichie possible : essaie d'ajouter un contexte clinique (localisation, symptôme, examen).\nEx. : Die Arterie im linken Bein ist verengt.");

    return tips.join("\n");
  }

  // Enhanced mode-specific fallbacks with scoring rubrics
  const detailedFallbacks: Record<string, (msg: string) => string> = {
    "phrase-lab": () =>
      "✅ Vérifie la majuscule initiale et la présence du mot demandé.\n💡 Structure utile : sujet + verbe + complément.\n✍️ Essaie d'ajouter un détail clinique concret.\n📊 Checklist : majuscule, verbe, mot-clé, ponctuation.",

    "script-builder": (msg) => {
      const hasSBAR = /situation|background|assessment|recommendation/i.test(msg);
      const wordCount = msg.trim().split(/\s+/).length;
      const tips: string[] = [];
      tips.push("✅ Ton script est enregistré.");
      if (hasSBAR) tips.push("👏 Bonne utilisation de la structure SBAR !");
      else tips.push("💡 Pense SBAR : Situation → Background → Assessment → Recommendation.");
      if (wordCount < 20) tips.push("💡 Développe davantage : ajoute des données cliniques précises.");
      if (wordCount > 100) tips.push("👏 Script détaillé et complet.");
      tips.push("✍️ Rends ton texte plus précis avec des données cliniques.");
      tips.push("📊 Points clés : structure, terminologie, exhaustivité, cohérence.");
      return tips.join("\n");
    },

    "diagnostic-builder": (msg) => {
      const hasDiag = /diagnos|verdacht|differenzial/i.test(msg);
      const tips: string[] = [];
      tips.push("✅ Ta réponse est enregistrée.");
      if (hasDiag) tips.push("👏 Tu mentionnes le diagnostic — c'est essentiel.");
      tips.push("💡 Pense au diagnostic principal + diagnostics différentiels.");
      tips.push("💡 Ajoute la prochaine étape clinique logique (examen, imagerie, laboratoire).");
      tips.push("📊 Grille : diagnostic principal, différentiels, raisonnement clinique, prochaine étape.");
      return tips.join("\n");
    },

    "case-creator": (msg) => {
      const sections = ["anamnese", "untersuchung", "diagnose", "therapie"];
      const found = sections.filter(s => msg.toLowerCase().includes(s));
      const tips: string[] = [];
      tips.push("✅ Ton cas est sauvegardé.");
      if (found.length >= 3) tips.push(`👏 ${found.length}/4 sections détectées.`);
      else tips.push(`💡 Vérifie les 4 sections : Anamnese, Untersuchung, Diagnose, Therapie.`);
      tips.push("✍️ Ajoute plus de détails médicaux concrets.");
      tips.push("📊 Complétude : anamnèse, examen, diagnostic, conduite à tenir.");
      return tips.join("\n");
    },

    "interview": (msg) => {
      const wordCount = msg.trim().split(/\s+/).length;
      const tips: string[] = [];
      tips.push("✅ Ta réponse est enregistrée.");
      if (wordCount < 10) tips.push("💡 Développe ta réponse — un entretien demande des phrases complètes.");
      if (wordCount > 30) tips.push("👏 Bonne longueur de réponse.");
      tips.push("💡 Structure : introduction → argument principal → exemple concret → conclusion.");
      tips.push("📊 Critères : pertinence, structure, vocabulaire médical, fluidité.");
      return tips.join("\n");
    },

    "interview-eval": () => {
      // Return a non-JSON marker so InterviewSimulator uses its own evaluateLocally()
      // which has full access to question context, keywords, and richer scoring
      return "[LOCAL_EVAL_FALLBACK]";
    },

    "clinical": (msg) => {
      const tips: string[] = [];
      tips.push("✅ Ta note clinique est sauvegardée.");
      tips.push("💡 Vérifie la structure : motif, anamnèse, examen, hypothèses, plan.");
      tips.push("💡 Utilise le vocabulaire médical allemand précis.");
      tips.push("📊 Grille : exhaustivité, terminologie, raisonnement, plan thérapeutique.");
      return tips.join("\n");
    },
  };

  const fallbackFn = detailedFallbacks[mode];
  if (fallbackFn) return fallbackFn(userMessage);

  return "✅ Ta création est sauvegardée.\n💡 Le coach IA est indisponible, mais tu peux continuer avec un feedback local basique.\n📊 Tes XP et ta progression sont toujours comptabilisés.";
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

    // Check cache first
    const cached = getCachedResponse(userMessage, mode);
    if (cached) {
      setResponse(cached);
      setStatus("success");
      setIsLoading(false);
      return;
    }

    // Skip AI if Supabase is not configured or key is missing
    if (!CHAT_URL || !supabaseAvailable || !SUPABASE_KEY) {
      setResponse(generateFallback(userMessage, mode));
      setStatus("fallback");
      setIsLoading(false);
      return;
    }

    // Skip AI if browser is offline
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setResponse(generateFallback(userMessage, mode));
      setError("Mode hors-ligne — feedback local active.");
      setStatus("fallback");
      setIsLoading(false);
      return;
    }

    // Only skip AI if currently in fallback — but always try if status recovered
    if (isAIInFallback()) {
      setResponse(generateFallback(userMessage, mode));
      setError("Le coach IA est temporairement indisponible. Feedback local activé.");
      setStatus("fallback");
      setIsLoading(false);
      return;
    }

    const messages: Msg[] = [{ role: "user", content: userMessage }];

    try {
      const resp = await fetch(CHAT_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ messages, mode }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          reportAIFailure("rate_limited");
          setResponse(generateFallback(userMessage, mode));
          setError("Le coach IA est momentanément occupé. Feedback local activé.");
          setStatus("fallback");
          setIsLoading(false);
          return;
        }
        if (resp.status === 402) {
          reportAIFailure("credits_exhausted");
          setResponse(generateFallback(userMessage, mode));
          setError("Le coach IA est temporairement indisponible (crédits épuisés). Feedback local activé.");
          setStatus("fallback");
          setIsLoading(false);
          return;
        }
        reportAIFailure("error");
        setResponse(generateFallback(userMessage, mode));
        setError("Connexion au coach interrompue. Feedback local activé.");
        setStatus("fallback");
        setIsLoading(false);
        return;
      }

      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const payload = await resp.json().catch(() => null) as { fallback?: boolean; reason?: string; error?: string } | null;

        if (payload?.fallback) {
          if (payload.reason === "credits_exhausted") {
            reportAIFailure("credits_exhausted");
          } else if (payload.reason === "rate_limited") {
            reportAIFailure("rate_limited");
          } else {
            reportAIFailure("error");
          }
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

      // Cache successful response
      if (fullText) {
        setCachedResponse(userMessage, mode, fullText);
        reportAIRecovery();
      }
      setStatus("success");
      setIsLoading(false);
    } catch (e) {
      console.error("AI coach error:", e);
      reportAIFailure("network");
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
