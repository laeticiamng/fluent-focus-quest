import { useState } from "react";
import { IVW } from "@/data/content";
import { Button } from "@/components/ui/button";

interface InterviewProps {
  rat: Record<number, number>;
  setRating: (qi: number, r: number) => void;
}

const EMOJIS = [
  { v: 1, e: "😰" }, { v: 2, e: "😕" }, { v: 3, e: "🙂" }, { v: 4, e: "😊" }, { v: 5, e: "🔥" },
];

export function Interview({ rat, setRating }: InterviewProps) {
  const [ii, setIi] = useState(0);
  const [sa, setSa] = useState(false);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-black">💼 Entretien — Réponds À VOIX HAUTE</h2>

      <div className="flex gap-1.5 flex-wrap">
        {IVW.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIi(i); setSa(false); }}
            className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
              ii === i ? "border-primary bg-primary/20 text-primary" :
              rat[i] ? "border-success/30 bg-success/10 text-success" :
              "border-border bg-card text-muted-foreground"
            }`}
          >{i + 1}</button>
        ))}
      </div>

      <div className="rounded-xl border border-primary/30 bg-card p-5">
        <p className="text-[9px] uppercase tracking-widest text-primary mb-2">Frage {ii + 1}/10</p>
        <p className="text-lg font-bold leading-snug mb-4">{IVW[ii].q}</p>
        <div className="rounded-lg bg-accent/10 border-l-[3px] border-accent px-3 py-2">
          <p className="text-[11px] text-accent font-semibold">💡 {IVW[ii].h}</p>
        </div>
      </div>

      <Button
        onClick={() => setSa(!sa)}
        className="w-full"
        variant={sa ? "secondary" : "default"}
      >
        {sa ? "Masquer" : "🔓 Révéler la réponse"}
      </Button>

      {sa && (
        <>
          <div className="rounded-xl border border-success/30 bg-card p-4">
            <p className="text-[10px] text-success font-bold mb-2">Antwort:</p>
            <p className="text-sm leading-relaxed">{IVW[ii].r}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-3">Auto-évaluation:</p>
            <div className="flex gap-2 justify-center">
              {EMOJIS.map(r => (
                <button
                  key={r.v}
                  onClick={() => setRating(ii, r.v)}
                  className={`rounded-lg p-2.5 border transition-all text-xl ${
                    rat[ii] === r.v ? "bg-success/20 border-success" : "bg-secondary border-border"
                  }`}
                >{r.e}</button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
