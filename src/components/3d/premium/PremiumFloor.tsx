import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * Premium floor — multi-layered sacred ground with rune circles,
 * energy channels, relief zones, radial glyphs, and reflective center.
 * "Forge linguistique" / "command center" aesthetic.
 */
export function PremiumFloor({
  radius = 8,
  variant = "circular",
  accentColor = "#d4a017",
  secondaryAccent = "#6366f1",
  reflective = true,
}: {
  radius?: number;
  variant?: "circular" | "square";
  accentColor?: string;
  secondaryAccent?: string;
  reflective?: boolean;
}) {
  const runeRingRef = useRef<THREE.Group>(null);
  const innerRuneRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (runeRingRef.current) runeRingRef.current.rotation.z = t * 0.015;
    if (innerRuneRef.current) innerRuneRef.current.rotation.z = -t * 0.025;
  });

  return (
    <group>
      {/* ── Layer 0: Deep base — very dark, large ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]} receiveShadow>
        {variant === "circular" ? (
          <circleGeometry args={[radius * 1.15, 64]} />
        ) : (
          <planeGeometry args={[radius * 2.3, radius * 2.3]} />
        )}
        <meshStandardMaterial
          color="#0e0e25"
          metalness={0.6}
          roughness={0.5}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* ── Layer 1: Main platform — raised, reflective dark metal ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        {variant === "circular" ? (
          <circleGeometry args={[radius, 64]} />
        ) : (
          <planeGeometry args={[radius * 2, radius * 2]} />
        )}
        {reflective ? (
          <MeshReflectorMaterial
            mirror={0.15}
            mixBlur={8}
            mixStrength={0.6}
            resolution={512}
            blur={[300, 100]}
            color="#18183a"
            metalness={0.7}
            roughness={0.25}
          />
        ) : (
          <meshStandardMaterial
            color="#18183a"
            metalness={0.65}
            roughness={0.28}
            envMapIntensity={0.5}
          />
        )}
      </mesh>

      {/* ── Layer 2: Inner elevated zone — lighter, noble stone ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        {variant === "circular" ? (
          <circleGeometry args={[radius * 0.55, 64]} />
        ) : (
          <planeGeometry args={[radius * 1.1, radius * 1.1]} />
        )}
        <meshStandardMaterial
          color="#222248"
          metalness={0.55}
          roughness={0.32}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* ── Layer 3: Inner sanctum disc — slightly raised center ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, 0]}>
        <circleGeometry args={[radius * 0.25, 48]} />
        <meshStandardMaterial
          color="#2a2a55"
          metalness={0.5}
          roughness={0.35}
          emissive={accentColor}
          emissiveIntensity={0.04}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* ── Outer rune ring system — slow rotation ── */}
      <group ref={runeRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.475, 0]}>
        {/* Outermost ring — thin gold */}
        <mesh>
          <ringGeometry args={[radius * 0.92, radius * 0.94, 128]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Platform edge bevel ring */}
        <mesh>
          <ringGeometry args={[radius * 0.97, radius * 1.0, 128]} />
          <meshStandardMaterial
            color="#0a0a20"
            emissive={secondaryAccent}
            emissiveIntensity={0.2}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Mid-outer ring — indigo energy channel */}
        <mesh>
          <ringGeometry args={[radius * 0.72, radius * 0.735, 128]} />
          <meshStandardMaterial
            color={secondaryAccent}
            emissive={secondaryAccent}
            emissiveIntensity={0.45}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Mid ring — gold circuit */}
        <mesh>
          <ringGeometry args={[radius * 0.52, radius * 0.535, 128]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.6}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Compass tick marks — 36 for high density */}
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i / 36) * Math.PI * 2;
          const isMajor = i % 9 === 0;
          const isMed = i % 3 === 0;
          const innerR = radius * (isMajor ? 0.55 : isMed ? 0.65 : 0.72);
          const outerR = radius * 0.9;
          const x1 = Math.cos(angle) * innerR;
          const y1 = Math.sin(angle) * innerR;
          const x2 = Math.cos(angle) * outerR;
          const y2 = Math.sin(angle) * outerR;

          return (
            <line key={i}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array([x1, y1, 0, x2, y2, 0]), 3]}
                  count={2}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={isMajor ? accentColor : isMed ? secondaryAccent : "#3a3a60"}
                transparent
                opacity={isMajor ? 0.55 : isMed ? 0.3 : 0.12}
              />
            </line>
          );
        })}
      </group>

      {/* ── Inner rune ring — counter-rotating ── */}
      <group ref={innerRuneRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.465, 0]}>
        {/* Inner ritual ring */}
        <mesh>
          <ringGeometry args={[radius * 0.28, radius * 0.30, 96]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.9}
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Glyph marks — 8 cardinal runes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const r = radius * 0.41;
          const isMajor = i % 2 === 0;
          return (
            <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0]}>
              <boxGeometry args={[isMajor ? 0.12 : 0.06, isMajor ? 0.06 : 0.03, 0.002]} />
              <meshStandardMaterial
                color={isMajor ? accentColor : secondaryAccent}
                emissive={isMajor ? accentColor : secondaryAccent}
                emissiveIntensity={isMajor ? 0.8 : 0.4}
                transparent
                opacity={isMajor ? 0.5 : 0.25}
              />
            </mesh>
          );
        })}
      </group>

      {/* ── Cardinal energy nodes — 4 glowing circles at compass points ── */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => {
        const d = radius * 0.72;
        return (
          <group key={i}>
            {/* Node disc */}
            <mesh
              position={[Math.cos(angle) * d, -0.465, Math.sin(angle) * d]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[0.2, 16]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? accentColor : secondaryAccent}
                emissive={i % 2 === 0 ? accentColor : secondaryAccent}
                emissiveIntensity={1.2}
                transparent
                opacity={0.5}
              />
            </mesh>
            {/* Node glow halo */}
            <mesh
              position={[Math.cos(angle) * d, -0.47, Math.sin(angle) * d]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[0.35, 16]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? accentColor : secondaryAccent}
                emissive={i % 2 === 0 ? accentColor : secondaryAccent}
                emissiveIntensity={0.4}
                transparent
                opacity={0.12}
              />
            </mesh>
          </group>
        );
      })}

      {/* ── Radial energy channels — 8 lines from center to edge ── */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const innerR = radius * 0.26;
        const outerR = radius * 0.52;
        const cx = (Math.cos(angle) * (innerR + outerR)) / 2;
        const cz = (Math.sin(angle) * (innerR + outerR)) / 2;
        const length = outerR - innerR;

        return (
          <mesh
            key={i}
            position={[cx, -0.468, cz]}
            rotation={[0, -angle + Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.025, 0.003, length]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? accentColor : secondaryAccent}
              emissive={i % 2 === 0 ? accentColor : secondaryAccent}
              emissiveIntensity={0.6}
              transparent
              opacity={0.3}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        );
      })}

      {/* ── Edge glow — subtle platform rim ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <ringGeometry args={[radius - 0.06, radius, 64]} />
        <meshStandardMaterial
          color="#0a0a1e"
          emissive={secondaryAccent}
          emissiveIntensity={0.25}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
