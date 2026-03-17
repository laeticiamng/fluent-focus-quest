import { useRef, useState, useCallback, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Float } from "@react-three/drei";
import * as THREE from "three";
import { ESCAPE_ZONES, ZONE_TAB_MAP } from "@/data/escapeGame";
import type { RoomStatus } from "@/data/escapeGame";
import type { Artifact } from "@/hooks/useProgress";
import { PremiumLighting, PremiumShadows } from "./premium/PremiumLighting";
import { AmbientParticles, BackgroundStructures, SuspendedArcs, CinematicIntro, PulsingFloorVeins, Fireflies, EnergyTrails, AnimatedFogLayers, AtmosphericHeightFog } from "./premium/DecorativeElements";
import { PremiumPostProcessing } from "./premium/PostProcessing";
import { CinematicCameraBreathing } from "./premium/CinematicCamera";
import { useQualityTier } from "@/hooks/useQualityTier";
import { getSceneLightingRig } from "./premium/SceneLightingConfig";

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

const ZONE_SHAPES: Record<string, "tower" | "dome" | "spire" | "fortress" | "obelisk"> = {
  forge: "fortress",
  grammar: "dome",
  studio: "spire",
  clinical: "tower",
  laboratory: "obelisk",
  archive: "dome",
  aerzterat: "spire",
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
  const baseColor = isLocked ? "#121228" : color;
  const emissiveIntensity = isLocked ? 0.01 : isSelected ? 1.4 : hovered ? 0.8 : 0.35;

  const buildingBody = useMemo(() => {
    const matProps = {
      color: baseColor,
      metalness: 0.6 as number,
      roughness: 0.32 as number,
      emissive: new THREE.Color(baseColor),
      emissiveIntensity,
      transparent: isLocked,
      opacity: isLocked ? 0.3 : 1,
      envMapIntensity: 0.4,
    };

    switch (shape) {
      case "fortress":
        return (
          <group>
            <mesh position={[0, buildingHeight / 2 + 0.02, 0]} castShadow>
              <boxGeometry args={[0.9, buildingHeight, 0.9]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
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
            <mesh position={[0, buildingHeight * 1.15 + 0.1, 0]} castShadow>
              <coneGeometry args={[0.35, 0.4, 4]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
          </group>
        );
      default:
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
      {/* Base platform */}
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <cylinderGeometry args={[1.15, 1.25, 0.15, 8]} />
        <meshStandardMaterial
          color={isLocked ? "#0e0e22" : "#121230"}
          metalness={0.7}
          roughness={0.28}
          envMapIntensity={0.35}
        />
      </mesh>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.1, 8]} />
        <meshStandardMaterial
          color={isLocked ? "#101028" : "#181840"}
          metalness={0.65}
          roughness={0.32}
          emissive={new THREE.Color(baseColor)}
          emissiveIntensity={isLocked ? 0 : 0.03}
        />
      </mesh>

      {/* Accent ring */}
      {!isLocked && (
        <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.88, 0.94, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {buildingBody}

      {/* Accent bands */}
      {!isLocked && [0.35, 0.65].filter(h => h < buildingHeight).map((h, i) => (
        <mesh key={i} position={[0, h, 0]}>
          <torusGeometry args={[0.52 + i * 0.02, 0.012, 8, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            metalness={1}
            roughness={0.05}
            transparent
            opacity={0.45}
          />
        </mesh>
      ))}

      {/* Floating ring */}
      {!isLocked && (
        <mesh ref={ringRef} position={[0, buildingHeight * 0.5, 0]}>
          <torusGeometry args={[0.75, 0.006, 8, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            metalness={1}
            roughness={0.05}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}

      {/* Beacon */}
      {!isLocked && (
        <Float speed={1.8} floatIntensity={0.08}>
          <mesh ref={beaconRef} position={[0, buildingHeight + 0.5, 0]}>
            <octahedronGeometry args={[0.09, 0]} />
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

      {/* Room indicators */}
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
              color={isSolved ? "#10b981" : isAccessible ? color : "#1a1a34"}
              emissive={new THREE.Color(isSolved ? "#10b981" : isAccessible ? color : "#080814")}
              emissiveIntensity={isSolved ? 1.2 : isAccessible ? 0.6 : 0.01}
              metalness={0.85}
              roughness={0.15}
            />
          </mesh>
        );
      })}

      {/* Zone light */}
      {!isLocked && (
        <pointLight
          position={[0, buildingHeight + 0.7, 0]}
          intensity={isSelected ? 3.5 : hovered ? 1.8 : 0.6}
          color={color}
          distance={6}
          decay={2}
        />
      )}

      {/* Label */}
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

// ── Connectors ──
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
            <mesh position={[center.x, center.y, center.z]} rotation={[0, Math.atan2(dir.x, dir.z), 0]}>
              <boxGeometry args={[0.05, 0.012, length]} />
              <meshStandardMaterial
                color={bothUnlocked ? "#d4a017" : "#181830"}
                emissive={bothUnlocked ? "#d4a017" : "#0a0a18"}
                emissiveIntensity={bothUnlocked ? 0.8 : 0.02}
                transparent
                opacity={bothUnlocked ? 0.65 : 0.2}
                metalness={0.85}
                roughness={0.15}
              />
            </mesh>
            {bothUnlocked && (
              <mesh position={[center.x, center.y - 0.01, center.z]} rotation={[0, Math.atan2(dir.x, dir.z), 0]}>
                <boxGeometry args={[0.18, 0.004, length]} />
                <meshStandardMaterial
                  color="#d4a017"
                  emissive="#d4a017"
                  emissiveIntensity={0.3}
                  transparent
                  opacity={0.1}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ── Map Floor ──
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.58, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a20" metalness={0.65} roughness={0.35} envMapIntensity={0.35} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.56, 0]}>
        <circleGeometry args={[7, 48]} />
        <meshStandardMaterial color="#101028" metalness={0.6} roughness={0.35} envMapIntensity={0.4} />
      </mesh>

      <gridHelper args={[18, 36, "#181838", "#121228"]} position={[0, -0.565, 0]} />

      <group ref={runeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        {[3, 5.5, 8].map((r, i) => (
          <mesh key={i}>
            <ringGeometry args={[r - 0.02, r, 64]} />
            <meshStandardMaterial
              color={i === 1 ? "#6366f1" : "#d4a017"}
              emissive={i === 1 ? "#6366f1" : "#d4a017"}
              emissiveIntensity={0.35 - i * 0.06}
              transparent
              opacity={0.2 - i * 0.03}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      <group ref={innerRuneRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.545, 0]}>
        <mesh>
          <ringGeometry args={[1.8, 1.85, 48]} />
          <meshStandardMaterial
            color="#d4a017"
            emissive="#d4a017"
            emissiveIntensity={0.5}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const r = 1.82;
          return (
            <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0]}>
              <boxGeometry args={[i % 2 === 0 ? 0.1 : 0.05, 0.03, 0.002]} />
              <meshStandardMaterial
                color="#d4a017"
                emissive="#d4a017"
                emissiveIntensity={0.4}
                transparent
                opacity={0.35}
              />
            </mesh>
          );
        })}
      </group>

      {/* Corner pillars */}
      {([[-7, -7], [7, -7], [-7, 7], [7, 7]] as [number, number][]).map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.12, 0.15, 0.12, 6]} />
            <meshStandardMaterial color="#0a0a20" metalness={0.75} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 1.8, 6]} />
            <meshStandardMaterial color="#0e0e28" metalness={0.8} roughness={0.22} />
          </mesh>
          <mesh position={[0, 1.55, 0]}>
            <octahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial
              color="#6366f1"
              emissive="#6366f1"
              emissiveIntensity={0.7}
              metalness={1}
              roughness={0}
            />
          </mesh>
          <pointLight position={[0, 1.6, 0]} intensity={0.25} color="#6366f1" distance={4} decay={2} />
        </group>
      ))}
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
  const quality = useQualityTier();
  const rig = useMemo(() => getSceneLightingRig("map"), []);

  return (
    <div className="w-full rounded-2xl overflow-hidden relative" style={{ height: "clamp(360px, 55vh, 540px)" }}>
      <Canvas
        shadows
        camera={{ position: [0, 8, 9], fov: 42 }}
        dpr={quality.dpr}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.7,
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#060610");
        }}
      >
        <Suspense fallback={null}>
          <CinematicIntro targetPosition={[0, 8, 9]} startOffset={[0, 4, 6]} duration={2.5} />
          <CinematicCameraBreathing fovBreath={0.5} breathSpeed={0.1} parallaxStrength={0.15} />

          <PremiumLighting scene="map" />

          <fog attach="fog" args={[rig.fogColor, rig.fogNear, rig.fogFar]} />

          <MapFloor />

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

          {quality.enableParticles && (
            <AmbientParticles count={Math.round(40 * quality.particleMultiplier)} radius={9} height={5} color="#d4a017" secondaryColor="#6366f1" />
          )}

          {quality.enableEnergyTrails && (
            <EnergyTrails count={4} radius={6} height={3.5} color="#d4a017" secondaryColor="#6366f1" speed={0.15} />
          )}

          {quality.enableFogLayers && (
            <>
              <AnimatedFogLayers layers={rig.animFogLayers} baseY={rig.animFogBaseY} radius={rig.animFogRadius} color={rig.fogColor} maxOpacity={rig.animFogMaxOpacity} />
              <AtmosphericHeightFog
                groundColor={rig.heightFogGroundColor}
                midColor={rig.heightFogMidColor}
                baseY={rig.heightFogBaseY}
                radius={rig.heightFogRadius}
                groundOpacity={rig.heightFogGroundOpacity}
                midOpacity={rig.heightFogMidOpacity}
              />
            </>
          )}

          {quality.enableFireflies && (
            <Fireflies count={Math.round(18 * quality.particleMultiplier)} radius={8} height={4} color="#fbbf24" secondaryColor="#6366f1" />
          )}

          <SuspendedArcs count={3} baseY={4.5} radius={7} color="#6366f1" />

          {quality.enableBackgroundStructures && (
            <BackgroundStructures count={6} minRadius={14} maxRadius={22} height={5} color="#040410" />
          )}

          {quality.enableContactShadows && (
            <PremiumShadows y={rig.shadowY} opacity={rig.shadowOpacity} scale={rig.shadowScale} blur={rig.shadowBlur} />
          )}

          <PremiumPostProcessing
            bloomIntensity={0.55}
            bloomThreshold={0.38}
            bloomSmoothing={0.65}
            vignetteOpacity={0.25}
            chromaticAberration={0.0002}
            qualityTier={quality.tier}
            aoRadius={0.4}
            aoIntensity={1.0}
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
