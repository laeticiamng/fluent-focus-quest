import { useRef, useState, useCallback, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Html, Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { ESCAPE_ZONES, ZONE_TAB_MAP } from "@/data/escapeGame";
import type { RoomStatus } from "@/data/escapeGame";
import type { Artifact } from "@/hooks/useProgress";
import { PremiumLighting, PremiumShadows } from "./premium/PremiumLighting";
import { AmbientParticles, BackgroundStructures, SuspendedArcs, CinematicIntro, PulsingFloorVeins, Fireflies, EnergyTrails, AnimatedFogLayers } from "./premium/DecorativeElements";
import { PremiumPostProcessing } from "./premium/PostProcessing";
import { CinematicCameraBreathing } from "./premium/CinematicCamera";

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

// Distinctive building shapes per zone
const ZONE_SHAPES: Record<string, "tower" | "dome" | "spire" | "fortress" | "obelisk"> = {
  forge: "fortress",
  grammar: "dome",
  studio: "spire",
  clinical: "tower",
  laboratory: "obelisk",
  archive: "dome",
  aerzterat: "spire",
};

// ── Zone Building — DISTINCTIVE LANDMARKS ──
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
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = ZONE_COLORS_3D[zone.id] || "#888";
  const shape = ZONE_SHAPES[zone.id] || "tower";
  const isLocked = !status?.unlocked;
  const isCleared = status ? status.roomsSolved === status.totalRooms : false;
  const roomCount = zone.rooms.length;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      const targetY = isSelected ? 0.4 : hovered ? 0.18 : 0;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.08;
    }
    if (beaconRef.current) {
      beaconRef.current.rotation.y = t * 0.7;
      const pulse = Math.sin(t * 1.8) * 0.1 + 0.9;
      beaconRef.current.scale.setScalar(pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.15;
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

  const buildingHeight = 0.7 + (status?.progress ?? 0) * 1.2;
  const baseColor = isLocked ? "#161630" : color;
  const emissiveIntensity = isLocked ? 0.02 : isSelected ? 1.6 : hovered ? 1.0 : 0.45;

  // ── Build unique silhouette per zone shape ──
  const buildingBody = useMemo(() => {
    const matProps = {
      color: baseColor,
      metalness: 0.55 as number,
      roughness: 0.3 as number,
      emissive: new THREE.Color(baseColor),
      emissiveIntensity,
      transparent: isLocked,
      opacity: isLocked ? 0.3 : 1,
      envMapIntensity: 0.5,
    };

    switch (shape) {
      case "fortress":
        return (
          <group>
            {/* Wide main body */}
            <mesh position={[0, buildingHeight / 2 + 0.02, 0]} castShadow>
              <boxGeometry args={[0.9, buildingHeight, 0.9]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
            {/* Corner turrets */}
            {[[-0.4, 0.4], [0.4, 0.4], [-0.4, -0.4], [0.4, -0.4]].map(([cx, cz], ti) => (
              <mesh key={ti} position={[cx, buildingHeight * 0.6 + 0.02, cz]} castShadow>
                <cylinderGeometry args={[0.12, 0.15, buildingHeight * 0.8, 6]} />
                <meshStandardMaterial {...matProps} />
              </mesh>
            ))}
          </group>
        );
      case "dome":
        return (
          <group>
            <mesh position={[0, buildingHeight * 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.6, 0.7, buildingHeight * 0.6, 16]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
            <mesh position={[0, buildingHeight * 0.7, 0]} castShadow>
              <sphereGeometry args={[0.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
          </group>
        );
      case "spire":
        return (
          <group>
            <mesh position={[0, buildingHeight * 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.45, 0.6, buildingHeight * 0.5, 8]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
            <mesh position={[0, buildingHeight * 0.7 + 0.1, 0]} castShadow>
              <coneGeometry args={[0.35, buildingHeight * 0.6, 8]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
          </group>
        );
      case "obelisk":
        return (
          <group>
            <mesh position={[0, buildingHeight * 0.55 + 0.02, 0]} castShadow>
              <boxGeometry args={[0.5, buildingHeight * 1.2, 0.5]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
            {/* Pyramid cap */}
            <mesh position={[0, buildingHeight * 1.15 + 0.1, 0]} castShadow>
              <coneGeometry args={[0.35, 0.4, 4]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
          </group>
        );
      default: // tower
        return (
          <mesh position={[0, buildingHeight / 2 + 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.65, buildingHeight, 8]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        );
    }
  }, [shape, buildingHeight, baseColor, emissiveIntensity, isLocked]);

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
      {/* ── Base platform — tiered with accent ── */}
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <cylinderGeometry args={[1.15, 1.25, 0.15, 8]} />
        <meshStandardMaterial
          color={isLocked ? "#121228" : "#161638"}
          metalness={0.65}
          roughness={0.25}
          envMapIntensity={0.4}
        />
      </mesh>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.1, 8]} />
        <meshStandardMaterial
          color={isLocked ? "#141430" : "#1e1e42"}
          metalness={0.6}
          roughness={0.3}
          emissive={new THREE.Color(baseColor)}
          emissiveIntensity={isLocked ? 0 : 0.04}
        />
      </mesh>

      {/* ── Accent ring on platform ── */}
      {!isLocked && (
        <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.88, 0.94, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.7}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* ── Building body — unique per zone ── */}
      {buildingBody}

      {/* ── Building accent bands ── */}
      {!isLocked && [0.35, 0.65].filter(h => h < buildingHeight).map((h, i) => (
        <mesh key={i} position={[0, h, 0]}>
          <torusGeometry args={[0.52 + i * 0.02, 0.012, 8, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.9}
            metalness={1}
            roughness={0.05}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}

      {/* ── Floating ring around building ── */}
      {!isLocked && (
        <mesh ref={ringRef} position={[0, buildingHeight * 0.5, 0]}>
          <torusGeometry args={[0.75, 0.006, 8, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={1}
            roughness={0.05}
            transparent
            opacity={0.25}
          />
        </mesh>
      )}

      {/* ── Beacon at top ── */}
      {!isLocked && (
        <Float speed={1.8} floatIntensity={0.08}>
          <mesh ref={beaconRef} position={[0, buildingHeight + 0.5, 0]}>
            <octahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial
              color={isCleared ? "#10b981" : color}
              emissive={isCleared ? "#10b981" : color}
              emissiveIntensity={2.5}
              metalness={1}
              roughness={0}
            />
          </mesh>
        </Float>
      )}

      {/* ── Room indicators — orbiting around base ── */}
      {zone.rooms.map((room, i) => {
        const roomStatus = status?.rooms?.find(r => r.id === room.id);
        const angle = (i / roomCount) * Math.PI * 2;
        const rx = Math.cos(angle) * 0.85;
        const rz = Math.sin(angle) * 0.85;
        const isSolved = roomStatus?.status === "solved";
        const isAccessible = roomStatus?.status === "accessible" || roomStatus?.status === "in_progress";
        return (
          <mesh key={room.id} position={[rx, 0.08, rz]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color={isSolved ? "#10b981" : isAccessible ? color : "#1e1e3a"}
              emissive={new THREE.Color(isSolved ? "#10b981" : isAccessible ? color : "#0a0a15")}
              emissiveIntensity={isSolved ? 1.5 : isAccessible ? 0.7 : 0.02}
              metalness={0.85}
              roughness={0.12}
            />
          </mesh>
        );
      })}

      {/* ── Zone light ── */}
      {!isLocked && (
        <pointLight
          position={[0, buildingHeight + 0.7, 0]}
          intensity={isSelected ? 4.0 : hovered ? 2.0 : 0.8}
          color={color}
          distance={6}
          decay={2}
        />
      )}

      {/* ── Label ── */}
      <Html position={[0, -0.6, 0]} center distanceFactor={8}>
        <div className={`text-center pointer-events-none select-none ${isLocked ? "opacity-18" : ""}`}>
          <div className="text-base drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]">{zone.icon}</div>
          <div
            className="text-[8px] font-bold whitespace-nowrap"
            style={{
              color: isLocked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.85)",
              textShadow: `0 0 6px rgba(0,0,0,0.9)${!isLocked ? `, 0 0 10px ${color}55` : ""}`,
            }}
          >
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

// ── Connectors — luminous energy paths ──
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
        center.y = -0.5;
        const bothUnlocked = escapeZoneStatus[c.from]?.unlocked && escapeZoneStatus[c.to]?.unlocked;

        return (
          <group key={i}>
            {/* Main connector */}
            <mesh position={[center.x, center.y, center.z]} rotation={[0, Math.atan2(dir.x, dir.z), 0]}>
              <boxGeometry args={[0.05, 0.012, length]} />
              <meshStandardMaterial
                color={bothUnlocked ? "#d4a017" : "#1e1e3a"}
                emissive={bothUnlocked ? "#d4a017" : "#0e0e20"}
                emissiveIntensity={bothUnlocked ? 0.9 : 0.03}
                transparent
                opacity={bothUnlocked ? 0.7 : 0.25}
                metalness={0.85}
                roughness={0.12}
              />
            </mesh>
            {/* Glow track */}
            {bothUnlocked && (
              <mesh position={[center.x, center.y - 0.01, center.z]} rotation={[0, Math.atan2(dir.x, dir.z), 0]}>
                <boxGeometry args={[0.18, 0.004, length]} />
                <meshStandardMaterial
                  color="#d4a017"
                  emissive="#d4a017"
                  emissiveIntensity={0.35}
                  transparent
                  opacity={0.12}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ── Map Floor — premium with rich detail ──
function MapFloor() {
  const runeRef = useRef<THREE.Group>(null);
  const innerRuneRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (runeRef.current) runeRef.current.rotation.z = t * 0.012;
    if (innerRuneRef.current) innerRuneRef.current.rotation.z = -t * 0.02;
  });

  return (
    <group>
      {/* ── Main floor — dark brushed metal ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.58, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#0e0e28"
          metalness={0.6}
          roughness={0.3}
          envMapIntensity={0.4}
        />
      </mesh>

      {/* ── Inner elevated platform ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.56, 0]}>
        <circleGeometry args={[7, 48]} />
        <meshStandardMaterial
          color="#141432"
          metalness={0.55}
          roughness={0.32}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* ── Subtle grid — refined ── */}
      <gridHelper args={[18, 36, "#1e1e42", "#161634"]} position={[0, -0.565, 0]} />

      {/* ── Decorative floor rings ── */}
      <group ref={runeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        {[3, 5.5, 8].map((r, i) => (
          <mesh key={i}>
            <ringGeometry args={[r - 0.02, r, 64]} />
            <meshStandardMaterial
              color={i === 1 ? "#6366f1" : "#d4a017"}
              emissive={i === 1 ? "#6366f1" : "#d4a017"}
              emissiveIntensity={0.45 - i * 0.08}
              transparent
              opacity={0.25 - i * 0.04}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* ── Inner rune ring ── */}
      <group ref={innerRuneRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.545, 0]}>
        <mesh>
          <ringGeometry args={[1.8, 1.85, 48]} />
          <meshStandardMaterial
            color="#d4a017"
            emissive="#d4a017"
            emissiveIntensity={0.6}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Cardinal glyphs */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const r = 1.82;
          return (
            <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0]}>
              <boxGeometry args={[i % 2 === 0 ? 0.1 : 0.05, 0.03, 0.002]} />
              <meshStandardMaterial
                color="#d4a017"
                emissive="#d4a017"
                emissiveIntensity={0.5}
                transparent
                opacity={0.4}
              />
            </mesh>
          );
        })}
      </group>

      {/* ── Corner landmarks — ornate pillars at map edges ── */}
      {([[-7, -7], [7, -7], [-7, 7], [7, 7]] as [number, number][]).map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Base */}
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.12, 0.15, 0.12, 6]} />
            <meshStandardMaterial color="#101028" metalness={0.7} roughness={0.25} />
          </mesh>
          {/* Column */}
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 1.8, 6]} />
            <meshStandardMaterial color="#141434" metalness={0.75} roughness={0.2} />
          </mesh>
          {/* Crown */}
          <mesh position={[0, 1.55, 0]}>
            <octahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial
              color="#6366f1"
              emissive="#6366f1"
              emissiveIntensity={0.9}
              metalness={1}
              roughness={0}
            />
          </mesh>
          <pointLight position={[0, 1.6, 0]} intensity={0.3} color="#6366f1" distance={4} decay={2} />
        </group>
      ))}
    </group>
  );
}

// ── Main Map Scene — IMMERSIVE COMMAND MAP ──
export function MapScene({
  escapeZoneStatus,
  artifacts,
  onNavigate,
  sigilsCollected,
  selectedZone,
  onSelectZone,
}: MapSceneProps) {
  return (
    <div className="w-full rounded-2xl overflow-hidden relative" style={{ height: "clamp(360px, 55vh, 540px)" }}>
      <Canvas
        shadows
        camera={{ position: [0, 8, 9], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#060616");
        }}
      >
        <Suspense fallback={null}>
          <CinematicIntro targetPosition={[0, 8, 9]} startOffset={[0, 4, 6]} duration={2.5} />
          <CinematicCameraBreathing fovBreath={0.5} breathSpeed={0.1} parallaxStrength={0.15} />

          <PremiumLighting preset="default" accentColor="#d4a017" rimColor="#6366f1" />

          <fog attach="fog" args={["#080818", 12, 35]} />

          <MapFloor />

          {/* Pulsing floor energy veins */}
          <PulsingFloorVeins count={12} innerRadius={2} outerRadius={8} y={-0.55} color="#d4a017" secondaryColor="#6366f1" />

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
          <AmbientParticles count={40} radius={9} height={5} color="#d4a017" secondaryColor="#6366f1" />

          {/* Energy trails */}
          <EnergyTrails count={4} radius={6} height={3.5} color="#d4a017" secondaryColor="#6366f1" speed={0.15} />

          {/* Animated fog layers */}
          <AnimatedFogLayers layers={2} baseY={-0.4} radius={14} color="#080818" maxOpacity={0.12} />

          {/* Fireflies */}
          <Fireflies count={18} radius={8} height={4} color="#fbbf24" secondaryColor="#6366f1" />

          {/* Suspended energy arcs */}
          <SuspendedArcs count={3} baseY={4.5} radius={7} color="#6366f1" />

          {/* Background depth */}
          <BackgroundStructures count={6} minRadius={14} maxRadius={22} height={5} color="#060614" />

          <PremiumShadows y={-0.57} opacity={0.35} scale={22} />

          <PremiumPostProcessing
            bloomIntensity={0.65}
            bloomThreshold={0.3}
            bloomSmoothing={0.6}
            vignetteOpacity={0.35}
            chromaticAberration={0.0004}
          />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={5}
            maxDistance={18}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2.3}
            dampingFactor={0.06}
            enableDamping
            panSpeed={0.5}
            maxAzimuthAngle={Math.PI / 3}
            minAzimuthAngle={-Math.PI / 3}
          />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-white/25 pointer-events-none select-none">
        Clic = sélectionner · Double-clic = entrer · Glisser = pivoter
      </div>
    </div>
  );
}
