import { GRAM } from "@/data/content";

const COLORS = [
  "border-info/30 text-info",
  "border-grammar/30 text-grammar",
  "border-success/30 text-success",
  "border-clinical/30 text-clinical",
  "border-primary/30 text-primary",
];

export function Grammar() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-black">📐 Grammaire essentielle</h2>
      {GRAM.map((g, gi) => (
        <div key={gi} className={`rounded-xl border bg-card p-4 ${COLORS[gi].split(" ")[0]}`}>
          <h3 className={`text-sm font-bold mb-3 ${COLORS[gi].split(" ")[1]}`}>{g.title}</h3>
          <div className="space-y-1.5">
            {g.items.map((c, ci) => (
              <div key={ci} className="rounded-lg bg-secondary p-2.5">
                <div className={`text-[11px] font-bold ${COLORS[gi].split(" ")[1]}`}>{c.l}</div>
                <div className="text-xs">{c.e}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
