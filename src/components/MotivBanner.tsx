import { useState, useEffect, useMemo } from "react";
import { MOTIV, TARGET } from "@/data/content";
import { motion, AnimatePresence } from "framer-motion";

export function MotivBanner() {
  const [mi, setMi] = useState(() => Math.floor(Math.random() * MOTIV.length));
  useEffect(() => { const t = setInterval(() => setMi(i => (i + 1) % MOTIV.length), 6000); return () => clearInterval(t); }, []);

  const daysLeft = useMemo(() => {
    const diff = TARGET.getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 864e5));
  }, []);

  const isUrgent = daysLeft <= 7;
  const isFinal = daysLeft <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl px-5 py-3.5 relative overflow-hidden"
      style={{
        background: isFinal
          ? "linear-gradient(145deg, hsl(0 84% 60% / 0.06), hsl(var(--card)), hsl(0 84% 60% / 0.03))"
          : isUrgent
          ? "linear-gradient(145deg, hsl(38 92% 50% / 0.06), hsl(var(--card)), hsl(38 92% 50% / 0.03))"
          : "linear-gradient(145deg, hsl(var(--primary) / 0.06), hsl(var(--card)))",
        border: isFinal
          ? "1px solid hsl(0 84% 60% / 0.15)"
          : isUrgent
          ? "1px solid hsl(38 92% 50% / 0.12)"
          : "1px solid hsl(var(--primary) / 0.1)",
      }}
    >
      {isFinal && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-16 bg-rose-500/8 blur-[30px] rounded-full pointer-events-none" />
      )}
      <AnimatePresence mode="wait">
        <motion.p
          key={mi}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`text-sm font-medium leading-relaxed relative z-10 ${
            isFinal ? "text-rose-400/90" : isUrgent ? "text-amber-400/90" : "text-primary/90"
          }`}
        >
          {MOTIV[mi]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}
