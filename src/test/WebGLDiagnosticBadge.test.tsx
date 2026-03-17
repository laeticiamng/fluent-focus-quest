import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock useQualityTier before importing the component
vi.mock("@/hooks/useQualityTier", () => {
  const capabilities = {
    high: {
      tier: "high" as const,
      dpr: [1, 1.5] as [number, number],
      enableSSAO: true,
      enableDOF: true,
      enableBloom: true,
      enableChromaticAberration: true,
      enableReflections: true,
      enableContactShadows: true,
      enableParticles: true,
      enableFogLayers: true,
      enableEnergyTrails: true,
      enableFireflies: true,
      enableBackgroundStructures: true,
      particleMultiplier: 1,
      bloomIntensityMultiplier: 1,
      shadowMapSize: 1024,
      maxPointLights: 16,
    },
    medium: {
      tier: "medium" as const,
      dpr: [1, 1.25] as [number, number],
      enableSSAO: false,
      enableDOF: false,
      enableBloom: true,
      enableChromaticAberration: false,
      enableReflections: false,
      enableContactShadows: true,
      enableParticles: true,
      enableFogLayers: true,
      enableEnergyTrails: false,
      enableFireflies: true,
      enableBackgroundStructures: true,
      particleMultiplier: 0.5,
      bloomIntensityMultiplier: 0.75,
      shadowMapSize: 512,
      maxPointLights: 8,
    },
    mobile: {
      tier: "mobile" as const,
      dpr: [1, 1] as [number, number],
      enableSSAO: false,
      enableDOF: false,
      enableBloom: true,
      enableChromaticAberration: false,
      enableReflections: false,
      enableContactShadows: false,
      enableParticles: true,
      enableFogLayers: false,
      enableEnergyTrails: false,
      enableFireflies: false,
      enableBackgroundStructures: false,
      particleMultiplier: 0.3,
      bloomIntensityMultiplier: 0.5,
      shadowMapSize: 256,
      maxPointLights: 4,
    },
  };

  return {
    getQualityTier: vi.fn(() => "high" as const),
    getCapabilities: vi.fn((tier?: string) => capabilities[(tier || "high") as keyof typeof capabilities]),
    useQualityTier: vi.fn(() => capabilities.high),
  };
});

import {
  WebGLDiagnosticBadge,
  updateDiagnostic,
  clearDiagnostics,
  normalizeFallbackReason,
  getFallbackLabel,
  getDiagnosticSnapshot,
} from "@/components/3d/WebGLDetect";
import { getQualityTier } from "@/hooks/useQualityTier";

function seedDiagnostic(
  sceneName: string,
  mode: "WEBGL" | "FALLBACK",
  opts: { reason?: string; qualityTier?: "high" | "medium" | "mobile" } = {},
) {
  updateDiagnostic(sceneName, {
    mode,
    sceneName,
    reason: opts.reason || "",
    reducedMotion: mode === "FALLBACK" && opts.reason === "reduced-motion",
    canvasActive: mode === "WEBGL",
    lastError: "",
    qualityTier: opts.qualityTier || null,
    webglVersion: mode === "WEBGL" ? 2 : 0,
    renderer: mode === "WEBGL" ? "test-gpu" : "none",
  });
}

