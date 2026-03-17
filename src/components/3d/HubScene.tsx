import { useRef, useState, useCallback, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Float,
  ContactShadows,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { ESCAPE_ZONES, ZONE_TAB_MAP } from "@/data/escapeGame";
import { PremiumLighting, PremiumShadows } from "./premium/PremiumLighting";
import { PremiumFloor } from "./premium/PremiumFloor";
import { DecorativePillars, FloatingRings, AmbientParticles } from "./premium/DecorativeElements";
import { PremiumPostProcessing } from "./premium/PostProcessing";

// ── Types ──
interface ZonePortalData {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  tabTarget: string;
  color: THREE.Color;
  emissive: THREE.Color;
  position: [number, number, number];
  unlocked: boolean;
  progress: number;
  cleared: boolean;
}

interface HubSceneProps {
  escapeZoneStatus: Record<string, {
    unlocked: boolean;
    roomsSolved: number;
    totalRooms: number;
    progress: number;
  }>;
  onNavigate: (tab: string) => void;
  sigilCount: number;
}

// ── Zone color mapping ──
const ZONE_PORTAL_COLORS: Record<string, { color: string; emissive: string }> = {
  forge: { color: "#f59e0b", emissive: "#d97706" },
  grammar: { color: "#10b981", emissive: "#059669" },
  studio: { color: "#8b5cf6", emissive: "#7c3aed" },
  clinical: { color: "#f43f5e", emissive: "#e11d48" },
  laboratory: { color: "#3b82f6", emissive: "#2563eb" },
  archive: { color: "#06b6d4", emissive: "#0891b2" },
  aerzterat: { color: "#6366f1", emissive: "#4f46e5" },
};

// ── Portal positions in a circle ──
function getPortalPositions(count: number, radius: number): [number, number, number][] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [number, number, number];
  });
}

// ── Central Pillar (the Lazarus core) — PREMIUM ──
function CentralPillar({ sigilCount }: { sigilCount: number }) {
  const pillarRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) ringRef.current.rotation.y = t * 0.3;
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.2;
      ring2Ref.current.rotation.x = Math.sin(t * 0.15) * 0.2;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.5;
      coreRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
    }
  });

  const sigilIntensity = sigilCount / 7;

  return (
    <group position={[0, 0, 0]}>
      {/* Tiered base platform */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[2.8, 3.2, 0.25, 32]} />
        <meshStandardMaterial color="#1e1e3e" metalness={0.7} roughness={0.3} envMapIntensity={0.5} />
      </mesh>
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.5, 0.15, 32]} />
        <meshStandardMaterial color="#252550" metalness={0.65} roughness={0.3} envMapIntensity={0.5} />
      </mesh>
      <mesh position={[0, -0.22, 0]} receiveShadow>
        <cylinderGeometry args={[1.6, 1.8, 0.12, 32]} />
        <meshStandardMaterial
          color="#2a2a55"
          metalness={0.6}
          roughness={0.3}
          emissive="#d4a017"
          emissiveIntensity={0.05 + sigilIntensity * 0.1}
        />
      </mesh>

      {/* Central pillar — refined octagonal with glow lines */}
      <mesh ref={pillarRef} position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.45, 2.4, 8]} />
        <meshStandardMaterial
          color="#202048"
          metalness={0.8}
          roughness={0.2}
          emissive="#d4a017"
          emissiveIntensity={0.1 + sigilIntensity * 0.4}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Pillar accent bands */}
      {[0.3, 1.0, 1.7].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.38 + i * 0.01, 0.02, 8, 32]} />
          <meshStandardMaterial
            color="#d4a017"
            emissive="#d4a017"
            emissiveIntensity={0.8 + sigilIntensity * 0.5}
            metalness={1}
            roughness={0.05}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      {/* Floating core — icosahedron */}
      <Float speed={1.5} floatIntensity={0.3} rotationIntensity={0.2}>
        <mesh ref={coreRef} position={[0, 2.8, 0]} castShadow>
          <icosahedronGeometry args={[0.25, 1]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={1.0 + sigilIntensity * 2.0}
            metalness={0.95}
            roughness={0.05}
          />
        </mesh>
      </Float>

      {/* Primary floating ring */}
      <mesh ref={ringRef} position={[0, 2.5, 0]}>
        <torusGeometry args={[0.9, 0.03, 16, 64]} />
        <meshStandardMaterial
          color="#d4a017"
          emissive="#d4a017"
          emissiveIntensity={0.6 + sigilIntensity * 1.0}
          metalness={1}
          roughness={0.05}
        />
      </mesh>

      {/* Secondary floating ring — tilted */}
      <mesh ref={ring2Ref} position={[0, 2.5, 0]} rotation={[0.4, 0, 0.3]}>
        <torusGeometry args={[1.1, 0.02, 16, 64]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.4 + sigilIntensity * 0.6}
          metalness={1}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Sigil indicators on the pillar — orbiting */}
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i / 7) * Math.PI * 2;
        const x = Math.cos(angle) * 0.6;
        const z = Math.sin(angle) * 0.6;
        const obtained = i < sigilCount;
        return (
          <Float key={i} speed={2} floatIntensity={obtained ? 0.15 : 0.05}>
            <mesh position={[x, 1.5 + (i % 2) * 0.25, z]}>
              <octahedronGeometry args={[obtained ? 0.1 : 0.06, 0]} />
              <meshStandardMaterial
                color={obtained ? "#fbbf24" : "#3a3a5a"}
                emissive={obtained ? "#fbbf24" : "#1a1a30"}
                emissiveIntensity={obtained ? 1.5 : 0.05}
                metalness={0.95}
                roughness={0.05}
              />
            </mesh>
          </Float>
        );
      })}

      {/* Core point light */}
      <pointLight
        position={[0, 2.8, 0]}
        intensity={1.5 + sigilIntensity * 3}
        color="#fbbf24"
        distance={12}
        decay={2}
      />
      {/* Base glow */}
      <pointLight
        position={[0, 0, 0]}
        intensity={0.5 + sigilIntensity * 0.5}
        color="#6366f1"
        distance={6}
        decay={2}
      />
    </group>
  );
}

