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
    <div className="rounded-xl border border-primary/20 bg-card p-5">
      <p className="text-center text-[10px] uppercase tracking-[3px] text-muted-foreground mb-3">
        🔥 Countdown Jour J
      </p>
      <div className="flex justify-center gap-3">
        {units.map((u, i) => (
          <motion.div
            key={i}
            className="text-center min-w-[52px]"
            animate={{ scale: i === 3 ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className={`font-mono text-3xl font-black ${i === 0 ? "text-primary animate-pulse-glow" : "text-foreground"}`}>
              {String(u.v).padStart(2, "0")}
            </div>
            <div className="text-[9px] text-muted-foreground mt-1">{u.l}</div>
          </motion.div>
        ))}
      </div>
      <p className="text-center mt-3 text-xs font-semibold text-primary">
        Dr. Attias-Widmer — Spitalzentrum Biel
      </p>
    </div>
  );
}
