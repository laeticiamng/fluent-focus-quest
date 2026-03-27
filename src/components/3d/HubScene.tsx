import { useRef, useState, useCallback, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Float,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { ESCAPE_ZONES, ZONE_TAB_MAP } from "@/data/escapeGame";
import { PremiumLighting, PremiumShadows } from "./premium/PremiumLighting";
import { PremiumFloor } from "./premium/PremiumFloor";
import { DecorativePillars, FloatingRings, AmbientParticles, BackgroundStructures, SuspendedArcs, FloatingArch, EnergyBeams, CinematicIntro, PulsingFloorVeins, HolographicDistortion, Fireflies, EnergyTrails, AnimatedFogLayers, AtmosphericHeightFog } from "./premium/DecorativeElements";
import { PremiumPostProcessing, GodRaySource } from "./premium/PostProcessing";
import { CinematicCameraBreathing } from "./premium/CinematicCamera";
import { VortexPortal } from "./premium/VortexPortalShader";
import { useQualityTier } from "@/hooks/useQualityTier";
import { getSceneLightingRig } from "./premium/SceneLightingConfig";

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

// ── Central Pillar (the Lazarus core) — SPECTACULAR FOCAL POINT ──
function CentralPillar({ sigilCount }: { sigilCount: number }) {
  const pillarRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const shieldRingRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ringRef.current) ringRef.current.rotation.y = t * 0.25;
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.18;
      ring2Ref.current.rotation.x = Math.sin(t * 0.12) * 0.25;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * 0.15;
      ring3Ref.current.rotation.x = Math.cos(t * 0.1) * 0.15;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.4;
      coreRef.current.rotation.x = Math.sin(t * 0.25) * 0.12;
    }
    if (shieldRingRef.current) {
      shieldRingRef.current.rotation.y = -t * 0.08;
    }
  });

  const sigilIntensity = sigilCount / 7;

  return (
    <group position={[0, 0, 0]}>
      {/* ── Grand tiered base — support stone ── */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.6, 0.2, 32]} />
        <meshStandardMaterial color="#121230" metalness={0.6} roughness={0.38} envMapIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.38, 0]} receiveShadow>
        <cylinderGeometry args={[2.6, 2.9, 0.15, 32]} />
        <meshStandardMaterial color="#181840" metalness={0.58} roughness={0.35} envMapIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.28, 0]} receiveShadow>
        <cylinderGeometry args={[2.0, 2.3, 0.12, 32]} />
        <meshStandardMaterial
          color="#1e1e48"
          metalness={0.55}
          roughness={0.35}
          emissive="#d4a017"
          emissiveIntensity={0.02 + sigilIntensity * 0.05}
        />
      </mesh>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.7, 0.08, 32]} />
        <meshStandardMaterial
          color="#222250"
          metalness={0.52}
          roughness={0.35}
          emissive="#d4a017"
          emissiveIntensity={0.04 + sigilIntensity * 0.08}
        />
      </mesh>

      {/* ── Base accent rings ── */}
      {[3.0, 2.4, 1.7].map((r, i) => (
        <mesh key={i} position={[0, -0.42 + i * 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.03, r, 64]} />
          <meshStandardMaterial
            color={i === 1 ? "#6366f1" : "#d4a017"}
            emissive={i === 1 ? "#6366f1" : "#d4a017"}
            emissiveIntensity={0.4 + sigilIntensity * 0.25}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* ── Central pillar column — support stone ── */}
      <mesh ref={pillarRef} position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.42, 2.6, 8]} />
        <meshStandardMaterial
          color="#181840"
          metalness={0.65}
          roughness={0.28}
          emissive="#d4a017"
          emissiveIntensity={0.06 + sigilIntensity * 0.3}
          envMapIntensity={0.4}
        />
      </mesh>

      {/* ── Pillar accent bands ── */}
      {[0.1, 0.6, 1.2, 1.8].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.34 + i * 0.005, 0.018, 8, 32]} />
          <meshStandardMaterial
            color="#d4a017"
            emissive="#d4a017"
            emissiveIntensity={0.8 + sigilIntensity * 0.4}
            metalness={1}
            roughness={0.05}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      {/* ── Shield ring system ── */}
      <group ref={shieldRingRef} position={[0, 1.2, 0]}>
        {[0, Math.PI / 3, Math.PI * 2 / 3].map((rot, i) => (
          <mesh key={i} rotation={[Math.PI / 2, rot, Math.PI / 6]}>
            <torusGeometry args={[0.7, 0.008, 8, 48]} />
            <meshStandardMaterial
              color="#6366f1"
              emissive="#6366f1"
              emissiveIntensity={0.35 + sigilIntensity * 0.25}
              metalness={1}
              roughness={0.05}
              transparent
              opacity={0.25}
            />
          </mesh>
        ))}
      </group>

      {/* ── Floating core — hero material ── */}
      <Float speed={1.2} floatIntensity={0.25} rotationIntensity={0.15}>
        <mesh ref={coreRef} position={[0, 3.0, 0]} castShadow>
          <icosahedronGeometry args={[0.35, 2]} />
          <meshPhysicalMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={1.0 + sigilIntensity * 2.0}
            metalness={0.3}
            roughness={0.05}
            envMapIntensity={1.5}
            clearcoat={1}
            clearcoatRoughness={0.08}
            iridescence={0.6}
            iridescenceIOR={1.8}
            transmission={0.5}
            thickness={1.5}
            ior={1.5}
          />
        </mesh>
        <HolographicDistortion
          position={[0, 3.0, 0]}
          radius={0.35}
          color="#fbbf24"
          secondaryColor="#6366f1"
          activated={sigilIntensity > 0.3}
        />
      </Float>

      {/* ── Primary floating ring ── */}
      <mesh ref={ringRef} position={[0, 2.8, 0]}>
        <torusGeometry args={[1.1, 0.025, 16, 64]} />
        <meshStandardMaterial
          color="#d4a017"
          emissive="#d4a017"
          emissiveIntensity={0.6 + sigilIntensity * 0.8}
          metalness={1}
          roughness={0.05}
        />
      </mesh>

      {/* ── Secondary ring — tilted indigo ── */}
      <mesh ref={ring2Ref} position={[0, 2.7, 0]} rotation={[0.5, 0, 0.35]}>
        <torusGeometry args={[1.35, 0.018, 16, 64]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.4 + sigilIntensity * 0.5}
          metalness={1}
          roughness={0.08}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* ── Third ring ── */}
      <mesh ref={ring3Ref} position={[0, 2.9, 0]} rotation={[0.8, 0.3, 0]}>
        <torusGeometry args={[0.85, 0.01, 16, 48]} />
        <meshStandardMaterial
          color="#d4a017"
          emissive="#d4a017"
          emissiveIntensity={0.25 + sigilIntensity * 0.35}
          metalness={1}
          roughness={0.05}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* ── Sigil indicators ── */}
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i / 7) * Math.PI * 2;
        const x = Math.cos(angle) * 0.7;
        const z = Math.sin(angle) * 0.7;
        const obtained = i < sigilCount;
        return (
          <Float key={i} speed={1.8} floatIntensity={obtained ? 0.12 : 0.03}>
            <mesh position={[x, 1.6 + (i % 2) * 0.3, z]}>
              <octahedronGeometry args={[obtained ? 0.11 : 0.05, 0]} />
              <meshStandardMaterial
                color={obtained ? "#fbbf24" : "#2a2a4a"}
                emissive={obtained ? "#fbbf24" : "#0e0e20"}
                emissiveIntensity={obtained ? 1.5 : 0.02}
                metalness={0.95}
                roughness={0.05}
              />
            </mesh>
          </Float>
        );
      })}

      {/* ── Light sources ── */}
      <pointLight
        position={[0, 3.0, 0]}
        intensity={1.8 + sigilIntensity * 3.5}
        color="#fbbf24"
        distance={14}
        decay={2}
      />
      <pointLight
        position={[0, 0.5, 0]}
        intensity={0.5 + sigilIntensity * 0.4}
        color="#6366f1"
        distance={8}
        decay={2}
      />
      <pointLight
        position={[0, -0.3, 0]}
        intensity={0.2}
        color="#d4a017"
        distance={6}
        decay={2}
      />
    </group>
  );
}

