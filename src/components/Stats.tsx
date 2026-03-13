import { useMemo } from "react";
import { DECKS } from "@/data/content";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { motion } from "framer-motion";
import type { Artifact } from "@/hooks/useProgress";
import { CREATION_BADGES } from "@/hooks/useProgress";

interface StatsProps {
  xp: number;
  quizScores: Record<string, { correct: number; total: number; date: string }[]>;
  hardCards: Record<string, boolean>;
  pomodoroCount: number;
  streak: number;
  done: Record<string, boolean>;
  grammarDone: Record<string, boolean>;
  rat: Record<number, number>;
  artifacts?: Artifact[];
}

const PIE_COLORS = [
  "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)", "hsl(270, 60%, 60%)",
  "hsl(187, 100%, 42%)", "hsl(210, 100%, 52%)"
];

export function Stats({ xp, quizScores, hardCards, pomodoroCount, streak, done, grammarDone, rat, artifacts = [] }: StatsProps) {
  const totalTasks = Object.values(done).filter(Boolean).length;
  const totalHard = Object.values(hardCards).filter(Boolean).length;
  const totalGrammar = Object.keys(grammarDone).length;
  const ratedCount = Object.keys(rat).length;

  // Production stats
  const phrasesForged = artifacts.filter(a => a.type === "phrase_forged").length;
  const grammarCreated = artifacts.filter(a => a.type === "grammar_phrase" || a.type === "grammar_rule" || a.type === "grammar_transform").length;
  const interviewAnswers = artifacts.filter(a => a.type === "interview_answer").length;
  const diagnosticsBuilt = artifacts.filter(a => a.type === "diagnostic" || a.type === "clinical_note").length;
  const scriptsWritten = artifacts.filter(a => a.type === "script" || a.type === "document").length;
  const creationXp = artifacts.reduce((a, b) => a + b.xpEarned, 0);

  // Production by day (last 7 days)
  const productionByDay = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().split("T")[0];
      days[key] = 0;
    }
    for (const a of artifacts) {
      const day = a.date.split("T")[0];
      if (days[day] !== undefined) days[day]++;
    }
    return Object.entries(days).map(([date, count]) => ({
      name: new Date(date).toLocaleDateString("fr-FR", { weekday: "short" }),
      creations: count,
    }));
  }, [artifacts]);

  // Production pie
  const productionPie = [
    { name: "Phrases", value: phrasesForged, color: "hsl(38, 92%, 50%)" },
    { name: "Grammaire", value: grammarCreated, color: "hsl(270, 60%, 60%)" },
    { name: "Entretien", value: interviewAnswers, color: "hsl(35, 100%, 55%)" },
    { name: "Clinique", value: diagnosticsBuilt, color: "hsl(340, 65%, 60%)" },
    { name: "Scripts/Docs", value: scriptsWritten, color: "hsl(210, 100%, 52%)" },
  ].filter(d => d.value > 0);

  const quizData = DECKS.map((dk) => {
    const scores = quizScores[dk.name] || [];
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, s) => a + (s.correct / s.total) * 100, 0) / scores.length)
      : 0;
    return { name: dk.icon + " " + dk.name.slice(0, 8), score: avgScore, attempts: scores.length };
  }).filter(d => d.attempts > 0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black tracking-tight">📊 Ma production</h2>

      {/* Primary: Creation stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { v: `${artifacts.length}`, l: "creations", cls: "text-amber-400" },
          { v: `${creationXp}`, l: "XP creation", cls: "text-accent" },
          { v: `${streak}`, l: "streak 🔥", cls: "text-primary" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="card-elevated rounded-2xl p-3.5 text-center">
            <div className={`text-xl font-black ${s.cls}`}>{s.v}</div>
            <div className="text-[9px] font-medium text-muted-foreground mt-0.5">{s.l}</div>
          </motion.div>
        ))}
      </div>

      {/* Production breakdown */}
      <div className="card-elevated rounded-2xl p-4">
        <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-3">Detail de production</p>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { v: `${phrasesForged}`, l: "phrases forgees", cls: "text-amber-400", icon: "✍️" },
            { v: `${grammarCreated}`, l: "regles construites", cls: "text-grammar", icon: "🌳" },
            { v: `${interviewAnswers}`, l: "reponses creees", cls: "text-accent", icon: "💬" },
            { v: `${diagnosticsBuilt}`, l: "diagnostics", cls: "text-clinical", icon: "🏥" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl bg-secondary/30 p-2.5">
              <span className="text-lg">{s.icon}</span>
              <div>
                <div className={`text-sm font-black ${s.cls}`}>{s.v}</div>
                <div className="text-[8px] font-medium text-muted-foreground">{s.l}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Production by day chart */}
      {artifacts.length > 0 && (
        <div className="card-elevated rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">🔨 Creations par jour</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={productionByDay}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(230, 10%, 50%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(230, 10%, 50%)" }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(230, 12%, 12%)", border: "1px solid hsl(230, 10%, 22%)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="creations" fill="hsl(38, 92%, 50%)" radius={[6, 6, 0, 0]} name="Creations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Production pie */}
      {productionPie.length > 0 && (
        <div className="card-elevated rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4">🎯 Repartition des creations</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={productionPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {productionPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(230, 12%, 12%)", border: "1px solid hsl(230, 10%, 22%)", borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Secondary: Legacy stats */}
      <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mt-2">Activite globale</p>
      <div className="grid grid-cols-4 gap-2">
        {[
          { v: `${totalTasks}`, l: "taches ✓", cls: "text-success" },
          { v: `${totalGrammar}`, l: "echauff.", cls: "text-grammar" },
          { v: `${pomodoroCount}`, l: "pomodoros", cls: "text-info" },
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

      {artifacts.length === 0 && quizData.length === 0 && (
        <div className="card-elevated rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">🔨</div>
          <p className="text-sm text-muted-foreground">Commence a creer pour voir tes stats de production !</p>
        </div>
      )}
    </div>
  );
}
