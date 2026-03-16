import { SUISSE_AVANTAGES, OBJECTIF } from "@/data/content";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

export function VisionBoard() {
  return (
    <div className="space-y-5">
      {/* Hero affirmation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl room-3d p-6 sm:p-8 text-center"
        style={{
          background: "linear-gradient(145deg, hsl(var(--primary) / 0.15), hsl(var(--card)), hsl(var(--accent) / 0.12))",
          border: "1px solid hsl(var(--primary) / 0.2)",
          boxShadow: "var(--shadow-3d-xl), 0 0 60px -12px hsl(var(--primary) / 0.15)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="text-4xl mb-1">🔥</div>
          <p className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-foreground">
            Tu as survécu aux urgences françaises.
          </p>
          <p className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-foreground">
            Tu as géré des polytraumas à 3h du matin.
          </p>
          <p className="text-sm font-bold text-accent/90 mt-2">
            Un entretien en allemand ? Tu vas le <span className="text-accent">DÉVORER.</span>
          </p>
        </div>
      </motion.div>

      {/* Objectif principal */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="room-3d rounded-2xl p-5 relative overflow-hidden"
        style={{ boxShadow: "var(--shadow-3d-md)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-success/6 via-transparent to-primary/6 pointer-events-none" />
        <p className="text-[9px] uppercase tracking-[4px] text-muted-foreground mb-4 relative">🎯 Ta transformation</p>

        <div className="flex items-center gap-3 relative">
          <div className="flex-1">
            <div className="rounded-xl bg-secondary/60 border border-border/40 p-3 text-center">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Maintenant</p>
              <p className="text-xs font-bold">{OBJECTIF.avant}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-success shrink-0" />
          <div className="flex-1">
            <div className="rounded-xl bg-success/10 border border-success/20 p-3 text-center glow-success">
              <p className="text-[10px] text-success/70 font-semibold uppercase tracking-wider mb-1">Objectif</p>
              <p className="text-xs font-bold text-success">{OBJECTIF.apres}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 relative">
          {[
            { l: "📍 Lieu", v: OBJECTIF.lieu },
            { l: "👩‍⚕️ Chef·fe", v: OBJECTIF.chef },
            { l: "🫀 Spécialité", v: OBJECTIF.specialite },
            { l: "🏆 Titre visé", v: OBJECTIF.fmh },
          ].map((item, i) => (
            <div key={i} className="rounded-lg bg-secondary/40 p-2.5">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{item.l}</p>
              <p className="text-[11px] font-semibold mt-0.5">{item.v}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pourquoi la Suisse */}
      <div>
        <h3 className="text-xs font-bold tracking-tight mb-3 text-muted-foreground uppercase tracking-[3px]">🇨🇭 Tes raisons de te battre</h3>
        <div className="space-y-2">
          {SUISSE_AVANTAGES.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="room-3d rounded-2xl p-4 group hover:border-border/60 transition-all"
              style={{ boxShadow: "var(--shadow-3d-sm)" }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">{a.icon}</span>
                <div>
                  <p className="text-xs font-bold tracking-tight">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{a.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rappel de force final */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl room-3d p-6 text-center"
        style={{
          background: "linear-gradient(145deg, hsl(var(--primary) / 0.1), hsl(var(--card)), hsl(var(--info) / 0.08))",
          border: "1px solid hsl(var(--primary) / 0.15)",
          boxShadow: "var(--shadow-3d-lg)",
        }}
      >
        <div className="flex items-center justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-warning fill-warning" />
          ))}
        </div>
        <p className="text-base font-black text-foreground tracking-tight leading-snug">
          Tu ne fais pas ça pour prouver quelque chose.
        </p>
        <p className="text-base font-black text-primary tracking-tight leading-snug mt-1">
          Tu fais ça parce que tu le MÉRITES.
        </p>
        <p className="text-xs text-muted-foreground mt-3 italic">30 mars 2026 — Spitalzentrum Biel</p>
      </motion.div>
    </div>
  );
}
