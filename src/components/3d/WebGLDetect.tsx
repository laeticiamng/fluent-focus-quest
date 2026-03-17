import { useState, useEffect, ReactNode } from "react";
import { Scene3DErrorBoundary } from "./Scene3DErrorBoundary";
import { getQualityTier, getCapabilities, type QualityTier } from "@/hooks/useQualityTier";

let cachedSupport: boolean | null = null;
let cachedReason: string = "";

function detectWebGL(): { supported: boolean; reason: string } {
  if (cachedSupport !== null) return { supported: cachedSupport, reason: cachedReason };
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) {
      cachedSupport = false;
      cachedReason = "no-webgl";
      return { supported: false, reason: cachedReason };
    }
    cachedSupport = true;
    cachedReason = "";
  } catch (e) {
    cachedSupport = false;
    cachedReason = `runtime-error: ${e instanceof Error ? e.message : "unknown"}`;
  }
  return { supported: cachedSupport ?? false, reason: cachedReason };
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

// ── Diagnostic state ──
type DiagnosticMode = "WEBGL" | "FALLBACK" | "DETECTING";
interface WebGLDiagnostic {
  mode: DiagnosticMode;
  sceneName: string;
  reason: string;
  reducedMotion: boolean;
  canvasActive: boolean;
  lastError: string;
  qualityTier: QualityTier | null;
}

const diagnostics = new Map<string, WebGLDiagnostic>();

function updateDiagnostic(sceneName: string, update: Partial<WebGLDiagnostic>) {
  const prev = diagnostics.get(sceneName) || {
    mode: "DETECTING" as DiagnosticMode,
    sceneName,
    reason: "",
    reducedMotion: false,
    canvasActive: false,
    lastError: "",
    qualityTier: null,
  };
  diagnostics.set(sceneName, { ...prev, ...update });
}

export function getWebGLDiagnostics(): WebGLDiagnostic[] {
  return Array.from(diagnostics.values());
}

// ── Debug check ──
function isDebugEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return new URLSearchParams(window.location.search).get("debug") === "1";
  } catch {
    return false;
  }
}

// ── Enhanced Diagnostic Badge ──
export function WebGLDiagnosticBadge() {
  const [visible, setVisible] = useState(false);
  const [diags, setDiags] = useState<WebGLDiagnostic[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!isDebugEnabled()) return;
    setVisible(true);
    // Inject quality tier into diagnostics
    const tier = getQualityTier();
    diagnostics.forEach((d, key) => {
      diagnostics.set(key, { ...d, qualityTier: tier });
    });
    const interval = setInterval(() => {
      setDiags(getWebGLDiagnostics());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!visible || diags.length === 0) return null;

  const primary = diags[0];
  const isWebGL = primary.mode === "WEBGL";
  const tier = primary.qualityTier || getQualityTier();
  const caps = getCapabilities(tier);

  const tierColors: Record<QualityTier, string> = {
    high: "#6ee7b7",
    medium: "#fcd34d",
    mobile: "#fb923c",
  };

  return (
    <div
      className="fixed bottom-2 left-2 z-[9999] rounded-lg px-2.5 py-1.5 font-mono text-[9px] leading-tight backdrop-blur-sm select-none pointer-events-auto cursor-pointer"
      style={{
        background: isWebGL
          ? "rgba(16, 185, 129, 0.12)"
          : "rgba(245, 158, 11, 0.12)",
        border: `1px solid ${isWebGL ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.25)"}`,
        color: isWebGL ? "#6ee7b7" : "#fcd34d",
        maxWidth: expanded ? "280px" : "220px",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Compact header */}
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: isWebGL ? "#10b981" : "#f59e0b" }}
        />
        <span className="font-bold">{primary.mode}</span>
        <span className="opacity-50">·</span>
        <span className="opacity-70">{primary.sceneName}</span>
        <span className="opacity-50">·</span>
        <span style={{ color: tierColors[tier] }}>{tier.toUpperCase()}</span>
        <span className="opacity-30 ml-auto">{expanded ? "−" : "+"}</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-1.5 pt-1.5 border-t border-white/10 space-y-1">
          {/* Per-scene diagnostics */}
          {diags.map((d) => (
            <div key={d.sceneName} className="opacity-80">
              <span className="font-bold">{d.sceneName}</span>
              <span className="opacity-50"> · {d.mode}</span>
              {d.reason && <span className="opacity-40"> · {d.reason}</span>}
              {d.reducedMotion && <span className="opacity-40"> · reduced-motion</span>}
              {d.lastError && (
                <div className="text-red-400/70 truncate">{d.lastError.slice(0, 50)}</div>
              )}
            </div>
          ))}

          {/* Quality tier details */}
          <div className="opacity-60 mt-1">
            <div>DPR: {caps.dpr[0]}–{caps.dpr[1]}</div>
            <div className="flex flex-wrap gap-x-2">
              <span style={{ color: caps.enableSSAO ? "#6ee7b7" : "#ef4444" }}>SSAO</span>
              <span style={{ color: caps.enableDOF ? "#6ee7b7" : "#ef4444" }}>DOF</span>
              <span style={{ color: caps.enableBloom ? "#6ee7b7" : "#ef4444" }}>Bloom</span>
              <span style={{ color: caps.enableReflections ? "#6ee7b7" : "#ef4444" }}>Reflect</span>
              <span style={{ color: caps.enableContactShadows ? "#6ee7b7" : "#ef4444" }}>CShadow</span>
              <span style={{ color: caps.enableFireflies ? "#6ee7b7" : "#ef4444" }}>Flies</span>
              <span style={{ color: caps.enableEnergyTrails ? "#6ee7b7" : "#ef4444" }}>Trails</span>
              <span style={{ color: caps.enableFogLayers ? "#6ee7b7" : "#ef4444" }}>Fog</span>
            </div>
            <div>Particles: ×{caps.particleMultiplier}</div>
          </div>

          {/* Safe mode hint */}
          <div className="opacity-40 mt-1 text-[8px]">
            ?quality=mobile for safe mode
          </div>
        </div>
      )}
    </div>
  );
}

