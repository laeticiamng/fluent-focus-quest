import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type Puzzle,
  type PuzzleHint,
  checkPuzzleAnswer,
  checkStepAnswer,
  getPuzzlesForRoom,
  getAllPuzzles,
  INTERVIEW_PUZZLES,
  CLINICAL_PUZZLES,
} from "@/data/puzzleEngine";
import { ESCAPE_ZONES, ZONE_COLORS } from "@/data/escapeGame";

interface PuzzleEngineProps {
  onPuzzleSolved: (puzzleId: string, xpEarned: number) => void;
  solvedPuzzleIds: string[];
  currentRoomId?: string;
}

type PuzzleView = "zones" | "room_puzzles" | "solving";

const PUZZLE_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  deduction: { label: "Deduction", icon: "🔍" },
  association: { label: "Association", icon: "🔗" },
  ordering: { label: "Ordre", icon: "📋" },
  completion: { label: "Completion", icon: "✍️" },
  error_finding: { label: "Erreur", icon: "❌" },
  classification: { label: "Classification", icon: "📊" },
  decoding: { label: "Decodage", icon: "🔓" },
  visual_clue: { label: "Indice visuel", icon: "👁️" },
  multi_step: { label: "Multi-etapes", icon: "⚡" },
};

const DIFFICULTY_LABELS = ["", "Facile", "Moyen", "Difficile"];
const DIFFICULTY_COLORS = ["", "text-emerald-400", "text-amber-400", "text-rose-400"];

