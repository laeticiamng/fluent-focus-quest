import { useRef, useState, useCallback, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Html, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import { META_PUZZLE_FRAGMENTS, type MetaPuzzleFragment } from "@/data/puzzleEngine";
import { PremiumLighting, PremiumShadows } from "./premium/PremiumLighting";
import { AmbientParticles, FloatingRings } from "./premium/DecorativeElements";
import { PremiumPostProcessing } from "./premium/PostProcessing";

interface LazarusSceneProps {
  sigilsCollected: string[];
  arrangement: string[];
  onAddToArrangement: (fragmentId: string) => void;
  onRemoveFromArrangement: (fragmentId: string) => void;
  activated: boolean;
  feedback: string | null;
}

// ── Central Altar — SPECTACULAR ──
function Altar({ sigilCount, activated }: { sigilCount: number; activated: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const orbitalRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * (activated ? 3 : 0.6);
      coreRef.current.rotation.x = Math.sin(t * 0.4) * 0.15;
      const s = activated ? 1.5 : 1;
      coreRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.04);
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = t * 0.15;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = -t * 0.1;
      outerRingRef.current.rotation.x = Math.sin(t * 0.08) * 0.1;
    }
    if (orbitalRef.current) {
      orbitalRef.current.rotation.y = t * 0.4;
      orbitalRef.current.rotation.x = Math.sin(t * 0.2) * 0.3;
    }
  });

  const intensity = sigilCount / 7;
  const coreColor = activated ? "#fbbf24" : "#4a506a";
  const coreEmissive = activated ? "#fbbf24" : "#6366f1";
  const ringColor = activated ? "#10b981" : "#d4a017";

  return (
    <group position={[0, 0, 0]}>
      {/* Three-tier base platform */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.5, 0.2, 32]} />
        <meshStandardMaterial
          color={activated ? "#1a2a1a" : "#161638"}
          metalness={0.7}
          roughness={0.25}
          envMapIntensity={0.5}
        />
      </mesh>
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <cylinderGeometry args={[1.8, 2.0, 0.15, 32]} />
        <meshStandardMaterial
          color={activated ? "#1e321e" : "#1a1a40"}
          metalness={0.65}
          roughness={0.3}
          emissive={new THREE.Color(ringColor)}
          emissiveIntensity={0.03 + intensity * 0.05}
        />
      </mesh>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.4, 1.6, 0.12, 32]} />
        <meshStandardMaterial
          color={activated ? "#203520" : "#1e1e45"}
          metalness={0.6}
          roughness={0.3}
          emissive={new THREE.Color(ringColor)}
          emissiveIntensity={0.05 + intensity * 0.1}
        />
      </mesh>

      {/* Inner rune ring — rotating */}
      <group ref={innerRingRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[1.2, 0.035, 16, 64]} />
          <meshStandardMaterial
            color={ringColor}
            emissive={ringColor}
            emissiveIntensity={activated ? 2.5 : 0.6 + intensity * 0.5}
            metalness={1}
            roughness={0.05}
          />
        </mesh>
        {/* Rune marks on inner ring */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0.02]}>
              <boxGeometry args={[0.06, 0.02, 0.01]} />
              <meshStandardMaterial
                color={ringColor}
                emissive={ringColor}
                emissiveIntensity={activated ? 2.0 : 0.4}
                transparent
                opacity={0.6}
              />
            </mesh>
          );
        })}
      </group>

      {/* Outer ring — counter-rotating */}
      <group ref={outerRingRef} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[1.7, 0.025, 16, 64]} />
          <meshStandardMaterial
            color="#d4a017"
            emissive="#d4a017"
            emissiveIntensity={activated ? 1.2 : 0.3}
            metalness={1}
            roughness={0.05}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>

      {/* Third orbital ring — tilted */}
      <mesh ref={orbitalRef} position={[0, 0.8, 0]}>
        <torusGeometry args={[0.7, 0.015, 16, 48]} />
        <meshStandardMaterial
          color={activated ? "#10b981" : "#6366f1"}
          emissive={activated ? "#10b981" : "#6366f1"}
          emissiveIntensity={activated ? 2.0 : 0.5}
          metalness={1}
          roughness={0.05}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Central core — the heart */}
      <Float speed={activated ? 4 : 1.5} floatIntensity={activated ? 0.4 : 0.1}>
        <mesh ref={coreRef} position={[0, 0.9, 0]} castShadow>
          <icosahedronGeometry args={[0.35, 1]} />
          <meshStandardMaterial
            color={coreColor}
            emissive={new THREE.Color(coreEmissive)}
            emissiveIntensity={activated ? 4.0 : 0.5 + intensity * 0.8}
            metalness={0.95}
            roughness={0.03}
            envMapIntensity={1.0}
          />
        </mesh>
      </Float>

      {/* Energy pillars around altar */}
      {[0, Math.PI / 3, Math.PI * 2 / 3, Math.PI, Math.PI * 4 / 3, Math.PI * 5 / 3].map((angle, i) => {
        const d = 2.0;
        const x = Math.cos(angle) * d;
        const z = Math.sin(angle) * d;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.04, 0.06, 1.8, 6]} />
              <meshStandardMaterial
                color="#181838"
                metalness={0.7}
                roughness={0.25}
                emissive={new THREE.Color(activated ? "#10b981" : "#6366f1")}
                emissiveIntensity={0.05}
              />
            </mesh>
            <mesh position={[0, 1.8, 0]}>
              <octahedronGeometry args={[0.05, 0]} />
              <meshStandardMaterial
                color={activated ? "#10b981" : "#6366f1"}
                emissive={activated ? "#10b981" : "#6366f1"}
                emissiveIntensity={activated ? 2.0 : 0.6}
                metalness={1}
                roughness={0}
              />
            </mesh>
          </group>
        );
      })}

      {/* Core light — dramatic */}
      <pointLight
        position={[0, 0.9, 0]}
        intensity={activated ? 8 : 1.0 + intensity * 2}
        color={activated ? "#fbbf24" : "#6366f1"}
        distance={10}
        decay={2}
      />
      {/* Base glow */}
      <pointLight
        position={[0, 0, 0]}
        intensity={activated ? 3 : 0.5}
        color={activated ? "#10b981" : "#d4a017"}
        distance={6}
        decay={2}
      />
    </group>
  );
}

