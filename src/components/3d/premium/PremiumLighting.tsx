import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

/**
 * Cinematic lighting rig for premium 3D scenes.
 * Key + fill + rim + accent scheme with gold/indigo palette.
 */
export function PremiumLighting({
  preset = "default",
  accentColor = "#d4a017",
  rimColor = "#6366f1",
  intensity = 1,
}: {
  preset?: "default" | "dramatic" | "sacred" | "showcase";
  accentColor?: string;
  rimColor?: string;
  intensity?: number;
}) {
  const mult = intensity;

  const presets = {
    default: { ambient: 0.5, key: 1.6, fill: 0.6, rim: 0.8, accent: 1.0, envIntensity: 0.35 },
    dramatic: { ambient: 0.35, key: 1.8, fill: 0.4, rim: 1.2, accent: 1.5, envIntensity: 0.25 },
    sacred: { ambient: 0.45, key: 1.5, fill: 0.55, rim: 1.0, accent: 1.8, envIntensity: 0.3 },
    showcase: { ambient: 0.55, key: 1.4, fill: 0.7, rim: 0.7, accent: 0.8, envIntensity: 0.4 },
  };

  const p = presets[preset];

  return (
    <>
      <Environment preset="city" environmentIntensity={p.envIntensity} />

      {/* Ambient fill — cool blue */}
      <ambientLight intensity={p.ambient * mult} color="#b8c4e8" />

      {/* Key light — warm, from upper-right-front */}
      <directionalLight
        position={[5, 12, 6]}
        intensity={p.key * mult}
        color="#ffecd0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={25}
        shadow-camera-near={0.1}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.002}
      />

      {/* Fill light — cool blue from opposite side */}
      <directionalLight position={[-5, 7, -4]} intensity={p.fill * mult} color="#8899cc" />

      {/* Rim light — indigo/violet backlight for depth separation */}
      <pointLight position={[0, 2, -8]} intensity={p.rim * mult} color={rimColor} distance={20} decay={2} />
      <pointLight position={[-6, 1, -4]} intensity={p.rim * 0.4 * mult} color="#7c3aed" distance={14} decay={2} />

      {/* Top accent — warm gold downlight */}
      <pointLight position={[0, 8, 0]} intensity={p.accent * mult} color={accentColor} distance={20} decay={2} />

      {/* Under-fill to prevent black holes */}
      <pointLight position={[0, -1, 0]} intensity={0.25 * mult} color="#2a3455" distance={12} decay={2} />

      {/* Subtle cyan accent from side */}
      <pointLight position={[6, 1, 2]} intensity={0.3 * mult} color="#22d3ee" distance={10} decay={2} />
    </>
  );
}

/**
 * Premium contact shadows with proper scale.
 */
export function PremiumShadows({
  y = -0.49,
  opacity = 0.35,
  scale = 18,
}: {
  y?: number;
  opacity?: number;
  scale?: number;
}) {
  return (
    <ContactShadows
      position={[0, y, 0]}
      opacity={opacity}
      scale={scale}
      blur={2.5}
      far={6}
      color="#0a0a20"
    />
  );
}
