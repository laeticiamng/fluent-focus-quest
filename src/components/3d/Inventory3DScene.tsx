import { useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { InventoryItem } from "@/hooks/useProgress";

interface Inventory3DSceneProps {
  items: InventoryItem[];
  sigilsCollected: string[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
}

const FRAG_COLORS: Record<string, { color: string; emissive: string; shape: "octa" | "icosa" | "dodeca" | "torus" | "cone" }> = {
  key_fragment: { color: "#f59e0b", emissive: "#d97706", shape: "octa" },
  code_digit: { color: "#3b82f6", emissive: "#2563eb", shape: "dodeca" },
  medical_rune: { color: "#10b981", emissive: "#059669", shape: "icosa" },
  vocal_seal: { color: "#8b5cf6", emissive: "#7c3aed", shape: "torus" },
  clinical_artifact: { color: "#f43f5e", emissive: "#e11d48", shape: "cone" },
  sonic_rune: { color: "#f97316", emissive: "#ea580c", shape: "icosa" },
  archive_piece: { color: "#06b6d4", emissive: "#0891b2", shape: "dodeca" },
  master_sigil: { color: "#fbbf24", emissive: "#f59e0b", shape: "octa" },
};

// ── Artifact Object ──
function ArtifactObject({
  item,
  position,
  isSelected,
  onSelect,
  index,
}: {
  item: InventoryItem;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const config = FRAG_COLORS[item.type] || FRAG_COLORS.key_fragment;
  const isSigil = item.type === "master_sigil";

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * (isSelected ? 1.5 : 0.5) + index;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3 + index) * 0.15;
      const targetScale = isSelected ? 1.4 : hovered ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      // Float
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.8 + index * 0.7) * 0.08;
    }
  });

  const geometry = useMemo(() => {
    switch (config.shape) {
      case "octa": return <octahedronGeometry args={[isSigil ? 0.25 : 0.18, 0]} />;
      case "icosa": return <icosahedronGeometry args={[0.18, 0]} />;
      case "dodeca": return <dodecahedronGeometry args={[0.18, 0]} />;
      case "torus": return <torusGeometry args={[0.14, 0.06, 16, 32]} />;
      case "cone": return <coneGeometry args={[0.15, 0.3, 6]} />;
    }
  }, [config.shape, isSigil]);

  return (
    <group position={position}>
      {/* Pedestal */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.15, 8]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* The artifact */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
        <mesh
          ref={meshRef}
          position={[0, 0.15, 0]}
          castShadow
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
        >
          {geometry}
          <meshStandardMaterial
            color={config.color}
            emissive={new THREE.Color(config.emissive)}
            emissiveIntensity={isSelected ? 1.2 : hovered ? 0.6 : 0.3}
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>
      </Float>

      {/* Glow light */}
      <pointLight
        position={[0, 0.15, 0]}
        intensity={isSelected ? 2 : hovered ? 0.8 : 0.2}
        color={config.emissive}
        distance={2}
        decay={2}
      />

      {/* Label */}
      {(isSelected || hovered) && (
        <Html position={[0, 0.55, 0]} center distanceFactor={5}>
          <div className="text-center pointer-events-none select-none max-w-[120px]">
            <div className="text-[10px] font-bold text-white/90">{item.name}</div>
            {isSelected && (
              <div className="text-[8px] text-white/50 mt-0.5">{item.description}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Sigil Display Stand ──
function SigilStand({ count, total }: { count: number; total: number }) {
  const standRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (standRef.current) {
      standRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group ref={standRef} position={[0, 0, 0]}>
      {/* Central pedestal */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.3, 8]} />
        <meshStandardMaterial color="#16213e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Sigil slots in a circle */}
      {Array.from({ length: total }).map((_, i) => {
        const angle = (i / total) * Math.PI * 2;
        const x = Math.cos(angle) * 0.35;
        const z = Math.sin(angle) * 0.35;
        const obtained = i < count;
        return (
          <group key={i} position={[x, 0.2, z]}>
            <mesh>
              <octahedronGeometry args={[0.08, 0]} />
              <meshStandardMaterial
                color={obtained ? "#f59e0b" : "#222"}
                emissive={new THREE.Color(obtained ? "#f59e0b" : "#000")}
                emissiveIntensity={obtained ? 1 : 0}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            {obtained && (
              <pointLight position={[0, 0, 0]} intensity={0.5} color="#f59e0b" distance={1} decay={2} />
            )}
          </group>
        );
      })}
    </group>
  );
}

// ── Main Inventory 3D Scene ──
export function Inventory3DScene({ items, sigilsCollected, selectedItemId, onSelectItem }: Inventory3DSceneProps) {
  const sigils = items.filter(i => i.type === "master_sigil");
  const fragments = items.filter(i => i.type !== "master_sigil");

  // Arrange fragments in a grid
  const fragmentPositions = useMemo(() => {
    const cols = Math.min(5, fragments.length);
    return fragments.map((_, i): [number, number, number] => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const offsetX = -(cols - 1) * 0.6 / 2;
      return [offsetX + col * 0.6, 0, 1.5 + row * 0.7];
    });
  }, [fragments.length]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ height: "clamp(240px, 40vh, 380px)" }}>
      <Canvas
        shadows
        camera={{ position: [0, 3, 4], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.15} color="#8888aa" />
          <directionalLight position={[3, 5, 3]} intensity={0.3} color="#ffe4b5" castShadow />
          <pointLight position={[0, 2, 0]} intensity={0.4} color="#d4a017" distance={8} />

          <fog attach="fog" args={["#080818", 6, 14]} />

          {/* Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#0a0a1a" metalness={0.4} roughness={0.6} />
          </mesh>

          {/* Sigil stand */}
          <SigilStand count={sigils.length} total={7} />

          {/* Fragment objects */}
          {fragments.map((item, i) => (
            <ArtifactObject
              key={item.id}
              item={item}
              position={fragmentPositions[i] || [0, 0, 0]}
              isSelected={selectedItemId === item.id}
              onSelect={() => onSelectItem(selectedItemId === item.id ? null : item.id)}
              index={i}
            />
          ))}

          <ContactShadows position={[0, -0.29, 0]} opacity={0.3} scale={10} blur={2} />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.3}
            dampingFactor={0.08}
            enableDamping
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
