import { useState, useEffect } from "react";
import { TARGET } from "@/data/content";
import { motion } from "framer-motion";

export function Countdown() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const diff = TARGET.getTime() - now.getTime();
  const dd = Math.max(0, Math.floor(diff / 864e5));
  const hh = Math.max(0, Math.floor((diff % 864e5) / 36e5));
  const mn = Math.max(0, Math.floor((diff % 36e5) / 6e4));
  const sc = Math.max(0, Math.floor((diff % 6e4) / 1e3));

  const units = [
    { v: dd, l: "jours" },
    { v: hh, l: "heures" },
    { v: mn, l: "min" },
    { v: sc, l: "sec" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="room-3d rounded-2xl p-6 relative overflow-hidden"
      style={{ boxShadow: "var(--shadow-3d-lg)" }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5 pointer-events-none" />
      
      <p className="text-center text-[10px] font-semibold uppercase tracking-[4px] text-muted-foreground mb-4 relative">
        ⏱️ Mission Countdown
      </p>
      <div className="flex justify-center gap-3 relative">
        {units.map((u, i) => (
          <motion.div
            key={i}
            className="text-center"
            animate={i === 3 ? { scale: [1, 1.04, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-16 h-16 rounded-xl bg-secondary/60 flex items-center justify-center mb-1.5 room-3d" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
              <span className={`font-mono text-2xl font-black tracking-tight ${
                i === 0 ? "gradient-text" : "text-foreground"
              }`}>
                {String(u.v).padStart(2, "0")}
              </span>
            </div>
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">{u.l}</span>
          </motion.div>
        ))}
      </div>
      <p className="text-center mt-4 text-xs font-semibold text-primary/80 relative">
        🎯 Objectif : Spitalzentrum Biel — Dr. Attias-Widmer
      </p>
    </motion.div>
  );
}
