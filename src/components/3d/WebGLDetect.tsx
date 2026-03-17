import { useState, useEffect, ReactNode } from "react";
import { Scene3DErrorBoundary } from "./Scene3DErrorBoundary";
import { getQualityTier, getCapabilities, type QualityTier } from "@/hooks/useQualityTier";

// ── Fallback reason normalization ──
export type FallbackReason =
  | "webgl_unavailable"
  | "context_lost"
  | "shader_compile_failure"
  | "low_gpu_tier"
  | "low_memory"
  | "postprocessing_disabled"
  | "reduced_motion"
  | "runtime_error"
  | "unknown_fallback"
  | "";

const REASON_MAP: Record<string, FallbackReason> = {
  "no-webgl": "webgl_unavailable",
  "no_webgl": "webgl_unavailable",
  "webgl-unavailable": "webgl_unavailable",
  "context-lost": "context_lost",
  "context_lost": "context_lost",
  "shader-compile": "shader_compile_failure",
  "shader_compile_failure": "shader_compile_failure",
  "low-gpu": "low_gpu_tier",
  "low_gpu_tier": "low_gpu_tier",
  "low-memory": "low_memory",
  "low_memory": "low_memory",
  "postprocessing-disabled": "postprocessing_disabled",
  "postprocessing_disabled": "postprocessing_disabled",
  "reduced-motion": "reduced_motion",
  "reduced_motion": "reduced_motion",
  "runtime-error": "runtime_error",
  "runtime_error": "runtime_error",
};

export function normalizeFallbackReason(raw: string): FallbackReason {
  if (!raw) return "";
  const lower = raw.toLowerCase().trim();
  if (REASON_MAP[lower]) return REASON_MAP[lower];
  if (lower.includes("webgl")) return "webgl_unavailable";
  if (lower.includes("context")) return "context_lost";
  if (lower.includes("shader")) return "shader_compile_failure";
  if (lower.includes("gpu")) return "low_gpu_tier";
  if (lower.includes("memory")) return "low_memory";
  if (lower.includes("motion")) return "reduced_motion";
  if (lower.includes("runtime") || lower.includes("error")) return "runtime_error";
  return "unknown_fallback";
}

const REASON_LABELS: Record<FallbackReason, string> = {
  webgl_unavailable: "WebGL non disponible",
  context_lost: "Contexte WebGL perdu",
  shader_compile_failure: "Echec de compilation des shaders",
  low_gpu_tier: "GPU insuffisant pour la 3D",
  low_memory: "Memoire insuffisante",
  postprocessing_disabled: "Post-traitement desactive",
  reduced_motion: "Mouvement reduit prefere",
  runtime_error: "Erreur d'execution survenue",
  unknown_fallback: "Mode de secours inconnu",
  "": "",
};

export function getFallbackLabel(reason: FallbackReason): string {
  return REASON_LABELS[reason] || reason;
}

// ── WebGL detection ──
let cachedSupport: boolean | null = null;
let cachedReason: string = "";
let cachedWebGLVersion: number = 0;
let cachedRenderer: string = "";

