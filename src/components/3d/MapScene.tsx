import { useRef, useState, useCallback, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Html, Float } from "@react-three/drei";
import * as THREE from "three";
import { ESCAPE_ZONES, ZONE_TAB_MAP, ZONE_COLORS } from "@/data/escapeGame";
import type { RoomStatus, EscapeRoom } from "@/data/escapeGame";
import type { Artifact } from "@/hooks/useProgress";

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

// Zone layout: a complex-like arrangement
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

// ── Zone Building ──
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
  const [hovered, setHovered] = useState(false);
  const color = ZONE_COLORS_3D[zone.id] || "#888";
  const isLocked = !status?.unlocked;
  const isCleared = status ? status.roomsSolved === status.totalRooms : false;
  const roomCount = zone.rooms.length;

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const targetY = isSelected ? 0.3 : hovered ? 0.15 : 0;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.08;
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

  const buildingHeight = 0.6 + (status?.progress ?? 0) * 0.8;
  const baseColor = isLocked ? "#1a1a2e" : color;
  const emissiveIntensity = isLocked ? 0 : isSelected ? 0.6 : hovered ? 0.3 : 0.1;

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
      {/* Base platform */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1, 1.1, 0.2, 6]} />
        <meshStandardMaterial
          color={isLocked ? "#111" : "#1a1a2e"}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Main building body */}
      <mesh position={[0, buildingHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.9, buildingHeight, 0.9]} />
        <meshStandardMaterial
          color={baseColor}
          metalness={0.5}
          roughness={0.4}
          emissive={new THREE.Color(baseColor)}
          emissiveIntensity={emissiveIntensity}
          transparent={isLocked}
          opacity={isLocked ? 0.3 : 1}
        />
      </mesh>

      {/* Roof piece */}
      <mesh position={[0, buildingHeight + 0.15, 0]} castShadow>
        <coneGeometry args={[0.65, 0.3, 6]} />
        <meshStandardMaterial
          color={isCleared ? "#10b981" : baseColor}
          metalness={0.7}
          roughness={0.2}
          emissive={new THREE.Color(isCleared ? "#10b981" : baseColor)}
          emissiveIntensity={isCleared ? 0.5 : emissiveIntensity * 0.5}
          transparent={isLocked}
          opacity={isLocked ? 0.3 : 1}
        />
      </mesh>

      {/* Room indicators (small cubes around base) */}
      {zone.rooms.map((room, i) => {
        const roomStatus = status?.rooms?.find(r => r.id === room.id);
        const angle = (i / roomCount) * Math.PI * 2;
        const rx = Math.cos(angle) * 0.75;
        const rz = Math.sin(angle) * 0.75;
        const isSolved = roomStatus?.status === "solved";
        const isAccessible = roomStatus?.status === "accessible" || roomStatus?.status === "in_progress";
        return (
          <mesh key={room.id} position={[rx, 0.1, rz]}>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial
              color={isSolved ? "#10b981" : isAccessible ? color : "#333"}
              emissive={new THREE.Color(isSolved ? "#10b981" : isAccessible ? color : "#000")}
              emissiveIntensity={isSolved ? 0.6 : isAccessible ? 0.3 : 0}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        );
      })}

      {/* Zone light */}
      {!isLocked && (
        <pointLight
          position={[0, buildingHeight + 0.5, 0]}
          intensity={isSelected ? 2 : hovered ? 1 : 0.3}
          color={color}
          distance={4}
          decay={2}
        />
      )}

      {/* Label */}
      <Html position={[0, -0.5, 0]} center distanceFactor={8}>
        <div className={`text-center pointer-events-none select-none ${isLocked ? "opacity-20" : ""}`}>
          <div className="text-base">{zone.icon}</div>
          <div className="text-[8px] font-bold text-white/70 whitespace-nowrap">
            {zone.name.replace("Aile de la ", "").replace("Aile de l'", "").replace("Aile du ", "").replace("Aile d'", "").replace("Laboratoire de ", "Labo ").replace("Archives ", "Archives").replace("Der ", "").slice(0, 16)}
          </div>
          {!isLocked && status && (
            <div className="text-[7px] text-white/40 mt-0.5">
              {status.roomsSolved}/{status.totalRooms}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ── Connectors (paths between zones) ──
function Connectors() {
  const connections = [
    { from: ZONE_LAYOUT.forge.pos, to: ZONE_LAYOUT.grammar.pos },
    { from: ZONE_LAYOUT.grammar.pos, to: ZONE_LAYOUT.studio.pos },
    { from: ZONE_LAYOUT.studio.pos, to: ZONE_LAYOUT.clinical.pos },
    { from: ZONE_LAYOUT.clinical.pos, to: ZONE_LAYOUT.laboratory.pos },
    { from: ZONE_LAYOUT.forge.pos, to: ZONE_LAYOUT.laboratory.pos },
    { from: ZONE_LAYOUT.laboratory.pos, to: ZONE_LAYOUT.archive.pos },
    { from: ZONE_LAYOUT.studio.pos, to: ZONE_LAYOUT.aerzterat.pos },
    { from: ZONE_LAYOUT.clinical.pos, to: ZONE_LAYOUT.aerzterat.pos },
  ];

  return (
    <group>
      {connections.map((c, i) => {
        const start = new THREE.Vector3(...c.from);
        const end = new THREE.Vector3(...c.to);
        const mid = start.clone().lerp(end, 0.5);
        mid.y = -0.45;
        const dir = end.clone().sub(start);
        const length = dir.length();
        const center = start.clone().add(end).multiplyScalar(0.5);
        center.y = -0.45;

        return (
          <mesh key={i} position={[center.x, center.y, center.z]} rotation={[0, Math.atan2(dir.x, dir.z), 0]}>
            <boxGeometry args={[0.04, 0.02, length]} />
            <meshStandardMaterial
              color="#d4a017"
              emissive="#d4a017"
              emissiveIntensity={0.15}
              transparent
              opacity={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ── Floor grid ──
function MapFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#06060f" metalness={0.3} roughness={0.8} />
      </mesh>
      {/* Grid lines */}
      <gridHelper args={[16, 32, "#1a1a2e", "#0d0d1a"]} position={[0, -0.54, 0]} />
    </group>
  );
}

// ── Main Map Scene ──
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
        camera={{ position: [0, 7, 8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting — improved visibility */}
          <ambientLight intensity={0.3} color="#8888cc" />
          <directionalLight
            position={[6, 10, 4]}
            intensity={0.55}
            color="#ffe4b5"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          <fog attach="fog" args={["#08081a", 12, 26]} />

          <MapFloor />
          <Connectors />

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

          <ContactShadows position={[0, -0.54, 0]} opacity={0.3} scale={20} blur={2.5} />

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

      {/* Gradient overlays */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background/50 to-transparent pointer-events-none" />

      {/* Instructions overlay */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-white/30 pointer-events-none">
        Clic = selectionner · Double-clic = entrer · Glisser = pivoter
      </div>
    </div>
  );
}
