import { useRef, useState, useCallback, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Html, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import { META_PUZZLE_FRAGMENTS, type MetaPuzzleFragment } from "@/data/puzzleEngine";

interface LazarusSceneProps {
  sigilsCollected: string[];
  arrangement: string[];
  onAddToArrangement: (fragmentId: string) => void;
  onRemoveFromArrangement: (fragmentId: string) => void;
  activated: boolean;
  feedback: string | null;
}

// ── Central Altar ──
function Altar({ sigilCount, activated }: { sigilCount: number; activated: boolean }) {
  const altarRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (coreRef.current) {
      coreRef.current.rotation.y = clock.getElapsedTime() * (activated ? 2 : 0.5);
      const s = activated ? 1.3 : 1;
      coreRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.05);
    }
  });

  return (
    <group ref={altarRef} position={[0, 0, 0]}>
      {/* Base — lighter */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[1.8, 2, 0.4, 8]} />
        <meshStandardMaterial
          color={activated ? "#253525" : "#242448"}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      {/* Inner ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.04, 16, 48]} />
        <meshStandardMaterial
          color={activated ? "#10b981" : "#d4a017"}
          emissive={new THREE.Color(activated ? "#10b981" : "#d4a017")}
          emissiveIntensity={activated ? 1.8 : 0.5}
          metalness={1}
          roughness={0.1}
        />
      </mesh>

      {/* Outer ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.03, 16, 48]} />
        <meshStandardMaterial
          color="#d4a017"
          emissive="#d4a017"
          emissiveIntensity={0.25}
          metalness={1}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Central core */}
      <Float speed={activated ? 3 : 1} floatIntensity={activated ? 0.5 : 0.1}>
        <mesh ref={coreRef} position={[0, 0.8, 0]} castShadow>
          <icosahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial
            color={activated ? "#fbbf24" : "#4a506a"}
            emissive={new THREE.Color(activated ? "#fbbf24" : "#6366f1")}
            emissiveIntensity={activated ? 2.5 : 0.4}
            metalness={0.9}
            roughness={0.08}
          />
        </mesh>
      </Float>

      {/* Core light */}
      <pointLight
        position={[0, 0.8, 0]}
        intensity={activated ? 5 : 0.8}
        color={activated ? "#fbbf24" : "#6366f1"}
        distance={8}
        decay={2}
      />
    </group>
  );
}

// ── Sigil Slot ──
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
  const radius = 1.3;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  useFrame(({ clock }) => {
    if (meshRef.current) {
      if (isPlaced || activated) {
        meshRef.current.rotation.y = clock.getElapsedTime() * 1.5;
        meshRef.current.position.y = 0.3 + Math.sin(clock.getElapsedTime() * 2 + index) * 0.05;
      } else {
        meshRef.current.rotation.y = clock.getElapsedTime() * 0.3 + index;
        meshRef.current.position.y = 0.15;
      }
    }
  });

  const handleClick = useCallback(() => {
    if (activated) return;
    if (isPlaced) {
      onRemove();
    } else if (isObtained) {
      onPlace();
    }
  }, [activated, isPlaced, isObtained, onPlace, onRemove]);

  const slotColor = isPlaced ? "#f59e0b" : isObtained ? "#5a5a7a" : "#2a2a40";
  const emissive = isPlaced ? "#f59e0b" : isObtained && hovered ? "#6366f1" : "#111";

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.1, 6]} />
        <meshStandardMaterial
          color={isPlaced ? "#3a2a10" : "#1a1a30"}
          metalness={0.6}
          roughness={0.35}
          emissive={new THREE.Color(isPlaced ? "#f59e0b" : "#111")}
          emissiveIntensity={isPlaced ? 0.3 : 0.01}
        />
      </mesh>

      <mesh
        ref={meshRef}
        position={[0, 0.15, 0]}
        castShadow
        onClick={(e) => { e.stopPropagation(); handleClick(); }}
        onPointerOver={() => { setHovered(true); if (isObtained && !activated) document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
      >
        <octahedronGeometry args={[isPlaced ? 0.14 : isObtained ? 0.12 : 0.06, 0]} />
        <meshStandardMaterial
          color={slotColor}
          emissive={new THREE.Color(emissive)}
          emissiveIntensity={isPlaced ? 1.2 : hovered ? 0.6 : 0.05}
          metalness={0.85}
          roughness={0.12}
          transparent={!isObtained}
          opacity={isObtained ? 1 : 0.3}
        />
      </mesh>

      {isPlaced && (
        <pointLight position={[0, 0.2, 0]} intensity={1.8} color="#f59e0b" distance={1.8} decay={2} />
      )}

      <Html position={[0, -0.25, 0]} center distanceFactor={6}>
        <div className={`text-center pointer-events-none select-none ${isObtained ? "" : "opacity-25"}`}>
          <div className="text-xs">{isObtained ? fragment.icon : "?"}</div>
          <div className="text-[7px] text-white/60 whitespace-nowrap">
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

// ── Main Lazarus Scene ──
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
        camera={{ position: [0, 4, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color(activated ? "#141e14" : "#151530");
        }}
      >
        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.2} />

          <ambientLight intensity={0.6} color="#b8b8d8" />
          <directionalLight position={[4, 10, 4]} intensity={1.2} color="#ffe8c0" castShadow />
          <directionalLight position={[-3, 5, -2]} intensity={0.45} color="#99aadd" />
          <pointLight position={[0, 3, 0]} intensity={0.7} color={activated ? "#10b981" : "#6366f1"} distance={12} decay={2} />
          <pointLight position={[0, -0.2, 0]} intensity={0.2} color="#334477" distance={8} decay={2} />

          <fog attach="fog" args={[activated ? "#152015" : "#181838", 12, 24]} />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
            <circleGeometry args={[5, 64]} />
            <meshStandardMaterial color="#1e1e3a" metalness={0.35} roughness={0.5} />
          </mesh>

          <Altar sigilCount={sigilsCollected.length} activated={activated} />

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

          <ContactShadows position={[0, -0.39, 0]} opacity={0.25} scale={10} blur={2} />

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
            autoRotateSpeed={activated ? 1 : 0}
          />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
