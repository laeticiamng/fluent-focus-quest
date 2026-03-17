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

  // Atmospheric height fog (per-scene tuning)
  heightFogGroundColor: string;
  heightFogMidColor: string;
  heightFogBaseY: number;
  heightFogRadius: number;
  heightFogGroundOpacity: number;
  heightFogMidOpacity: number;

  // Animated fog layers
  animFogLayers: number;
  animFogBaseY: number;
  animFogRadius: number;
  animFogMaxOpacity: number;
}

/**
 * HubScene — Majestic, mystique, sacred architecture.
 * High-contrast dramatic lighting with warm gold key and deep indigo rim.
 * Strong focal point on central pillar.
 */
const HUB_RIG: SceneLightingRig = {
  ambientIntensity: 0.28,
  ambientColor: "#8898cc",

  keyIntensity: 2.4,
  keyColor: "#ffe0a0",
  keyPosition: [5, 16, 6],

  fillIntensity: 0.45,
  fillColor: "#6080b0",
  fillPosition: [-7, 6, -6],

  rimIntensity: 1.6,
  rimColor: "#6366f1",
  rimSecondaryColor: "#7c3aed",
  rimTertiaryColor: "#4338ca",

  accentIntensity: 2.0,
  accentColor: "#d4a017",

  underFillIntensity: 0.3,
  underFillColor: "#252a55",

  sideAccentCyan: 0.35,
  sideAccentWarm: 0.22,

  envIntensity: 0.3,

  skyPalette: { c1: "#030310", c2: "#0a0824", c3: "#7c3aed", c4: "#f59e0b" },

  breathSpeed: 0.5,
  breathAmount: 0.12,

  shadowY: -0.49,
  shadowOpacity: 0.4,
  shadowScale: 20,
  shadowBlur: 2.5,

  fogColor: "#080818",
  fogNear: 12,
  fogFar: 38,

  // Hub: majestic, subtle, layered depth
  heightFogGroundColor: "#080818",
  heightFogMidColor: "#0c0c24",
  heightFogBaseY: -0.5,
  heightFogRadius: 12,
  heightFogGroundOpacity: 0.12,
  heightFogMidOpacity: 0.05,
  animFogLayers: 3,
  animFogBaseY: -0.3,
  animFogRadius: 12,
  animFogMaxOpacity: 0.1,
};

/**
 * MapScene — Exploration, orientation, strategic overview.
 * Even illumination for readability. Cooler, more neutral.
 * Landmarks must pop against a calm atmospheric backdrop.
 */
const MAP_RIG: SceneLightingRig = {
  ambientIntensity: 0.4,
  ambientColor: "#9db0d0",

  keyIntensity: 1.8,
  keyColor: "#ffecc0",
  keyPosition: [4, 18, 8],

  fillIntensity: 0.55,
  fillColor: "#7090c0",
  fillPosition: [-5, 10, -4],

  rimIntensity: 1.0,
  rimColor: "#6366f1",
  rimSecondaryColor: "#818cf8",
  rimTertiaryColor: "#4f46e5",

  accentIntensity: 1.2,
  accentColor: "#d4a017",

  underFillIntensity: 0.35,
  underFillColor: "#283050",

  sideAccentCyan: 0.25,
  sideAccentWarm: 0.18,

  envIntensity: 0.4,

  skyPalette: { c1: "#050512", c2: "#0c0c2e", c3: "#6366f1", c4: "#d4a017" },

  breathSpeed: 0.35,
  breathAmount: 0.08,

  shadowY: -0.57,
  shadowOpacity: 0.3,
  shadowScale: 22,
  shadowBlur: 3,

  fogColor: "#080816",
  fogNear: 16,
  fogFar: 42,

  // Map: readable exploration fog, lighter density
  heightFogGroundColor: "#080816",
  heightFogMidColor: "#0a0a1e",
  heightFogBaseY: -0.58,
  heightFogRadius: 14,
  heightFogGroundOpacity: 0.08,
  heightFogMidOpacity: 0.035,
  animFogLayers: 2,
  animFogBaseY: -0.4,
  animFogRadius: 14,
  animFogMaxOpacity: 0.08,
};

/**
 * Inventory3DScene — Showroom premium, luxury display.
 * Bright, controlled, museum-like. Strong ambient for artifact readability.
 * Gentle rim separation, soft fill, no harsh shadows.
 */
