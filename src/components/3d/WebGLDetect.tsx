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
      cachedReason = "WebGL not available in this browser";
      return { supported: false, reason: cachedReason };
    }
    cachedSupport = true;
    cachedReason = "";
  } catch (e) {
    cachedSupport = false;
    cachedReason = `WebGL detection failed: ${e instanceof Error ? e.message : "unknown"}`;
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

interface WebGLGateProps {
  children: ReactNode;
  fallback: ReactNode;
  sceneName?: string;
}

export function WebGLGate({ children, fallback, sceneName }: WebGLGateProps) {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const { supported: webglOk, reason } = detectWebGL();
    const reducedMotion = prefersReducedMotion();

    if (!webglOk) {
      if (import.meta.env.DEV) console.info(`[WebGLGate:${sceneName || "?"}] Falling back to 2D: ${reason}`);
      setSupported(false);
    } else if (reducedMotion) {
      if (import.meta.env.DEV) console.info(`[WebGLGate:${sceneName || "?"}] Falling back to 2D: prefers-reduced-motion`);
      setSupported(false);
    } else {
      setSupported(true);
    }
  }, [sceneName]);

  // Show a minimal placeholder during detection (prevents layout jump)
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
    <Scene3DErrorBoundary fallback={fallback} sceneName={sceneName}>
      {children}
    </Scene3DErrorBoundary>
  );
}

export function useWebGLSupported(): boolean {
  const [supported, setSupported] = useState(true);
  useEffect(() => { setSupported(detectWebGL().supported); }, []);
  return supported;
}
