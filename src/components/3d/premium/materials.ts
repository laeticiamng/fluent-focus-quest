/**
 * Material hierarchy — shared material presets for the 3D system.
 *
 * Three tiers:
 * - heroCrystal: meshPhysicalMaterial for central gems, altar cores, premium artifacts.
 *   Features: clearcoat, iridescence, transmission, high env map.
 * - ritualMetal: meshStandardMaterial for accent bands, rings, active elements.
 *   Features: high metalness, low roughness, moderate emissive.
 * - supportStone: meshStandardMaterial for pillars, pedestals, architectural elements.
 *   Features: moderate metalness, higher roughness, minimal emissive.
 *
 * Guidelines:
 * - Only hero elements use meshPhysicalMaterial (transmission/iridescence/clearcoat).
 * - Support geometry uses meshStandardMaterial to avoid GPU cost and visual competition.
 * - Specular behavior is reduced on support structures to prevent shimmer.
 */

export interface HeroCrystalProps {
  color: string;
  emissive: string;
  emissiveIntensity?: number;
  iridescence?: number;
  transmission?: number;
  clearcoat?: number;
}

export interface RitualMetalProps {
  color: string;
  emissive: string;
  emissiveIntensity?: number;
  opacity?: number;
  transparent?: boolean;
}

export interface SupportStoneProps {
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
}

/** Hero crystal material props — for central gems, altar cores, premium artifacts */
export function heroCrystalProps({
  color,
  emissive,
  emissiveIntensity = 1.0,
  iridescence = 0.5,
  transmission = 0.4,
  clearcoat = 1,
}: HeroCrystalProps) {
  return {
    color,
    emissive,
    emissiveIntensity,
    metalness: 0.3,
    roughness: 0.05,
    envMapIntensity: 1.2,
    clearcoat,
    clearcoatRoughness: 0.08,
    iridescence,
    iridescenceIOR: 1.8,
    transmission,
    thickness: 1.5,
    ior: 1.5,
  };
}

/** Ritual metal props — for accent bands, rings, active elements */
export function ritualMetalProps({
  color,
  emissive,
  emissiveIntensity = 0.6,
  opacity = 1,
  transparent = false,
}: RitualMetalProps) {
  return {
    color,
    emissive,
    emissiveIntensity,
    metalness: 0.95,
    roughness: 0.08,
    transparent,
    opacity,
  };
}

/** Support stone props — for pillars, pedestals, architectural elements */
export function supportStoneProps({
  color,
  emissive,
  emissiveIntensity = 0.02,
}: SupportStoneProps) {
  return {
    color,
    metalness: 0.6,
    roughness: 0.35,
    emissive: emissive || color,
    emissiveIntensity,
    envMapIntensity: 0.3,
  };
}
