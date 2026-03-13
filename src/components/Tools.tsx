import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SURVIVAL, CHECKLIST } from "@/data/content";
import { Check } from "lucide-react";

interface ToolsProps {
  addXp: (n: number) => void;
  cl: Record<string, boolean>;
  toggleChecklist: (key: string) => void;
}

const SURV_COLORS = [
  "border-accent/30 text-accent",
  "border-info/30 text-info",
  "border-success/30 text-success",
  "border-grammar/30 text-grammar",
  "border-warning/30 text-warning",
];

export function Tools({ addXp, cl, toggleChecklist }: ToolsProps) {
  const [tmr, setTmr] = useState(0);
  const [tmrOn, setTmrOn] = useState(false);
  const [tmrM, setTmrM] = useState(25);
  const ref = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (tmrOn && tmr > 0) { ref.current = setTimeout(() => setTmr(t => t - 1), 1000); }
    else if (tmrOn && tmr === 0) { setTmrOn(false); addXp(20); }
    return () => clearTimeout(ref.current);
  }, [tmrOn, tmr, addXp]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black">🛠️ Outils</h2>

      {/* Pomodoro */}
      <div className="rounded-xl border border-primary/30 bg-card p-5">
        <h3 className="text-sm font-bold text-primary mb-4">⏱️ Pomodoro</h3>
        <div className="text-center mb-4">
          <span className={`font-mono text-5xl font-black ${tmr > 0 ? "text-primary" : ""}`}>
            {String(Math.floor(tmr / 60)).padStart(2, "0")}:{String(tmr % 60).padStart(2, "0")}
          </span>
        </div>
        <div className="flex gap-2 justify-center mb-3">
          {[15, 25, 45].map(m => (
            <Button key={m} size="sm" variant={tmrM === m ? "default" : "secondary"}
              onClick={() => { setTmr(m * 60); setTmrOn(false); setTmrM(m); }}
            >{m}m</Button>
          ))}
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => { if (!tmrOn && tmr === 0) setTmr(tmrM * 60); setTmrOn(!tmrOn); }}
            className={tmrOn ? "bg-accent text-accent-foreground" : "bg-success"}
          >{tmrOn ? "⏸ Pause" : "▶ Start"}</Button>
          <Button variant="secondary" onClick={() => { setTmrOn(false); setTmr(0); }}>↺ Reset</Button>
        </div>
      </div>

      {/* Survival phrases */}
      <h3 className="text-sm font-bold">🆘 Phrases de survie</h3>
      {SURVIVAL.map((cat, ci) => (
        <div key={ci} className={`rounded-xl border bg-card p-4 ${SURV_COLORS[ci].split(" ")[0]}`}>
          <p className={`text-xs font-bold mb-3 ${SURV_COLORS[ci].split(" ")[1]}`}>{cat.cat}</p>
          <div className="space-y-2">
            {cat.items.map((p, pi) => (
              <div key={pi} className="border-b border-border last:border-0 pb-1.5 last:pb-0">
                <div className="text-xs font-semibold">{p.de}</div>
                <div className="text-[11px] text-muted-foreground">{p.fr}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* DO / DON'T */}
      <h3 className="text-sm font-bold">🇨🇭 DO / DON'T Jour J</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-success/30 bg-card p-3">
          <p className="text-xs font-bold text-success mb-2">✅ DO</p>
          {["15 min en avance","Serrer la main","Grüezi / Uf Widerluege","Vouvoyer (Sie)","Poser des questions","Remercier chacun","Accepter le café"].map((d, i) => (
            <p key={i} className="text-[10px] leading-relaxed">{d}</p>
          ))}
        </div>
        <div className="rounded-xl border border-primary/30 bg-card p-3">
          <p className="text-xs font-bold text-primary mb-2">❌ DON'T</p>
          {["Jamais en retard","Pas tutoyer","Pas interrompre","Pas critiquer FR vs CH","Pas de téléphone","Pas voix forte","Email merci le soir"].map((d, i) => (
            <p key={i} className="text-[10px] leading-relaxed">{d}</p>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <h3 className="text-sm font-bold">✅ Checklist Jour J</h3>
      {CHECKLIST.map((cat, catI) => (
        <div key={catI} className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-bold mb-3">{cat.cat}</p>
          <div className="space-y-1.5">
            {cat.items.map((item, itemI) => {
              const k = `cl-${catI}-${itemI}`;
              return (
                <div key={itemI} onClick={() => toggleChecklist(k)} className="flex gap-2.5 items-center cursor-pointer">
                  <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 ${
                    cl[k] ? "bg-success border-success" : "border-muted-foreground"
                  }`}>
                    {cl[k] && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                  </div>
                  <span className={`text-xs ${cl[k] ? "line-through text-muted-foreground" : ""}`}>{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
