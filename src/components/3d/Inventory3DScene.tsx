import { useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Html, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { InventoryItem } from "@/hooks/useProgress";
import { PremiumLighting, PremiumShadows } from "./premium/PremiumLighting";
import { AmbientParticles } from "./premium/DecorativeElements";
import { PremiumPostProcessing } from "./premium/PostProcessing";

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

// ── Premium Artifact Display ──
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
  const haloRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const config = FRAG_COLORS[item.type] || FRAG_COLORS.key_fragment;
  const isSigil = item.type === "master_sigil";

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * (isSelected ? 1.8 : 0.6) + index;
      meshRef.current.rotation.x = Math.sin(t * 0.3 + index) * 0.12;
      const targetScale = isSelected ? 1.5 : hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
      meshRef.current.position.y = position[1] + 0.15 + Math.sin(t * 0.8 + index * 0.7) * 0.06;
    }
    if (haloRef.current) {
      const haloScale = isSelected ? 1.3 : hovered ? 1.1 : 0.9;
      haloRef.current.scale.lerp(new THREE.Vector3(haloScale, haloScale, haloScale), 0.08);
      (haloRef.current.material as THREE.MeshStandardMaterial).opacity =
        isSelected ? 0.25 : hovered ? 0.15 : 0.08;
    }
  });

  const geometry = useMemo(() => {
    switch (config.shape) {
      case "octa": return <octahedronGeometry args={[isSigil ? 0.28 : 0.2, 1]} />;
      case "icosa": return <icosahedronGeometry args={[0.2, 1]} />;
      case "dodeca": return <dodecahedronGeometry args={[0.2, 0]} />;
      case "torus": return <torusGeometry args={[0.16, 0.07, 16, 32]} />;
      case "cone": return <coneGeometry args={[0.17, 0.35, 8]} />;
    }
  }, [config.shape, isSigil]);

  return (
    <group position={position}>
      {/* Premium pedestal — tiered with accent */}
      <mesh position={[0, -0.22, 0]} receiveShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.08, 8]} />
        <meshStandardMaterial color="#1a1a38" metalness={0.7} roughness={0.25} envMapIntensity={0.5} />
      </mesh>
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.06, 8]} />
        <meshStandardMaterial color="#222248" metalness={0.65} roughness={0.3} />
      </mesh>
      {/* Pedestal accent ring */}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.22, 16]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={0.6}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Halo glow disc under artifact */}
      <mesh ref={haloRef} position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial
          color={config.emissive}
          emissive={config.emissive}
          emissiveIntensity={1.5}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Artifact */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
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
            emissiveIntensity={isSelected ? 2.0 : hovered ? 1.0 : 0.5}
            metalness={0.85}
            roughness={0.1}
            envMapIntensity={0.8}
          />
        </mesh>
      </Float>

      {/* Per-artifact point light */}
      <pointLight
        position={[0, 0.2, 0]}
        intensity={isSelected ? 3.0 : hovered ? 1.2 : 0.4}
        color={config.emissive}
        distance={2.5}
        decay={2}
      />

      {/* Tooltip */}
      {(isSelected || hovered) && (
        <Html position={[0, 0.6, 0]} center distanceFactor={5}>
          <div className="text-center pointer-events-none select-none max-w-[130px]">
            <div className="text-[10px] font-bold text-white/95 drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]">
              {item.name}
            </div>
            {isSelected && (
              <div className="text-[8px] text-white/65 mt-0.5">{item.description}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Premium Sigil Stand ──
function SigilStand({ count, total }: { count: number; total: number }) {
  const standRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (standRef.current) standRef.current.rotation.y = t * 0.12;
    if (ringRef.current) {
      ringRef.current.rotation.y = -t * 0.08;
      ringRef.current.rotation.x = Math.sin(t * 0.1) * 0.15;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Tiered base */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <cylinderGeometry args={[0.7, 0.8, 0.12, 8]} />
        <meshStandardMaterial color="#1a1a38" metalness={0.7} roughness={0.25} envMapIntensity={0.5} />
      </mesh>
      <mesh position={[0, -0.07, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.1, 8]} />
        <meshStandardMaterial color="#202045" metalness={0.65} roughness={0.3} />
      </mesh>

      {/* Accent ring */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.55, 32]} />
        <meshStandardMaterial
          color="#d4a017"
          emissive="#d4a017"
          emissiveIntensity={0.6}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating ring */}
      <mesh ref={ringRef} position={[0, 0.5, 0]}>
        <torusGeometry args={[0.6, 0.015, 16, 48]} />
        <meshStandardMaterial
          color="#d4a017"
          emissive="#d4a017"
          emissiveIntensity={0.8}
          metalness={1}
          roughness={0.05}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Sigil orbs */}
      <group ref={standRef}>
        {Array.from({ length: total }).map((_, i) => {
          const angle = (i / total) * Math.PI * 2;
          const x = Math.cos(angle) * 0.4;
          const z = Math.sin(angle) * 0.4;
          const obtained = i < count;
          return (
            <group key={i} position={[x, 0.15, z]}>
              <Float speed={2} floatIntensity={obtained ? 0.15 : 0}>
                <mesh>
                  <octahedronGeometry args={[obtained ? 0.1 : 0.05, 0]} />
                  <meshStandardMaterial
                    color={obtained ? "#fbbf24" : "#2a2a45"}
                    emissive={new THREE.Color(obtained ? "#fbbf24" : "#111")}
                    emissiveIntensity={obtained ? 1.8 : 0.02}
                    metalness={0.95}
                    roughness={0.05}
                  />
                </mesh>
              </Float>
              {obtained && (
                <pointLight position={[0, 0, 0]} intensity={0.8} color="#fbbf24" distance={1.2} decay={2} />
              )}
            </group>
          );
        })}
      </group>

      {/* Central glow */}
      <pointLight position={[0, 0.3, 0]} intensity={1.0 + (count / total) * 2} color="#d4a017" distance={4} decay={2} />
    </group>
  );
}

// ── Showcase Pillars — frame the inventory ──
function ShowcasePillars() {
  return (
    <group>
      {[[-2.5, 0, -0.5], [2.5, 0, -0.5], [-2.5, 0, 2.5], [2.5, 0, 2.5]].map(([x, _y, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 2, 6]} />
            <meshStandardMaterial color="#181835" metalness={0.7} roughness={0.25} />
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <octahedronGeometry args={[0.04, 0]} />
            <meshStandardMaterial
              color="#6366f1"
              emissive="#6366f1"
              emissiveIntensity={1.0}
              metalness={1}
              roughness={0}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── Main Inventory Scene — PREMIUM ──
export function Inventory3DScene({ items, sigilsCollected, selectedItemId, onSelectItem }: Inventory3DSceneProps) {
  const sigils = items.filter(i => i.type === "master_sigil");
  const fragments = items.filter(i => i.type !== "master_sigil");

  const fragmentPositions = useMemo(() => {
    const cols = Math.min(5, fragments.length);
    return fragments.map((_, i): [number, number, number] => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const offsetX = -(cols - 1) * 0.7 / 2;
      return [offsetX + col * 0.7, 0, 1.5 + row * 0.8];
    });
  }, [fragments.length]);

  if (items.length === 0) return null;

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ height: "clamp(240px, 40vh, 380px)" }}>
      <Canvas
        shadows
        camera={{ position: [0, 3.5, 4.5], fov: 44 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5,
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#0c0c1e");
        }}
      >
        <Suspense fallback={null}>
          <PremiumLighting preset="showcase" accentColor="#d4a017" rimColor="#6366f1" />

          <fog attach="fog" args={["#0e0e22", 10, 20]} />

          {/* Premium floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
            <planeGeometry args={[12, 12]} />
            <meshStandardMaterial color="#141430" metalness={0.5} roughness={0.35} envMapIntensity={0.5} />
          </mesh>
          {/* Floor accent rings */}
          {[1.5, 3, 4.5].map((r, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.29, 0]}>
              <ringGeometry args={[r - 0.02, r, 64]} />
              <meshStandardMaterial
                color={i === 1 ? "#6366f1" : "#d4a017"}
                emissive={i === 1 ? "#6366f1" : "#d4a017"}
                emissiveIntensity={0.4 - i * 0.08}
                transparent
                opacity={0.2 - i * 0.04}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}

          {/* Showcase pillars */}
          <ShowcasePillars />

          {/* Sigil stand */}
          <SigilStand count={sigils.length} total={7} />

          {/* Artifact items */}
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

          {/* Ambient particles */}
          <AmbientParticles count={25} radius={4} height={3} color="#d4a017" secondaryColor="#6366f1" />

          <PremiumShadows y={-0.29} opacity={0.25} scale={12} />

          <PremiumPostProcessing
            bloomIntensity={0.6}
            bloomThreshold={0.35}
            bloomSmoothing={0.5}
            vignetteOpacity={0.3}
          />

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
