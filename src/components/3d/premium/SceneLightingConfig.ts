/**
 * Per-scene lighting configuration — cinematic rig presets.
 * Each scene gets a unique artistic direction while sharing the same rig structure.
 */

export interface SceneLightingRig {
  // Ambient
  ambientIntensity: number;
  ambientColor: string;

  // Key light — primary directional
  keyIntensity: number;
  keyColor: string;
  keyPosition: [number, number, number];

  // Fill light — secondary directional, cooler
  fillIntensity: number;
  fillColor: string;
  fillPosition: [number, number, number];

  // Rim lights (3)
  rimIntensity: number;
  rimColor: string;
  rimSecondaryColor: string;
  rimTertiaryColor: string;

  // Top accent spotlight
  accentIntensity: number;
  accentColor: string;

  // Under-fill (bounce light from below)
  underFillIntensity: number;
  underFillColor: string;

  // Side accents
  sideAccentCyan: number;
  sideAccentWarm: number;

  // Environment
  envIntensity: number;

  // Skybox palette
  skyPalette: { c1: string; c2: string; c3: string; c4: string };

  // Breathing dynamics
  breathSpeed: number;
  breathAmount: number;

  // Contact shadows
  shadowY: number;
  shadowOpacity: number;
  shadowScale: number;
  shadowBlur: number;

  // Fog
  fogColor: string;
  fogNear: number;
  fogFar: number;
}

/**
 * HubScene — Majestic, mystique, sacred architecture.
 * High-contrast dramatic lighting with warm gold key and deep indigo rim.
 * Strong focal point on central pillar.
 */
const HUB_RIG: SceneLightingRig = {
  ambientIntensity: 0.18,
  ambientColor: "#8090c0",

  keyIntensity: 2.6,
  keyColor: "#ffe0a0",
  keyPosition: [5, 16, 6],

  fillIntensity: 0.25,
  fillColor: "#5070a0",
  fillPosition: [-7, 6, -6],

  rimIntensity: 1.8,
  rimColor: "#6366f1",
  rimSecondaryColor: "#7c3aed",
  rimTertiaryColor: "#4338ca",

  accentIntensity: 2.2,
  accentColor: "#d4a017",

  underFillIntensity: 0.15,
  underFillColor: "#1a2550",

  sideAccentCyan: 0.3,
  sideAccentWarm: 0.18,

  envIntensity: 0.2,

  skyPalette: { c1: "#020208", c2: "#08061e", c3: "#7c3aed", c4: "#f59e0b" },

  breathSpeed: 0.5,
  breathAmount: 0.12,

  shadowY: -0.49,
  shadowOpacity: 0.45,
  shadowScale: 20,
  shadowBlur: 2.5,

  fogColor: "#060614",
  fogNear: 10,
  fogFar: 32,
};

/**
 * MapScene — Exploration, orientation, strategic overview.
 * Even illumination for readability. Cooler, more neutral.
 * Landmarks must pop against a calm atmospheric backdrop.
 */
const MAP_RIG: SceneLightingRig = {
  ambientIntensity: 0.32,
  ambientColor: "#95a8c8",

  keyIntensity: 1.8,
  keyColor: "#ffecc0",
  keyPosition: [4, 18, 8],

  fillIntensity: 0.45,
  fillColor: "#6888b8",
  fillPosition: [-5, 10, -4],

  rimIntensity: 1.0,
  rimColor: "#6366f1",
  rimSecondaryColor: "#818cf8",
  rimTertiaryColor: "#4f46e5",

  accentIntensity: 1.2,
  accentColor: "#d4a017",

  underFillIntensity: 0.25,
  underFillColor: "#1e2848",

  sideAccentCyan: 0.22,
  sideAccentWarm: 0.15,

  envIntensity: 0.35,

  skyPalette: { c1: "#040410", c2: "#0a0a28", c3: "#6366f1", c4: "#d4a017" },

  breathSpeed: 0.35,
  breathAmount: 0.08,

  shadowY: -0.57,
  shadowOpacity: 0.35,
  shadowScale: 22,
  shadowBlur: 3,

  fogColor: "#060612",
  fogNear: 14,
  fogFar: 38,
};

