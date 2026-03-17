import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

/**
 * Procedural gradient skybox — tech-fantasy nebula dome.
 * HD resolution (1024) with stars and animated nebula glow.
 */
function GradientSkybox({ preset = "default" }: { preset?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;

    const palettes: Record<string, { bottom: string; mid1: string; mid2: string; top: string }> = {
      default:  { bottom: "#050510", mid1: "#0c0c2a", mid2: "#14143a", top: "#0a0a1e" },
      dramatic: { bottom: "#030308", mid1: "#0a0822", mid2: "#18103a", top: "#080614" },
      sacred:   { bottom: "#040410", mid1: "#0e0a28", mid2: "#160e35", top: "#0a0818" },
      showcase: { bottom: "#060612", mid1: "#0e0e2e", mid2: "#161640", top: "#0c0c22" },
    };
    const p = palettes[preset] || palettes.default;

    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    gradient.addColorStop(0, p.bottom);
    gradient.addColorStop(0.3, p.mid1);
    gradient.addColorStop(0.6, p.mid2);
    gradient.addColorStop(1.0, p.top);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Nebula glow spots — richer and more varied
    const spots = [
      { x: 400, y: 360, r: 240, color: "rgba(99, 102, 241, 0.05)" },
      { x: 700, y: 560, r: 180, color: "rgba(212, 160, 23, 0.04)" },
      { x: 200, y: 700, r: 200, color: "rgba(124, 58, 237, 0.045)" },
      { x: 850, y: 200, r: 160, color: "rgba(6, 182, 212, 0.03)" },
      { x: 500, y: 150, r: 280, color: "rgba(245, 158, 11, 0.025)" },
      { x: 120, y: 400, r: 150, color: "rgba(236, 72, 153, 0.025)" },
    ];
    spots.forEach(({ x, y, r, color }) => {
      const radial = ctx.createRadialGradient(x, y, 0, x, y, r);
      radial.addColorStop(0, color);
      radial.addColorStop(1, "transparent");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Stars — scattered bright points
    const starCount = 200;
    for (let i = 0; i < starCount; i++) {
      const sx = Math.random() * canvas.width;
      const sy = Math.random() * canvas.height;
      const sr = 0.3 + Math.random() * 1.2;
      const brightness = 0.15 + Math.random() * 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.fill();
    }

    // Larger "bright" stars with slight glow
    for (let i = 0; i < 15; i++) {
      const sx = Math.random() * canvas.width;
      const sy = Math.random() * canvas.height;
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 4);
      glow.addColorStop(0, "rgba(255, 255, 255, 0.6)");
      glow.addColorStop(0.5, "rgba(180, 200, 255, 0.15)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(sx - 4, sy - 4, 8, 8);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    return tex;
  }, [preset]);

  // Slow skybox rotation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.003;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[50, 64, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

/**
 * Breathing light — a point light that pulses subtly over time.
 */
function BreathingLight({
  position,
  baseIntensity,
  color,
  distance,
  breathSpeed = 0.8,
  breathAmount = 0.3,
}: {
  position: [number, number, number];
  baseIntensity: number;
  color: string;
  distance: number;
  breathSpeed?: number;
  breathAmount?: number;
}) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.getElapsedTime();
      lightRef.current.intensity = baseIntensity + Math.sin(t * breathSpeed) * breathAmount * baseIntensity;
    }
  });

  return (
    <pointLight ref={lightRef} position={position} intensity={baseIntensity} color={color} distance={distance} decay={2} />
  );
}

/**
 * Cinematic lighting rig — premium immersive 2026.
 * 8-light setup with breathing dynamics for living feel.
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
      {/* HDRI for reflections only */}
      <Environment preset="city" environmentIntensity={p.envIntensity} background={false} />

      {/* Custom gradient skybox — tech-fantasy nebula with stars */}
      <GradientSkybox preset={preset} />

      {/* Ambient — desaturated cool blue for depth */}
      <ambientLight intensity={p.ambient * mult} color="#a0b0d0" />

      {/* Key light — warm cinematic from upper-right-front */}
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

      {/* Fill light — cool steel blue */}
      <directionalLight position={[-6, 8, -5]} intensity={p.fill * mult} color="#7090bb" />

      {/* Rim lights — breathing for living feel */}
      <BreathingLight position={[0, 3, -10]} baseIntensity={p.rim * mult} color={rimColor} distance={25} breathSpeed={0.6} breathAmount={0.15} />
      <BreathingLight position={[-8, 2, -5]} baseIntensity={p.rim * 0.5 * mult} color="#7c3aed" distance={18} breathSpeed={0.45} breathAmount={0.2} />
      <BreathingLight position={[8, 2, -5]} baseIntensity={p.rim * 0.35 * mult} color="#4f46e5" distance={14} breathSpeed={0.55} breathAmount={0.18} />

      {/* Top accent — breathing gold spotlight */}
      <BreathingLight position={[0, 10, 0]} baseIntensity={p.accent * mult} color={accentColor} distance={25} breathSpeed={0.4} breathAmount={0.12} />

      {/* Under-fill */}
      <pointLight position={[0, -2, 0]} intensity={p.backFill * mult} color="#1e2a4a" distance={15} decay={2} />

      {/* Side accents with breathing */}
      <BreathingLight position={[7, 1.5, 3]} baseIntensity={0.35 * mult} color="#22d3ee" distance={12} breathSpeed={0.7} breathAmount={0.25} />
      <BreathingLight position={[-7, 1.5, 3]} baseIntensity={0.2 * mult} color="#f59e0b" distance={10} breathSpeed={0.5} breathAmount={0.2} />
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
