import { useRef, useState, useCallback, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Float,
  Text,
  MeshTransmissionMaterial,
  ContactShadows,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { ESCAPE_ZONES, ZONE_TAB_MAP } from "@/data/escapeGame";

// ── Types ──
interface ZonePortal {
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

// ── Central Pillar (the Lazarus core) ──
function CentralPillar({ sigilCount }: { sigilCount: number }) {
  const pillarRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  const sigilIntensity = sigilCount / 7;

  return (
    <group position={[0, 0, 0]}>
      {/* Base platform */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 3, 0.3, 32]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Central pillar */}
      <mesh ref={pillarRef} position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 2.2, 8]} />
        <meshStandardMaterial
          color="#16213e"
          metalness={0.9}
          roughness={0.2}
          emissive={new THREE.Color("#d4a017")}
          emissiveIntensity={0.1 + sigilIntensity * 0.4}
        />
      </mesh>

      {/* Floating ring */}
      <mesh ref={ringRef} position={[0, 2.2, 0]}>
        <torusGeometry args={[0.8, 0.05, 16, 48]} />
        <meshStandardMaterial
          color="#d4a017"
          emissive="#d4a017"
          emissiveIntensity={0.3 + sigilIntensity * 0.7}
          metalness={1}
          roughness={0.1}
        />
      </mesh>

      {/* Sigil indicators on the pillar */}
      {Array.from({ length: 7 }).map((_, i) => {
        const angle = (i / 7) * Math.PI * 2;
        const x = Math.cos(angle) * 0.55;
        const z = Math.sin(angle) * 0.55;
        const obtained = i < sigilCount;
        return (
          <mesh key={i} position={[x, 1.5 + (i % 2) * 0.2, z]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial
              color={obtained ? "#f59e0b" : "#333"}
              emissive={obtained ? "#f59e0b" : "#000"}
              emissiveIntensity={obtained ? 0.8 : 0}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        );
      })}

      {/* Ambient point light */}
      <pointLight
        position={[0, 2, 0]}
        intensity={0.5 + sigilIntensity * 1.5}
        color="#d4a017"
        distance={8}
        decay={2}
      />
    </group>
  );
}

