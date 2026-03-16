import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Package, X, Sparkles, Shield } from "lucide-react";
import type { InventoryItem } from "@/hooks/useProgress";

interface InventoryArtifact3DProps {
  items: InventoryItem[];
  sigilsCollected: string[];
  compact?: boolean;
}

const TYPE_LABELS: Record<string, { label: string; color: string; glow: string }> = {
  key_fragment: { label: "Fragment de cle", color: "text-amber-400", glow: "32 95% 55%" },
  code_digit: { label: "Element de code", color: "text-blue-400", glow: "215 90% 58%" },
  medical_rune: { label: "Rune medicale", color: "text-emerald-400", glow: "152 60% 48%" },
  vocal_seal: { label: "Sceau vocal", color: "text-violet-400", glow: "265 55% 62%" },
  clinical_artifact: { label: "Artefact clinique", color: "text-rose-400", glow: "350 65% 55%" },
  sonic_rune: { label: "Rune sonore", color: "text-orange-400", glow: "25 80% 50%" },
  archive_piece: { label: "Piece d'archive", color: "text-cyan-400", glow: "185 70% 48%" },
  master_sigil: { label: "Sigil de Maitrise", color: "text-amber-300", glow: "38 92% 50%" },
};

export function InventoryArtifact3D({ items, sigilsCollected, compact = false }: InventoryArtifact3DProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const sigils = items.filter(i => i.type === "master_sigil");
  const fragments = items.filter(i => i.type !== "master_sigil");

  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5 transition-all hover:bg-amber-500/15"
        style={{ boxShadow: items.length > 0 ? "0 0 12px -4px hsl(32 95% 55% / 0.3)" : undefined }}
      >
        <Package className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] font-bold text-amber-400">{items.length}</span>
        {items.length > 0 && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400"
          />
        )}
      </motion.button>
    );
  }

  return (
    <>
      {/* Inventory Button — 3D capsule style */}
      <motion.button
        whileHover={{ y: -3, scale: 1.005 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(true)}
        className="w-full rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-4 text-left transition-all hover:border-amber-500/30 group room-3d relative overflow-hidden"
      >
        {/* Volumetric inner glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-[20%] rounded-full bg-amber-500/[0.04] blur-[30px]" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <motion.div
            animate={{ rotateY: [0, 8, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="door-icon-3d w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform"
            style={{ boxShadow: "var(--shadow-3d-sm), 0 0 16px -4px hsl(32 95% 55% / 0.2)" }}
          >
            <Package className="w-5 h-5 text-amber-400" />
          </motion.div>
          <div className="flex-1">
            <p className="text-xs font-bold">Inventaire</p>
            <p className="text-[10px] text-muted-foreground">
              {fragments.length} fragment{fragments.length !== 1 ? "s" : ""} · {sigils.length}/6 Sigils
            </p>
          </div>
          {/* Sigil slots — 3D pedestals */}
          <div className="flex gap-1.5">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={i < sigils.length ? { rotateY: [0, 360] } : undefined}
                transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: i * 1.3 }}
                className={`totem-pedestal w-6 h-6 rounded-lg border flex items-center justify-center text-[8px] transition-all ${
                  i < sigils.length
                    ? "bg-gradient-to-br from-amber-500/25 to-amber-400/10 border-amber-500/40 sigil-3d"
                    : "bg-secondary/20 border-border/20"
                }`}
              >
                {i < sigils.length ? "🏅" : "·"}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.button>

      {/* Inventory Panel — Immersive 3D */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.95, rotateX: 5 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative z-10 w-full max-w-md mx-4 mb-4 sm:mb-0 max-h-[80vh] overflow-hidden rounded-3xl bg-card border border-border/50"
              style={{ boxShadow: "var(--shadow-3d-xl), 0 0 60px -12px hsl(32 95% 55% / 0.15)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with atmospheric glow */}
              <div className="relative p-5 border-b border-border/30">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/8 to-transparent pointer-events-none" />
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/[0.06] blur-[40px] rounded-full" />
                </div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="door-icon-3d w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center"
                      style={{ boxShadow: "var(--shadow-3d-sm)" }}>
                      <Package className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-tight">Inventaire</h3>
                      <p className="text-[10px] text-muted-foreground">{items.length} objet{items.length !== 1 ? "s" : ""} collecte{items.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-secondary/50 transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[60vh] p-4 space-y-5">
                {/* Sigils Section — 3D pedestals */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <p className="text-[10px] uppercase tracking-[3px] text-amber-400/70">Sigils de Maitrise</p>
                    <span className="text-[10px] font-bold text-amber-400 ml-auto">{sigils.length}/6</span>
                  </div>
                  <div className="grid grid-cols-6 gap-2.5">
                    {[...Array(6)].map((_, i) => {
                      const sigil = sigils[i];
                      return (
                        <motion.div
                          key={i}
                          whileHover={sigil ? { scale: 1.15, rotateY: 15 } : undefined}
                          className={`totem-pedestal aspect-square rounded-xl border flex items-center justify-center text-lg cursor-default ${
                            sigil
                              ? "sigil-3d bg-gradient-to-br from-amber-500/25 to-amber-400/10 border-amber-500/35"
                              : "bg-secondary/15 border-border/15"
                          }`}
                          style={sigil ? {
                            boxShadow: "0 0 16px -4px hsl(32 95% 55% / 0.3), var(--shadow-3d-sm)",
                          } : undefined}
                          title={sigil?.name || `Sigil ${i + 1} — non obtenu`}
                        >
                          {sigil ? (
                            <motion.span
                              animate={{ rotateY: [0, 360] }}
                              transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: i * 1.5 }}
                              style={{ display: "inline-block" }}
                            >🏅</motion.span>
                          ) : (
                            <span className="text-muted-foreground/20 text-sm">?</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Fragments Section — floating capsules */}
                {fragments.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground">Fragments & Indices</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {fragments.map((item, i) => {
                        const typeInfo = TYPE_LABELS[item.type] || { label: item.type, color: "text-foreground", glow: "215 90% 58%" };
                        const isSelected = selectedItem?.id === item.id;
                        return (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, y: 12, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: i * 0.04 }}
                            whileHover={{ y: -4, rotateY: 5, scale: 1.02 }}
                            onClick={() => setSelectedItem(isSelected ? null : item)}
                            className={`artifact-3d rounded-xl border p-3 text-left transition-all ${
                              isSelected
                                ? "bg-primary/10 border-primary/25"
                                : "bg-gradient-to-br from-card to-secondary/20 border-border/25 hover:border-border/40"
                            }`}
                            style={{
                              boxShadow: isSelected
                                ? `0 0 20px -4px hsl(${typeInfo.glow} / 0.25), var(--shadow-3d-md)`
                                : "var(--shadow-3d-sm)",
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <motion.span
                                animate={{ y: [0, -2, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                                className="text-lg"
                              >{item.icon}</motion.span>
                              <span className={`text-[9px] font-bold ${typeInfo.color}`}>{typeInfo.label}</span>
                            </div>
                            <p className="text-[10px] font-bold leading-tight">{item.name}</p>
                            <AnimatePresence>
                              {isSelected && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="text-[9px] text-muted-foreground mt-1.5 leading-relaxed"
                                >
                                  {item.description}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {items.length === 0 && (
                  <div className="text-center py-10">
                    <motion.div
                      animate={{ y: [0, -6, 0], rotateY: [0, 180, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="text-4xl mb-3 inline-block"
                    >📦</motion.div>
                    <p className="text-xs font-bold text-muted-foreground">Inventaire vide</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">Resous des salles pour collecter des fragments</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
