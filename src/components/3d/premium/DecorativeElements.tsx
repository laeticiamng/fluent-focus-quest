import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * Temple pillars — premium architectural columns with
 * tiered bases, accent bands, and crowned caps.
 * Major pillars get arched connections.
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
            {/* Pillar base — tiered pedestal */}
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[isMajor ? 0.2 : 0.14, isMajor ? 0.24 : 0.17, 0.15, 8]} />
              <meshStandardMaterial
                color="#141430"
                metalness={0.7}
                roughness={0.25}
                emissive={accentColor}
                emissiveIntensity={0.03}
              />
            </mesh>

            {/* Pillar body — tapered column */}
            <mesh position={[0, height / 2 - 0.25, 0]} castShadow>
              <cylinderGeometry args={[isMajor ? 0.1 : 0.065, isMajor ? 0.14 : 0.09, height, 8]} />
              <meshStandardMaterial
                color={color}
                metalness={0.75}
                roughness={0.2}
                emissive={accentColor}
                emissiveIntensity={0.03}
              />
            </mesh>

            {/* Accent bands at 1/3 and 2/3 height */}
            {isMajor && [height * 0.33, height * 0.66].map((bandY, bi) => (
              <mesh key={bi} position={[0, bandY - 0.25, 0]}>
                <torusGeometry args={[0.12, 0.012, 8, 24]} />
                <meshStandardMaterial
                  color={accentColor}
                  emissive={accentColor}
                  emissiveIntensity={0.6}
                  metalness={1}
                  roughness={0.05}
                  transparent
                  opacity={0.5}
                />
              </mesh>
            ))}

            {/* Capital — ornate top piece */}
            <mesh position={[0, height - 0.15, 0]}>
              <cylinderGeometry args={[isMajor ? 0.16 : 0.1, isMajor ? 0.1 : 0.065, 0.15, 8]} />
              <meshStandardMaterial
                color="#1a1a3a"
                metalness={0.7}
                roughness={0.2}
              />
            </mesh>

            {/* Crown gem — glowing octahedron */}
            <Float speed={1.5} floatIntensity={isMajor ? 0.08 : 0.04}>
              <mesh position={[0, height + 0.05, 0]}>
                <octahedronGeometry args={[isMajor ? 0.1 : 0.06, 0]} />
                <meshStandardMaterial
                  color={accentColor}
                  emissive={accentColor}
                  emissiveIntensity={1.5}
                  metalness={0.95}
                  roughness={0.05}
                />
              </mesh>
            </Float>

            {/* Point light on major pillars */}
            {isMajor && (
              <pointLight
                position={[0, height + 0.1, 0]}
                intensity={0.5}
                color={accentColor}
                distance={5}
                decay={2}
              />
            )}

            {/* Base accent ring — glowing circle */}
            <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.22, 0.28, 16]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={accentColor}
                emissiveIntensity={0.5}
                transparent
                opacity={0.25}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Floating orbital rings — tech-arcane energy bands.
 * Nested counter-rotating tori with varying thickness and opacity.
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
      const t = clock.getElapsedTime();
      groupRef.current.children.forEach((child, i) => {
        child.rotation.x = Math.sin(t * 0.18 + i * 1.4) * 0.35;
        child.rotation.z = Math.cos(t * 0.12 + i * 0.9) * 0.25;
        child.rotation.y = t * (0.06 + i * 0.025) * (i % 2 === 0 ? 1 : -1);
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, baseY, 0]}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i}>
          <torusGeometry args={[baseRadius + i * 0.7, 0.012 + i * 0.004, 16, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.7 - i * 0.12}
            metalness={1}
            roughness={0.08}
            transparent
            opacity={0.45 - i * 0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Ambient floating particles — noble sparkle with dual-color system.
 * Instanced rendering for performance.
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
      speed: 0.15 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
      scale: 0.015 + Math.random() * 0.025,
      isGold: Math.random() > 0.35,
    }));
  }, [count, radius, height]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.phase) * 0.4,
        p.y + Math.sin(t * p.speed * 0.4 + p.phase) * 0.6,
        p.z + Math.cos(t * p.speed + p.phase) * 0.4
      );
      const s = p.scale * (0.6 + Math.sin(t * 1.8 + p.phase) * 0.4);
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
        emissiveIntensity={2.5}
        transparent
        opacity={0.55}
      />
    </instancedMesh>
  );
}

