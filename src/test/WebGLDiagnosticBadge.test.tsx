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

    expect(screen.getAllByText(/reduced-motion/).length).toBeGreaterThanOrEqual(1);
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

    expect(screen.getByText("SSAO")).toBeInTheDocument();
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
});
