import { useRef, useState, useCallback, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Html, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import { META_PUZZLE_FRAGMENTS, type MetaPuzzleFragment } from "@/data/puzzleEngine";
import { PremiumLighting, PremiumShadows } from "./premium/PremiumLighting";
import { AmbientParticles, FloatingRings, BackgroundStructures, SuspendedArcs, EnergyBeams, CinematicIntro, PulsingFloorVeins, HolographicDistortion, Fireflies, ThematicParticles } from "./premium/DecorativeElements";
import { PremiumPostProcessing } from "./premium/PostProcessing";

interface LazarusSceneProps {
  sigilsCollected: string[];
  arrangement: string[];
  onAddToArrangement: (fragmentId: string) => void;
  onRemoveFromArrangement: (fragmentId: string) => void;
  activated: boolean;
  feedback: string | null;
}

// ── Central Altar — SPECTACULAR TECHNO-SACRED FOCAL POINT ──
function Altar({ sigilCount, activated }: { sigilCount: number; activated: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Group>(null);
  const orbitalRef = useRef<THREE.Mesh>(null);
  const shieldRef = useRef<THREE.Group>(null);
  const columnRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * (activated ? 2.5 : 0.5);
      coreRef.current.rotation.x = Math.sin(t * 0.35) * 0.15;
      const s = activated ? 1.6 : 1;
      coreRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.04);
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = t * 0.12;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = -t * 0.08;
      outerRingRef.current.rotation.x = Math.sin(t * 0.06) * 0.12;
    }
    if (orbitalRef.current) {
      orbitalRef.current.rotation.y = t * 0.35;
      orbitalRef.current.rotation.x = Math.sin(t * 0.18) * 0.3;
    }
    if (shieldRef.current) {
      shieldRef.current.rotation.y = -t * 0.06;
    }
    if (columnRef.current) {
      columnRef.current.rotation.y = t * 0.03;
    }
  });

  const intensity = sigilCount / 7;
  const coreColor = activated ? "#fbbf24" : "#4a506a";
  const coreEmissive = activated ? "#fbbf24" : "#6366f1";
  const ringColor = activated ? "#10b981" : "#d4a017";

  return (
    <group position={[0, 0, 0]}>
      {/* ── Grand four-tier base platform ── */}
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.8, 0.18, 32]} />
        <meshStandardMaterial
          color={activated ? "#142014" : "#121232"}
          metalness={0.75}
          roughness={0.22}
          envMapIntensity={0.5}
        />
      </mesh>
      <mesh position={[0, -0.22, 0]} receiveShadow>
        <cylinderGeometry args={[2.0, 2.3, 0.14, 32]} />
        <meshStandardMaterial
          color={activated ? "#183018" : "#161640"}
          metalness={0.7}
          roughness={0.25}
          emissive={new THREE.Color(ringColor)}
          emissiveIntensity={0.03 + intensity * 0.04}
        />
      </mesh>
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <cylinderGeometry args={[1.6, 1.8, 0.1, 32]} />
        <meshStandardMaterial
          color={activated ? "#1e381e" : "#1a1a45"}
          metalness={0.65}
          roughness={0.28}
          emissive={new THREE.Color(ringColor)}
          emissiveIntensity={0.04 + intensity * 0.08}
        />
      </mesh>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.2, 1.4, 0.08, 32]} />
        <meshStandardMaterial
          color={activated ? "#22421e" : "#1e1e48"}
          metalness={0.6}
          roughness={0.3}
          emissive={new THREE.Color(ringColor)}
          emissiveIntensity={0.06 + intensity * 0.12}
        />
      </mesh>

      {/* ── Base accent energy rings ── */}
      {[2.2, 1.7, 1.3].map((r, i) => (
        <mesh key={i} position={[0, -0.28 + i * 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.025, r, 64]} />
          <meshStandardMaterial
            color={activated ? "#10b981" : i === 1 ? "#6366f1" : "#d4a017"}
            emissive={activated ? "#10b981" : i === 1 ? "#6366f1" : "#d4a017"}
            emissiveIntensity={activated ? 1.2 : 0.5 + intensity * 0.3}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* ── Inner rune ring — rotating, with glyphs ── */}
      <group ref={innerRingRef} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[1.25, 0.03, 16, 64]} />
          <meshStandardMaterial
            color={ringColor}
            emissive={ringColor}
            emissiveIntensity={activated ? 3.0 : 0.7 + intensity * 0.5}
            metalness={1}
            roughness={0.04}
          />
        </mesh>
        {/* Glyph marks */}
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2;
          const isMajor = i % 2 === 0;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0.02]}>
              <boxGeometry args={[isMajor ? 0.08 : 0.04, isMajor ? 0.03 : 0.015, 0.008]} />
              <meshStandardMaterial
                color={ringColor}
                emissive={ringColor}
                emissiveIntensity={activated ? 2.5 : 0.5}
                transparent
                opacity={isMajor ? 0.6 : 0.3}
              />
            </mesh>
          );
        })}
      </group>

      {/* ── Outer ring — counter-rotating ── */}
      <group ref={outerRingRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[1.8, 0.02, 16, 64]} />
          <meshStandardMaterial
            color="#d4a017"
            emissive="#d4a017"
            emissiveIntensity={activated ? 1.5 : 0.35}
            metalness={1}
            roughness={0.04}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>

      {/* ── Shield ring system — triple protection rings ── */}
      <group ref={shieldRef} position={[0, 0.7, 0]}>
        {[0, Math.PI / 3, Math.PI * 2 / 3].map((rot, i) => (
          <mesh key={i} rotation={[Math.PI / 2, rot, Math.PI / 5]}>
            <torusGeometry args={[0.55, 0.006, 8, 36]} />
            <meshStandardMaterial
              color={activated ? "#10b981" : "#6366f1"}
              emissive={activated ? "#10b981" : "#6366f1"}
              emissiveIntensity={activated ? 1.5 : 0.35 + intensity * 0.2}
              metalness={1}
              roughness={0.05}
              transparent
              opacity={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* ── Orbital ring — tilted, wide ── */}
      <mesh ref={orbitalRef} position={[0, 0.85, 0]}>
        <torusGeometry args={[0.75, 0.012, 16, 48]} />
        <meshStandardMaterial
          color={activated ? "#10b981" : "#6366f1"}
          emissive={activated ? "#10b981" : "#6366f1"}
          emissiveIntensity={activated ? 2.5 : 0.55}
          metalness={1}
          roughness={0.04}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* ── Central core — the sacred heart, more spectacular ── */}
      <Float speed={activated ? 3.5 : 1.2} floatIntensity={activated ? 0.35 : 0.1}>
        <mesh ref={coreRef} position={[0, 1.0, 0]} castShadow>
          <icosahedronGeometry args={[0.4, 2]} />
          <meshPhysicalMaterial
            color={coreColor}
            emissive={new THREE.Color(coreEmissive)}
            emissiveIntensity={activated ? 5.0 : 0.6 + intensity * 1.0}
            metalness={0.95}
            roughness={0.02}
            envMapIntensity={1.0}
            clearcoat={1}
            clearcoatRoughness={0.05}
            iridescence={activated ? 1.0 : 0.4}
            iridescenceIOR={1.8}
          />
        </mesh>
        {/* Holographic distortion aura */}
        <HolographicDistortion
          position={[0, 1.0, 0]}
          radius={0.4}
          color={activated ? "#10b981" : "#fbbf24"}
          secondaryColor={activated ? "#fbbf24" : "#6366f1"}
          activated={activated || intensity > 0.3}
        />
      </Float>

      {/* ── Sentinel pillars around altar ── */}
      <group ref={columnRef}>
        {[0, Math.PI / 3, Math.PI * 2 / 3, Math.PI, Math.PI * 4 / 3, Math.PI * 5 / 3].map((angle, i) => {
          const d = 2.1;
          const x = Math.cos(angle) * d;
          const z = Math.sin(angle) * d;
          return (
            <group key={i} position={[x, 0, z]}>
              {/* Base */}
              <mesh position={[0, -0.02, 0]}>
                <cylinderGeometry args={[0.07, 0.09, 0.08, 6]} />
                <meshStandardMaterial
                  color="#101028"
                  metalness={0.7}
                  roughness={0.25}
                />
              </mesh>
              {/* Column */}
              <mesh position={[0, 0.85, 0]}>
                <cylinderGeometry args={[0.035, 0.055, 1.9, 6]} />
                <meshStandardMaterial
                  color="#141435"
                  metalness={0.75}
                  roughness={0.2}
                  emissive={new THREE.Color(activated ? "#10b981" : "#6366f1")}
                  emissiveIntensity={0.04}
                />
              </mesh>
              {/* Accent band */}
              <mesh position={[0, 1.2, 0]}>
                <torusGeometry args={[0.045, 0.006, 8, 16]} />
                <meshStandardMaterial
                  color={activated ? "#10b981" : "#6366f1"}
                  emissive={activated ? "#10b981" : "#6366f1"}
                  emissiveIntensity={0.6}
                  metalness={1}
                  roughness={0.05}
                  transparent
                  opacity={0.4}
                />
              </mesh>
              {/* Crown gem */}
              <Float speed={1.5} floatIntensity={0.05}>
                <mesh position={[0, 1.9, 0]}>
                  <octahedronGeometry args={[0.05, 0]} />
                  <meshStandardMaterial
                    color={activated ? "#10b981" : "#6366f1"}
                    emissive={activated ? "#10b981" : "#6366f1"}
                    emissiveIntensity={activated ? 2.5 : 0.7}
                    metalness={1}
                    roughness={0}
                  />
                </mesh>
              </Float>
              {i % 2 === 0 && (
                <pointLight
                  position={[0, 1.9, 0]}
                  intensity={0.3}
                  color={activated ? "#10b981" : "#6366f1"}
                  distance={3}
                  decay={2}
                />
              )}
            </group>
          );
        })}
      </group>

      {/* ── Core lighting — dramatic ── */}
      <pointLight
        position={[0, 1.0, 0]}
        intensity={activated ? 10 : 1.2 + intensity * 2.5}
        color={activated ? "#fbbf24" : "#6366f1"}
        distance={12}
        decay={2}
      />
      <pointLight
        position={[0, 0, 0]}
        intensity={activated ? 4 : 0.6}
        color={activated ? "#10b981" : "#d4a017"}
        distance={7}
        decay={2}
      />
      <pointLight
        position={[0, -0.3, 0]}
        intensity={0.3}
        color={activated ? "#10b981" : "#6366f1"}
        distance={5}
        decay={2}
      />
    </group>
  );
}

