import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { META_PUZZLE, META_PUZZLE_FRAGMENTS, type MetaPuzzleFragment } from "@/data/puzzleEngine";

interface MetaPuzzleProps {
  sigilsCollected: string[];
  onActivateProtocol: () => void;
}

export default function MetaPuzzle({ sigilsCollected, onActivateProtocol }: MetaPuzzleProps) {
  const [arrangement, setArrangement] = useState<string[]>([]);
  const [activated, setActivated] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Map sigils to fragments
  const fragments = META_PUZZLE_FRAGMENTS.map(f => ({
    ...f,
    obtained: sigilsCollected.some(s =>
      s.toLowerCase().includes(f.source) || f.name.toLowerCase().includes(s.toLowerCase().split(" ").pop() || "")
    ),
  }));

  const obtainedFragments = fragments.filter(f => f.obtained);
  const allObtained = obtainedFragments.length >= 6; // Need at least 6 of 7

  const handleAddToArrangement = (fragment: MetaPuzzleFragment) => {
    if (arrangement.includes(fragment.id)) return;
    setArrangement([...arrangement, fragment.id]);
    setFeedback(null);
  };

  const handleRemoveFromArrangement = (id: string) => {
    setArrangement(arrangement.filter(x => x !== id));
    setFeedback(null);
  };

  const handleValidate = () => {
    // Check if the order matches the expected solution
    const expectedOrder = ["meta-forge", "meta-grammar", "meta-studio", "meta-clinical", "meta-lab", "meta-archive", "meta-aerzterat"];
    const isCorrect = arrangement.length >= 6 &&
      arrangement.every((id, i) => id === expectedOrder[i]);

    if (isCorrect) {
      setActivated(true);
      setFeedback(null);
      onActivateProtocol();
    } else {
      setFeedback("L'ordre n'est pas correct. Pense a la progression logique de la formation medicale : des bases linguistiques jusqu'au Conseil.");
    }
  };

  const handleReset = () => {
    setArrangement([]);
    setFeedback(null);
  };

  // Not enough sigils — show progress
  if (!allObtained) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl room-3d relative overflow-hidden" style={{
          background: "linear-gradient(145deg, hsl(270 60% 60% / 0.1), hsl(var(--card)), hsl(235 60% 50% / 0.05))",
          border: "1px solid hsl(270 60% 60% / 0.2)",
          boxShadow: "var(--shadow-3d-lg), 0 0 40px -12px hsl(270 60% 60% / 0.15)",
        }}>
          <h2 className="text-lg font-bold text-purple-400 flex items-center gap-2">
            🔮 {META_PUZZLE.title}
          </h2>
          <p className="text-white/50 text-sm mt-2">{META_PUZZLE.narrative}</p>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {fragments.map(f => (
              <div
                key={f.id}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 border transition-all ${
                  f.obtained
                    ? "bg-amber-500/15 border-amber-500/30"
                    : "bg-white/5 border-white/10 opacity-40"
                }`}
              >
                <span className="text-xl">{f.obtained ? f.icon : "❓"}</span>
                <span className="text-[10px] text-white/50 mt-0.5 text-center leading-tight">
                  {f.obtained ? f.name.split(" ").pop() : "???"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 text-center">
            <span className="text-white/40 text-sm">
              {obtainedFragments.length}/7 Sigils collectes
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Activated — show victory
  if (activated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <div className="p-6 rounded-2xl room-3d room-solved relative overflow-hidden" style={{
          background: "linear-gradient(145deg, hsl(38 92% 50% / 0.15), hsl(var(--card)), hsl(270 60% 60% / 0.08))",
          border: "1px solid hsl(38 92% 50% / 0.3)",
          boxShadow: "var(--shadow-3d-xl), 0 0 60px -12px hsl(38 92% 50% / 0.2)",
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-center"
          >
            <span className="text-5xl">🏆</span>
          </motion.div>

          <h2 className="text-xl font-bold text-amber-400 text-center mt-3">
            {META_PUZZLE.reward.title}
          </h2>
          <p className="text-white/70 text-sm text-center mt-2">
            {META_PUZZLE.reward.narrative}
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center"
          >
            <span className="text-amber-400 font-bold text-lg">
              Rang final : {META_PUZZLE.reward.finalRank}
            </span>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Full puzzle — arrange sigils
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/20">
        <h2 className="text-lg font-bold text-purple-400 flex items-center gap-2">
          🔮 {META_PUZZLE.title}
        </h2>
        <p className="text-white/50 text-sm mt-2">{META_PUZZLE.prompt}</p>

        {/* Arrangement slots */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {arrangement.map((id, i) => {
            const fragment = fragments.find(f => f.id === id);
            return (
              <motion.button
                key={`slot-${i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => handleRemoveFromArrangement(id)}
                className="px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center gap-1 hover:bg-amber-500/25"
              >
                <span>{fragment?.icon}</span>
                <span className="text-xs text-amber-400">{fragment?.name.split(" ").pop()}</span>
                <span className="text-white/30 text-xs ml-1">×</span>
              </motion.button>
            );
          })}
          {arrangement.length < obtainedFragments.length && (
            <div className="px-3 py-2 rounded-lg border border-dashed border-white/20 flex items-center">
              <span className="text-white/30 text-xs">Position {arrangement.length + 1}</span>
            </div>
          )}
        </div>

        {/* Available fragments */}
        <div className="mt-4">
          <div className="text-white/40 text-xs mb-2">Sigils disponibles :</div>
          <div className="flex gap-2 flex-wrap">
            {obtainedFragments
              .filter(f => !arrangement.includes(f.id))
              .map(f => (
                <motion.button
                  key={f.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddToArrangement(f)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1 hover:bg-white/10"
                >
                  <span>{f.icon}</span>
                  <span className="text-xs text-white/70">{f.name.split(" ").pop()}</span>
                </motion.button>
              ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleValidate}
            disabled={arrangement.length < 6}
            className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all disabled:opacity-30"
          >
            Activer le Protocole
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-sm"
          >
            Reset
          </button>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20"
            >
              <p className="text-rose-400 text-sm">{feedback}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
