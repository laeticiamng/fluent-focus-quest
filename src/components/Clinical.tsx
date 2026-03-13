import { useState } from "react";
import { SCENARIOS } from "@/data/content";
import { Check } from "lucide-react";

export function Clinical() {
  const [sci, setSci] = useState(0);
  const [scs, setScs] = useState(0);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-black">🏥 Cas cliniques</h2>
      <div className="flex gap-2">
        {SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => { setSci(i); setScs(0); }}
            className={`flex-1 rounded-lg border p-2.5 text-center transition-all ${
              sci === i ? "border-primary bg-primary/10" : "border-border bg-card"
            }`}
          >
            <div className="text-xl">{s.icon}</div>
            <div className={`text-[9px] mt-1 ${sci === i ? "text-primary" : "text-muted-foreground"}`}>{s.title}</div>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-primary/30 bg-card p-4">
        <h3 className="text-sm font-bold text-primary mb-3">{SCENARIOS[sci].icon} {SCENARIOS[sci].title}</h3>
        <div className="rounded-lg bg-info/10 border-l-[3px] border-info px-3 py-2.5 mb-4">
          <p className="text-xs leading-relaxed">{SCENARIOS[sci].sit}</p>
        </div>
        <div className="space-y-2">
          {SCENARIOS[sci].steps.map((st, i) => (
            <div
              key={i}
              onClick={() => setScs(Math.max(scs, i + 1))}
              className="flex gap-2.5 items-start cursor-pointer"
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold ${
                i < scs ? "bg-success text-primary-foreground" : "bg-secondary text-foreground"
              }`}>
                {i < scs ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <p className={`text-xs leading-relaxed ${i <= scs ? "" : "blur-sm"} ${i < scs ? "text-foreground" : "text-muted-foreground"}`}>
                {st}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
