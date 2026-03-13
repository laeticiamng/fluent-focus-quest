import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SURVIVAL, CHECKLIST, TEMPLATES } from "@/data/content";
import { Check, Volume2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useCelebration } from "@/components/CelebrationProvider";

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
  "border-accent/15 text-accent",
  "border-info/15 text-info",
  "border-success/15 text-success",
  "border-grammar/15 text-grammar",
  "border-warning/15 text-warning",
];

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880; gain.gain.value = 0.3;
    osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, 500);
    setTimeout(() => {
      const ctx2 = new AudioContext();
      const osc2 = ctx2.createOscillator();
      const gain2 = ctx2.createGain();
      osc2.connect(gain2); gain2.connect(ctx2.destination);
      osc2.frequency.value = 1100; gain2.gain.value = 0.3;
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
    else if (tmrOn && tmr === 0) { setTmrOn(false); addXp(20); addPomodoro(); playBeep(); }
    return () => clearTimeout(ref.current);
  }, [tmrOn, tmr, addXp, addPomodoro]);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-black tracking-tight">🛠️ Outils</h2>

      {/* Pomodoro */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated rounded-2xl p-6"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold text-primary">⏱️ Pomodoro</h3>
          <span className="text-[10px] text-muted-foreground font-medium">{pomodoroCount} sessions ✓</span>
        </div>
        <div className="text-center mb-5">
          <span className={`font-mono text-5xl font-black tracking-tight ${tmr > 0 ? "text-primary" : "text-foreground/40"}`}>
            {String(Math.floor(tmr / 60)).padStart(2, "0")}:{String(tmr % 60).padStart(2, "0")}
          </span>
        </div>
        <div className="flex gap-2 justify-center mb-4">
          {[15, 25, 45].map(m => (
            <button key={m}
              onClick={() => { setTmr(m * 60); setTmrOn(false); setTmrM(m); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${tmrM === m ? "bg-primary/15 text-primary border border-primary/20" : "bg-secondary text-muted-foreground"}`}
            >{m}m</button>
          ))}
        </div>
        <div className="flex gap-2.5 justify-center">
          <Button onClick={() => { if (!tmrOn && tmr === 0) setTmr(tmrM * 60); setTmrOn(!tmrOn); }}
            className={`rounded-xl px-6 ${tmrOn ? "bg-accent text-accent-foreground" : "bg-success text-primary-foreground"}`}
          >{tmrOn ? "⏸ Pause" : "▶ Start"}</Button>
          <Button variant="secondary" onClick={() => { setTmrOn(false); setTmr(0); }} className="rounded-xl">↺ Reset</Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
          <Volume2 className="w-3 h-3" /> Son à la fin
        </p>
      </motion.div>

      {/* Notes */}
      <div className="card-elevated rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-3">📝 Notes personnelles</h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Tes phrases, notes, idées... Sauvegarde auto."
          className="w-full bg-secondary/50 rounded-xl p-4 text-xs min-h-[120px] resize-y border border-border/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 text-foreground placeholder:text-muted-foreground transition-all"
        />
      </div>

      {/* Templates */}
      <h3 className="text-sm font-bold">📄 Templates & Modèles</h3>
      {TEMPLATES.map((tpl, ti) => (
        <div key={ti} className="card-elevated rounded-2xl overflow-hidden">
          <button
            onClick={() => setOpenTemplate(openTemplate === ti ? null : ti)}
            className="w-full p-4 text-left flex items-center gap-3 hover:bg-secondary/30 transition-colors"
          >
            <span className="text-xl">{tpl.icon}</span>
            <span className="text-sm font-semibold flex-1 tracking-tight">{tpl.title}</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openTemplate === ti ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openTemplate === ti && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border/30 p-5 space-y-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-[3px] text-info/70 mb-2">🇩🇪 Deutsch</p>
                    <pre className="text-xs whitespace-pre-wrap bg-secondary/40 rounded-xl p-4 leading-relaxed">{tpl.de}</pre>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[3px] text-success/70 mb-2">🇫🇷 Français</p>
                    <pre className="text-xs whitespace-pre-wrap bg-secondary/40 rounded-xl p-4 leading-relaxed">{tpl.fr}</pre>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Survival */}
      <h3 className="text-sm font-bold">🆘 Phrases de survie</h3>
      {SURVIVAL.map((cat, ci) => (
        <div key={ci} className={`card-elevated rounded-2xl p-4 border-l-[3px] ${SURV_COLORS[ci].split(" ")[0]}`}>
          <p className={`text-xs font-bold mb-3 ${SURV_COLORS[ci].split(" ")[1]}`}>{cat.cat}</p>
          <div className="space-y-2.5">
            {cat.items.map((p, pi) => (
              <div key={pi} className="border-b border-border/20 last:border-0 pb-2 last:pb-0">
                <div className="text-xs font-semibold">{p.de}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{p.fr}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* DO / DON'T */}
      <h3 className="text-sm font-bold">🇨🇭 DO / DON'T Jour J</h3>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="card-elevated rounded-2xl p-4 border-l-[3px] border-success/20">
          <p className="text-xs font-bold text-success mb-2.5">✅ DO</p>
          {["15 min en avance","Serrer la main","Grüezi / Uf Widerluege","Vouvoyer (Sie)","Poser des questions","Remercier chacun","Accepter le café","Contact visuel","Sourire naturel"].map((d, i) => (
            <p key={i} className="text-[10px] leading-[1.6]">{d}</p>
          ))}
        </div>
        <div className="card-elevated rounded-2xl p-4 border-l-[3px] border-primary/20">
          <p className="text-xs font-bold text-primary mb-2.5">❌ DON'T</p>
          {["Jamais en retard","Pas tutoyer","Pas interrompre","Pas critiquer FR vs CH","Pas de téléphone","Pas voix forte","Email merci le soir","Pas bras croisés","Pas mâcher gum"].map((d, i) => (
            <p key={i} className="text-[10px] leading-[1.6]">{d}</p>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <h3 className="text-sm font-bold">✅ Checklist Jour J</h3>
      {CHECKLIST.map((cat, catI) => (
        <div key={catI} className="card-elevated rounded-2xl p-4">
          <p className="text-xs font-bold mb-3">{cat.cat}</p>
          <div className="space-y-2">
            {cat.items.map((item, itemI) => {
              const k = `cl-${catI}-${itemI}`;
              return (
                <motion.div key={itemI} whileTap={{ scale: 0.98 }} onClick={() => toggleChecklist(k)} className="flex gap-3 items-center cursor-pointer py-0.5">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    cl[k] ? "bg-success border-success" : "border-muted-foreground/30"
                  }`}>
                    {cl[k] && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className={`text-xs ${cl[k] ? "line-through text-muted-foreground" : ""}`}>{item}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
