// ── AtmosphericSceneWrapper ──
// Bridge between legacy API and the 2026 experience engine.
// Maintains backward compatibility while delegating to AmbientRenderer.

import { useEffect, type ReactNode } from "react";
import { AmbientRenderer } from "@/experience";
import { useExperience, type AtmosphereType, type ExperienceMode } from "@/experience";

interface AtmosphericSceneWrapperProps {
  children: ReactNode;
  atmosphere?: AtmosphereType;
  intensity?: "low" | "medium" | "high";
  className?: string;
}

const INTENSITY_TO_MODE: Record<string, ExperienceMode> = {
  low: "ambient",
  medium: "focus",
  high: "reveal",
};

export function AtmosphericSceneWrapper({
  children,
  atmosphere = "neutral",
  intensity = "medium",
  className = "",
}: AtmosphericSceneWrapperProps) {
  const { setZoneAtmosphere } = useExperience();

  // Sync atmosphere with experience engine when props change
  useEffect(() => {
    const mode = INTENSITY_TO_MODE[intensity] || "ambient";
    setZoneAtmosphere(atmosphere, mode);
  }, [atmosphere, intensity, setZoneAtmosphere]);

  return (
    <AmbientRenderer className={className}>
      {children}
    </AmbientRenderer>
  );
}
