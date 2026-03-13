import { LVLS } from "@/data/content";
import { Progress } from "@/components/ui/progress";

interface XPBarProps { xp: number; }

export function XPBar({ xp }: XPBarProps) {
  const level = Math.min(Math.floor(xp / 100) + 1, 7);
  const lvlPct = xp % 100;

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-xl font-black text-primary">
        {level}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1.5">
          <span className="font-bold text-sm">{LVLS[Math.min(level - 1, 6)]}</span>
          <span className="text-accent font-bold text-xs">{xp} XP</span>
        </div>
        <Progress value={lvlPct} className="h-2 bg-muted" />
      </div>
    </div>
  );
}