function detectWebGL(): { supported: boolean; reason: string; webglVersion: number; renderer: string } {
  if (cachedSupport !== null) {
    return { supported: cachedSupport, reason: cachedReason, webglVersion: cachedWebGLVersion, renderer: cachedRenderer };
  }
  try {
    const canvas = document.createElement("canvas");
    const gl2 = canvas.getContext("webgl2");
    if (gl2) {
      cachedSupport = true;
      cachedWebGLVersion = 2;
      const debugInfo = gl2.getExtension("WEBGL_debug_renderer_info");
      cachedRenderer = debugInfo ? gl2.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "unknown";
      cachedReason = "";
    } else {
      const gl1 = canvas.getContext("webgl");
      if (gl1) {
        cachedSupport = true;
        cachedWebGLVersion = 1;
        const debugInfo = gl1.getExtension("WEBGL_debug_renderer_info");
        cachedRenderer = debugInfo ? gl1.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "unknown";
        cachedReason = "";
      } else {
        cachedSupport = false;
        cachedReason = "no-webgl";
        cachedWebGLVersion = 0;
        cachedRenderer = "none";
      }
    }
  } catch (e) {
    cachedSupport = false;
    cachedReason = `runtime-error: ${e instanceof Error ? e.message : "unknown"}`;
    cachedWebGLVersion = 0;
    cachedRenderer = "error";
  }
  return {
    supported: cachedSupport ?? false,
    reason: cachedReason,
    webglVersion: cachedWebGLVersion,
    renderer: cachedRenderer,
  };
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

export interface WebGLDiagnostic {
  mode: DiagnosticMode;
  sceneName: string;
  reason: string;
  normalizedReason: FallbackReason;
  reducedMotion: boolean;
  canvasActive: boolean;
  lastError: string;
  qualityTier: QualityTier | null;
  webglVersion: number;
  renderer: string;
}

const diagnostics = new Map<string, WebGLDiagnostic>();

export function updateDiagnostic(sceneName: string, update: Partial<WebGLDiagnostic>) {
  const prev = diagnostics.get(sceneName) || {
    mode: "DETECTING" as DiagnosticMode,
    sceneName,
    reason: "",
    normalizedReason: "" as FallbackReason,
    reducedMotion: false,
    canvasActive: false,
    lastError: "",
    qualityTier: null,
    webglVersion: 0,
    renderer: "",
  };
  const merged = { ...prev, ...update };
  // Auto-normalize reason
  if (update.reason !== undefined) {
    merged.normalizedReason = normalizeFallbackReason(merged.reason);
  }
  diagnostics.set(sceneName, merged);
}

export function getWebGLDiagnostics(): WebGLDiagnostic[] {
  return Array.from(diagnostics.values());
}

export function clearDiagnostics() {
  diagnostics.clear();
}

/** Testable diagnostic snapshot */
export function getDiagnosticSnapshot() {
  const detection = detectWebGL();
  const tier = getQualityTier();
  const caps = getCapabilities(tier);
  return {
    webglSupported: detection.supported,
    webglVersion: detection.webglVersion,
    renderer: detection.renderer,
    qualityTier: tier,
    capabilities: caps,
    scenes: getWebGLDiagnostics(),
    reducedMotion: prefersReducedMotion(),
  };
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

function debugLog(...args: unknown[]) {
  if (isDebugEnabled()) {
    console.debug("[WebGL]", ...args);
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
    // Inject quality tier and WebGL info into diagnostics
    const tier = getQualityTier();
    const detection = detectWebGL();
    diagnostics.forEach((d, key) => {
      diagnostics.set(key, {
        ...d,
        qualityTier: tier,
        webglVersion: detection.webglVersion,
        renderer: detection.renderer,
      });
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
  const detection = detectWebGL();

  const tierColors: Record<QualityTier, string> = {
    high: "#6ee7b7",
    medium: "#fcd34d",
    mobile: "#fb923c",
  };

  const modeLabel = isWebGL ? "WEBGL" : "FALLBACK";
  const rendererMode = detection.webglVersion === 2 ? "WebGL 2.0" : detection.webglVersion === 1 ? "WebGL 1.0" : "None";

  return (
    <div
      className="fixed bottom-2 left-2 z-[9999] rounded-lg px-2.5 py-1.5 font-mono text-[9px] leading-tight backdrop-blur-sm select-none pointer-events-auto cursor-pointer"
      style={{
        background: isWebGL
          ? "rgba(16, 185, 129, 0.12)"
          : "rgba(245, 158, 11, 0.12)",
        border: `1px solid ${isWebGL ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.25)"}`,
        color: isWebGL ? "#6ee7b7" : "#fcd34d",
        maxWidth: expanded ? "310px" : "220px",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Compact header */}
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: isWebGL ? "#10b981" : "#f59e0b" }}
        />
        <span className="font-bold">{modeLabel}</span>
        <span className="opacity-50">·</span>
        <span className="opacity-70">{primary.sceneName}</span>
        <span className="opacity-50">·</span>
        <span style={{ color: tierColors[tier] }}>{tier.toUpperCase()}</span>
        <span className="opacity-30 ml-auto">{expanded ? "−" : "+"}</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-1.5 pt-1.5 border-t border-white/10 space-y-1">
          {/* Renderer info */}
          <div className="opacity-70">
            <div>Renderer: {rendererMode}</div>
            <div className="truncate opacity-50" title={detection.renderer}>GPU: {detection.renderer.slice(0, 40)}</div>
          </div>

          {/* Per-scene diagnostics */}
          {diags.map((d) => (
            <div key={d.sceneName} className="opacity-80">
              <span className="font-bold">{d.sceneName}</span>
              <span className="opacity-50"> · {d.mode}</span>
              {d.normalizedReason && (
                <span className="opacity-60"> · {getFallbackLabel(d.normalizedReason)}</span>
              )}
              {!d.normalizedReason && d.reason && (
                <span className="opacity-40"> · {d.reason}</span>
              )}
              {d.reducedMotion && <span className="opacity-40"> · reduced-motion</span>}
              {d.lastError && (
                <div className="text-red-400/70 truncate">{d.lastError.slice(0, 60)}</div>
              )}
            </div>
          ))}

          {/* Quality tier details */}
          <div className="opacity-60 mt-1">
            <div>DPR: {caps.dpr[0]}–{caps.dpr[1]}</div>
            <div className="flex flex-wrap gap-x-2">
              <span style={{ color: caps.enableSSAO ? "#6ee7b7" : "#ef4444" }}>AO</span>
              <span style={{ color: caps.enableDOF ? "#6ee7b7" : "#ef4444" }}>DOF</span>
              <span style={{ color: caps.enableBloom ? "#6ee7b7" : "#ef4444" }}>Bloom</span>
              <span style={{ color: caps.enableReflections ? "#6ee7b7" : "#ef4444" }}>Reflect</span>
              <span style={{ color: caps.enableContactShadows ? "#6ee7b7" : "#ef4444" }}>CShadow</span>
              <span style={{ color: caps.enableFireflies ? "#6ee7b7" : "#ef4444" }}>Flies</span>
              <span style={{ color: caps.enableEnergyTrails ? "#6ee7b7" : "#ef4444" }}>Trails</span>
              <span style={{ color: caps.enableFogLayers ? "#6ee7b7" : "#ef4444" }}>Fog</span>
              <span style={{ color: caps.enableBackgroundStructures ? "#6ee7b7" : "#ef4444" }}>BgStruct</span>
            </div>
            <div>Particles: ×{caps.particleMultiplier}</div>
            <div>Bloom: ×{caps.bloomIntensityMultiplier}</div>
            <div>Shadow map: {caps.shadowMapSize}px</div>
            <div>Max lights: {caps.maxPointLights}</div>
          </div>

          {/* Safe mode hint */}
          <div className="opacity-40 mt-1 text-[8px]">
            ?quality=mobile for safe mode · ?quality=high|medium|mobile
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
    const { supported: webglOk, reason, webglVersion, renderer } = detectWebGL();
    const reducedMotion = prefersReducedMotion();
    const tier = getQualityTier();

    if (!webglOk) {
      const normalizedReason = normalizeFallbackReason(reason || "no-webgl");
      debugLog(`[${label}] Fallback 2D — ${normalizedReason}`);
      updateDiagnostic(label, {
        mode: "FALLBACK",
        sceneName: label,
        reason: reason || "no-webgl",
        reducedMotion,
        canvasActive: false,
        qualityTier: tier,
        webglVersion,
        renderer,
      });
      setSupported(false);
    } else if (reducedMotion) {
      debugLog(`[${label}] Fallback 2D — reduced_motion`);
      updateDiagnostic(label, {
        mode: "FALLBACK",
        sceneName: label,
        reason: "reduced-motion",
        reducedMotion: true,
        canvasActive: false,
        qualityTier: tier,
        webglVersion,
        renderer,
      });
      setSupported(false);
    } else {
      debugLog(`[${label}] WebGL active — tier: ${tier}`);
      updateDiagnostic(label, {
        mode: "WEBGL",
        sceneName: label,
        reason: "",
        reducedMotion: false,
        canvasActive: true,
        qualityTier: tier,
        webglVersion,
        renderer,
      });
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
        updateDiagnostic(label, {
          mode: "FALLBACK",
          reason: "runtime-error",
          lastError: error,
          canvasActive: false,
        });
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
