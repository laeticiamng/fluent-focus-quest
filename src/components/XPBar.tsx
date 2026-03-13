import { LVLS } from "@/data/content";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

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
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/25 to-primary/8 border border-primary/25 flex items-center justify-center text-lg font-black text-primary glow-primary cursor-default select-none"
      >
        {level}
      </motion.div>
      <div className="flex-1">
        <div className="flex justify-between mb-2">
          <span className="font-bold text-sm tracking-tight">{LVLS[Math.min(level - 1, 6)]}</span>
          <span className="flex items-center gap-1 text-primary font-bold text-xs">
            <Zap className="w-3 h-3" />{xp} XP
          </span>
        </div>
        <div className="relative">
          <Progress value={lvlPct} className="h-2 bg-secondary rounded-full" />
          {lvlPct > 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary glow-primary" />
            </motion.div>
          )}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">Niveau {level}</span>
          <span className="text-[10px] text-muted-foreground">{100 - lvlPct} XP → prochain niveau</span>
        </div>
      </div>
    </motion.div>
  );
}