const INVENTORY_RIG: SceneLightingRig = {
  ambientIntensity: 0.5,
  ambientColor: "#b8c0d8",

  keyIntensity: 1.6,
  keyColor: "#fff0d8",
  keyPosition: [3, 12, 5],

  fillIntensity: 0.65,
  fillColor: "#80a0c8",
  fillPosition: [-4, 8, -3],

  rimIntensity: 0.75,
  rimColor: "#6366f1",
  rimSecondaryColor: "#818cf8",
  rimTertiaryColor: "#4f46e5",

  accentIntensity: 0.9,
  accentColor: "#d4a017",

  underFillIntensity: 0.3,
  underFillColor: "#222848",

  sideAccentCyan: 0.28,
  sideAccentWarm: 0.2,

  envIntensity: 0.45,

  skyPalette: { c1: "#060614", c2: "#0e0e2e", c3: "#6366f1", c4: "#d4a017" },

  breathSpeed: 0.3,
  breathAmount: 0.06,

  shadowY: -0.31,
  shadowOpacity: 0.25,
  shadowScale: 14,
  shadowBlur: 3.5,

  fogColor: "#0a0a1e",
  fogNear: 10,
  fogFar: 24,

  // Inventory: premium showroom fog, very restrained
  heightFogGroundColor: "#0a0a1e",
  heightFogMidColor: "#0c0c22",
  heightFogBaseY: -0.32,
  heightFogRadius: 8,
  heightFogGroundOpacity: 0.06,
  heightFogMidOpacity: 0.025,
  animFogLayers: 2,
  animFogBaseY: -0.15,
  animFogRadius: 8,
  animFogMaxOpacity: 0.06,
};

/**
 * LazarusScene — Ritual dramatique, sacred energy, high contrast.
 * Deep shadows, strong under-light, dramatic rim. Focal point on altar core.
 * Dynamic: shifts to green/gold when activated.
 */
const LAZARUS_RIG: SceneLightingRig = {
  ambientIntensity: 0.22,
  ambientColor: "#7888a0",

  keyIntensity: 2.0,
  keyColor: "#ffd8a0",
  keyPosition: [4, 14, 5],

  fillIntensity: 0.42,
  fillColor: "#5878b0",
  fillPosition: [-6, 7, -5],

  rimIntensity: 1.5,
  rimColor: "#6366f1",
  rimSecondaryColor: "#8b5cf6",
  rimTertiaryColor: "#4338ca",

  accentIntensity: 2.2,
  accentColor: "#d4a017",

  underFillIntensity: 0.4,
  underFillColor: "#222058",

  sideAccentCyan: 0.25,
  sideAccentWarm: 0.18,

  envIntensity: 0.25,

  skyPalette: { c1: "#04040c", c2: "#0c0a28", c3: "#8b5cf6", c4: "#10b981" },

  breathSpeed: 0.6,
  breathAmount: 0.15,

  shadowY: -0.44,
  shadowOpacity: 0.35,
  shadowScale: 14,
  shadowBlur: 2.5,

  fogColor: "#070712",
  fogNear: 10,
  fogFar: 30,

  // Lazarus: denser ritual atmosphere, but still readable
  heightFogGroundColor: "#070712",
  heightFogMidColor: "#0a0a1e",
  heightFogBaseY: -0.45,
  heightFogRadius: 10,
  heightFogGroundOpacity: 0.12,
  heightFogMidOpacity: 0.04,
  animFogLayers: 2,
  animFogBaseY: -0.3,
  animFogRadius: 8,
  animFogMaxOpacity: 0.1,
};

/** Activated variant for Lazarus — greener, more radiant */
const LAZARUS_ACTIVATED_RIG: SceneLightingRig = {
  ...LAZARUS_RIG,
  ambientIntensity: 0.28,
  ambientColor: "#70a888",
  keyColor: "#e0ffc0",
  fillIntensity: 0.48,
  fillColor: "#509870",
  rimColor: "#059669",
  rimSecondaryColor: "#10b981",
  rimTertiaryColor: "#047857",
  accentColor: "#10b981",
  underFillIntensity: 0.45,
  underFillColor: "#0e3020",
  skyPalette: { c1: "#030a06", c2: "#0a1e12", c3: "#10b981", c4: "#fbbf24" },
  fogColor: "#060c06",
  breathAmount: 0.2,
  heightFogGroundColor: "#060c06",
  heightFogMidColor: "#081008",
  heightFogGroundOpacity: 0.14,
  heightFogMidOpacity: 0.05,
  animFogMaxOpacity: 0.1,
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
