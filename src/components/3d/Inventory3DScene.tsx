import { useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Html, ContactShadows, Environment } from "@react-three/drei";
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
      {/* Pedestal — lighter */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.15, 8]} />
        <meshStandardMaterial color="#2a2a48" metalness={0.6} roughness={0.35} />
      </mesh>

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
            emissiveIntensity={isSelected ? 1.5 : hovered ? 0.8 : 0.4}
            metalness={0.8}
            roughness={0.18}
          />
        </mesh>
      </Float>

      <pointLight
        position={[0, 0.15, 0]}
        intensity={isSelected ? 2.5 : hovered ? 1.0 : 0.3}
        color={config.emissive}
        distance={2.5}
        decay={2}
      />

      {(isSelected || hovered) && (
        <Html position={[0, 0.55, 0]} center distanceFactor={5}>
          <div className="text-center pointer-events-none select-none max-w-[120px]">
            <div className="text-[10px] font-bold text-white/90">{item.name}</div>
            {isSelected && (
              <div className="text-[8px] text-white/60 mt-0.5">{item.description}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function SigilStand({ count, total }: { count: number; total: number }) {
  const standRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (standRef.current) {
      standRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group ref={standRef} position={[0, 0, 0]}>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.3, 8]} />
        <meshStandardMaterial color="#242448" metalness={0.7} roughness={0.25} />
      </mesh>

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
                color={obtained ? "#f59e0b" : "#333"}
                emissive={new THREE.Color(obtained ? "#f59e0b" : "#111")}
                emissiveIntensity={obtained ? 1.2 : 0.02}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            {obtained && (
              <pointLight position={[0, 0, 0]} intensity={0.6} color="#f59e0b" distance={1} decay={2} />
            )}
          </group>
        );
      })}
    </group>
  );
}

export function Inventory3DScene({ items, sigilsCollected, selectedItemId, onSelectItem }: Inventory3DSceneProps) {
  const sigils = items.filter(i => i.type === "master_sigil");
  const fragments = items.filter(i => i.type !== "master_sigil");

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
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#151530");
        }}
      >
        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.25} />

          <ambientLight intensity={0.65} color="#c0c8e0" />
          <directionalLight position={[4, 8, 4]} intensity={1.2} color="#ffe8c0" castShadow />
          <directionalLight position={[-3, 4, -2]} intensity={0.45} color="#99aadd" />
          <pointLight position={[0, 2, 0]} intensity={0.8} color="#d4a017" distance={12} />
          <pointLight position={[0, -0.2, 0]} intensity={0.2} color="#334477" distance={8} decay={2} />

          <fog attach="fog" args={["#181838", 12, 22]} />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#1e1e3a" metalness={0.35} roughness={0.55} />
          </mesh>

          <SigilStand count={sigils.length} total={7} />

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

          <ContactShadows position={[0, -0.29, 0]} opacity={0.25} scale={10} blur={2} />

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
