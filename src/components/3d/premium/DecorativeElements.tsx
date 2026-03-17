import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * Floating decorative pillars arranged in a circle.
 * Evokes a "temple" / "forge linguistique" aesthetic.
 */
export function DecorativePillars({
  count = 8,
  radius = 6,
  height = 3,
  color = "#1e2040",
  accentColor = "#6366f1",
}: {
  count?: number;
  radius?: number;
  height?: number;
  color?: string;
  accentColor?: string;
}) {
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const isMajor = i % 2 === 0;

        return (
          <group key={i} position={[x, 0, z]}>
            {/* Pillar body */}
            <mesh position={[0, height / 2 - 0.5, 0]} castShadow>
              <cylinderGeometry args={[isMajor ? 0.12 : 0.08, isMajor ? 0.15 : 0.1, height, 6]} />
              <meshStandardMaterial
                color={color}
                metalness={0.7}
                roughness={0.25}
                emissive={accentColor}
                emissiveIntensity={0.05}
              />
            </mesh>

            {/* Pillar cap — glowing */}
            <mesh position={[0, height - 0.3, 0]}>
              <octahedronGeometry args={[isMajor ? 0.1 : 0.07, 0]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={accentColor}
                emissiveIntensity={1.2}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>

            {/* Subtle light at top of major pillars */}
            {isMajor && (
              <pointLight
                position={[0, height - 0.2, 0]}
                intensity={0.4}
                color={accentColor}
                distance={4}
                decay={2}
              />
            )}

            {/* Base accent ring */}
            <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.2, 0.25, 16]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={accentColor}
                emissiveIntensity={0.5}
                transparent
                opacity={0.3}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Floating rings that orbit slowly — evokes energy / tech feel.
 */
export function FloatingRings({
  count = 3,
  baseY = 2,
  baseRadius = 2.5,
  color = "#d4a017",
}: {
  count?: number;
  baseY?: number;
  baseRadius?: number;
  color?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.rotation.x = Math.sin(clock.getElapsedTime() * 0.2 + i * 1.2) * 0.3;
        child.rotation.z = Math.cos(clock.getElapsedTime() * 0.15 + i * 0.8) * 0.2;
        child.rotation.y = clock.getElapsedTime() * (0.08 + i * 0.03);
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, baseY, 0]}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i}>
          <torusGeometry args={[baseRadius + i * 0.6, 0.015 + i * 0.005, 16, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6 - i * 0.15}
            metalness={1}
            roughness={0.1}
            transparent
            opacity={0.4 - i * 0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Ambient floating particles — subtle sparkle effect.
 */
export function AmbientParticles({
  count = 60,
  radius = 6,
  height = 4,
  color = "#d4a017",
  secondaryColor = "#6366f1",
}: {
  count?: number;
  radius?: number;
  height?: number;
  color?: string;
  secondaryColor?: string;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * radius * 2,
      y: Math.random() * height - 0.5,
      z: (Math.random() - 0.5) * radius * 2,
      speed: 0.2 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      scale: 0.02 + Math.random() * 0.03,
      isGold: Math.random() > 0.4,
    }));
  }, [count, radius, height]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.phase) * 0.3,
        p.y + Math.sin(t * p.speed * 0.5 + p.phase) * 0.5,
        p.z + Math.cos(t * p.speed + p.phase) * 0.3
      );
      const s = p.scale * (0.7 + Math.sin(t * 2 + p.phase) * 0.3);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0.6}
      />
    </instancedMesh>
  );
}

/**
 * Floating arches — architectural decoration for hub/map scenes.
 */
export function FloatingArch({
  position = [0, 0, 0] as [number, number, number],
  rotation = [0, 0, 0] as [number, number, number],
  scale = 1,
  color = "#1e2040",
  accentColor = "#d4a017",
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
  accentColor?: string;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Left pillar */}
      <mesh position={[-0.8, 1, 0]} castShadow>
        <boxGeometry args={[0.15, 2.2, 0.15]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Right pillar */}
      <mesh position={[0.8, 1, 0]} castShadow>
        <boxGeometry args={[0.15, 2.2, 0.15]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Arch top */}
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[1.75, 0.12, 0.15]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Accent gems at top corners */}
      <mesh position={[-0.8, 2.3, 0]}>
        <octahedronGeometry args={[0.05, 0]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.5} metalness={1} roughness={0} />
      </mesh>
      <mesh position={[0.8, 2.3, 0]}>
        <octahedronGeometry args={[0.05, 0]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.5} metalness={1} roughness={0} />
      </mesh>
    </group>
  );
}

/**
 * Subtle fog plane — adds depth layering.
 */
export function DepthFogPlane({
  y = -0.3,
  radius = 10,
  color = "#1a1a35",
  opacity = 0.3,
}: {
  y?: number;
  radius?: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <circleGeometry args={[radius, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
