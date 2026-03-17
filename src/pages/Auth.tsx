import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

/** Map Supabase auth error messages to user-friendly French messages. */
function translateAuthError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();

  if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (lower.includes("email not confirmed")) {
    return "Ton email n'est pas encore confirmé. Vérifie ta boîte de réception.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests") || lower.includes("over_request_rate_limit")) {
    return "Trop de tentatives. Réessaie dans quelques minutes.";
  }
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "Cet email est déjà enregistré. Essaie de te connecter.";
  }
  if (lower.includes("password") && lower.includes("least")) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("failed to fetch")) {
    return "Erreur réseau. Vérifie ta connexion internet et réessaie.";
  }
  if (lower.includes("service_unavailable") || lower.includes("service unavailable")) {
    return "Le service d'authentification est temporairement indisponible. Réessaie plus tard.";
  }
  // Fallback: show the original error — never fabricate a config diagnostic
  return raw;
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connecté !");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Vérifie ton email pour confirmer ton compte !");
      }
    } catch (error: unknown) {
      toast.error(translateAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background ambient-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm space-y-8 relative z-10"
      >
        {/* Hero */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-grammar/15 border border-primary/20 flex items-center justify-center text-4xl glow-primary"
          >
            ✨
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight gradient-text">Operation Bienne</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isLogin
              ? "Reprends là où tu t'es arrêtée. Bienne t'attend."
              : "Lance ta préparation. Chaque création te rapproche du but."}
          </p>
        </div>

        {/* Motivational pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl bg-gradient-to-r from-accent/8 to-warning/5 border border-accent/15 px-4 py-3 text-center"
        >
          <p className="text-xs font-medium text-accent/80 italic">
            "La création active ancre les connaissances 3× plus durablement que la révision passive."
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-secondary/50 rounded-xl p-3.5 text-sm border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 text-foreground placeholder:text-muted-foreground transition-all"
              placeholder="ton@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-secondary/50 rounded-xl p-3.5 text-sm border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 text-foreground placeholder:text-muted-foreground transition-all"
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-xl h-12 text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            disabled={loading}
          >
            {loading ? "Chargement..." : isLogin ? "→ Continuer ma préparation" : "→ Lancer ma préparation"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
            {isLogin ? "Créer un compte" : "Se connecter"}
          </button>
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {["✍️ Créer", "🧠 Apprendre", "🎙️ S'entraîner", "🤖 IA Coach"].map((f, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="text-[10px] font-semibold text-muted-foreground bg-secondary/60 rounded-full px-3 py-1.5 border border-border/30"
            >
              {f}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
