import { useState, useEffect, ReactNode } from "react";
import { Scene3DErrorBoundary } from "./Scene3DErrorBoundary";

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

// ── Diagnostic state (module-level for cross-component access) ──
type DiagnosticMode = "WEBGL" | "FALLBACK" | "DETECTING";
interface WebGLDiagnostic {
  mode: DiagnosticMode;
  sceneName: string;
  reason: string;
  reducedMotion: boolean;
  canvasActive: boolean;
  lastError: string;
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
  };
  diagnostics.set(sceneName, { ...prev, ...update });
}

export function getWebGLDiagnostics(): WebGLDiagnostic[] {
  return Array.from(diagnostics.values());
}

// ── Diagnostic Badge Component ──
function isDebugEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return new URLSearchParams(window.location.search).get("debug") === "1";
  } catch {
    return false;
  }
}

export function WebGLDiagnosticBadge() {
  const [visible, setVisible] = useState(false);
  const [diags, setDiags] = useState<WebGLDiagnostic[]>([]);

  useEffect(() => {
    if (!isDebugEnabled()) return;
    setVisible(true);
    const interval = setInterval(() => {
      setDiags(getWebGLDiagnostics());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!visible || diags.length === 0) return null;

  const primary = diags[0];
  const isWebGL = primary.mode === "WEBGL";

  return (
    <div
      className="fixed bottom-2 left-2 z-[9999] rounded-lg px-2.5 py-1.5 font-mono text-[9px] leading-tight backdrop-blur-sm select-none pointer-events-auto cursor-default"
      style={{
        background: isWebGL
          ? "rgba(16, 185, 129, 0.15)"
          : "rgba(245, 158, 11, 0.15)",
        border: `1px solid ${isWebGL ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
        color: isWebGL ? "#6ee7b7" : "#fcd34d",
        maxWidth: "220px",
      }}
    >
      {diags.map((d) => (
        <div key={d.sceneName} className="mb-0.5 last:mb-0">
          <span className="font-bold">3D: {d.mode}</span>
          <span className="opacity-60"> · {d.sceneName}</span>
          {d.reason && <div className="opacity-50">reason: {d.reason}</div>}
          {d.reducedMotion && <div className="opacity-50">reduced-motion: on</div>}
          {d.lastError && <div className="text-red-400 opacity-70">err: {d.lastError.slice(0, 60)}</div>}
        </div>
      ))}
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

    if (!webglOk) {
      const fallbackReason = reason || "no-webgl";
      console.info(`[WebGLGate:${label}] Fallback 2D — ${fallbackReason}`);
      updateDiagnostic(label, { mode: "FALLBACK", sceneName: label, reason: fallbackReason, reducedMotion, canvasActive: false });
      setSupported(false);
    } else if (reducedMotion) {
      console.info(`[WebGLGate:${label}] Fallback 2D — reduced-motion`);
      updateDiagnostic(label, { mode: "FALLBACK", sceneName: label, reason: "reduced-motion", reducedMotion: true, canvasActive: false });
      setSupported(false);
    } else {
      updateDiagnostic(label, { mode: "WEBGL", sceneName: label, reason: "", reducedMotion: false, canvasActive: true });
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