/**
 * Floating arches — grand architectural gateways.
 * Wider, more ornate, with energy line accent and gem crowns.
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
      <mesh position={[-0.9, 1.1, 0]} castShadow>
        <boxGeometry args={[0.14, 2.4, 0.14]} />
        <meshStandardMaterial color={color} metalness={0.75} roughness={0.2} />
      </mesh>
      {/* Left pillar accent band */}
      <mesh position={[-0.9, 1.8, 0]}>
        <torusGeometry args={[0.09, 0.01, 8, 16]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} metalness={1} roughness={0.05} transparent opacity={0.4} />
      </mesh>

      {/* Right pillar */}
      <mesh position={[0.9, 1.1, 0]} castShadow>
        <boxGeometry args={[0.14, 2.4, 0.14]} />
        <meshStandardMaterial color={color} metalness={0.75} roughness={0.2} />
      </mesh>
      {/* Right pillar accent band */}
      <mesh position={[0.9, 1.8, 0]}>
        <torusGeometry args={[0.09, 0.01, 8, 16]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} metalness={1} roughness={0.05} transparent opacity={0.4} />
      </mesh>

      {/* Arch lintel */}
      <mesh position={[0, 2.4, 0]}>
        <boxGeometry args={[1.95, 0.12, 0.14]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Inner energy line */}
      <mesh position={[0, 2.3, 0.06]}>
        <boxGeometry args={[1.65, 0.02, 0.01]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1.5}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Crown gems at corners */}
      {[-0.9, 0, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 2.55, 0]}>
          <octahedronGeometry args={[i === 1 ? 0.07 : 0.04, 0]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={i === 1 ? 2.0 : 1.2}
            metalness={1}
            roughness={0}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Background depth structures — silhouettes at distance to imply vastness.
 * Very dark, subtle, far away. Gives "world beyond the arena" feeling.
 */
export function BackgroundStructures({
  count = 6,
  minRadius = 14,
  maxRadius = 22,
  height = 6,
  color = "#0c0c22",
}: {
  count?: number;
  minRadius?: number;
  maxRadius?: number;
  height?: number;
  color?: string;
}) {
  const structures = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const dist = minRadius + Math.random() * (maxRadius - minRadius);
      const h = height * (0.4 + Math.random() * 0.6);
      const w = 0.3 + Math.random() * 0.5;
      return { angle, dist, h, w, type: Math.random() > 0.5 ? "tower" : "monolith" };
    });
  }, [count, minRadius, maxRadius, height]);

  return (
    <group>
      {structures.map((s, i) => {
        const x = Math.cos(s.angle) * s.dist;
        const z = Math.sin(s.angle) * s.dist;
        return (
          <group key={i} position={[x, 0, z]}>
            {s.type === "tower" ? (
              <mesh position={[0, s.h / 2, 0]}>
                <cylinderGeometry args={[s.w * 0.6, s.w, s.h, 6]} />
                <meshStandardMaterial
                  color={color}
                  metalness={0.4}
                  roughness={0.6}
                  emissive="#0a0a1a"
                  emissiveIntensity={0.05}
                />
              </mesh>
            ) : (
              <mesh position={[0, s.h / 2, 0]}>
                <boxGeometry args={[s.w, s.h, s.w * 0.4]} />
                <meshStandardMaterial
                  color={color}
                  metalness={0.4}
                  roughness={0.6}
                  emissive="#0a0a1a"
                  emissiveIntensity={0.05}
                />
              </mesh>
            )}
            {/* Faint crown light */}
            <mesh position={[0, s.h + 0.1, 0]}>
              <sphereGeometry args={[0.06, 6, 6]} />
              <meshStandardMaterial
                color="#6366f1"
                emissive="#6366f1"
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
 * Suspended energy arcs — thin luminous curves floating above the scene.
 * Adds vertical interest and "technology" feeling.
 */
export function SuspendedArcs({
  count = 4,
  baseY = 4,
  radius = 5,
  color = "#d4a017",
}: {
  count?: number;
  baseY?: number;
  radius?: number;
  color?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = baseY + Math.sin(i * 1.5) * 0.8;

        return (
          <group key={i} position={[x, y, z]} rotation={[0, angle + Math.PI / 2, Math.PI * 0.12]}>
            <mesh>
              <torusGeometry args={[1.5, 0.008, 8, 32, Math.PI * 0.6]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
                transparent
                opacity={0.3}
                metalness={1}
                roughness={0.05}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Vertical energy beams — luminous columns connecting sentinel pillars to core.
 * Animated opacity pulsing for living energy feel.
 */
export function EnergyBeams({
  count = 4,
  radius = 2.1,
  height = 3,
  color = "#d4a017",
  secondaryColor = "#6366f1",
  activated = false,
}: {
  count?: number;
  radius?: number;
  height?: number;
  color?: string;
  secondaryColor?: string;
  activated?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (mat && mat.opacity !== undefined) {
        mat.opacity = 0.08 + Math.sin(t * 1.5 + i * 1.2) * 0.06;
        mat.emissiveIntensity = (activated ? 1.5 : 0.6) + Math.sin(t * 2 + i * 0.8) * 0.3;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const beamColor = i % 2 === 0 ? color : secondaryColor;
        return (
          <mesh key={i} position={[x, height / 2 + 0.1, z]}>
            <cylinderGeometry args={[0.015, 0.015, height, 6]} />
            <meshStandardMaterial
              color={beamColor}
              emissive={beamColor}
              emissiveIntensity={0.6}
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Cinematic camera intro — smooth dolly-zoom on first load.
 * Animates from far/high to resting position over ~2.5 seconds.
 */
export function CinematicIntro({
  targetPosition = [0, 6, 8] as [number, number, number],
  startOffset = [0, 4, 6] as [number, number, number],
  duration = 2.5,
}: {
  targetPosition?: [number, number, number];
  startOffset?: [number, number, number];
  duration?: number;
}) {
  const startedRef = useRef(false);
  const startTimeRef = useRef(0);

  useFrame(({ camera, clock }) => {
    if (!startedRef.current) {
      startedRef.current = true;
      startTimeRef.current = clock.getElapsedTime();
      camera.position.set(
        targetPosition[0] + startOffset[0],
        targetPosition[1] + startOffset[1],
        targetPosition[2] + startOffset[2],
      );
    }

    const elapsed = clock.getElapsedTime() - startTimeRef.current;
    if (elapsed < duration) {
      const progress = elapsed / duration;
      // Smooth ease-out cubic
      const t = 1 - Math.pow(1 - progress, 3);

      camera.position.x = (targetPosition[0] + startOffset[0]) + (targetPosition[0] - (targetPosition[0] + startOffset[0])) * t;
      camera.position.y = (targetPosition[1] + startOffset[1]) + (targetPosition[1] - (targetPosition[1] + startOffset[1])) * t;
      camera.position.z = (targetPosition[2] + startOffset[2]) + (targetPosition[2] - (targetPosition[2] + startOffset[2])) * t;
    }
  });

  return null;
}

/**
 * Depth fog plane — horizontal fog layer for atmosphere.
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
