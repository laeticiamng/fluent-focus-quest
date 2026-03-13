import { LVLS } from "@/data/content";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface XPBarProps { xp: number; }

export function XPBar({ xp }: XPBarProps) {
  const level = Math.min(Math.floor(xp / 100) + 1, 7);
  const lvlPct = xp % 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="card-elevated rounded-2xl p-4 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-lg font-black text-primary glow-primary">
        {level}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-sm tracking-tight">{LVLS[Math.min(level - 1, 6)]}</span>
          <span className="text-primary font-bold text-xs">{xp} XP</span>
        </div>
        <Progress value={lvlPct} className="h-1.5 bg-secondary rounded-full" />
      </div>
    </motion.div>
  );
}
