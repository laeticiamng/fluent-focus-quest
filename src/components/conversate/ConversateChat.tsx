import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { buildContextBundle, buildCompactContext, type ContextBundle, type UploadedFile } from "@/services/contextBundle";
import { ContextPanel } from "./ContextPanel";
import { PdfUploader } from "./PdfUploader";
import { Send, Sparkles, FileText, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function ConversateChat() {
  const { user } = useAuth();
  const progress = useProgress();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextBundle, setContextBundle] = useState<ContextBundle | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [contextInjected, setContextInjected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleBuildContext = useCallback(() => {
    const bundle = buildContextBundle(
      {
        xp: progress.xp,
        streak: progress.streak,
        artifacts: progress.artifacts,
        earnedBadges: progress.earnedBadges,
        notes: progress.notes,
        pomodoroCount: progress.pomodoroCount,
        questState: progress.questState,
        escapeState: progress.escapeState || {
          solvedRooms: [], inventory: [], sigilsCollected: [],
          solvedPuzzles: [], protocolActivated: false,
        },
        done: progress.done,
        quizScores: progress.quizScores,
      },
      user?.email,
      [],
      uploadedFiles,
    );
    setContextBundle(bundle);
    setContextInjected(true);
    setShowContext(true);
  }, [progress, user, uploadedFiles]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const compactCtx = contextBundle ? buildCompactContext(contextBundle) : undefined;

      const { data, error } = await supabase.functions.invoke("conversate-chat", {
        body: {
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          contextBundle: compactCtx,
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message || "Erreur de reponse.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Desole, une erreur est survenue. Reessaie.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-black tracking-tight">Conversate</h2>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">IA</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={handleBuildContext}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            {contextInjected ? "Actualiser" : "Recuperer le contexte"}
          </button>
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-muted hover:bg-muted/80 transition-colors"
          >
            <FileText className="w-3 h-3" />
            PDF ({uploadedFiles.length}/5)
          </button>
        </div>
      </div>

      {/* Context injection indicator */}
      {contextInjected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl p-2.5 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--accent) / 0.05))",
            border: "1px solid hsl(var(--primary) / 0.15)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-muted-foreground">
              Contexte injecte: {contextBundle?.platformElements.length} elements | {contextBundle?.aiHints.length} indices
            </span>
          </div>
          <button
            onClick={() => setShowContext(!showContext)}
            className="text-[10px] text-primary font-bold flex items-center gap-0.5"
          >
            {showContext ? "Masquer" : "Voir"}
            {showContext ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </motion.div>
      )}

      {/* Context panel */}
      <AnimatePresence>
        {showContext && contextBundle && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ContextPanel bundle={contextBundle} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF uploader */}
      <AnimatePresence>
        {showUploader && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <PdfUploader
              files={uploadedFiles}
              onFilesChange={setUploadedFiles}
              maxFiles={5}
              maxSizeMb={4.5}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border) / 0.4)",
          minHeight: messages.length === 0 ? "200px" : undefined,
          maxHeight: "50vh",
          overflowY: "auto",
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Sparkles className="w-8 h-8 text-primary/30 mb-3" />
            <p className="text-sm font-bold text-foreground/70">Bienvenue dans Conversate</p>
            <p className="text-[10px] text-muted-foreground mt-1 max-w-xs">
              Clique sur "Recuperer le contexte" pour enrichir l'IA avec tes donnees de preparation, puis pose tes questions.
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:text-[11px] [&_li]:text-[11px] [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_code]:text-[10px]">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted/50 rounded-xl px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="flex items-end gap-2 rounded-xl p-2"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border) / 0.4)",
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pose ta question..."
          rows={1}
          className="flex-1 bg-transparent text-[11px] resize-none outline-none min-h-[32px] max-h-[100px] py-1.5 px-2 text-foreground placeholder:text-muted-foreground"
          style={{ lineHeight: "1.5" }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="shrink-0 p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
