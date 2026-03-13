import { useState, useEffect } from "react";
import { MOTIV } from "@/data/content";
import { motion, AnimatePresence } from "framer-motion";

export function MotivBanner() {
  const [mi, setMi] = useState(0);
  useEffect(() => { const t = setInterval(() => setMi(i => (i + 1) % MOTIV.length), 5000); return () => clearInterval(t); }, []);

  return (
    <div className="rounded-lg border-l-4 border-primary bg-primary/5 px-4 py-3">
      <AnimatePresence mode="wait">
        <motion.p
          key={mi}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-sm font-semibold text-primary"
        >
          {MOTIV[mi]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