// ── Sigil Slot — PREMIUM SACRED ──
function SigilSlot({
  fragment,
  index,
  total,
  isObtained,
  isPlaced,
  placedIndex,
  onPlace,
  onRemove,
  activated,
}: {
  fragment: MetaPuzzleFragment;
  index: number;
  total: number;
  isObtained: boolean;
  isPlaced: boolean;
  placedIndex: number;
  onPlace: () => void;
  onRemove: () => void;
  activated: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = 1.4;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      if (isPlaced || activated) {
        meshRef.current.rotation.y = t * 1.8;
        meshRef.current.position.y = 0.38 + Math.sin(t * 2.2 + index) * 0.06;
      } else {
        meshRef.current.rotation.y = t * 0.35 + index;
        meshRef.current.position.y = 0.2;
      }
    }
  });

  const handleClick = useCallback(() => {
    if (activated) return;
    if (isPlaced) onRemove();
    else if (isObtained) onPlace();
  }, [activated, isPlaced, isObtained, onPlace, onRemove]);

  const slotColor = isPlaced ? "#fbbf24" : isObtained ? "#4a4a6a" : "#161630";
  const emissive = isPlaced ? "#fbbf24" : isObtained && hovered ? "#6366f1" : "#0a0a15";

  return (
    <group position={[x, 0, z]}>
      {/* ── Slot pedestal — tiered ── */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.24, 0.28, 0.08, 6]} />
        <meshStandardMaterial
          color={isPlaced ? "#2a2010" : "#121228"}
          metalness={0.7}
          roughness={0.25}
          emissive={new THREE.Color(isPlaced ? "#fbbf24" : "#0a0a15")}
          emissiveIntensity={isPlaced ? 0.3 : 0.01}
        />
      </mesh>
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.05, 6]} />
        <meshStandardMaterial
          color={isPlaced ? "#302510" : "#161632"}
          metalness={0.65}
          roughness={0.28}
        />
      </mesh>

      {/* ── Slot accent ring ── */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.24, 16]} />
        <meshStandardMaterial
          color={isPlaced ? "#fbbf24" : isObtained ? "#6366f1" : "#101025"}
          emissive={isPlaced ? "#fbbf24" : isObtained ? "#6366f1" : "#060612"}
          emissiveIntensity={isPlaced ? 1.5 : isObtained ? 0.35 : 0.02}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Sigil gem ── */}
      <Float speed={1.8} floatIntensity={isPlaced ? 0.12 : 0}>
        <mesh
          ref={meshRef}
          position={[0, 0.2, 0]}
          castShadow
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
          onPointerOver={() => { setHovered(true); if (isObtained && !activated) document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
        >
          <octahedronGeometry args={[isPlaced ? 0.17 : isObtained ? 0.14 : 0.045, isPlaced ? 1 : 0]} />
          <meshStandardMaterial
            color={slotColor}
            emissive={new THREE.Color(emissive)}
            emissiveIntensity={isPlaced ? 2.5 : hovered ? 1.0 : 0.04}
            metalness={0.92}
            roughness={0.06}
            transparent={!isObtained}
            opacity={isObtained ? 1 : 0.2}
            envMapIntensity={0.9}
          />
        </mesh>
      </Float>

      {/* ── Placed sigil light ── */}
      {isPlaced && (
        <pointLight position={[0, 0.3, 0]} intensity={3.0} color="#fbbf24" distance={2.5} decay={2} />
      )}

      {/* ── Label ── */}
      <Html position={[0, -0.3, 0]} center distanceFactor={6}>
        <div className={`text-center pointer-events-none select-none ${isObtained ? "" : "opacity-18"}`}>
          <div className="text-xs drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]">{isObtained ? fragment.icon : "?"}</div>
          <div
            className="text-[7px] whitespace-nowrap"
            style={{
              color: isObtained ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.25)",
              textShadow: "0 0 6px rgba(0,0,0,0.9)",
            }}
          >
            {isObtained ? fragment.name.split(" ").pop() : "???"}
          </div>
          {isPlaced && (
            <div className="text-[7px] text-amber-400 font-bold" style={{ textShadow: "0 0 4px rgba(251,191,36,0.4)" }}>
              #{placedIndex + 1}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ── Lazarus Floor — sacred ritual ground with deep engraving ──
function LazarusFloor({ activated }: { activated: boolean }) {
  const runeRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (runeRef.current) runeRef.current.rotation.z = t * (activated ? 0.04 : 0.015);
    if (innerRef.current) innerRef.current.rotation.z = -t * (activated ? 0.06 : 0.025);
  });

  return (
    <group>
      {/* ── Outer floor — deep dark ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]} receiveShadow>
        <circleGeometry args={[7, 64]} />
        <meshStandardMaterial
          color={activated ? "#0e1a0e" : "#0e0e25"}
          metalness={0.6}
          roughness={0.35}
          envMapIntensity={0.4}
        />
      </mesh>

      {/* ── Inner sanctum ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.44, 0]}>
        <circleGeometry args={[3.5, 64]} />
        <meshStandardMaterial
          color={activated ? "#122012" : "#121230"}
          metalness={0.55}
          roughness={0.3}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* ── Inner core zone ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.435, 0]}>
        <circleGeometry args={[1.8, 48]} />
        <meshStandardMaterial
          color={activated ? "#162816" : "#161638"}
          metalness={0.5}
          roughness={0.32}
        />
      </mesh>

      {/* ── Rune circles — outer set ── */}
      <group ref={runeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.425, 0]}>
        {[1.6, 2.6, 4.2, 5.8].map((r, i) => (
          <mesh key={i}>
            <ringGeometry args={[r - 0.02, r, 64]} />
            <meshStandardMaterial
              color={activated ? "#10b981" : i % 2 === 0 ? "#d4a017" : "#6366f1"}
              emissive={activated ? "#10b981" : i % 2 === 0 ? "#d4a017" : "#6366f1"}
              emissiveIntensity={activated ? 1.2 - i * 0.15 : 0.45 - i * 0.06}
              transparent
              opacity={activated ? 0.4 - i * 0.05 : 0.22 - i * 0.03}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* ── Radial glyph marks — 20 for high density ── */}
        {Array.from({ length: 20 }).map((_, i) => {
          const a = (i / 20) * Math.PI * 2;
          const isMajor = i % 5 === 0;
          const r = 3.4;
          return (
            <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0]}>
              <boxGeometry args={[isMajor ? 0.1 : 0.04, isMajor ? 0.7 : 0.35, 0.004]} />
              <meshStandardMaterial
                color={activated ? "#10b981" : "#d4a017"}
                emissive={activated ? "#10b981" : "#d4a017"}
                emissiveIntensity={isMajor ? 0.7 : 0.3}
                transparent
                opacity={isMajor ? 0.35 : 0.15}
              />
            </mesh>
          );
        })}
      </group>

      {/* ── Inner counter-rotating rune ring ── */}
      <group ref={innerRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]}>
        <mesh>
          <ringGeometry args={[1.05, 1.1, 48]} />
          <meshStandardMaterial
            color={activated ? "#10b981" : "#d4a017"}
            emissive={activated ? "#10b981" : "#d4a017"}
            emissiveIntensity={activated ? 1.5 : 0.6}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Inner glyphs */}
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2;
          const r = 1.07;
          return (
            <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0]}>
              <boxGeometry args={[0.06, 0.06, 0.003]} />
              <meshStandardMaterial
                color={activated ? "#10b981" : "#fbbf24"}
                emissive={activated ? "#10b981" : "#fbbf24"}
                emissiveIntensity={0.8}
                transparent
                opacity={0.5}
              />
            </mesh>
          );
        })}
      </group>

      {/* ── Cardinal energy nodes ── */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => {
        const d = 4.5;
        return (
          <group key={i}>
            <mesh
              position={[Math.cos(angle) * d, -0.42, Math.sin(angle) * d]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[0.2, 12]} />
              <meshStandardMaterial
                color={activated ? "#10b981" : i % 2 === 0 ? "#d4a017" : "#6366f1"}
                emissive={activated ? "#10b981" : i % 2 === 0 ? "#d4a017" : "#6366f1"}
                emissiveIntensity={1.0}
                transparent
                opacity={0.4}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ── Main Lazarus Scene — SPECTACULAR TECHNO-SACRED ──
export function LazarusScene({
  sigilsCollected,
  arrangement,
  onAddToArrangement,
  onRemoveFromArrangement,
  activated,
  feedback,
}: LazarusSceneProps) {
  const fragments = META_PUZZLE_FRAGMENTS.map(f => ({
    ...f,
    obtained: sigilsCollected.some(s =>
      s.toLowerCase().includes(f.source) || f.name.toLowerCase().includes(s.toLowerCase().split(" ").pop() || "")
    ),
  }));

  return (
    <div className="w-full rounded-2xl overflow-hidden relative" style={{ height: "clamp(300px, 48vh, 480px)" }}>
      <Canvas
        shadows
        camera={{ position: [0, 5, 6], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color(activated ? "#061006" : "#060618");
        }}
      >
        <Suspense fallback={null}>
          <PremiumLighting
            preset="sacred"
            accentColor={activated ? "#10b981" : "#d4a017"}
            rimColor={activated ? "#059669" : "#6366f1"}
          />

          <fog attach="fog" args={[activated ? "#081408" : "#08081a", 8, 28]} />

          {/* Cinematic camera intro */}
          <CinematicIntro targetPosition={[0, 5, 6]} startOffset={[0, 3, 5]} duration={2.2} />

          {/* Sacred floor */}
          <LazarusFloor activated={activated} />

          {/* Pulsing floor energy veins */}
          <PulsingFloorVeins
            count={14}
            innerRadius={1.5}
            outerRadius={5.5}
            y={-0.42}
            color={activated ? "#10b981" : "#d4a017"}
            secondaryColor={activated ? "#fbbf24" : "#6366f1"}
          />

          {/* Energy beams from sentinel pillars */}
          <EnergyBeams count={6} radius={2.1} height={2} color={activated ? "#10b981" : "#d4a017"} secondaryColor={activated ? "#fbbf24" : "#6366f1"} activated={activated} />

          {/* The Altar */}
          <Altar sigilCount={sigilsCollected.length} activated={activated} />

          {/* Sigil slots */}
          {fragments.map((f, i) => (
            <SigilSlot
              key={f.id}
              fragment={f}
              index={i}
              total={fragments.length}
              isObtained={f.obtained}
              isPlaced={arrangement.includes(f.id)}
              placedIndex={arrangement.indexOf(f.id)}
              onPlace={() => onAddToArrangement(f.id)}
              onRemove={() => onRemoveFromArrangement(f.id)}
              activated={activated}
            />
          ))}

          {/* Floating rings above altar */}
          <FloatingRings
            count={activated ? 5 : 3}
            baseY={activated ? 2.8 : 2.2}
            baseRadius={1.6}
            color={activated ? "#10b981" : "#d4a017"}
          />

          {/* Suspended energy arcs */}
          <SuspendedArcs count={activated ? 6 : 3} baseY={3.5} radius={4} color={activated ? "#10b981" : "#6366f1"} />

          {/* Ambient particles */}
          <AmbientParticles
            count={activated ? 65 : 35}
            radius={6}
            height={5}
            color={activated ? "#10b981" : "#d4a017"}
            secondaryColor={activated ? "#fbbf24" : "#6366f1"}
          />

          {/* Fireflies — erratic luminous wanderers */}
          <Fireflies count={activated ? 30 : 15} radius={5} height={4} color={activated ? "#10b981" : "#fbbf24"} secondaryColor={activated ? "#fbbf24" : "#6366f1"} />

          {/* Thematic embers — rising heat effect */}
          <ThematicParticles count={20} radius={4} height={5} color={activated ? "#10b981" : "#f59e0b"} variant="embers" />

          {/* Background depth */}
          <BackgroundStructures count={5} minRadius={12} maxRadius={18} height={5} color={activated ? "#040e04" : "#050514"} />

          <PremiumShadows y={-0.44} opacity={0.35} scale={14} />

          <PremiumPostProcessing
            bloomIntensity={activated ? 1.1 : 0.8}
            bloomThreshold={activated ? 0.22 : 0.3}
            bloomSmoothing={0.6}
            vignetteOpacity={activated ? 0.45 : 0.4}
            chromaticAberration={0.0005}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={12}
            minPolarAngle={Math.PI / 7}
            maxPolarAngle={Math.PI / 2.3}
            dampingFactor={0.06}
            enableDamping
            autoRotate={activated}
            autoRotateSpeed={activated ? 1.0 : 0}
          />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
