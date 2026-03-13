import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SURVIVAL, CHECKLIST, TEMPLATES } from "@/data/content";
import { Check, Volume2 } from "lucide-react";

interface ToolsProps {
  addXp: (n: number) => void;
  cl: Record<string, boolean>;
  toggleChecklist: (key: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  addPomodoro: () => void;
  pomodoroCount: number;
}

const SURV_COLORS = [
  "border-accent/30 text-accent",
  "border-info/30 text-info",
  "border-success/30 text-success",
  "border-grammar/30 text-grammar",
  "border-warning/30 text-warning",
];

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, 500);
    // Second beep
    setTimeout(() => {
      const ctx2 = new AudioContext();
      const osc2 = ctx2.createOscillator();
      const gain2 = ctx2.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx2.destination);
      osc2.frequency.value = 1100;
      gain2.gain.value = 0.3;
      osc2.start();
      setTimeout(() => { osc2.stop(); ctx2.close(); }, 500);
    }, 600);
  } catch {}
}

export function Tools({ addXp, cl, toggleChecklist, notes, setNotes, addPomodoro, pomodoroCount }: ToolsProps) {
  const [tmr, setTmr] = useState(0);
  const [tmrOn, setTmrOn] = useState(false);
  const [tmrM, setTmrM] = useState(25);
  const [openTemplate, setOpenTemplate] = useState<number | null>(null);
  const ref = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (tmrOn && tmr > 0) { ref.current = setTimeout(() => setTmr(t => t - 1), 1000); }
    else if (tmrOn && tmr === 0) {
      setTmrOn(false);
      addXp(20);
      addPomodoro();
      playBeep();
    }
    return () => clearTimeout(ref.current);
  }, [tmrOn, tmr, addXp, addPomodoro]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black">🛠️ Outils</h2>

      {/* Pomodoro */}
      <div className="rounded-xl border border-primary/30 bg-card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-primary">⏱️ Pomodoro</h3>
          <span className="text-[10px] text-muted-foreground">{pomodoroCount} sessions ✓</span>
        </div>
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
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          <Volume2 className="w-3 h-3 inline mr-1" />Son à la fin de chaque session
        </p>
      </div>

      {/* Notes personnelles */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-bold mb-3">📝 Notes personnelles</h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Écris tes phrases, tes notes, tes idées ici... Tout est sauvegardé automatiquement."
          className="w-full bg-secondary rounded-lg p-3 text-xs min-h-[120px] resize-y border-0 focus:outline-none focus:ring-1 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Templates d'écriture */}
      <h3 className="text-sm font-bold">📄 Templates & Modèles</h3>
      {TEMPLATES.map((tpl, ti) => (
        <div key={ti} className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            onClick={() => setOpenTemplate(openTemplate === ti ? null : ti)}
            className="w-full p-4 text-left flex items-center gap-3 hover:bg-secondary/50 transition-colors"
          >
            <span className="text-xl">{tpl.icon}</span>
            <span className="text-sm font-bold flex-1">{tpl.title}</span>
            <span className="text-muted-foreground text-xs">{openTemplate === ti ? "▲" : "▼"}</span>
          </button>
          {openTemplate === ti && (
            <div className="border-t border-border p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-info mb-2">🇩🇪 Deutsch</p>
                <pre className="text-xs whitespace-pre-wrap bg-secondary rounded-lg p-3 leading-relaxed">{tpl.de}</pre>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-success mb-2">🇫🇷 Français</p>
                <pre className="text-xs whitespace-pre-wrap bg-secondary rounded-lg p-3 leading-relaxed">{tpl.fr}</pre>
              </div>
            </div>
          )}
        </div>
      ))}

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
          {["15 min en avance","Serrer la main","Grüezi / Uf Widerluege","Vouvoyer (Sie)","Poser des questions","Remercier chacun","Accepter le café","Contact visuel","Sourire naturel"].map((d, i) => (
            <p key={i} className="text-[10px] leading-relaxed">{d}</p>
          ))}
        </div>
        <div className="rounded-xl border border-primary/30 bg-card p-3">
          <p className="text-xs font-bold text-primary mb-2">❌ DON'T</p>
          {["Jamais en retard","Pas tutoyer","Pas interrompre","Pas critiquer FR vs CH","Pas de téléphone","Pas voix forte","Email merci le soir","Pas bras croisés","Pas mâcher gum"].map((d, i) => (
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