export default function PuzzleEngine({ onPuzzleSolved, solvedPuzzleIds, currentRoomId }: PuzzleEngineProps) {
  const [view, setView] = useState<PuzzleView>(currentRoomId ? "room_puzzles" : "zones");
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(currentRoomId || null);
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [answer, setAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [showHint, setShowHint] = useState<PuzzleHint | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepAnswers, setStepAnswers] = useState<string[]>([]);

  const allPuzzles = getAllPuzzles();

  // Zones that have puzzles
  const zonesWithPuzzles = ESCAPE_ZONES.filter(zone =>
    zone.rooms.some(room => getPuzzlesForRoom(room.id).length > 0)
  );

  const handleSelectZone = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    setView("room_puzzles");
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleStartPuzzle = (puzzle: Puzzle) => {
    setActivePuzzle(puzzle);
    setAnswer("");
    setHintsUsed(0);
    setShowHint(null);
    setFeedback(null);
    setCurrentStep(0);
    setStepAnswers([]);
    setView("solving");
  };

  const handleUseHint = useCallback(() => {
    if (!activePuzzle || hintsUsed >= 3) return;
    const hint = activePuzzle.hints[hintsUsed];
    if (hint) {
      setShowHint(hint);
      setHintsUsed(h => h + 1);
    }
  }, [activePuzzle, hintsUsed]);

  const handleSubmit = useCallback(() => {
    if (!activePuzzle || !answer.trim()) return;

    // Multi-step puzzle
    if (activePuzzle.type === "multi_step" && activePuzzle.steps) {
      const step = activePuzzle.steps[currentStep];
      if (checkStepAnswer(step, answer)) {
        const newAnswers = [...stepAnswers, answer];
        setStepAnswers(newAnswers);
        if (currentStep < activePuzzle.steps.length - 1) {
          setCurrentStep(s => s + 1);
          setAnswer("");
          setFeedback({ correct: true, message: `Etape ${currentStep + 1} correcte !` });
          setTimeout(() => setFeedback(null), 1500);
          return;
        }
        // All steps complete
        const hintPenalty = activePuzzle.hints
          .slice(0, hintsUsed)
          .reduce((sum, h) => sum + h.xpPenalty, 0);
        const xp = Math.max(5, activePuzzle.reward.xp - hintPenalty);
        setFeedback({ correct: true, message: activePuzzle.reward.narrativeReveal });
        onPuzzleSolved(activePuzzle.id, xp);
        return;
      }
      setFeedback({ correct: false, message: "Ce n'est pas la bonne reponse. Essaie encore ou utilise un indice." });
      return;
    }

    // Single puzzle
    if (checkPuzzleAnswer(activePuzzle, answer)) {
      const hintPenalty = activePuzzle.hints
        .slice(0, hintsUsed)
        .reduce((sum, h) => sum + h.xpPenalty, 0);
      const xp = Math.max(5, activePuzzle.reward.xp - hintPenalty);
      setFeedback({ correct: true, message: activePuzzle.reward.narrativeReveal });
      onPuzzleSolved(activePuzzle.id, xp);
    } else {
      setFeedback({ correct: false, message: "Ce n'est pas la bonne reponse. Essaie encore ou utilise un indice." });
    }
  }, [activePuzzle, answer, hintsUsed, currentStep, stepAnswers, onPuzzleSolved]);

  const handleBack = () => {
    if (view === "solving") {
      setActivePuzzle(null);
      setView("room_puzzles");
    } else if (view === "room_puzzles") {
      setSelectedRoomId(null);
      setSelectedZoneId(null);
      setView("zones");
    }
  };

  // ===== ZONE OVERVIEW =====
  if (view === "zones") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white/90">Enigmes du Complexe</h2>
        <p className="text-white/50 text-sm">Resous les enigmes pour debloquer les salles et progresser dans le Complexe Medical.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {zonesWithPuzzles.map(zone => {
            const colors = ZONE_COLORS[zone.color] || ZONE_COLORS.cyan;
            const zonePuzzles = zone.rooms.flatMap(r => getPuzzlesForRoom(r.id));
            const solvedCount = zonePuzzles.filter(p => solvedPuzzleIds.includes(p.id)).length;

            return (
              <motion.button
                key={zone.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectZone(zone.id)}
                className={`p-4 rounded-xl bg-gradient-to-br ${colors.bg} ${colors.border} border text-left transition-all hover:shadow-lg ${colors.glow}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{zone.icon}</span>
                  <div>
                    <div className={`font-bold ${colors.text}`}>{zone.name}</div>
                    <div className="text-white/40 text-xs">{zone.subtitle}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.accent} rounded-full transition-all`}
                      style={{ width: `${zonePuzzles.length > 0 ? (solvedCount / zonePuzzles.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-white/50 text-xs">{solvedCount}/{zonePuzzles.length}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">Enigmes resolues</span>
            <span className="text-white/80 font-bold">
              {allPuzzles.filter(p => solvedPuzzleIds.includes(p.id)).length} / {allPuzzles.length}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ===== ROOM PUZZLES =====
  if (view === "room_puzzles") {
    const zone = ESCAPE_ZONES.find(z => z.id === selectedZoneId);
    const roomsWithPuzzles = zone
      ? zone.rooms.filter(r => getPuzzlesForRoom(r.id).length > 0)
      : ESCAPE_ZONES.flatMap(z => z.rooms).filter(r => r.id === selectedRoomId);

    return (
      <div className="space-y-4">
        <button onClick={handleBack} className="text-white/50 hover:text-white/80 text-sm flex items-center gap-1">
          ← Retour aux zones
        </button>

        {zone && (
          <h2 className="text-lg font-bold text-white/90">{zone.icon} {zone.name}</h2>
        )}

        {roomsWithPuzzles.map(room => {
          const puzzles = getPuzzlesForRoom(room.id);
          const colors = ZONE_COLORS[zone?.color || "cyan"] || ZONE_COLORS.cyan;

          return (
            <div key={room.id} className="space-y-2">
              <h3 className={`font-semibold ${colors.text} flex items-center gap-2`}>
                <span>{room.icon}</span> {room.name}
              </h3>

              {puzzles.map(puzzle => {
                const isSolved = solvedPuzzleIds.includes(puzzle.id);
                const typeInfo = PUZZLE_TYPE_LABELS[puzzle.type] || { label: puzzle.type, icon: "?" };

                return (
                  <motion.button
                    key={puzzle.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => !isSolved && handleStartPuzzle(puzzle)}
                    disabled={isSolved}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      isSolved
                        ? "bg-emerald-500/10 border-emerald-500/20 opacity-70"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{isSolved ? "✅" : typeInfo.icon}</span>
                        <div>
                          <div className="text-white/90 font-medium text-sm">{puzzle.title}</div>
                          <div className="text-white/40 text-xs flex items-center gap-2">
                            <span>{typeInfo.label}</span>
                            <span className={DIFFICULTY_COLORS[puzzle.difficulty]}>
                              {DIFFICULTY_LABELS[puzzle.difficulty]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-400 text-xs font-bold">+{puzzle.reward.xp} XP</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // ===== SOLVING VIEW =====
  if (view === "solving" && activePuzzle) {
    const typeInfo = PUZZLE_TYPE_LABELS[activePuzzle.type] || { label: activePuzzle.type, icon: "?" };
    const isSolved = feedback?.correct && solvedPuzzleIds.includes(activePuzzle.id);
    const isMultiStep = activePuzzle.type === "multi_step" && activePuzzle.steps;
    const currentStepData = isMultiStep ? activePuzzle.steps![currentStep] : null;

    return (
      <div className="space-y-4">
        <button onClick={handleBack} className="text-white/50 hover:text-white/80 text-sm flex items-center gap-1">
          ← Retour
        </button>

        {/* Puzzle header */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{typeInfo.icon}</span>
            <h2 className="text-lg font-bold text-white/90">{activePuzzle.title}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activePuzzle.difficulty === 1 ? "bg-emerald-500/20 text-emerald-400" :
              activePuzzle.difficulty === 2 ? "bg-amber-500/20 text-amber-400" :
              "bg-rose-500/20 text-rose-400"
            }`}>
              {DIFFICULTY_LABELS[activePuzzle.difficulty]}
            </span>
          </div>

          {/* Narrative */}
          <p className="text-white/50 text-sm italic mb-3">{activePuzzle.narrative}</p>

          {/* Prompt */}
          <div className="p-3 rounded-lg bg-black/30 border border-white/5">
            <p className="text-white/80 text-sm">
              {isMultiStep && currentStepData
                ? `Etape ${currentStep + 1}/${activePuzzle.steps!.length} : ${currentStepData.prompt}`
                : activePuzzle.prompt
              }
            </p>
          </div>

          {/* Multi-step progress */}
          {isMultiStep && (
            <div className="flex gap-1 mt-2">
              {activePuzzle.steps!.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < currentStep ? "bg-emerald-500" :
                    i === currentStep ? "bg-amber-500" :
                    "bg-white/10"
                  }`}
                />
              ))}
            </div>
          )}

          {/* German vocab tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {activePuzzle.germanVocab.map(word => (
              <span key={word} className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Hint section */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUseHint}
            disabled={hintsUsed >= 3 || !!isSolved}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              hintsUsed >= 3 || isSolved
                ? "bg-white/5 text-white/20 cursor-not-allowed"
                : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20"
            }`}
          >
            💡 Indice {hintsUsed}/3
          </button>
          {hintsUsed > 0 && (
            <span className="text-white/30 text-xs">
              (-{activePuzzle.hints.slice(0, hintsUsed).reduce((s, h) => s + h.xpPenalty, 0)} XP)
            </span>
          )}
        </div>

        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
            >
              <div className="text-amber-400 text-xs font-bold mb-1">Indice niveau {showHint.level}</div>
              <p className="text-white/70 text-sm">{showHint.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer input */}
        {!isSolved && (
          <div className="space-y-2">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Ta reponse..."
              className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white/90 placeholder-white/30 text-sm resize-none focus:outline-none focus:border-indigo-500/40"
              rows={3}
            />
            <button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Valider
            </button>
          </div>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg border ${
                feedback.correct
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-rose-500/10 border-rose-500/20"
              }`}
            >
              <div className={`font-bold text-sm mb-1 ${feedback.correct ? "text-emerald-400" : "text-rose-400"}`}>
                {feedback.correct ? "Correct !" : "Incorrect"}
              </div>
              <p className="text-white/70 text-sm">{feedback.message}</p>
              {feedback.correct && (
                <div className="mt-2 text-amber-400 text-sm font-bold">
                  +{Math.max(5, activePuzzle.reward.xp - activePuzzle.hints.slice(0, hintsUsed).reduce((s, h) => s + h.xpPenalty, 0))} XP
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
