import { DECKS } from "@/data/content";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

const COLORS_ARR = ["hsl(0, 80%, 62%)", "hsl(145, 65%, 50%)", "hsl(230, 70%, 60%)", "hsl(38, 100%, 51%)", "hsl(265, 60%, 65%)", "hsl(185, 100%, 55%)", "hsl(0, 60%, 50%)", "hsl(120, 50%, 45%)", "hsl(200, 70%, 55%)"];

export function Stats({ xp, quizScores, hardCards, pomodoroCount, streak, done, grammarDone, rat }: StatsProps) {
  const totalTasks = Object.values(done).filter(Boolean).length;
  const totalHard = Object.values(hardCards).filter(Boolean).length;
  const totalGrammar = Object.keys(grammarDone).length;
  const ratedCount = Object.keys(rat).length;

  // Quiz scores by deck
  const quizData = DECKS.map((dk, i) => {
    const scores = quizScores[dk.name] || [];
    const lastScore = scores.length > 0 ? scores[scores.length - 1] : null;
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, s) => a + (s.correct / s.total) * 100, 0) / scores.length)
      : 0;
    return {
      name: dk.icon + " " + dk.name.slice(0, 8),
      score: avgScore,
      attempts: scores.length,
      last: lastScore ? Math.round((lastScore.correct / lastScore.total) * 100) : 0,
    };
  }).filter(d => d.attempts > 0);

  // Pie data for overall progress
  const pieData = [
    { name: "Tâches", value: totalTasks, color: "hsl(145, 65%, 50%)" },
    { name: "Quiz", value: Object.values(quizScores).reduce((a, s) => a + s.length, 0), color: "hsl(230, 70%, 60%)" },
    { name: "Grammaire", value: totalGrammar, color: "hsl(265, 60%, 65%)" },
    { name: "Entretien", value: ratedCount, color: "hsl(38, 100%, 51%)" },
    { name: "Pomodoro", value: pomodoroCount, color: "hsl(0, 80%, 62%)" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black">📊 Statistiques</h2>

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { v: `${xp}`, l: "XP total", cls: "text-accent" },
          { v: `${streak}`, l: "jours streak", cls: "text-primary" },
          { v: `${pomodoroCount}`, l: "pomodoros", cls: "text-success" },
        ].map((s, i) => (
          <div key={i} className="rounded-lg bg-card p-3 text-center">
            <div className={`text-xl font-black ${s.cls}`}>{s.v}</div>
            <div className="text-[9px] text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { v: `${totalTasks}`, l: "tâches ✓", cls: "text-success" },
          { v: `${totalGrammar}`, l: "exos gram.", cls: "text-grammar" },
          { v: `${ratedCount}`, l: "entretien", cls: "text-info" },
          { v: `${totalHard}`, l: "mots ⭐", cls: "text-primary" },
        ].map((s, i) => (
          <div key={i} className="rounded-lg bg-card p-2.5 text-center">
            <div className={`text-lg font-black ${s.cls}`}>{s.v}</div>
            <div className="text-[9px] text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Quiz performance chart */}
      {quizData.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold mb-4">📈 Score moyen par deck</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={quizData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(228, 15%, 50%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(228, 15%, 50%)" }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(222, 40%, 9%)", border: "1px solid hsl(222, 25%, 18%)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "hsl(220, 20%, 92%)" }}
              />
              <Bar dataKey="score" fill="hsl(145, 65%, 50%)" radius={[4, 4, 0, 0]} name="Score moyen %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Activity pie chart */}
      {pieData.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold mb-4">🎯 Répartition de l'activité</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(222, 40%, 9%)", border: "1px solid hsl(222, 25%, 18%)", borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quiz history */}
      {Object.keys(quizScores).length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold mb-3">📋 Historique quiz</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {Object.entries(quizScores).flatMap(([deck, scores]) =>
              scores.map((s, i) => ({
                deck,
                ...s,
                key: `${deck}-${i}`
              }))
            ).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15).map(s => (
              <div key={s.key} className="flex justify-between items-center text-xs border-b border-border pb-1.5 last:border-0">
                <span className="font-medium">{s.deck}</span>
                <div className="flex gap-3">
                  <span className={s.correct === s.total ? "text-success font-bold" : "text-muted-foreground"}>
                    {s.correct}/{s.total}
                  </span>
                  <span className="text-muted-foreground">{s.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {quizData.length === 0 && pieData.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm text-muted-foreground">Commence à travailler pour voir tes stats ici!</p>
        </div>
      )}
    </div>
  );
}
