import { useState, useEffect, ReactNode } from "react";
import { Scene3DErrorBoundary } from "./Scene3DErrorBoundary";

let cachedSupport: boolean | null = null;

function detectWebGL(): boolean {
  if (cachedSupport !== null) return cachedSupport;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    cachedSupport = !!gl;
  } catch {
    cachedSupport = false;
  }
  return cachedSupport ?? false;
}

// Check for reduced motion preference
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
}

export function WebGLGate({ children, fallback }: WebGLGateProps) {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // Skip 3D if user prefers reduced motion or WebGL not available
    setSupported(detectWebGL() && !prefersReducedMotion());
  }, []);

  if (supported === null) return null;
  if (!supported) return <>{fallback}</>;

  // Wrap in error boundary so a 3D crash falls back to 2D gracefully
  return (
    <Scene3DErrorBoundary fallback={fallback}>
      {children}
    </Scene3DErrorBoundary>
  );
}

export function useWebGLSupported(): boolean {
  const [supported, setSupported] = useState(true);
  useEffect(() => { setSupported(detectWebGL()); }, []);
  return supported;
}
