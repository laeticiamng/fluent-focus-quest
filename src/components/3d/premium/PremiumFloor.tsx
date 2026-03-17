import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Premium floor with subtle reflections, rune circles, and circuit patterns.
 * Creates a "forge linguistique" / "medical command center" feel.
 */
export function PremiumFloor({
  radius = 8,
  variant = "circular",
  accentColor = "#d4a017",
  secondaryAccent = "#6366f1",
}: {
  radius?: number;
  variant?: "circular" | "square";
  accentColor?: string;
  secondaryAccent?: string;
}) {
  const runeRingRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (runeRingRef.current) {
      runeRingRef.current.rotation.z = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group>
      {/* Main floor surface — slightly reflective dark indigo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        {variant === "circular" ? (
          <circleGeometry args={[radius, 64]} />
        ) : (
          <planeGeometry args={[radius * 2, radius * 2]} />
        )}
        <meshStandardMaterial
          color="#1c1c3a"
          metalness={0.55}
          roughness={0.35}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Subtle inner floor highlight — lighter center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        {variant === "circular" ? (
          <circleGeometry args={[radius * 0.6, 64]} />
        ) : (
          <planeGeometry args={[radius * 1.2, radius * 1.2]} />
        )}
        <meshStandardMaterial
          color="#222244"
          metalness={0.5}
          roughness={0.4}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Decorative rune rings — rotating slowly */}
      <group ref={runeRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        {/* Outer rune circle */}
        <mesh>
          <ringGeometry args={[radius * 0.85, radius * 0.87, 128]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.6}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Middle accent ring */}
        <mesh>
          <ringGeometry args={[radius * 0.55, radius * 0.56, 128]} />
          <meshStandardMaterial
            color={secondaryAccent}
            emissive={secondaryAccent}
            emissiveIntensity={0.4}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Inner ring — gold */}
        <mesh>
          <ringGeometry args={[radius * 0.3, radius * 0.315, 128]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.8}
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Rune tick marks — like compass marks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const isMajor = i % 6 === 0;
          const innerR = radius * (isMajor ? 0.6 : 0.7);
          const outerR = radius * 0.82;
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
                color={isMajor ? accentColor : secondaryAccent}
                transparent
                opacity={isMajor ? 0.5 : 0.2}
              />
            </line>
          );
        })}
      </group>

      {/* Corner accent glows — cardinal directions */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => {
        const d = radius * 0.7;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * d, -0.47, Math.sin(angle) * d]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.15, 16]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? accentColor : secondaryAccent}
              emissive={i % 2 === 0 ? accentColor : secondaryAccent}
              emissiveIntensity={1.0}
              transparent
              opacity={0.5}
            />
          </mesh>
        );
      })}

      {/* Edge glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
        <ringGeometry args={[radius - 0.05, radius, 64]} />
        <meshStandardMaterial
          color="#0a0a20"
          emissive={secondaryAccent}
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