// ── Zone Portal — PREMIUM ──
function ZonePortal({
  portal,
  onNavigate,
}: {
  portal: ZonePortalData;
  onNavigate: (tab: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.6 + portal.position[0]) * 0.04;
    }
    if (glowRef.current) {
      const s = hovered ? 1.12 : 1;
      glowRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.08);
      // Pulsing glow
      if (portal.unlocked) {
        const pulse = Math.sin(t * 1.5 + portal.position[0] * 2) * 0.15 + 0.85;
        (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
          (hovered ? 3.0 : 1.5) * pulse;
      }
    }
  });

  const handleClick = useCallback(() => {
    if (portal.unlocked) onNavigate(portal.tabTarget);
  }, [portal.unlocked, portal.tabTarget, onNavigate]);

  const opacity = portal.unlocked ? 1 : 0.35;

  const lookAtCenter = useMemo(() => {
    const dir = new THREE.Vector3(-portal.position[0], 0, -portal.position[2]).normalize();
    return Math.atan2(dir.x, dir.z);
  }, [portal.position]);

  return (
    <group
      ref={groupRef}
      position={portal.position}
      rotation={[0, lookAtCenter, 0]}
      onClick={handleClick}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = portal.unlocked ? "pointer" : "not-allowed"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
    >
      <group ref={frameRef}>
        {/* Left pillar — tapered with accent */}
        <mesh position={[-0.45, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 1.5, 6]} />
          <meshStandardMaterial
            color={portal.unlocked ? "#1e2045" : "#1a1a2e"}
            metalness={0.75}
            roughness={0.2}
            opacity={opacity}
            transparent={!portal.unlocked}
          />
        </mesh>
        <mesh position={[-0.45, 0.05, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color={portal.color}
            emissive={portal.emissive}
            emissiveIntensity={portal.unlocked ? 0.8 : 0.05}
            metalness={0.9}
            roughness={0.1}
            opacity={opacity}
            transparent={!portal.unlocked}
          />
        </mesh>

        {/* Right pillar */}
        <mesh position={[0.45, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 1.5, 6]} />
          <meshStandardMaterial
            color={portal.unlocked ? "#1e2045" : "#1a1a2e"}
            metalness={0.75}
            roughness={0.2}
            opacity={opacity}
            transparent={!portal.unlocked}
          />
        </mesh>
        <mesh position={[0.45, 0.05, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color={portal.color}
            emissive={portal.emissive}
            emissiveIntensity={portal.unlocked ? 0.8 : 0.05}
            metalness={0.9}
            roughness={0.1}
            opacity={opacity}
            transparent={!portal.unlocked}
          />
        </mesh>

        {/* Top arch — arched beam with emissive accent */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[1.05, 0.08, 0.1]} />
          <meshStandardMaterial
            color={portal.color}
            emissive={portal.emissive}
            emissiveIntensity={portal.unlocked ? 0.6 : 0.05}
            metalness={0.8}
            roughness={0.15}
            opacity={opacity}
            transparent={!portal.unlocked}
          />
        </mesh>

        {/* Crown gem */}
        <Float speed={2} floatIntensity={portal.unlocked ? 0.15 : 0}>
          <mesh position={[0, 1.7, 0]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial
              color={portal.color}
              emissive={portal.emissive}
              emissiveIntensity={portal.unlocked ? 2.0 : 0.1}
              metalness={1}
              roughness={0}
            />
          </mesh>
        </Float>

        {/* Portal inner glow — the "energy field" */}
        <mesh ref={glowRef} position={[0, 0.75, 0.02]}>
          <planeGeometry args={[0.78, 1.35]} />
          <meshStandardMaterial
            color={portal.emissive}
            emissive={portal.emissive}
            emissiveIntensity={portal.unlocked ? (hovered ? 3.0 : 1.5) : 0.05}
            transparent
            opacity={portal.unlocked ? (hovered ? 0.65 : 0.35) : 0.05}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Portal edge glow strips */}
        {portal.unlocked && (
          <>
            <mesh position={[-0.42, 0.75, 0.01]}>
              <planeGeometry args={[0.03, 1.3]} />
              <meshStandardMaterial
                color={portal.emissive}
                emissive={portal.emissive}
                emissiveIntensity={1.5}
                transparent
                opacity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0.42, 0.75, 0.01]}>
              <planeGeometry args={[0.03, 1.3]} />
              <meshStandardMaterial
                color={portal.emissive}
                emissive={portal.emissive}
                emissiveIntensity={1.5}
                transparent
                opacity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}

        {/* Lock icon for locked portals */}
        {!portal.unlocked && (
          <mesh position={[0, 0.75, 0.05]}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial color="#3a3a55" metalness={0.7} roughness={0.35} />
          </mesh>
        )}

        {/* Progress ring at base */}
        {portal.unlocked && portal.progress > 0 && (
          <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.55, 0.62, 32, 1, 0, portal.progress * Math.PI * 2]} />
            <meshStandardMaterial
              color={portal.cleared ? "#10b981" : portal.emissive}
              emissive={portal.cleared ? "#10b981" : portal.emissive}
              emissiveIntensity={1.0}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Base pedestal for each portal */}
        <mesh position={[0, -0.15, 0]} receiveShadow>
          <cylinderGeometry args={[0.55, 0.65, 0.12, 8]} />
          <meshStandardMaterial
            color="#1e1e3e"
            metalness={0.6}
            roughness={0.3}
            emissive={portal.emissive}
            emissiveIntensity={portal.unlocked ? 0.05 : 0}
          />
        </mesh>

        {/* Zone label */}
        <Html position={[0, -0.4, 0.2]} center distanceFactor={6}>
          <div
            className={`text-center pointer-events-none select-none ${portal.unlocked ? "" : "opacity-30"}`}
            style={{ whiteSpace: "nowrap" }}
          >
            <div className="text-lg">{portal.icon}</div>
            <div className="text-[9px] font-bold text-white/90 mt-0.5 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
              {portal.shortName}
            </div>
            {portal.unlocked && portal.cleared && (
              <div className="text-[7px] text-emerald-400 font-bold">CLEAR</div>
            )}
          </div>
        </Html>

        {/* Point light for each portal */}
        {portal.unlocked && (
          <pointLight
            position={[0, 0.8, 0.4]}
            intensity={hovered ? 4.0 : 1.5}
            color={portal.emissive.getStyle()}
            distance={4}
            decay={2}
          />
        )}
      </group>
    </group>
  );
}

// ── Camera Controller ──
function CameraSetup() {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.y += (5.5 - camera.position.y) * 0.02;
  });
  return null;
}