describe("WebGLDiagnosticBadge", () => {
  let originalDEV: boolean;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    originalDEV = import.meta.env.DEV;
    import.meta.env.DEV = true;
    clearDiagnostics();
  });

  afterEach(() => {
    import.meta.env.DEV = originalDEV;
    vi.useRealTimers();
  });

  it("renders nothing when debug is disabled", () => {
    import.meta.env.DEV = false;
    seedDiagnostic("hub", "WEBGL");
    const { container } = render(<WebGLDiagnosticBadge />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when no diagnostics are registered", () => {
    const { container } = render(<WebGLDiagnosticBadge />);
    act(() => { vi.advanceTimersByTime(1100); });
    expect(container.innerHTML).toBe("");
  });

  it("renders badge in WEBGL mode", () => {
    seedDiagnostic("hub", "WEBGL");
    render(<WebGLDiagnosticBadge />);
    act(() => { vi.advanceTimersByTime(1100); });

    expect(screen.getByText("WEBGL")).toBeInTheDocument();
    expect(screen.getByText("hub")).toBeInTheDocument();
  });

  it("renders badge in FALLBACK mode", () => {
    seedDiagnostic("map", "FALLBACK", { reason: "no-webgl" });
    render(<WebGLDiagnosticBadge />);
    act(() => { vi.advanceTimersByTime(1100); });

    expect(screen.getByText("FALLBACK")).toBeInTheDocument();
    expect(screen.getByText("map")).toBeInTheDocument();
  });

  it("displays fallback reason when expanded", () => {
    seedDiagnostic("scene", "FALLBACK", { reason: "reduced-motion" });
    render(<WebGLDiagnosticBadge />);
    act(() => { vi.advanceTimersByTime(1100); });

    // Click to expand
    const badge = screen.getByText("FALLBACK").closest("div[class*='fixed']")!;
    fireEvent.click(badge);

    expect(screen.getAllByText(/reduced/i).length).toBeGreaterThanOrEqual(1);
  });

  it("displays the quality tier label (HIGH)", () => {
    seedDiagnostic("hub", "WEBGL", { qualityTier: "high" });
    render(<WebGLDiagnosticBadge />);
    act(() => { vi.advanceTimersByTime(1100); });

    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("displays MOBILE tier label", () => {
    vi.mocked(getQualityTier).mockReturnValue("mobile");
    seedDiagnostic("hub", "WEBGL", { qualityTier: "mobile" });
    render(<WebGLDiagnosticBadge />);
    act(() => { vi.advanceTimersByTime(1100); });

    expect(screen.getByText("MOBILE")).toBeInTheDocument();
  });

  it("shows capability matrix when expanded", () => {
    seedDiagnostic("hub", "WEBGL", { qualityTier: "high" });
    render(<WebGLDiagnosticBadge />);
    act(() => { vi.advanceTimersByTime(1100); });

    const badge = screen.getByText("WEBGL").closest("div[class*='fixed']")!;
    fireEvent.click(badge);

    expect(screen.getByText("AO")).toBeInTheDocument();
    expect(screen.getByText("DOF")).toBeInTheDocument();
    expect(screen.getByText("Bloom")).toBeInTheDocument();
    expect(screen.getByText("Reflect")).toBeInTheDocument();
    expect(screen.getByText("CShadow")).toBeInTheDocument();
  });

  it("does not crash when diagnostic has minimal data", () => {
    updateDiagnostic("partial", {
      mode: "WEBGL",
      sceneName: "partial",
    });

    render(<WebGLDiagnosticBadge />);
    act(() => { vi.advanceTimersByTime(1100); });

    expect(screen.getByText("WEBGL")).toBeInTheDocument();
    expect(screen.getByText("partial")).toBeInTheDocument();
  });

  it("shows multiple scenes when expanded", () => {
    seedDiagnostic("hub", "WEBGL");
    seedDiagnostic("lazarus", "FALLBACK", { reason: "runtime-error" });
    render(<WebGLDiagnosticBadge />);
    act(() => { vi.advanceTimersByTime(1100); });

    const badge = screen.getByText("WEBGL").closest("div[class*='fixed']")!;
    fireEvent.click(badge);

    // "hub" appears in compact header + expanded list, "lazarus" appears in expanded list
    expect(screen.getAllByText("hub").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("lazarus").length).toBeGreaterThanOrEqual(1);
  });

  it("shows DPR and particle info when expanded", () => {
    seedDiagnostic("hub", "WEBGL");
    render(<WebGLDiagnosticBadge />);
    act(() => { vi.advanceTimersByTime(1100); });

    const badge = screen.getByText("WEBGL").closest("div[class*='fixed']")!;
    fireEvent.click(badge);

    expect(screen.getByText(/DPR:/)).toBeInTheDocument();
    expect(screen.getByText(/Particles:/)).toBeInTheDocument();
  });

  it("shows safe mode hint when expanded", () => {
    seedDiagnostic("hub", "WEBGL");
    render(<WebGLDiagnosticBadge />);
    act(() => { vi.advanceTimersByTime(1100); });

    const badge = screen.getByText("WEBGL").closest("div[class*='fixed']")!;
    fireEvent.click(badge);

    expect(screen.getByText(/quality=mobile/)).toBeInTheDocument();
  });

  it("shows renderer info when expanded", () => {
    seedDiagnostic("hub", "WEBGL");
    render(<WebGLDiagnosticBadge />);
    act(() => { vi.advanceTimersByTime(1100); });

    const badge = screen.getByText("WEBGL").closest("div[class*='fixed']")!;
    fireEvent.click(badge);

    expect(screen.getByText(/Renderer:/)).toBeInTheDocument();
    expect(screen.getByText(/GPU:/)).toBeInTheDocument();
  });

  it("shows bloom multiplier and shadow map info when expanded", () => {
    seedDiagnostic("hub", "WEBGL");
    render(<WebGLDiagnosticBadge />);
    act(() => { vi.advanceTimersByTime(1100); });

    const badge = screen.getByText("WEBGL").closest("div[class*='fixed']")!;
    fireEvent.click(badge);

    expect(screen.getByText(/Bloom:/)).toBeInTheDocument();
    expect(screen.getByText(/Shadow map:/)).toBeInTheDocument();
    expect(screen.getByText(/Max lights:/)).toBeInTheDocument();
  });

  it("shows BgStruct capability in expanded panel", () => {
    seedDiagnostic("hub", "WEBGL", { qualityTier: "high" });
    render(<WebGLDiagnosticBadge />);
    act(() => { vi.advanceTimersByTime(1100); });

    const badge = screen.getByText("WEBGL").closest("div[class*='fixed']")!;
    fireEvent.click(badge);

    expect(screen.getByText("BgStruct")).toBeInTheDocument();
  });
});

describe("normalizeFallbackReason", () => {
  it("maps known raw reasons to stable strings", () => {
    expect(normalizeFallbackReason("no-webgl")).toBe("webgl_unavailable");
    expect(normalizeFallbackReason("context-lost")).toBe("context_lost");
    expect(normalizeFallbackReason("reduced-motion")).toBe("reduced_motion");
    expect(normalizeFallbackReason("runtime-error")).toBe("runtime_error");
    expect(normalizeFallbackReason("shader-compile")).toBe("shader_compile_failure");
    expect(normalizeFallbackReason("low-gpu")).toBe("low_gpu_tier");
    expect(normalizeFallbackReason("low-memory")).toBe("low_memory");
    expect(normalizeFallbackReason("postprocessing-disabled")).toBe("postprocessing_disabled");
  });

  it("handles empty string", () => {
    expect(normalizeFallbackReason("")).toBe("");
  });

  it("falls back gracefully for unknown reasons", () => {
    expect(normalizeFallbackReason("some-random-issue")).toBe("unknown_fallback");
  });

  it("detects keywords in unknown reasons", () => {
    expect(normalizeFallbackReason("WebGL context error")).toBe("webgl_unavailable");
    expect(normalizeFallbackReason("shader linking failed")).toBe("shader_compile_failure");
    expect(normalizeFallbackReason("out of GPU memory")).toBe("low_gpu_tier");
    expect(normalizeFallbackReason("insufficient memory")).toBe("low_memory");
    expect(normalizeFallbackReason("prefers reduced motion")).toBe("reduced_motion");
    expect(normalizeFallbackReason("runtime crash")).toBe("runtime_error");
  });

  it("is case insensitive", () => {
    expect(normalizeFallbackReason("NO-WEBGL")).toBe("webgl_unavailable");
    expect(normalizeFallbackReason("Context-Lost")).toBe("context_lost");
  });
});

describe("getFallbackLabel", () => {
  it("returns human-readable labels for each reason", () => {
    expect(getFallbackLabel("webgl_unavailable")).toBe("WebGL not available");
    expect(getFallbackLabel("context_lost")).toBe("WebGL context lost");
    expect(getFallbackLabel("shader_compile_failure")).toBe("Shader compilation failed");
    expect(getFallbackLabel("low_gpu_tier")).toBe("GPU too weak for 3D");
    expect(getFallbackLabel("low_memory")).toBe("Insufficient memory");
    expect(getFallbackLabel("postprocessing_disabled")).toBe("Post-processing disabled");
    expect(getFallbackLabel("reduced_motion")).toBe("Reduced motion preferred");
    expect(getFallbackLabel("runtime_error")).toBe("Runtime error occurred");
    expect(getFallbackLabel("unknown_fallback")).toBe("Unknown fallback");
  });

  it("returns empty string for empty reason", () => {
    expect(getFallbackLabel("")).toBe("");
  });
});

describe("getDiagnosticSnapshot", () => {
  beforeEach(() => {
    clearDiagnostics();
  });

  it("returns a complete snapshot object", () => {
    const snapshot = getDiagnosticSnapshot();
    expect(snapshot).toHaveProperty("webglSupported");
    expect(snapshot).toHaveProperty("webglVersion");
    expect(snapshot).toHaveProperty("renderer");
    expect(snapshot).toHaveProperty("qualityTier");
    expect(snapshot).toHaveProperty("capabilities");
    expect(snapshot).toHaveProperty("scenes");
    expect(snapshot).toHaveProperty("reducedMotion");
  });

  it("includes scenes in snapshot", () => {
    seedDiagnostic("hub", "WEBGL");
    seedDiagnostic("map", "FALLBACK", { reason: "no-webgl" });
    const snapshot = getDiagnosticSnapshot();
    expect(snapshot.scenes).toHaveLength(2);
  });
});

describe("updateDiagnostic auto-normalization", () => {
  beforeEach(() => {
    clearDiagnostics();
  });

  it("auto-normalizes reason when updating", () => {
    updateDiagnostic("test", { mode: "FALLBACK", sceneName: "test", reason: "no-webgl" });
    const diags = getDiagnosticSnapshot().scenes;
    const testDiag = diags.find(d => d.sceneName === "test");
    expect(testDiag?.normalizedReason).toBe("webgl_unavailable");
  });

  it("preserves normalizedReason as empty when reason is empty", () => {
    updateDiagnostic("test", { mode: "WEBGL", sceneName: "test", reason: "" });
    const diags = getDiagnosticSnapshot().scenes;
    const testDiag = diags.find(d => d.sceneName === "test");
    expect(testDiag?.normalizedReason).toBe("");
  });
});
