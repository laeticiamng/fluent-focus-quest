import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Package, X, Sparkles, Shield } from "lucide-react";
import type { InventoryItem } from "@/hooks/useProgress";

interface InventoryProps {
  items: InventoryItem[];
  sigilsCollected: string[];
  compact?: boolean;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  key_fragment: { label: "Fragment de cle", color: "text-amber-400" },
  code_digit: { label: "Element de code", color: "text-blue-400" },
  medical_rune: { label: "Rune medicale", color: "text-emerald-400" },
  vocal_seal: { label: "Sceau vocal", color: "text-violet-400" },
  clinical_artifact: { label: "Artefact clinique", color: "text-rose-400" },
  sonic_rune: { label: "Rune sonore", color: "text-orange-400" },
  archive_piece: { label: "Piece d'archive", color: "text-cyan-400" },
  master_sigil: { label: "Sigil de Maitrise", color: "text-amber-300" },
};

export function Inventory({ items, sigilsCollected, compact = false }: InventoryProps) {
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
      >
        <Package className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] font-bold text-amber-400">{items.length}</span>
        {items.length > 0 && (
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400"
          />
        )}
      </motion.button>
    );
  }

  return (
    <>
      {/* Inventory Button */}
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(true)}
        className="w-full rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-4 text-left transition-all hover:border-amber-500/30 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
            <Package className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold">Inventaire</p>
            <p className="text-[10px] text-muted-foreground">
              {fragments.length} fragment{fragments.length !== 1 ? "s" : ""} · {sigils.length}/6 Sigils
            </p>
          </div>
          <div className="flex gap-1">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[8px] transition-all ${
                  i < sigils.length
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                    : "bg-secondary/30 border-border/20 text-muted-foreground/30"
                }`}
              >
                {i < sigils.length ? "🏅" : "·"}
              </div>
            ))}
          </div>
        </div>
      </motion.button>

      {/* Inventory Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative z-10 w-full max-w-md mx-4 mb-4 sm:mb-0 max-h-[80vh] overflow-hidden rounded-3xl bg-card border border-border/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-5 border-b border-border/30">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/8 to-transparent pointer-events-none" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
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

              <div className="overflow-y-auto max-h-[60vh] p-4 space-y-4">
                {/* Sigils Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <p className="text-[10px] uppercase tracking-[3px] text-amber-400/70">Sigils de Maitrise</p>
                    <span className="text-[10px] font-bold text-amber-400 ml-auto">{sigils.length}/6</span>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {[...Array(6)].map((_, i) => {
                      const sigil = sigils[i];
                      return (
                        <motion.div
                          key={i}
                          whileHover={sigil ? { scale: 1.1, rotate: 5 } : undefined}
                          className={`aspect-square rounded-xl border flex items-center justify-center text-lg transition-all cursor-default ${
                            sigil
                              ? "bg-gradient-to-br from-amber-500/20 to-amber-400/10 border-amber-500/30 shadow-lg shadow-amber-500/10"
                              : "bg-secondary/20 border-border/20"
                          }`}
                          title={sigil?.name || `Sigil ${i + 1} — non obtenu`}
                        >
                          {sigil ? (
                            <motion.span
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                            >
                              🏅
                            </motion.span>
                          ) : (
                            <span className="text-muted-foreground/20 text-sm">?</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Fragments Section */}
                {fragments.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground">Fragments & Indices</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {fragments.map((item, i) => {
                        const typeInfo = TYPE_LABELS[item.type] || { label: item.type, color: "text-foreground" };
                        return (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            whileHover={{ scale: 1.03 }}
                            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                            className={`rounded-xl border p-3 text-left transition-all ${
                              selectedItem?.id === item.id
                                ? "bg-primary/10 border-primary/25"
                                : "bg-secondary/20 border-border/20 hover:border-border/40"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{item.icon}</span>
                              <span className={`text-[9px] font-bold ${typeInfo.color}`}>{typeInfo.label}</span>
                            </div>
                            <p className="text-[10px] font-bold leading-tight">{item.name}</p>
                            {selectedItem?.id === item.id && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="text-[9px] text-muted-foreground mt-1 leading-relaxed"
                              >
                                {item.description}
                              </motion.p>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {items.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-3xl mb-3">📦</p>
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
