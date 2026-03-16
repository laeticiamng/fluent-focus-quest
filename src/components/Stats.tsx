import { useMemo } from "react";
import { DECKS } from "@/data/content";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { motion } from "framer-motion";
import type { Artifact, ZoneId } from "@/hooks/useProgress";
import { CREATION_BADGES, ZONES } from "@/hooks/useProgress";

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
  zoneStatus?: Record<ZoneId, { unlocked: boolean; progress: number; rooms: { id: string; unlocked: boolean }[] }>;
}

const PIE_COLORS = [
  "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)", "hsl(270, 60%, 60%)",
  "hsl(187, 100%, 42%)", "hsl(210, 100%, 52%)"
];

export function Stats({ xp, quizScores, hardCards, pomodoroCount, streak, done, grammarDone, rat, artifacts = [], zoneStatus }: StatsProps) {
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
      {/* Header — Le Chroniqueur */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-5 room-3d"
        style={{
          background: "linear-gradient(145deg, hsl(187 100% 42% / 0.08), hsl(var(--card)), hsl(38 92% 50% / 0.04))",
          border: "1px solid hsl(187 100% 42% / 0.12)",
          boxShadow: "var(--shadow-3d-lg), 0 0 40px -12px hsl(187 100% 42% / 0.12)",
        }}
      >
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="door-icon-3d w-12 h-12 rounded-xl bg-cyan-500/12 border border-cyan-500/15 flex items-center justify-center text-2xl"
            style={{ boxShadow: "var(--shadow-3d-sm), 0 0 14px -4px hsl(187 100% 42% / 0.2)" }}
          >
            📊
          </motion.div>
          <div>
            <h2 className="text-xl font-black tracking-tight">La Salle des Chroniques</h2>
            <p className="text-[10px] text-cyan-400/50 font-medium">Archives du Chroniqueur</p>
          </div>
        </div>
      </motion.div>

      {/* Primary: Creation stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { v: `${artifacts.length}`, l: "creations", cls: "text-amber-400" },
          { v: `${creationXp}`, l: "XP creation", cls: "text-accent" },
          { v: `${streak}`, l: "streak 🔥", cls: "text-primary" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="room-3d rounded-2xl p-3.5 text-center"
            style={{ boxShadow: "var(--shadow-3d-sm)" }}>
            <div className={`text-xl font-black ${s.cls}`}>{s.v}</div>
            <div className="text-[9px] font-medium text-muted-foreground mt-0.5">{s.l}</div>
          </motion.div>
        ))}
      </div>

      {/* Production breakdown */}
      <div className="room-3d rounded-2xl p-4" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
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
        <div className="room-3d rounded-2xl p-5" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
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
        <div className="room-3d rounded-2xl p-5" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
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

      {/* Zone progression */}
      {zoneStatus && (
        <div className="room-3d rounded-2xl p-5" style={{ boxShadow: "var(--shadow-3d-md)" }}>
          <h3 className="text-sm font-bold mb-4">🗺️ Progression des zones</h3>
          <div className="space-y-3">
            {ZONES.map(zone => {
              const status = zoneStatus[zone.id];
              if (!status) return null;
              const unlockedRooms = status.rooms.filter(r => r.unlocked).length;
              return (
                <div key={zone.id} className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center">{status.unlocked ? zone.icon : "🔒"}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${status.unlocked ? "" : "text-muted-foreground/50"}`}>
                        {zone.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{unlockedRooms}/{status.rooms.length} salles</span>
                    </div>
                    <div className="h-1.5 bg-secondary/40 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500/50 transition-all duration-700"
                        style={{ width: `${status.progress * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
          <div key={i} className="room-3d rounded-2xl p-2.5 text-center" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
            <div className={`text-lg font-black ${s.cls}`}>{s.v}</div>
            <div className="text-[8px] font-medium text-muted-foreground mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      {quizData.length > 0 && (
        <div className="room-3d rounded-2xl p-5" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
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
        <div className="room-3d rounded-2xl p-10 text-center" style={{ boxShadow: "var(--shadow-3d-md)" }}>
          <div className="text-5xl mb-4">🔨</div>
          <p className="text-sm text-muted-foreground">Commence a creer pour voir tes stats de production !</p>
        </div>
      )}
    </div>
  );
}
