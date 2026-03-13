import { DECKS } from "@/data/content";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

interface StatsProps {
  xp: number;
  quizScores: Record<string, { correct: number; total: number; date: string }[]>;
  hardCards: Record<string, boolean>;
  pomodoroCount: number;
  streak: number;
  done: Record<string, boolean>;
  grammarDone: Record<string, boolean>;
  rat: Record<number, number>;
}

const PIE_COLORS = [
  "hsl(142, 71%, 45%)", "hsl(217, 91%, 60%)", "hsl(270, 60%, 60%)",
  "hsl(38, 92%, 50%)", "hsl(210, 100%, 52%)"
];

export function Stats({ xp, quizScores, hardCards, pomodoroCount, streak, done, grammarDone, rat }: StatsProps) {
  const totalTasks = Object.values(done).filter(Boolean).length;
  const totalHard = Object.values(hardCards).filter(Boolean).length;
  const totalGrammar = Object.keys(grammarDone).length;
  const ratedCount = Object.keys(rat).length;

  const quizData = DECKS.map((dk) => {
    const scores = quizScores[dk.name] || [];
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, s) => a + (s.correct / s.total) * 100, 0) / scores.length)
      : 0;
    return { name: dk.icon + " " + dk.name.slice(0, 8), score: avgScore, attempts: scores.length };
  }).filter(d => d.attempts > 0);

  const pieData = [
    { name: "Tâches", value: totalTasks, color: PIE_COLORS[0] },
    { name: "Quiz", value: Object.values(quizScores).reduce((a, s) => a + s.length, 0), color: PIE_COLORS[1] },
    { name: "Grammaire", value: totalGrammar, color: PIE_COLORS[2] },
    { name: "Entretien", value: ratedCount, color: PIE_COLORS[3] },
    { name: "Pomodoro", value: pomodoroCount, color: PIE_COLORS[4] },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black tracking-tight">📊 Statistiques</h2>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { v: `${xp}`, l: "XP total", cls: "text-accent" },
          { v: `${streak}`, l: "streak 🔥", cls: "text-primary" },
          { v: `${pomodoroCount}`, l: "pomodoros", cls: "text-success" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="card-elevated rounded-2xl p-3.5 text-center">
            <div className={`text-xl font-black ${s.cls}`}>{s.v}</div>
            <div className="text-[9px] font-medium text-muted-foreground mt-0.5">{s.l}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { v: `${totalTasks}`, l: "tâches ✓", cls: "text-success" },
          { v: `${totalGrammar}`, l: "exos gram.", cls: "text-grammar" },
          { v: `${ratedCount}`, l: "entretien", cls: "text-info" },
          { v: `${totalHard}`, l: "mots ⭐", cls: "text-primary" },
        ].map((s, i) => (
          <div key={i} className="card-elevated rounded-2xl p-2.5 text-center">
            <div className={`text-lg font-black ${s.cls}`}>{s.v}</div>
            <div className="text-[8px] font-medium text-muted-foreground mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      {quizData.length > 0 && (
        <div className="card-elevated rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">📈 Score moyen par deck</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={quizData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(230, 10%, 50%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(230, 10%, 50%)" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(230, 12%, 12%)", border: "1px solid hsl(230, 10%, 22%)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="score" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} name="Score %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {pieData.length > 0 && (
        <div className="card-elevated rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">🎯 Répartition</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(230, 12%, 12%)", border: "1px solid hsl(230, 10%, 22%)", borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {Object.keys(quizScores).length > 0 && (
        <div className="card-elevated rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-3">📋 Historique quiz</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {Object.entries(quizScores).flatMap(([deck, scores]) =>
              scores.map((s, i) => ({ deck, ...s, key: `${deck}-${i}` }))
            ).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15).map(s => (
              <div key={s.key} className="flex justify-between items-center text-xs border-b border-border/20 pb-2 last:border-0">
                <span className="font-medium">{s.deck}</span>
                <div className="flex gap-3">
                  <span className={s.correct === s.total ? "text-success font-bold" : "text-muted-foreground"}>{s.correct}/{s.total}</span>
                  <span className="text-muted-foreground/60">{s.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {quizData.length === 0 && pieData.length === 0 && (
        <div className="card-elevated rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-sm text-muted-foreground">Commence à travailler pour voir tes stats!</p>
        </div>
      )}
    </div>
  );
}
