import { useAIStatus } from "@/hooks/useAIStatus";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, AlertTriangle, RefreshCw, Zap } from "lucide-react";

const STATUS_CONFIG = {
  credits_exhausted: {
    icon: AlertTriangle,
    bg: "from-amber-500/15 to-orange-500/10",
    border: "border-amber-500/30",
    text: "text-amber-300",
    label: "Credits IA epuises",
    detail: "Le coach IA fonctionne en mode local. Tes creations, XP et progression sont toujours comptabilises.",
  },
  rate_limited: {
    icon: Zap,
    bg: "from-yellow-500/10 to-amber-500/8",
    border: "border-yellow-500/25",
    text: "text-yellow-300",
    label: "Coach IA sature",
    detail: "Trop de requetes en cours. Le feedback local est active automatiquement.",
  },
  offline: {
    icon: WifiOff,
    bg: "from-red-500/10 to-orange-500/8",
    border: "border-red-500/25",
    text: "text-red-300",
    label: "Coach IA hors-ligne",
    detail: "Connexion impossible. Le mode pedagogique local est active.",
  },
  fallback: {
    icon: AlertTriangle,
    bg: "from-blue-500/10 to-cyan-500/8",
    border: "border-blue-500/25",
    text: "text-blue-300",
    label: "Mode local active",
    detail: "Le feedback IA est temporairement remplace par le systeme local.",
  },
} as const;

export function AIStatusBanner() {
  const { status, isFallback, checkHealth, message } = useAIStatus();

  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.fallback;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isFallback && (
        <motion.div
          key="ai-banner"
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className={`sticky top-0 z-[60] bg-gradient-to-r ${config.bg} border-b ${config.border} backdrop-blur-md`}
        >
          <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-3">
            <Icon className={`w-4 h-4 ${config.text} shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold ${config.text}`}>{config.label}</p>
              <p className="text-[10px] text-muted-foreground truncate">{message || config.detail}</p>
            </div>
            <button
              onClick={() => checkHealth()}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium ${config.text} border ${config.border} hover:bg-white/5 transition-colors`}
            >
              <RefreshCw className="w-3 h-3" />
              Retester
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
