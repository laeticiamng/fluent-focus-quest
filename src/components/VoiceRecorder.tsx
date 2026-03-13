import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Play, Pause, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Recording {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  date: string;
  label: string;
}

interface VoiceRecorderProps {
  label?: string;
  context?: string;
}

export function VoiceRecorder({ label = "Enregistrement", context }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      recordings.forEach(r => URL.revokeObjectURL(r.url));
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const rec: Recording = {
          id: Date.now().toString(),
          blob, url,
          duration: elapsed,
          date: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          label: context || label,
        };
        setRecordings(prev => [rec, ...prev].slice(0, 10));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    } catch {
      // Microphone non disponible
    }
  }, [label, context, elapsed]);

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  }, []);

  const playRecording = useCallback((rec: Recording) => {
    if (playing === rec.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(rec.url);
    audio.onended = () => setPlaying(null);
    audio.play();
    audioRef.current = audio;
    setPlaying(rec.id);
  }, [playing]);

  const deleteRecording = useCallback((id: string) => {
    setRecordings(prev => {
      const rec = prev.find(r => r.id === id);
      if (rec) URL.revokeObjectURL(rec.url);
      return prev.filter(r => r.id !== id);
    });
    if (playing === id) {
      audioRef.current?.pause();
      setPlaying(null);
    }
  }, [playing]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-3">
      {/* Record button */}
      <div className="flex items-center gap-3">
        {!recording ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            className="flex items-center gap-2 bg-primary/15 border border-primary/20 text-primary rounded-xl px-4 py-2.5 text-xs font-semibold transition-all hover:bg-primary/20"
          >
            <Mic className="w-4 h-4" />
            Enregistrer
          </motion.button>
        ) : (
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 bg-primary rounded-full"
            />
            <span className="font-mono text-sm font-bold text-primary">{fmt(elapsed)}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={stopRecording}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-xs font-semibold"
            >
              <Square className="w-3 h-3 fill-current" />
              Stop
            </motion.button>
          </div>
        )}
      </div>

      {/* Recordings list */}
      <AnimatePresence>
        {recordings.map(rec => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2.5 rounded-xl bg-secondary/50 border border-border/30 p-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => playRecording(rec)}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  playing === rec.id ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"
                }`}
              >
                {playing === rec.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </motion.button>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold truncate">{rec.label}</p>
                <p className="text-[10px] text-muted-foreground">{fmt(rec.duration)} — {rec.date}</p>
              </div>
              <button
                onClick={() => deleteRecording(rec.id)}
                className="text-muted-foreground hover:text-primary transition-colors p-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