// ── Zone Portal — PREMIUM GATEWAY ──
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
  const veilTopRef = useRef<THREE.Mesh>(null);
  const veilBotRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5 + portal.position[0]) * 0.035;
    }
    if (glowRef.current) {
      const s = hovered ? 1.15 : 1;
      glowRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.08);
      if (portal.unlocked) {
        const pulse = Math.sin(t * 1.2 + portal.position[0] * 2) * 0.15 + 0.85;
        (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
          (hovered ? 3.5 : 1.8) * pulse;
      }
    }
    if (veilTopRef.current && veilBotRef.current && portal.unlocked) {
      const targetOffset = hovered ? 0.45 : 0;
      veilTopRef.current.position.y += (0.78 + 0.35 + targetOffset - veilTopRef.current.position.y) * 0.08;
      veilBotRef.current.position.y += (0.78 - 0.35 - targetOffset - veilBotRef.current.position.y) * 0.08;
      const veilOpacity = hovered ? 0.5 : 0.15;
      (veilTopRef.current.material as THREE.MeshStandardMaterial).opacity +=
        (veilOpacity - (veilTopRef.current.material as THREE.MeshStandardMaterial).opacity) * 0.08;
      (veilBotRef.current.material as THREE.MeshStandardMaterial).opacity +=
        (veilOpacity - (veilBotRef.current.material as THREE.MeshStandardMaterial).opacity) * 0.08;
    }
  });

  const handleClick = useCallback(() => {
    if (portal.unlocked) onNavigate(portal.tabTarget);
  }, [portal.unlocked, portal.tabTarget, onNavigate]);

  const opacity = portal.unlocked ? 1 : 0.3;

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
      {/* ── Left pillar ── */}
      <mesh position={[-0.48, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.075, 1.6, 8]} />
        <meshStandardMaterial
          color={portal.unlocked ? "#141434" : "#101028"}
          metalness={0.85}
          roughness={0.2}
          opacity={opacity}
          transparent={!portal.unlocked}
        />
      </mesh>
      <mesh position={[-0.48, 0.15, 0]}>
        <torusGeometry args={[0.065, 0.008, 8, 16]} />
        <meshStandardMaterial
          color={portal.color}
          emissive={portal.emissive}
          emissiveIntensity={portal.unlocked ? 0.6 : 0.02}
          metalness={0.95}
          roughness={0.05}
          opacity={opacity}
          transparent={!portal.unlocked}
        />
      </mesh>
      <mesh position={[-0.48, 0.02, 0]}>
        <sphereGeometry args={[0.065, 8, 8]} />
        <meshStandardMaterial
          color={portal.color}
          emissive={portal.emissive}
          emissiveIntensity={portal.unlocked ? 0.8 : 0.02}
          metalness={0.9}
          roughness={0.1}
          opacity={opacity}
          transparent={!portal.unlocked}
        />
      </mesh>

      {/* ── Right pillar ── */}
      <mesh position={[0.48, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.075, 1.6, 8]} />
        <meshStandardMaterial
          color={portal.unlocked ? "#141434" : "#101028"}
          metalness={0.85}
          roughness={0.2}
          opacity={opacity}
          transparent={!portal.unlocked}
        />
      </mesh>
      <mesh position={[0.48, 0.15, 0]}>
        <torusGeometry args={[0.065, 0.008, 8, 16]} />
        <meshStandardMaterial
          color={portal.color}
          emissive={portal.emissive}
          emissiveIntensity={portal.unlocked ? 0.6 : 0.02}
          metalness={0.95}
          roughness={0.05}
          opacity={opacity}
          transparent={!portal.unlocked}
        />
      </mesh>
      <mesh position={[0.48, 0.02, 0]}>
        <sphereGeometry args={[0.065, 8, 8]} />
        <meshStandardMaterial
          color={portal.color}
          emissive={portal.emissive}
          emissiveIntensity={portal.unlocked ? 0.8 : 0.02}
          metalness={0.9}
          roughness={0.1}
          opacity={opacity}
          transparent={!portal.unlocked}
        />
      </mesh>

      {/* ── Top arch beam ── */}
      <mesh position={[0, 1.58, 0]} castShadow>
        <boxGeometry args={[1.1, 0.07, 0.1]} />
        <meshStandardMaterial
          color={portal.color}
          emissive={portal.emissive}
          emissiveIntensity={portal.unlocked ? 0.55 : 0.02}
          metalness={0.85}
          roughness={0.15}
          opacity={opacity}
          transparent={!portal.unlocked}
        />
      </mesh>

      {/* ── Arch inner energy line ── */}
      {portal.unlocked && (
        <mesh position={[0, 1.52, 0.04]}>
          <boxGeometry args={[0.9, 0.015, 0.005]} />
          <meshStandardMaterial
            color={portal.emissive}
            emissive={portal.emissive}
            emissiveIntensity={1.2}
            transparent
            opacity={0.35}
          />
        </mesh>
      )}

      {/* ── Crown gem ── */}
      <Float speed={1.8} floatIntensity={portal.unlocked ? 0.12 : 0}>
        <mesh position={[0, 1.78, 0]}>
          <octahedronGeometry args={[0.09, 0]} />
          <meshStandardMaterial
            color={portal.color}
            emissive={portal.emissive}
            emissiveIntensity={portal.unlocked ? 2.0 : 0.06}
            metalness={1}
            roughness={0}
          />
        </mesh>
      </Float>

      {/* ── Portal inner — vortex for unlocked ── */}
      {portal.unlocked ? (
        <group position={[0, 0.78, 0.03]}>
          <VortexPortal
            width={0.82}
            height={1.4}
            color={portal.emissive.getStyle()}
            secondaryColor={portal.color.getStyle()}
            intensity={hovered ? 2.5 : 1.2}
            speed={hovered ? 1.5 : 0.8}
            activated={portal.unlocked}
          />
        </group>
      ) : (
        <mesh ref={glowRef} position={[0, 0.78, 0.03]}>
          <planeGeometry args={[0.82, 1.4]} />
          <meshStandardMaterial
            color={portal.emissive}
            emissive={portal.emissive}
            emissiveIntensity={0.02}
            transparent
            opacity={0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* ── Portal edge glow strips ── */}
      {portal.unlocked && (
        <>
          <mesh position={[-0.44, 0.78, 0.02]}>
            <planeGeometry args={[0.025, 1.35]} />
            <meshStandardMaterial
              color={portal.emissive}
              emissive={portal.emissive}
              emissiveIntensity={1.5}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0.44, 0.78, 0.02]}>
            <planeGeometry args={[0.025, 1.35]} />
            <meshStandardMaterial
              color={portal.emissive}
              emissive={portal.emissive}
              emissiveIntensity={1.5}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* ── Portal energy veil ── */}
      {portal.unlocked && (
        <>
          <mesh ref={veilTopRef} position={[0, 0.78 + 0.35, 0.025]}>
            <planeGeometry args={[0.75, 0.5]} />
            <meshStandardMaterial
              color={portal.emissive}
              emissive={portal.emissive}
              emissiveIntensity={1.0}
              transparent
              opacity={0.12}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh ref={veilBotRef} position={[0, 0.78 - 0.35, 0.025]}>
            <planeGeometry args={[0.75, 0.5]} />
            <meshStandardMaterial
              color={portal.emissive}
              emissive={portal.emissive}
              emissiveIntensity={1.0}
              transparent
              opacity={0.12}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* ── Lock icon ── */}
      {!portal.unlocked && (
        <mesh position={[0, 0.78, 0.06]}>
          <octahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial color="#2a2a48" metalness={0.7} roughness={0.3} />
        </mesh>
      )}

      {/* ── Progress ring ── */}
      {portal.unlocked && portal.progress > 0 && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.58, 0.65, 32, 1, 0, portal.progress * Math.PI * 2]} />
          <meshStandardMaterial
            color={portal.cleared ? "#10b981" : portal.emissive}
            emissive={portal.cleared ? "#10b981" : portal.emissive}
            emissiveIntensity={1.0}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* ── Base pedestal ── */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <cylinderGeometry args={[0.6, 0.7, 0.12, 8]} />
        <meshStandardMaterial
          color="#121230"
          metalness={0.7}
          roughness={0.28}
          emissive={portal.emissive}
          emissiveIntensity={portal.unlocked ? 0.04 : 0}
        />
      </mesh>
      <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.6, 16]} />
        <meshStandardMaterial
          color={portal.emissive}
          emissive={portal.emissive}
          emissiveIntensity={portal.unlocked ? 0.35 : 0.01}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Zone label ── */}
      <Html position={[0, -0.45, 0.2]} center distanceFactor={6}>
        <div
          className={`text-center pointer-events-none select-none ${portal.unlocked ? "" : "opacity-25"}`}
          style={{ whiteSpace: "nowrap" }}
        >
          <div className="text-lg drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]">{portal.icon}</div>
          <div
            className="text-[9px] font-bold mt-0.5"
            style={{
              color: portal.unlocked ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.4)",
              textShadow: `0 0 6px rgba(0,0,0,0.9), 0 0 12px ${portal.unlocked ? portal.emissive.getStyle() : "transparent"}`,
            }}
          >
            {portal.shortName}
          </div>
          {portal.unlocked && portal.cleared && (
            <div className="text-[7px] text-emerald-400 font-bold drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]">CLEAR</div>
          )}
        </div>
      </Html>

      {/* ── Point light ── */}
      {portal.unlocked && (
        <pointLight
          position={[0, 0.8, 0.5]}
          intensity={hovered ? 4.0 : 1.8}
          color={portal.emissive.getStyle()}
          distance={4.5}
          decay={2}
        />
      )}
    </group>
  );
}

