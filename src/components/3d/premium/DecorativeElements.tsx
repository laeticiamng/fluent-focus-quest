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
 * Fresnel portal energy field — view-angle-dependent glow effect.
 * Brighter at grazing angles for an ethereal energy curtain look.
 */
export function FresnelPortalField({
  width = 0.82,
  height = 1.4,
  color = "#6366f1",
  intensity = 1.5,
  activated = true,
}: {
  width?: number;
  height?: number;
  color?: string;
  intensity?: number;
  activated?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const shaderData = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec2 vUv;
      void main() {
        float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.5);
        float scanline = sin(vUv.y * 40.0 + uTime * 2.0) * 0.05 + 0.95;
        float shimmer = sin(uTime * 3.0 + vUv.y * 8.0) * 0.1 + 0.9;
        float alpha = fresnel * 0.6 * scanline * shimmer * uIntensity;
        vec3 finalColor = uColor * (1.0 + fresnel * 0.5);
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
  }), [color, intensity]);

  useFrame(({ clock }) => {
    if (matRef.current && activated) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  if (!activated) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        ref={matRef}
        args={[shaderData]}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Holographic label panel — 3D billboard text display.
 * Floating translucent panel with subtle animated shimmer border.
 */
export function HolographicLabel({
  text,
  subtext,
  position = [0, 0, 0] as [number, number, number],
  color = "#ffffff",
  accentColor = "#6366f1",
  visible = true,
  scale = 1,
}: {
  text: string;
  subtext?: string;
  position?: [number, number, number];
  color?: string;
  accentColor?: string;
  visible?: boolean;
  scale?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    if (groupRef.current && visible) {
      groupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  if (!visible) return null;

  const panelWidth = 0.8 * scale;
  const panelHeight = (subtext ? 0.35 : 0.22) * scale;

  return (
    <group ref={groupRef} position={position}>
      {/* Background panel — dark translucent */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[panelWidth, panelHeight]} />
        <meshBasicMaterial
          color="#060618"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Top border accent line */}
      <mesh position={[0, panelHeight / 2 - 0.005 * scale, 0]}>
        <planeGeometry args={[panelWidth * 0.85, 0.008 * scale]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>

      {/* Bottom border accent line */}
      <mesh position={[0, -panelHeight / 2 + 0.005 * scale, 0]}>
        <planeGeometry args={[panelWidth * 0.85, 0.005 * scale]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Corner dots */}
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sy], i) => (
        <mesh key={i} position={[sx * panelWidth * 0.42, sy * panelHeight * 0.42, 0.001]}>
          <circleGeometry args={[0.008 * scale, 6]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Pulsing energy veins on floor — animated radial lines that glow and fade.
 * Creates living "circuitry" effect on the ground.
 */
export function PulsingFloorVeins({
  count = 12,
  innerRadius = 2,
  outerRadius = 7,
  y = -0.46,
  color = "#d4a017",
  secondaryColor = "#6366f1",
}: {
  count?: number;
  innerRadius?: number;
  outerRadius?: number;
  y?: number;
  color?: string;
  secondaryColor?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (mat && mat.opacity !== undefined) {
        const wave = Math.sin(t * 1.2 + i * (Math.PI * 2 / count)) * 0.5 + 0.5;
        mat.opacity = 0.05 + wave * 0.25;
        mat.emissiveIntensity = 0.2 + wave * 0.8;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const length = outerRadius - innerRadius;
        const midR = (innerRadius + outerRadius) / 2;
        const cx = Math.cos(angle) * midR;
        const cz = Math.sin(angle) * midR;
        const veinColor = i % 3 === 0 ? secondaryColor : color;

        return (
          <mesh
            key={i}
            position={[cx, y, cz]}
            rotation={[0, -angle + Math.PI / 2, 0]}
          >
            <boxGeometry args={[0.02, 0.002, length]} />
            <meshStandardMaterial
              color={veinColor}
              emissive={veinColor}
              emissiveIntensity={0.4}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Holographic distortion shell — animated outer aura around a core gem.
 * Creates a pulsating, slightly offset double-shell for depth and glow.
 */
export function HolographicDistortion({
  position = [0, 0, 0] as [number, number, number],
  radius = 0.45,
  color = "#fbbf24",
  secondaryColor = "#6366f1",
  activated = false,
}: {
  position?: [number, number, number];
  radius?: number;
  color?: string;
  secondaryColor?: string;
  activated?: boolean;
}) {
  const shell1Ref = useRef<THREE.Mesh>(null);
  const shell2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (shell1Ref.current) {
      const s1 = 1 + Math.sin(t * 1.8) * 0.08;
      shell1Ref.current.scale.setScalar(s1);
      shell1Ref.current.rotation.y = t * 0.3;
      shell1Ref.current.rotation.x = Math.sin(t * 0.4) * 0.1;
      const mat = shell1Ref.current.material as THREE.MeshStandardMaterial;
      mat.opacity = (activated ? 0.18 : 0.08) + Math.sin(t * 2.5) * 0.06;
    }

    if (shell2Ref.current) {
      const s2 = 1 + Math.sin(t * 1.2 + 1) * 0.12;
      shell2Ref.current.scale.setScalar(s2);
      shell2Ref.current.rotation.y = -t * 0.2;
      shell2Ref.current.rotation.z = Math.cos(t * 0.3) * 0.08;
      const mat = shell2Ref.current.material as THREE.MeshStandardMaterial;
      mat.opacity = (activated ? 0.12 : 0.05) + Math.sin(t * 1.8 + 2) * 0.04;
    }
  });

  return (
    <group position={position}>
      {/* Inner distortion shell */}
      <mesh ref={shell1Ref}>
        <icosahedronGeometry args={[radius * 1.15, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={activated ? 1.5 : 0.4}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          depthWrite={false}
          wireframe
        />
      </mesh>

      {/* Outer aura shell */}
      <mesh ref={shell2Ref}>
        <icosahedronGeometry args={[radius * 1.4, 1]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={secondaryColor}
          emissiveIntensity={activated ? 0.8 : 0.2}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Fireflies — erratic luminous points with bright emissive glow.
 * Wander randomly with smooth noise-like motion for organic life.
 */
export function Fireflies({
  count = 20,
  radius = 6,
  height = 4,
  color = "#fbbf24",
  secondaryColor = "#6366f1",
}: {
  count?: number;
  radius?: number;
  height?: number;
  color?: string;
  secondaryColor?: string;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const flies = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * radius * 2,
      y: Math.random() * height,
      z: (Math.random() - 0.5) * radius * 2,
      speedX: 0.3 + Math.random() * 0.6,
      speedY: 0.2 + Math.random() * 0.5,
      speedZ: 0.3 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      wanderRadius: 0.8 + Math.random() * 1.5,
      isGold: Math.random() > 0.4,
      pulseSpeed: 1.5 + Math.random() * 2,
    }));
  }, [count, radius, height]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    flies.forEach((f, i) => {
      // Erratic wandering with multiple sine waves
      const wx = f.x + Math.sin(t * f.speedX + f.phase) * f.wanderRadius + Math.sin(t * f.speedX * 1.7 + f.phase * 2) * f.wanderRadius * 0.3;
      const wy = f.y + Math.sin(t * f.speedY + f.phase * 1.5) * 0.8;
      const wz = f.z + Math.cos(t * f.speedZ + f.phase) * f.wanderRadius + Math.cos(t * f.speedZ * 1.3 + f.phase * 3) * f.wanderRadius * 0.2;
      
      dummy.position.set(wx, wy, wz);
      // Pulsing scale — fireflies blink
      const pulse = Math.sin(t * f.pulseSpeed + f.phase) * 0.5 + 0.5;
      const s = 0.02 + pulse * 0.04;
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
        emissiveIntensity={5}
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  );
}

/**
 * Thematic particles — zone-specific effects (embers, spores, sparks).
 */
export function ThematicParticles({
  count = 25,
  radius = 5,
  height = 3,
  color = "#f59e0b",
  variant = "embers",
}: {
  count?: number;
  radius?: number;
  height?: number;
  color?: string;
  variant?: "embers" | "spores" | "sparks";
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * radius * 2,
      y: Math.random() * height,
      z: (Math.random() - 0.5) * radius * 2,
      speed: variant === "embers" ? 0.3 + Math.random() * 0.4 : variant === "sparks" ? 0.8 + Math.random() * 1.2 : 0.1 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
      rise: variant === "embers" ? 0.3 + Math.random() * 0.5 : variant === "sparks" ? 0.1 : -0.05 + Math.random() * 0.1,
      scale: variant === "sparks" ? 0.008 + Math.random() * 0.012 : 0.012 + Math.random() * 0.02,
    }));
  }, [count, radius, height, variant]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      let y = p.y + (t * p.rise) % height;
      if (y > height) y -= height;
      if (y < 0) y += height;

      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.phase) * 0.6,
        y,
        p.z + Math.cos(t * p.speed + p.phase) * 0.6
      );
      const flicker = variant === "sparks" ? (Math.sin(t * 8 + p.phase) * 0.5 + 0.5) : 1;
      dummy.scale.setScalar(p.scale * flicker);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const emissiveIntensity = variant === "embers" ? 4 : variant === "sparks" ? 6 : 2;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        transparent
        opacity={0.7}
      />
    </instancedMesh>
  );
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

/**
 * Energy Trails — luminous lines that flow along curved paths.
 * Creates circulating energy currents in the scene.
 */
export function EnergyTrails({
  count = 5,
  radius = 4,
  height = 3,
  color = "#d4a017",
  secondaryColor = "#6366f1",
  speed = 0.3,
}: {
  count?: number;
  radius?: number;
  height?: number;
  color?: string;
  secondaryColor?: string;
  speed?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const trailLength = 20;
  const totalInstances = count * trailLength;

  const trails = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      baseAngle: (i / count) * Math.PI * 2,
      baseY: 0.5 + Math.random() * (height - 1),
      orbitRadius: radius * (0.5 + Math.random() * 0.5),
      speed: speed * (0.7 + Math.random() * 0.6),
      phase: Math.random() * Math.PI * 2,
      yOscillation: 0.5 + Math.random() * 1.0,
      isGold: Math.random() > 0.4,
    }));
  }, [count, radius, height, speed]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    trails.forEach((trail, ti) => {
      for (let j = 0; j < trailLength; j++) {
        const delay = j * 0.08;
        const tOffset = t * trail.speed - delay;
        const angle = trail.baseAngle + tOffset;
        
        const x = Math.cos(angle) * trail.orbitRadius;
        const z = Math.sin(angle) * trail.orbitRadius;
        const y = trail.baseY + Math.sin(tOffset * 1.5 + trail.phase) * trail.yOscillation;

        dummy.position.set(x, y, z);
        // Trail particles fade and shrink toward tail
        const fade = 1 - j / trailLength;
        const s = 0.025 * fade * fade;
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(ti * trailLength + j, dummy.matrix);
      }
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, totalInstances]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={4}
        transparent
        opacity={0.7}
      />
    </instancedMesh>
  );
}

/**
 * Animated Fog Layers — horizontal planes of rolling mist.
 * Uses animated noise-like opacity for living atmosphere.
 */
export function AnimatedFogLayers({
  layers = 3,
  baseY = -0.2,
  radius = 10,
  color = "#0e0e28",
  maxOpacity = 0.2,
}: {
  layers?: number;
  baseY?: number;
  radius?: number;
  color?: string;
  maxOpacity?: number;
}) {
  const refs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      // Each layer moves slightly and pulses opacity
      mesh.position.x = Math.sin(t * 0.05 + i * 2) * 0.5;
      mesh.position.z = Math.cos(t * 0.04 + i * 1.5) * 0.5;
      mesh.rotation.z = t * 0.008 * (i % 2 === 0 ? 1 : -1);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = maxOpacity * (0.5 + Math.sin(t * 0.2 + i * 1.2) * 0.5);
    });
  });

  return (
    <group>
      {Array.from({ length: layers }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) refs.current[i] = el; }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, baseY + i * 0.8, 0]}
        >
          <circleGeometry args={[radius * (1 - i * 0.15), 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={maxOpacity * (1 - i * 0.25)}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Atmospheric Height Fog — multi-strata volumetric mist.
 * Creates depth through graduated density layers at different heights.
 * More credible than flat fog — adds mystery, depth, and air.
 */
export function AtmosphericHeightFog({
  groundColor = "#0a0a1e",
  midColor = "#0e0e28",
  baseY = -0.5,
  radius = 12,
  groundOpacity = 0.18,
  midOpacity = 0.08,
}: {
  groundColor?: string;
  midColor?: string;
  baseY?: number;
  radius?: number;
  groundOpacity?: number;
  midOpacity?: number;
}) {
  const groundRef = useRef<THREE.Mesh>(null);
  const mid1Ref = useRef<THREE.Mesh>(null);
  const mid2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groundRef.current) {
      groundRef.current.position.x = Math.sin(t * 0.03) * 0.3;
      groundRef.current.position.z = Math.cos(t * 0.025) * 0.3;
      const mat = groundRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = groundOpacity * (0.7 + Math.sin(t * 0.15) * 0.3);
    }
    if (mid1Ref.current) {
      mid1Ref.current.position.x = Math.sin(t * 0.02 + 1.5) * 0.6;
      mid1Ref.current.position.z = Math.cos(t * 0.018 + 2) * 0.5;
      const mat = mid1Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = midOpacity * (0.5 + Math.sin(t * 0.12 + 1) * 0.5);
    }
    if (mid2Ref.current) {
      mid2Ref.current.position.x = Math.cos(t * 0.025 + 3) * 0.7;
      mid2Ref.current.position.z = Math.sin(t * 0.02 + 4) * 0.4;
      const mat = mid2Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = midOpacity * 0.6 * (0.5 + Math.sin(t * 0.1 + 2.5) * 0.5);
    }
  });

  return (
    <group>
      {/* Ground-hugging dense layer */}
      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, baseY + 0.05, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial
          color={groundColor}
          transparent
          opacity={groundOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Mid stratum 1 — thinner, wider drift */}
      <mesh ref={mid1Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, baseY + 1.2, 0]}>
        <circleGeometry args={[radius * 0.85, 32]} />
        <meshBasicMaterial
          color={midColor}
          transparent
          opacity={midOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Mid stratum 2 — highest, lightest */}
      <mesh ref={mid2Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, baseY + 2.5, 0]}>
        <circleGeometry args={[radius * 0.65, 32]} />
        <meshBasicMaterial
          color={midColor}
          transparent
          opacity={midOpacity * 0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
