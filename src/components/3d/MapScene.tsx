import { useRef, useState, useCallback, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Html, Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { ESCAPE_ZONES, ZONE_TAB_MAP } from "@/data/escapeGame";
import type { RoomStatus } from "@/data/escapeGame";
import type { Artifact } from "@/hooks/useProgress";
import { PremiumLighting, PremiumShadows } from "./premium/PremiumLighting";
import { AmbientParticles } from "./premium/DecorativeElements";
import { PremiumPostProcessing } from "./premium/PostProcessing";

interface MapSceneProps {
  escapeZoneStatus: Record<string, {
    unlocked: boolean;
    roomsSolved: number;
    totalRooms: number;
    progress: number;
    rooms: Array<{ id: string; status: RoomStatus; progress: number }>;
  }>;
  artifacts: Artifact[];
  onNavigate: (tab: string) => void;
  sigilsCollected: string[];
  selectedZone: string | null;
  onSelectZone: (zoneId: string | null) => void;
}

// Zone layout: complex-like arrangement
const ZONE_LAYOUT: Record<string, { pos: [number, number, number]; scale: number }> = {
  forge: { pos: [-3.5, 0, -2], scale: 1 },
  grammar: { pos: [-1.5, 0, -3.5], scale: 1 },
  studio: { pos: [1.5, 0, -3.5], scale: 1 },
  clinical: { pos: [3.5, 0, -2], scale: 1 },
  laboratory: { pos: [0, 0, 0], scale: 1.3 },
  archive: { pos: [-2.5, 0, 2.5], scale: 1 },
  aerzterat: { pos: [2.5, 0, 2.5], scale: 1.1 },
};

const ZONE_COLORS_3D: Record<string, string> = {
  forge: "#f59e0b",
  grammar: "#10b981",
  studio: "#8b5cf6",
  clinical: "#f43f5e",
  laboratory: "#3b82f6",
  archive: "#06b6d4",
  aerzterat: "#6366f1",
};

// ── Zone Building — PREMIUM ──
function ZoneBuilding({
  zone,
  status,
  layout,
  isSelected,
  onSelect,
  onNavigate,
}: {
  zone: typeof ESCAPE_ZONES[0];
  status: MapSceneProps["escapeZoneStatus"][string];
  layout: { pos: [number, number, number]; scale: number };
  isSelected: boolean;
  onSelect: () => void;
  onNavigate: (tab: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = ZONE_COLORS_3D[zone.id] || "#888";
  const isLocked = !status?.unlocked;
  const isCleared = status ? status.roomsSolved === status.totalRooms : false;
  const roomCount = zone.rooms.length;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      const targetY = isSelected ? 0.35 : hovered ? 0.15 : 0;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.08;
    }
    if (beaconRef.current) {
      beaconRef.current.rotation.y = t * 0.8;
      const pulse = Math.sin(t * 2) * 0.1 + 0.9;
      beaconRef.current.scale.setScalar(pulse);
    }
  });

  const handleClick = useCallback(() => {
    if (isLocked) return;
    onSelect();
  }, [isLocked, onSelect]);

  const handleDoubleClick = useCallback(() => {
    if (isLocked) return;
    onNavigate(ZONE_TAB_MAP[zone.id] || "dash");
  }, [isLocked, zone.id, onNavigate]);

  const buildingHeight = 0.6 + (status?.progress ?? 0) * 1.0;
  const baseColor = isLocked ? "#1e1e35" : color;
  const emissiveIntensity = isLocked ? 0.02 : isSelected ? 1.4 : hovered ? 0.8 : 0.4;

  return (
    <group
      ref={groupRef}
      position={layout.pos}
      scale={layout.scale}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = isLocked ? "not-allowed" : "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
    >
      {/* Base platform — tiered, premium */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.2, 0.15, 8]} />
        <meshStandardMaterial
          color={isLocked ? "#181830" : "#1e1e40"}
          metalness={0.6}
          roughness={0.3}
          envMapIntensity={0.4}
        />
      </mesh>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.9, 1.0, 0.1, 8]} />
        <meshStandardMaterial
          color={isLocked ? "#1a1a32" : "#222245"}
          metalness={0.55}
          roughness={0.35}
          emissive={new THREE.Color(baseColor)}
          emissiveIntensity={isLocked ? 0 : 0.05}
        />
      </mesh>

      {/* Accent ring on platform */}
      {!isLocked && (
        <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.85, 0.9, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Main building body — more refined */}
      <mesh position={[0, buildingHeight / 2 + 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.65, buildingHeight, 8]} />
        <meshStandardMaterial
          color={baseColor}
          metalness={0.5}
          roughness={0.35}
          emissive={new THREE.Color(baseColor)}
          emissiveIntensity={emissiveIntensity}
          transparent={isLocked}
          opacity={isLocked ? 0.3 : 1}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Building accent bands */}
      {!isLocked && [0.3, 0.6].filter(h => h < buildingHeight).map((h, i) => (
        <mesh key={i} position={[0, h, 0]}>
          <torusGeometry args={[0.58 + i * 0.02, 0.015, 8, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            metalness={1}
            roughness={0.05}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}

      {/* Roof / crown */}
      <mesh position={[0, buildingHeight + 0.1, 0]} castShadow>
        <coneGeometry args={[0.45, 0.4, 8]} />
        <meshStandardMaterial
          color={isCleared ? "#10b981" : baseColor}
          metalness={0.7}
          roughness={0.2}
          emissive={new THREE.Color(isCleared ? "#10b981" : baseColor)}
          emissiveIntensity={isCleared ? 1.0 : emissiveIntensity * 0.5}
          transparent={isLocked}
          opacity={isLocked ? 0.3 : 1}
        />
      </mesh>

      {/* Beacon at top */}
      {!isLocked && (
        <Float speed={2} floatIntensity={0.1}>
          <mesh ref={beaconRef} position={[0, buildingHeight + 0.45, 0]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial
              color={isCleared ? "#10b981" : color}
              emissive={isCleared ? "#10b981" : color}
              emissiveIntensity={2.0}
              metalness={1}
              roughness={0}
            />
          </mesh>
        </Float>
      )}

      {/* Room indicators — orbiting around base */}
      {zone.rooms.map((room, i) => {
        const roomStatus = status?.rooms?.find(r => r.id === room.id);
        const angle = (i / roomCount) * Math.PI * 2;
        const rx = Math.cos(angle) * 0.8;
        const rz = Math.sin(angle) * 0.8;
        const isSolved = roomStatus?.status === "solved";
        const isAccessible = roomStatus?.status === "accessible" || roomStatus?.status === "in_progress";
        return (
          <mesh key={room.id} position={[rx, 0.08, rz]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color={isSolved ? "#10b981" : isAccessible ? color : "#2a2a45"}
              emissive={new THREE.Color(isSolved ? "#10b981" : isAccessible ? color : "#111")}
              emissiveIntensity={isSolved ? 1.2 : isAccessible ? 0.6 : 0.02}
              metalness={0.8}
              roughness={0.15}
            />
          </mesh>
        );
      })}

      {/* Zone light */}
      {!isLocked && (
        <pointLight
          position={[0, buildingHeight + 0.6, 0]}
          intensity={isSelected ? 3.0 : hovered ? 1.5 : 0.6}
          color={color}
          distance={5}
          decay={2}
        />
      )}

      {/* Label */}
      <Html position={[0, -0.55, 0]} center distanceFactor={8}>
        <div className={`text-center pointer-events-none select-none ${isLocked ? "opacity-20" : ""}`}>
          <div className="text-base">{zone.icon}</div>
          <div className="text-[8px] font-bold text-white/80 whitespace-nowrap drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
            {zone.name.replace("Aile de la ", "").replace("Aile de l'", "").replace("Aile du ", "").replace("Aile d'", "").replace("Laboratoire de ", "Labo ").replace("Archives ", "Archives").replace("Der ", "").slice(0, 16)}
          </div>
          {!isLocked && status && (
            <div className="text-[7px] text-white/50 mt-0.5">
              {status.roomsSolved}/{status.totalRooms}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ── Connectors — PREMIUM luminous paths ──
function Connectors({ escapeZoneStatus }: { escapeZoneStatus: MapSceneProps["escapeZoneStatus"] }) {
  const connections = [
    { from: "forge", to: "grammar" },
    { from: "grammar", to: "studio" },
    { from: "studio", to: "clinical" },
    { from: "clinical", to: "laboratory" },
    { from: "forge", to: "laboratory" },
    { from: "laboratory", to: "archive" },
    { from: "studio", to: "aerzterat" },
    { from: "clinical", to: "aerzterat" },
  ];

  return (
    <group>
      {connections.map((c, i) => {
        const start = new THREE.Vector3(...ZONE_LAYOUT[c.from].pos);
        const end = new THREE.Vector3(...ZONE_LAYOUT[c.to].pos);
        const dir = end.clone().sub(start);
        const length = dir.length();
        const center = start.clone().add(end).multiplyScalar(0.5);
        center.y = -0.48;
        const bothUnlocked = escapeZoneStatus[c.from]?.unlocked && escapeZoneStatus[c.to]?.unlocked;

        return (
          <group key={i}>
            {/* Main connector */}
            <mesh position={[center.x, center.y, center.z]} rotation={[0, Math.atan2(dir.x, dir.z), 0]}>
              <boxGeometry args={[0.05, 0.015, length]} />
              <meshStandardMaterial
                color={bothUnlocked ? "#d4a017" : "#2a2a45"}
                emissive={bothUnlocked ? "#d4a017" : "#1a1a30"}
                emissiveIntensity={bothUnlocked ? 0.8 : 0.05}
                transparent
                opacity={bothUnlocked ? 0.7 : 0.3}
                metalness={0.8}
                roughness={0.15}
              />
            </mesh>
            {/* Glow connector underneath */}
            {bothUnlocked && (
              <mesh position={[center.x, center.y - 0.01, center.z]} rotation={[0, Math.atan2(dir.x, dir.z), 0]}>
                <boxGeometry args={[0.15, 0.005, length]} />
                <meshStandardMaterial
                  color="#d4a017"
                  emissive="#d4a017"
                  emissiveIntensity={0.4}
                  transparent
                  opacity={0.15}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ── Map Floor — PREMIUM ──
function MapFloor() {
  const runeRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (runeRef.current) {
      runeRef.current.rotation.z = clock.getElapsedTime() * 0.015;
    }
  });

  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial
          color="#151530"
          metalness={0.5}
          roughness={0.35}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Subtle grid — softer than before */}
      <gridHelper args={[18, 36, "#252548", "#1e1e3a"]} position={[0, -0.54, 0]} />

      {/* Decorative floor rings */}
      <group ref={runeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.53, 0]}>
        {[3, 5.5, 8].map((r, i) => (
          <mesh key={i}>
            <ringGeometry args={[r - 0.02, r, 64]} />
            <meshStandardMaterial
              color={i === 1 ? "#6366f1" : "#d4a017"}
              emissive={i === 1 ? "#6366f1" : "#d4a017"}
              emissiveIntensity={0.4 - i * 0.08}
              transparent
              opacity={0.25 - i * 0.05}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Corner landmarks — subtle pillars at map edges */}
      {[[-6, -6], [6, -6], [-6, 6], [6, 6]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 1.5, 6]} />
            <meshStandardMaterial color="#1a1a38" metalness={0.7} roughness={0.25} />
          </mesh>
          <mesh position={[0, 1.35, 0]}>
            <octahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial
              color="#6366f1"
              emissive="#6366f1"
              emissiveIntensity={0.8}
              metalness={1}
              roughness={0}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── Main Map Scene — PREMIUM ──
export function MapScene({
  escapeZoneStatus,
  artifacts,
  onNavigate,
  sigilsCollected,
  selectedZone,
  onSelectZone,
}: MapSceneProps) {
  return (
    <div className="w-full rounded-2xl overflow-hidden relative" style={{ height: "clamp(360px, 55vh, 520px)" }}>
      <Canvas
        shadows
        camera={{ position: [0, 7, 8], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5,
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#0a0a1c");
        }}
      >
        <Suspense fallback={null}>
          <PremiumLighting preset="default" accentColor="#d4a017" rimColor="#6366f1" />

          <fog attach="fog" args={["#0c0c20", 14, 32]} />

          <MapFloor />
          <Connectors escapeZoneStatus={escapeZoneStatus} />

          {ESCAPE_ZONES.map((zone) => {
            const layout = ZONE_LAYOUT[zone.id] || { pos: [0, 0, 0] as [number, number, number], scale: 1 };
            const status = escapeZoneStatus[zone.id];
            return (
              <ZoneBuilding
                key={zone.id}
                zone={zone}
                status={status}
                layout={layout}
                isSelected={selectedZone === zone.id}
                onSelect={() => onSelectZone(selectedZone === zone.id ? null : zone.id)}
                onNavigate={onNavigate}
              />
            );
          })}

          {/* Ambient particles */}
          <AmbientParticles count={35} radius={8} height={4} color="#d4a017" secondaryColor="#6366f1" />

          <PremiumShadows y={-0.54} opacity={0.3} scale={20} />

          <PremiumPostProcessing
            bloomIntensity={0.5}
            bloomThreshold={0.4}
            bloomSmoothing={0.5}
            vignetteOpacity={0.3}
          />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={5}
            maxDistance={16}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2.3}
            dampingFactor={0.08}
            enableDamping
            panSpeed={0.5}
            maxAzimuthAngle={Math.PI / 3}
            minAzimuthAngle={-Math.PI / 3}
          />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-white/30 pointer-events-none">
        Clic = sélectionner · Double-clic = entrer · Glisser = pivoter
      </div>
    </div>
  );
}