// ── WebGLGate ──
interface WebGLGateProps {
  children: ReactNode;
  fallback: ReactNode;
  sceneName?: string;
}

export function WebGLGate({ children, fallback, sceneName }: WebGLGateProps) {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const label = sceneName || "unknown";
    const { supported: webglOk, reason } = detectWebGL();
    const reducedMotion = prefersReducedMotion();
    const tier = getQualityTier();

    if (!webglOk) {
      const fallbackReason = reason || "no-webgl";
      console.info(`[WebGLGate:${label}] Fallback 2D — ${fallbackReason}`);
      updateDiagnostic(label, { mode: "FALLBACK", sceneName: label, reason: fallbackReason, reducedMotion, canvasActive: false, qualityTier: tier });
      setSupported(false);
    } else if (reducedMotion) {
      console.info(`[WebGLGate:${label}] Fallback 2D — reduced-motion`);
      updateDiagnostic(label, { mode: "FALLBACK", sceneName: label, reason: "reduced-motion", reducedMotion: true, canvasActive: false, qualityTier: tier });
      setSupported(false);
    } else {
      updateDiagnostic(label, { mode: "WEBGL", sceneName: label, reason: "", reducedMotion: false, canvasActive: true, qualityTier: tier });
      setSupported(true);
    }
  }, [sceneName]);

  if (supported === null) {
    return (
      <div className="rounded-2xl h-16 flex items-center justify-center" style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border) / 0.2)",
      }}>
        <p className="text-[10px] text-muted-foreground/50 animate-pulse">Initialisation...</p>
      </div>
    );
  }

  if (!supported) return <>{fallback}</>;

  return (
    <Scene3DErrorBoundary
      fallback={fallback}
      sceneName={sceneName}
      onError={(error) => {
        const label = sceneName || "unknown";
        updateDiagnostic(label, { mode: "FALLBACK", reason: "runtime-error", lastError: error, canvasActive: false });
      }}
    >
      {children}
    </Scene3DErrorBoundary>
  );
}

export function useWebGLSupported(): boolean {
  const [supported, setSupported] = useState(true);
  useEffect(() => { setSupported(detectWebGL().supported); }, []);
  return supported;
}