// ── Sigil Slot — PREMIUM ──
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
  const radius = 1.35;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      if (isPlaced || activated) {
        meshRef.current.rotation.y = t * 2.0;
        meshRef.current.position.y = 0.35 + Math.sin(t * 2.5 + index) * 0.06;
      } else {
        meshRef.current.rotation.y = t * 0.4 + index;
        meshRef.current.position.y = 0.18;
      }
    }
  });

  const handleClick = useCallback(() => {
    if (activated) return;
    if (isPlaced) onRemove();
    else if (isObtained) onPlace();
  }, [activated, isPlaced, isObtained, onPlace, onRemove]);

  const slotColor = isPlaced ? "#fbbf24" : isObtained ? "#4a4a6a" : "#1e1e35";
  const emissive = isPlaced ? "#fbbf24" : isObtained && hovered ? "#6366f1" : "#111";

  return (
    <group position={[x, 0, z]}>
      {/* Slot pedestal */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.1, 6]} />
        <meshStandardMaterial
          color={isPlaced ? "#2a2010" : "#151530"}
          metalness={0.65}
          roughness={0.3}
          emissive={new THREE.Color(isPlaced ? "#fbbf24" : "#111")}
          emissiveIntensity={isPlaced ? 0.3 : 0.01}
        />
      </mesh>

      {/* Slot accent ring */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.22, 16]} />
        <meshStandardMaterial
          color={isPlaced ? "#fbbf24" : isObtained ? "#6366f1" : "#1a1a30"}
          emissive={isPlaced ? "#fbbf24" : isObtained ? "#6366f1" : "#0a0a15"}
          emissiveIntensity={isPlaced ? 1.2 : isObtained ? 0.3 : 0.02}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sigil gem */}
      <Float speed={2} floatIntensity={isPlaced ? 0.15 : 0}>
        <mesh
          ref={meshRef}
          position={[0, 0.18, 0]}
          castShadow
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
          onPointerOver={() => { setHovered(true); if (isObtained && !activated) document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
        >
          <octahedronGeometry args={[isPlaced ? 0.16 : isObtained ? 0.13 : 0.05, isPlaced ? 1 : 0]} />
          <meshStandardMaterial
            color={slotColor}
            emissive={new THREE.Color(emissive)}
            emissiveIntensity={isPlaced ? 2.0 : hovered ? 0.8 : 0.05}
            metalness={0.9}
            roughness={0.08}
            transparent={!isObtained}
            opacity={isObtained ? 1 : 0.25}
            envMapIntensity={0.8}
          />
        </mesh>
      </Float>

      {/* Placed sigil light */}
      {isPlaced && (
        <pointLight position={[0, 0.25, 0]} intensity={2.5} color="#fbbf24" distance={2} decay={2} />
      )}

      {/* Label */}
      <Html position={[0, -0.28, 0]} center distanceFactor={6}>
        <div className={`text-center pointer-events-none select-none ${isObtained ? "" : "opacity-20"}`}>
          <div className="text-xs">{isObtained ? fragment.icon : "?"}</div>
          <div className="text-[7px] text-white/60 whitespace-nowrap drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
            {isObtained ? fragment.name.split(" ").pop() : "???"}
          </div>
          {isPlaced && (
            <div className="text-[7px] text-amber-400 font-bold">#{placedIndex + 1}</div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ── Lazarus Floor — sacred ritual circle ──
function LazarusFloor({ activated }: { activated: boolean }) {
  const runeRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (runeRef.current) {
      runeRef.current.rotation.z = clock.getElapsedTime() * (activated ? 0.05 : 0.02);
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial
          color={activated ? "#121e12" : "#12122a"}
          metalness={0.5}
          roughness={0.35}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Inner floor highlight */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.39, 0]}>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial
          color={activated ? "#162216" : "#161635"}
          metalness={0.45}
          roughness={0.4}
        />
      </mesh>

      {/* Rune circles */}
      <group ref={runeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]}>
        {[1.5, 2.5, 4, 5.5].map((r, i) => (
          <mesh key={i}>
            <ringGeometry args={[r - 0.02, r, 64]} />
            <meshStandardMaterial
              color={activated ? "#10b981" : i % 2 === 0 ? "#d4a017" : "#6366f1"}
              emissive={activated ? "#10b981" : i % 2 === 0 ? "#d4a017" : "#6366f1"}
              emissiveIntensity={activated ? 1.0 - i * 0.15 : 0.4 - i * 0.06}
              transparent
              opacity={activated ? 0.4 - i * 0.05 : 0.2 - i * 0.03}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* Radial rune marks */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const isMajor = i % 4 === 0;
          return (
            <mesh key={i} position={[Math.cos(a) * 3.2, Math.sin(a) * 3.2, 0]}>
              <boxGeometry args={[isMajor ? 0.08 : 0.04, 0.6, 0.005]} />
              <meshStandardMaterial
                color={activated ? "#10b981" : "#d4a017"}
                emissive={activated ? "#10b981" : "#d4a017"}
                emissiveIntensity={isMajor ? 0.6 : 0.3}
                transparent
                opacity={isMajor ? 0.35 : 0.15}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// ── Main Lazarus Scene — SPECTACULAR ──
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
    <div className="w-full rounded-2xl overflow-hidden relative" style={{ height: "clamp(300px, 45vh, 440px)" }}>
      <Canvas
        shadows
        camera={{ position: [0, 4.5, 5.5], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5,
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color(activated ? "#0a140a" : "#0a0a1c");
        }}
      >
        <Suspense fallback={null}>
          <PremiumLighting
            preset="sacred"
            accentColor={activated ? "#10b981" : "#d4a017"}
            rimColor={activated ? "#059669" : "#6366f1"}
          />

          <fog attach="fog" args={[activated ? "#0c180c" : "#0c0c20", 10, 25]} />

          {/* Sacred floor */}
          <LazarusFloor activated={activated} />

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
            count={activated ? 4 : 2}
            baseY={activated ? 2.5 : 2}
            baseRadius={1.5}
            color={activated ? "#10b981" : "#d4a017"}
          />

          {/* Ambient particles — more when activated */}
          <AmbientParticles
            count={activated ? 60 : 30}
            radius={5}
            height={4}
            color={activated ? "#10b981" : "#d4a017"}
            secondaryColor={activated ? "#fbbf24" : "#6366f1"}
          />

          <PremiumShadows y={-0.39} opacity={0.3} scale={12} />

          <PremiumPostProcessing
            bloomIntensity={activated ? 1.0 : 0.7}
            bloomThreshold={activated ? 0.25 : 0.35}
            bloomSmoothing={0.5}
            vignetteOpacity={activated ? 0.4 : 0.35}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={10}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.3}
            dampingFactor={0.08}
            enableDamping
            autoRotate={activated}
            autoRotateSpeed={activated ? 1.2 : 0}
          />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