// ── Zone Portal (a door/arch leading to a zone) ──
function ZonePortal({
  portal,
  onNavigate,
}: {
  portal: ZonePortal;
  onNavigate: (tab: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Subtle floating
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.8 + portal.position[0]) * 0.05;
    }
    if (glowRef.current) {
      const s = hovered ? 1.15 : 1;
      glowRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    }
  });

  const handleClick = useCallback(() => {
    if (portal.unlocked) {
      onNavigate(portal.tabTarget);
    }
  }, [portal.unlocked, portal.tabTarget, onNavigate]);

  const opacity = portal.unlocked ? 1 : 0.3;

  // Direction to face center
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
      {/* Portal arch - two pillars + top */}
      <group>
        {/* Left pillar */}
        <mesh position={[-0.4, 0.6, 0]} castShadow>
          <boxGeometry args={[0.12, 1.2, 0.12]} />
          <meshStandardMaterial
            color={portal.color}
            metalness={0.7}
            roughness={0.3}
            opacity={opacity}
            transparent={!portal.unlocked}
          />
        </mesh>
        {/* Right pillar */}
        <mesh position={[0.4, 0.6, 0]} castShadow>
          <boxGeometry args={[0.12, 1.2, 0.12]} />
          <meshStandardMaterial
            color={portal.color}
            metalness={0.7}
            roughness={0.3}
            opacity={opacity}
            transparent={!portal.unlocked}
          />
        </mesh>
        {/* Top arch */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <boxGeometry args={[0.92, 0.1, 0.14]} />
          <meshStandardMaterial
            color={portal.color}
            metalness={0.8}
            roughness={0.2}
            opacity={opacity}
            transparent={!portal.unlocked}
          />
        </mesh>

        {/* Portal inner glow */}
        <mesh ref={glowRef} position={[0, 0.6, 0.02]}>
          <planeGeometry args={[0.68, 1.1]} />
          <meshStandardMaterial
            color={portal.emissive}
            emissive={portal.emissive}
            emissiveIntensity={portal.unlocked ? (hovered ? 1.2 : 0.4) : 0.05}
            transparent
            opacity={portal.unlocked ? (hovered ? 0.6 : 0.25) : 0.05}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Lock icon for locked portals */}
        {!portal.unlocked && (
          <mesh position={[0, 0.6, 0.05]}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial color="#444" metalness={0.8} roughness={0.3} />
          </mesh>
        )}

        {/* Progress ring at base */}
        {portal.unlocked && portal.progress > 0 && (
          <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.58, 32, 1, 0, portal.progress * Math.PI * 2]} />
            <meshStandardMaterial
              color={portal.cleared ? "#10b981" : portal.emissive}
              emissive={portal.cleared ? "#10b981" : portal.emissive}
              emissiveIntensity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Zone label */}
        <Html position={[0, -0.3, 0.2]} center distanceFactor={6}>
          <div
            className={`text-center pointer-events-none select-none ${portal.unlocked ? "" : "opacity-30"}`}
            style={{ whiteSpace: "nowrap" }}
          >
            <div className="text-lg">{portal.icon}</div>
            <div className="text-[9px] font-bold text-white/80 mt-0.5">{portal.shortName}</div>
            {portal.unlocked && portal.cleared && (
              <div className="text-[7px] text-emerald-400 font-bold">CLEAR</div>
            )}
          </div>
        </Html>

        {/* Point light for each portal */}
        {portal.unlocked && (
          <pointLight
            position={[0, 0.6, 0.3]}
            intensity={hovered ? 1.5 : 0.3}
            color={portal.emissive.getStyle()}
            distance={3}
            decay={2}
          />
        )}
      </group>
    </group>
  );
}

// ── Floor ──
function Floor() {
  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial
          color="#12122a"
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Decorative rings on floor */}
      {[3, 5, 7].map((r, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
          <ringGeometry args={[r - 0.02, r, 64]} />
          <meshStandardMaterial
            color="#d4a017"
            emissive="#d4a017"
            emissiveIntensity={0.15 - i * 0.03}
            transparent
            opacity={0.2 - i * 0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Camera Controller ──
function CameraSetup() {
  const { camera } = useThree();
  useFrame(() => {
    // Slight drift
    camera.position.y += (5.5 - camera.position.y) * 0.02;
  });
  return null;
}

// ── Main Hub Scene ──
export function HubScene({ escapeZoneStatus, onNavigate, sigilCount }: HubSceneProps) {
  const positions = getPortalPositions(ESCAPE_ZONES.length, 4.5);

  const portals: ZonePortal[] = ESCAPE_ZONES.map((zone, i) => {
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
        camera={{ position: [0, 5.5, 7], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <CameraSetup />

          {/* Lighting — brighter for readability while keeping atmosphere */}
          <ambientLight intensity={0.35} color="#9999dd" />
          <directionalLight
            position={[5, 8, 3]}
            intensity={0.6}
            color="#ffe4b5"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={20}
            shadow-camera-near={0.1}
          />
          <pointLight position={[0, 4, 0]} intensity={0.5} color="#d4a017" distance={12} decay={2} />
          <pointLight position={[-4, 3, 4]} intensity={0.2} color="#6366f1" distance={10} decay={2} />

          {/* Fog for atmosphere — pushed back for visibility */}
          <fog attach="fog" args={["#0a0a20", 10, 22]} />

          {/* Floor */}
          <Floor />

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

          {/* Contact shadows */}
          <ContactShadows
            position={[0, -0.49, 0]}
            opacity={0.4}
            scale={16}
            blur={2}
            far={4}
          />

          {/* Orbit controls — constrained for guided experience */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={4}
            maxDistance={12}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            autoRotate
            autoRotateSpeed={0.3}
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
