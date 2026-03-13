import { useState, useEffect } from "react";
import { MOTIV } from "@/data/content";
import { motion, AnimatePresence } from "framer-motion";

export function MotivBanner() {
  const [mi, setMi] = useState(0);
  useEffect(() => { const t = setInterval(() => setMi(i => (i + 1) % MOTIV.length), 5000); return () => clearInterval(t); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl bg-gradient-to-r from-primary/8 via-primary/4 to-transparent border border-primary/10 px-5 py-3.5"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={mi}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-sm font-medium text-primary/90"
        >
          {MOTIV[mi]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}