/**
 * Inventory3DScene — Showroom premium, luxury display.
 * Bright, controlled, museum-like. Strong ambient for artifact readability.
 * Gentle rim separation, soft fill, no harsh shadows.
 */
const INVENTORY_RIG: SceneLightingRig = {
  ambientIntensity: 0.42,
  ambientColor: "#b0b8d0",

  keyIntensity: 1.5,
  keyColor: "#fff0d8",
  keyPosition: [3, 12, 5],

  fillIntensity: 0.6,
  fillColor: "#7898c0",
  fillPosition: [-4, 8, -3],

  rimIntensity: 0.75,
  rimColor: "#6366f1",
  rimSecondaryColor: "#818cf8",
  rimTertiaryColor: "#4f46e5",

  accentIntensity: 0.85,
  accentColor: "#d4a017",

  underFillIntensity: 0.2,
  underFillColor: "#1a2040",

  sideAccentCyan: 0.25,
  sideAccentWarm: 0.18,

  envIntensity: 0.4,

  skyPalette: { c1: "#050510", c2: "#0c0c2a", c3: "#6366f1", c4: "#d4a017" },

  breathSpeed: 0.3,
  breathAmount: 0.06,

  shadowY: -0.31,
  shadowOpacity: 0.3,
  shadowScale: 14,
  shadowBlur: 3.5,

  fogColor: "#080818",
  fogNear: 8,
  fogFar: 20,
};

/**
 * LazarusScene — Ritual dramatique, sacred energy, high contrast.
 * Deep shadows, strong under-light, dramatic rim. Focal point on altar core.
 * Dynamic: shifts to green/gold when activated.
 */
const LAZARUS_RIG: SceneLightingRig = {
  ambientIntensity: 0.15,
  ambientColor: "#708098",

  keyIntensity: 2.0,
  keyColor: "#ffd8a0",
  keyPosition: [4, 14, 5],

  fillIntensity: 0.3,
  fillColor: "#5068a0",
  fillPosition: [-6, 7, -5],

  rimIntensity: 1.6,
  rimColor: "#6366f1",
  rimSecondaryColor: "#8b5cf6",
  rimTertiaryColor: "#4338ca",

  accentIntensity: 2.5,
  accentColor: "#d4a017",

  underFillIntensity: 0.35,
  underFillColor: "#1a1850",

  sideAccentCyan: 0.2,
  sideAccentWarm: 0.15,

  envIntensity: 0.2,

  skyPalette: { c1: "#030308", c2: "#0a0822", c3: "#8b5cf6", c4: "#10b981" },

  breathSpeed: 0.6,
  breathAmount: 0.15,

  shadowY: -0.44,
  shadowOpacity: 0.38,
  shadowScale: 14,
  shadowBlur: 2.5,

  fogColor: "#05050f",
  fogNear: 8,
  fogFar: 26,
};

/** Activated variant for Lazarus — greener, more radiant */
const LAZARUS_ACTIVATED_RIG: SceneLightingRig = {
  ...LAZARUS_RIG,
  ambientColor: "#609878",
  keyColor: "#e0ffc0",
  fillColor: "#408860",
  rimColor: "#059669",
  rimSecondaryColor: "#10b981",
  rimTertiaryColor: "#047857",
  accentColor: "#10b981",
  underFillColor: "#0a2818",
  skyPalette: { c1: "#020804", c2: "#081a0e", c3: "#10b981", c4: "#fbbf24" },
  fogColor: "#040a04",
  breathAmount: 0.2,
};

export type SceneName = "hub" | "map" | "inventory" | "lazarus";

export const SCENE_LIGHTING_RIGS: Record<string, SceneLightingRig> = {
  hub: HUB_RIG,
  map: MAP_RIG,
  inventory: INVENTORY_RIG,
  lazarus: LAZARUS_RIG,
  lazarus_activated: LAZARUS_ACTIVATED_RIG,
};

export function getSceneLightingRig(scene: string): SceneLightingRig {
  return SCENE_LIGHTING_RIGS[scene] || SCENE_LIGHTING_RIGS.hub;
}
