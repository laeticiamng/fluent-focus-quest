import { SUISSE_AVANTAGES, OBJECTIF } from "@/data/content";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function VisionBoard() {
  return (
    <div className="space-y-4">
      {/* Objectif principal */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated rounded-2xl p-5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-success/8 via-transparent to-primary/8 pointer-events-none" />
        <p className="text-[9px] uppercase tracking-[4px] text-muted-foreground mb-4 relative">🎯 Ton objectif</p>
        
        <div className="flex items-center gap-3 relative">
          <div className="flex-1">
            <div className="rounded-xl bg-primary/8 border border-primary/15 p-3 text-center">
              <p className="text-[10px] text-primary/60 font-semibold uppercase tracking-wider mb-1">Avant</p>
              <p className="text-xs font-bold text-primary">{OBJECTIF.avant}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-success shrink-0" />
          <div className="flex-1">
            <div className="rounded-xl bg-success/10 border border-success/20 p-3 text-center glow-success">
              <p className="text-[10px] text-success/70 font-semibold uppercase tracking-wider mb-1">Après</p>
              <p className="text-xs font-bold text-success">{OBJECTIF.apres}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 relative">
          {[
            { l: "Lieu", v: OBJECTIF.lieu },
            { l: "Chef·fe", v: OBJECTIF.chef },
            { l: "Spécialité", v: OBJECTIF.specialite },
            { l: "Titre visé", v: OBJECTIF.fmh },
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
        <h3 className="text-sm font-bold tracking-tight mb-3">🇨🇭 Pourquoi la Suisse — Pourquoi tu fais ça</h3>
        <div className="space-y-2">
          {SUISSE_AVANTAGES.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-elevated rounded-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{a.icon}</span>
                <div>
                  <p className="text-xs font-bold tracking-tight">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{a.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rappel de force */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-gradient-to-br from-accent/12 to-accent/5 border border-accent/20 p-5 text-center"
      >
        <div className="text-3xl mb-2">🔥</div>
        <p className="text-sm font-bold text-accent tracking-tight">Tu as survécu aux urgences françaises.</p>
        <p className="text-sm font-bold text-accent tracking-tight">Tu as géré des polytraumas à 3h du matin.</p>
        <p className="text-xs text-accent/70 mt-2">Un entretien en allemand ? Tu vas le DÉVORER.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl bg-gradient-to-br from-primary/10 to-info/8 border border-primary/15 p-5 text-center"
      >
        <p className="text-xs text-primary/70 uppercase tracking-widest font-semibold mb-2">Rappelle-toi</p>
        <p className="text-lg font-black text-primary tracking-tight leading-tight">
          Tu ne fais pas ça pour prouver quelque chose.
        </p>
        <p className="text-lg font-black text-primary tracking-tight leading-tight mt-1">
          Tu fais ça parce que tu le MÉRITES.
        </p>
      </motion.div>
    </div>
  );
}
