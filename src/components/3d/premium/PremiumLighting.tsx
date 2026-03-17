import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

/**
 * Cinematic lighting rig — premium immersive 2026.
 * 8-light setup: key + fill + rim pair + accent + under-fill + side accents.
 * Designed for dramatic depth separation, warm/cool contrast, and eye-guiding highlights.
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
    default:  { ambient: 0.35, key: 2.0, fill: 0.5, rim: 1.2, accent: 1.4, envIntensity: 0.3, backFill: 0.3 },
    dramatic: { ambient: 0.2,  key: 2.4, fill: 0.3, rim: 1.6, accent: 2.0, envIntensity: 0.2, backFill: 0.2 },
    sacred:   { ambient: 0.3,  key: 1.8, fill: 0.45, rim: 1.4, accent: 2.2, envIntensity: 0.25, backFill: 0.35 },
    showcase: { ambient: 0.45, key: 1.6, fill: 0.65, rim: 0.9, accent: 1.0, envIntensity: 0.4, backFill: 0.25 },
  };

  const p = presets[preset];

  return (
    <>
      <Environment preset="city" environmentIntensity={p.envIntensity} />

      {/* Ambient — desaturated cool blue for depth */}
      <ambientLight intensity={p.ambient * mult} color="#a0b0d0" />

      {/* Key light — warm cinematic from upper-right-front, large shadow map */}
      <directionalLight
        position={[6, 14, 7]}
        intensity={p.key * mult}
        color="#ffe4b5"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-near={0.1}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.001}
      />

      {/* Fill light — cool steel blue from opposite side, no shadow */}
      <directionalLight position={[-6, 8, -5]} intensity={p.fill * mult} color="#7090bb" />

      {/* Rim light pair — strong backlight for silhouette separation */}
      <pointLight position={[0, 3, -10]} intensity={p.rim * mult} color={rimColor} distance={25} decay={2} />
      <pointLight position={[-8, 2, -5]} intensity={p.rim * 0.5 * mult} color="#7c3aed" distance={18} decay={2} />
      <pointLight position={[8, 2, -5]} intensity={p.rim * 0.35 * mult} color="#4f46e5" distance={14} decay={2} />

      {/* Top accent — warm gold spotlight from directly above */}
      <pointLight position={[0, 10, 0]} intensity={p.accent * mult} color={accentColor} distance={25} decay={2} />

      {/* Under-fill — prevents crushed blacks on floor and undersides */}
      <pointLight position={[0, -2, 0]} intensity={p.backFill * mult} color="#1e2a4a" distance={15} decay={2} />

      {/* Side accent — cool cyan from right for color separation */}
      <pointLight position={[7, 1.5, 3]} intensity={0.35 * mult} color="#22d3ee" distance={12} decay={2} />

      {/* Warm side accent — orange from left for three-point depth */}
      <pointLight position={[-7, 1.5, 3]} intensity={0.2 * mult} color="#f59e0b" distance={10} decay={2} />
    </>
  );
}

/**
 * Premium contact shadows — soft, cinematic ground contact.
 */
export function PremiumShadows({
  y = -0.49,
  opacity = 0.4,
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
      blur={3}
      far={8}
      color="#050510"
    />
  );
}