// ── Main Hub Scene — PREMIUM ──
export function HubScene({ escapeZoneStatus, onNavigate, sigilCount }: HubSceneProps) {
  const positions = getPortalPositions(ESCAPE_ZONES.length, 4.5);

  const portals: ZonePortalData[] = ESCAPE_ZONES.map((zone, i) => {
    const status = escapeZoneStatus[zone.id];
    const colors = ZONE_PORTAL_COLORS[zone.id] || { color: "#888", emissive: "#444" };
    return {
      id: zone.id,
      name: zone.name,
      shortName: zone.name.replace("Aile de la ", "").replace("Aile de l'", "").replace("Aile du ", "").replace("Aile d'", "").replace("Laboratoire de ", "").replace("Archives ", "").replace("Der ", "").slice(0, 14),
      icon: zone.icon,
      tabTarget: ZONE_TAB_MAP[zone.id] || "dash",
      color: new THREE.Color(colors.color),
      emissive: new THREE.Color(colors.emissive),
      position: positions[i],
      unlocked: status?.unlocked ?? false,
      progress: status?.progress ?? 0,
      cleared: status ? status.roomsSolved === status.totalRooms : false,
    };
  });

  return (
    <div className="w-full rounded-2xl overflow-hidden relative" style={{ height: "clamp(320px, 50vh, 480px)" }}>
      <Canvas
        shadows
        camera={{ position: [0, 5.5, 7], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5,
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#0c0c1e");
        }}
      >
        <Suspense fallback={null}>
          <CameraSetup />

          {/* Premium cinematic lighting */}
          <PremiumLighting preset="default" accentColor="#d4a017" rimColor="#6366f1" />

          {/* Fog — deep, cinematic */}
          <fog attach="fog" args={["#0e0e22", 12, 30]} />

          {/* Premium floor with rune patterns */}
          <PremiumFloor radius={8} variant="circular" accentColor="#d4a017" secondaryAccent="#6366f1" />

          {/* Decorative architecture — pillars around the hub */}
          <DecorativePillars count={8} radius={7} height={3.5} color="#181838" accentColor="#6366f1" />

          {/* Floating orbital rings above scene */}
          <FloatingRings count={3} baseY={3.5} baseRadius={3} color="#d4a017" />

          {/* Ambient particles */}
          <AmbientParticles count={50} radius={7} height={5} color="#d4a017" secondaryColor="#6366f1" />

          {/* Central Lazarus pillar */}
          <CentralPillar sigilCount={sigilCount} />

          {/* Zone portals */}
          {portals.map((portal) => (
            <ZonePortal
              key={portal.id}
              portal={portal}
              onNavigate={onNavigate}
            />
          ))}

          {/* Premium shadows */}
          <PremiumShadows y={-0.49} opacity={0.35} scale={18} />

          {/* Post-processing — bloom + vignette */}
          <PremiumPostProcessing
            bloomIntensity={0.7}
            bloomThreshold={0.35}
            bloomSmoothing={0.5}
            vignetteOpacity={0.35}
          />

          {/* Orbit controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={4}
            maxDistance={12}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            autoRotate
            autoRotateSpeed={0.25}
            dampingFactor={0.08}
            enableDamping
          />
        </Suspense>
      </Canvas>

      {/* Gradient overlay at bottom for text readability */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