// ── Camera Controller ──
function CameraSetup() {
  return <CinematicIntro targetPosition={[0, 6, 8]} startOffset={[0, 5, 8]} duration={2.8} />;
}

// ── Main Hub Scene ──
export function HubScene({ escapeZoneStatus, onNavigate, sigilCount }: HubSceneProps) {
  const quality = useQualityTier();
  const rig = useMemo(() => getSceneLightingRig("hub"), []);
  const godRaySunRef = useRef<THREE.Mesh>(null);
  const positions = getPortalPositions(ESCAPE_ZONES.length, 4.8);

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
    <div className="w-full rounded-2xl overflow-hidden relative" style={{ height: "clamp(320px, 52vh, 520px)" }}>
      <Canvas
        shadows
        camera={{ position: [0, 6, 8], fov: 46 }}
        dpr={quality.dpr}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.7,
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#080812");
        }}
      >
        <Suspense fallback={null}>
          <CameraSetup />
          <CinematicCameraBreathing fovBreath={0.8} breathSpeed={0.125} parallaxStrength={0.2} />

          {/* Per-scene cinematic lighting */}
          <PremiumLighting scene="hub" />

          {/* Scene-tuned fog */}
          <fog attach="fog" args={[rig.fogColor, rig.fogNear, rig.fogFar]} />

          {/* Premium floor */}
          <PremiumFloor radius={8} variant="circular" accentColor="#d4a017" secondaryAccent="#6366f1" reflective={quality.enableReflections} />

          {/* Decorative pillars */}
          <DecorativePillars count={8} radius={7.5} height={4} color="#101028" accentColor="#6366f1" />

          {/* Grand arches */}
          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
            <FloatingArch
              key={i}
              position={[Math.cos(angle) * 6.5, 0, Math.sin(angle) * 6.5]}
              rotation={[0, -angle + Math.PI / 2, 0]}
              scale={0.8}
              color="#0e0e28"
              accentColor={i % 2 === 0 ? "#d4a017" : "#6366f1"}
            />
          ))}

          {/* Floating rings */}
          <FloatingRings count={4} baseY={3.8} baseRadius={3.2} color="#d4a017" />

          {/* Suspended arcs */}
          <SuspendedArcs count={5} baseY={5} radius={6} color="#6366f1" />

          {/* Background structures */}
          {quality.enableBackgroundStructures && (
            <BackgroundStructures count={8} minRadius={16} maxRadius={24} height={7} color="#060614" />
          )}

          {/* Atmospheric height fog — per-scene tuned */}
          {quality.enableFogLayers && (
            <AtmosphericHeightFog
              groundColor={rig.heightFogGroundColor}
              midColor={rig.heightFogMidColor}
              baseY={rig.heightFogBaseY}
              radius={rig.heightFogRadius}
              groundOpacity={rig.heightFogGroundOpacity}
              midOpacity={rig.heightFogMidOpacity}
            />
          )}

          {/* Floor veins */}
          <PulsingFloorVeins count={16} innerRadius={2.5} outerRadius={7} y={-0.46} color="#d4a017" secondaryColor="#6366f1" />

          {/* Energy beams */}
          <EnergyBeams count={8} radius={7.5} height={4} color="#d4a017" secondaryColor="#6366f1" />

          {/* Particles */}
          {quality.enableParticles && (
            <AmbientParticles count={Math.round(55 * quality.particleMultiplier)} radius={8} height={6} color="#d4a017" secondaryColor="#6366f1" />
          )}

          {/* Energy trails */}
          {quality.enableEnergyTrails && (
            <EnergyTrails count={6} radius={5} height={4} color="#d4a017" secondaryColor="#6366f1" speed={0.25} />
          )}

          {/* Fog layers — per-scene tuned */}
          {quality.enableFogLayers && (
            <AnimatedFogLayers layers={rig.animFogLayers} baseY={rig.animFogBaseY} radius={rig.animFogRadius} color={rig.fogColor} maxOpacity={rig.animFogMaxOpacity} />
          )}

          {/* Fireflies */}
          {quality.enableFireflies && (
            <Fireflies count={Math.round(25 * quality.particleMultiplier)} radius={7} height={5} color="#fbbf24" secondaryColor="#6366f1" />
          )}

          {/* Central pillar */}
          <CentralPillar sigilCount={sigilCount} />

          {/* Zone portals */}
          {portals.map((portal) => (
            <ZonePortal key={portal.id} portal={portal} onNavigate={onNavigate} />
          ))}

          {/* Contact shadows */}
          {quality.enableContactShadows && (
            <PremiumShadows y={rig.shadowY} opacity={rig.shadowOpacity} scale={rig.shadowScale} blur={rig.shadowBlur} />
          )}

          {/* Post-processing */}
          <PremiumPostProcessing
            bloomIntensity={0.7}
            bloomThreshold={0.35}
            bloomSmoothing={0.65}
            vignetteOpacity={0.3}
            chromaticAberration={0.0003}
            qualityTier={quality.tier}
            aoRadius={0.5}
            aoIntensity={1.2}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={4}
            maxDistance={14}
            minPolarAngle={Math.PI / 7}
            maxPolarAngle={Math.PI / 2.4}
            autoRotate
            autoRotateSpeed={0.2}
            dampingFactor={0.06}
            enableDamping
          />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
