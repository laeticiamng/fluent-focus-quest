import { useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Html, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { InventoryItem } from "@/hooks/useProgress";
import { PremiumLighting, PremiumShadows } from "./premium/PremiumLighting";
import { AmbientParticles, FloatingRings, BackgroundStructures, CinematicIntro, Fireflies } from "./premium/DecorativeElements";
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

// ── Premium Artifact Display — relic showcase ──
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
      meshRef.current.rotation.y = t * (isSelected ? 1.5 : 0.5) + index;
      meshRef.current.rotation.x = Math.sin(t * 0.25 + index) * 0.1;
      const targetScale = isSelected ? 1.6 : hovered ? 1.25 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
      meshRef.current.position.y = position[1] + 0.18 + Math.sin(t * 0.7 + index * 0.7) * 0.05;
    }
    if (haloRef.current) {
      const haloScale = isSelected ? 1.4 : hovered ? 1.15 : 0.95;
      haloRef.current.scale.lerp(new THREE.Vector3(haloScale, haloScale, haloScale), 0.08);
      (haloRef.current.material as THREE.MeshStandardMaterial).opacity =
        isSelected ? 0.3 : hovered ? 0.18 : 0.08;
    }
  });

  const geometry = useMemo(() => {
    switch (config.shape) {
      case "octa": return <octahedronGeometry args={[isSigil ? 0.3 : 0.22, 1]} />;
      case "icosa": return <icosahedronGeometry args={[0.22, 1]} />;
      case "dodeca": return <dodecahedronGeometry args={[0.22, 0]} />;
      case "torus": return <torusGeometry args={[0.17, 0.075, 16, 32]} />;
      case "cone": return <coneGeometry args={[0.18, 0.38, 8]} />;
    }
  }, [config.shape, isSigil]);

  return (
    <group position={position}>
      {/* ── Tiered pedestal — noble dark metal ── */}
      <mesh position={[0, -0.24, 0]} receiveShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.08, 8]} />
        <meshStandardMaterial color="#141432" metalness={0.75} roughness={0.2} envMapIntensity={0.5} />
      </mesh>
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.06, 8]} />
        <meshStandardMaterial color="#1e1e42" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Pedestal accent ring */}
      <mesh position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.24, 16]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={0.7}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Halo glow disc ── */}
      <mesh ref={haloRef} position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 16]} />
        <meshStandardMaterial
          color={config.emissive}
          emissive={config.emissive}
          emissiveIntensity={1.8}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Artifact gem ── */}
      <Float speed={1.8} rotationIntensity={0} floatIntensity={0.15}>
        <mesh
          ref={meshRef}
          position={[0, 0.18, 0]}
          castShadow
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
        >
          {geometry}
          <meshPhysicalMaterial
            color={config.color}
            emissive={new THREE.Color(config.emissive)}
            emissiveIntensity={isSelected ? 2.5 : hovered ? 1.2 : 0.6}
            metalness={0.9}
            roughness={0.08}
            envMapIntensity={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
            iridescence={isSelected ? 0.8 : 0.3}
            iridescenceIOR={1.6}
          />
        </mesh>
      </Float>

      {/* ── Per-artifact point light ── */}
      <pointLight
        position={[0, 0.25, 0]}
        intensity={isSelected ? 3.5 : hovered ? 1.5 : 0.5}
        color={config.emissive}
        distance={2.5}
        decay={2}
      />

      {/* ── Tooltip ── */}
      {(isSelected || hovered) && (
        <Html position={[0, 0.65, 0]} center distanceFactor={5}>
          <div className="text-center pointer-events-none select-none max-w-[140px]">
            <div
              className="text-[10px] font-bold"
              style={{
                color: "rgba(255,255,255,0.95)",
                textShadow: `0 0 6px rgba(0,0,0,0.9), 0 0 12px ${config.emissive}`,
              }}
            >
              {item.name}
            </div>
            {isSelected && (
              <div className="text-[8px] text-white/60 mt-0.5">{item.description}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Premium Sigil Stand — reliquary centerpiece ──
function SigilStand({ count, total }: { count: number; total: number }) {
  const standRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (standRef.current) standRef.current.rotation.y = t * 0.1;
    if (ringRef.current) {
      ringRef.current.rotation.y = -t * 0.07;
      ringRef.current.rotation.x = Math.sin(t * 0.08) * 0.12;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = t * 0.06;
      ring2Ref.current.rotation.x = Math.cos(t * 0.06) * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ── Tiered base ── */}
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.12, 8]} />
        <meshStandardMaterial color="#141432" metalness={0.75} roughness={0.2} envMapIntensity={0.5} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.6, 0.72, 0.1, 8]} />
        <meshStandardMaterial color="#1a1a40" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[0.45, 0.55, 0.06, 8]} />
        <meshStandardMaterial
          color="#202048"
          metalness={0.65}
          roughness={0.28}
          emissive="#d4a017"
          emissiveIntensity={0.04}
        />
      </mesh>

      {/* ── Accent ring ── */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.52, 0.58, 32]} />
        <meshStandardMaterial
          color="#d4a017"
          emissive="#d4a017"
          emissiveIntensity={0.7}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Floating ring pair ── */}
      <mesh ref={ringRef} position={[0, 0.55, 0]}>
        <torusGeometry args={[0.65, 0.012, 16, 48]} />
        <meshStandardMaterial
          color="#d4a017"
          emissive="#d4a017"
          emissiveIntensity={0.9}
          metalness={1}
          roughness={0.03}
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh ref={ring2Ref} position={[0, 0.5, 0]} rotation={[0.4, 0, 0.3]}>
        <torusGeometry args={[0.5, 0.008, 16, 36]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.5}
          metalness={1}
          roughness={0.05}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* ── Sigil orbs ── */}
      <group ref={standRef}>
        {Array.from({ length: total }).map((_, i) => {
          const angle = (i / total) * Math.PI * 2;
          const x = Math.cos(angle) * 0.42;
          const z = Math.sin(angle) * 0.42;
          const obtained = i < count;
          return (
            <group key={i} position={[x, 0.18, z]}>
              <Float speed={1.8} floatIntensity={obtained ? 0.12 : 0}>
                <mesh>
                  <octahedronGeometry args={[obtained ? 0.11 : 0.045, 0]} />
                  <meshStandardMaterial
                    color={obtained ? "#fbbf24" : "#1e1e3a"}
                    emissive={new THREE.Color(obtained ? "#fbbf24" : "#0a0a15")}
                    emissiveIntensity={obtained ? 2.0 : 0.02}
                    metalness={0.95}
                    roughness={0.04}
                  />
                </mesh>
              </Float>
              {obtained && (
                <pointLight position={[0, 0, 0]} intensity={1.0} color="#fbbf24" distance={1.2} decay={2} />
              )}
            </group>
          );
        })}
      </group>

      {/* ── Central glow ── */}
      <pointLight position={[0, 0.35, 0]} intensity={1.2 + (count / total) * 2.5} color="#d4a017" distance={5} decay={2} />
    </group>
  );
}

// ── Showcase Pillars — ornate frame pillars ──
function ShowcasePillars() {
  return (
    <group>
      {([[-2.8, 0, -0.5], [2.8, 0, -0.5], [-2.8, 0, 3], [2.8, 0, 3]] as [number, number, number][]).map((pos, i) => (
        <group key={i} position={pos}>
          {/* Base */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.09, 0.12, 0.12, 6]} />
            <meshStandardMaterial color="#121230" metalness={0.7} roughness={0.25} />
          </mesh>
          {/* Column */}
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.04, 0.07, 2.2, 6]} />
            <meshStandardMaterial color="#151535" metalness={0.75} roughness={0.2} />
          </mesh>
          {/* Accent band */}
          <mesh position={[0, 1.4, 0]}>
            <torusGeometry args={[0.055, 0.007, 8, 16]} />
            <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.5} metalness={1} roughness={0.05} transparent opacity={0.4} />
          </mesh>
          {/* Crown */}
          <mesh position={[0, 2.05, 0]}>
            <octahedronGeometry args={[0.04, 0]} />
            <meshStandardMaterial
              color="#6366f1"
              emissive="#6366f1"
              emissiveIntensity={1.2}
              metalness={1}
              roughness={0}
            />
          </mesh>
          <pointLight position={[0, 2.1, 0]} intensity={0.25} color="#6366f1" distance={3} decay={2} />
        </group>
      ))}
    </group>
  );
}

// ── Main Inventory Scene — RELIC SHOWCASE ──
export function Inventory3DScene({ items, sigilsCollected, selectedItemId, onSelectItem }: Inventory3DSceneProps) {
  const sigils = items.filter(i => i.type === "master_sigil");
  const fragments = items.filter(i => i.type !== "master_sigil");

  const fragmentPositions = useMemo(() => {
    const cols = Math.min(5, fragments.length);
    return fragments.map((_, i): [number, number, number] => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const offsetX = -(cols - 1) * 0.75 / 2;
      return [offsetX + col * 0.75, 0, 1.5 + row * 0.85];
    });
  }, [fragments.length]);

  if (items.length === 0) return null;

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ height: "clamp(260px, 42vh, 400px)" }}>
      <Canvas
        shadows
        camera={{ position: [0, 3.8, 5], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#08081a");
        }}
      >
        <Suspense fallback={null}>
          <CinematicIntro targetPosition={[0, 3.8, 5]} startOffset={[0, 2, 4]} duration={2.0} />

          <PremiumLighting preset="showcase" accentColor="#d4a017" rimColor="#6366f1" />

          <fog attach="fog" args={["#0a0a1e", 8, 22]} />

          {/* ── Premium floor — dark showcase surface ── */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.32, 0]} receiveShadow>
            <planeGeometry args={[14, 14]} />
            <meshStandardMaterial color="#111128" metalness={0.6} roughness={0.28} envMapIntensity={0.5} />
          </mesh>
          {/* Inner floor highlight */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.31, 0]}>
            <circleGeometry args={[4, 48]} />
            <meshStandardMaterial color="#161638" metalness={0.55} roughness={0.32} />
          </mesh>
          {/* Floor accent rings */}
          {[1.5, 3, 4.8].map((r, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.305, 0]}>
              <ringGeometry args={[r - 0.02, r, 64]} />
              <meshStandardMaterial
                color={i === 1 ? "#6366f1" : "#d4a017"}
                emissive={i === 1 ? "#6366f1" : "#d4a017"}
                emissiveIntensity={0.45 - i * 0.08}
                transparent
                opacity={0.22 - i * 0.04}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}

          {/* Showcase pillars */}
          <ShowcasePillars />

          {/* Floating rings above sigil stand */}
          <FloatingRings count={2} baseY={1.5} baseRadius={1.2} color="#d4a017" />

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
          <AmbientParticles count={30} radius={5} height={3.5} color="#d4a017" secondaryColor="#6366f1" />

          {/* Fireflies — adds life to showcase */}
          <Fireflies count={12} radius={4} height={3} color="#fbbf24" secondaryColor="#6366f1" />

          {/* Background depth */}
          <BackgroundStructures count={4} minRadius={10} maxRadius={16} height={4} color="#080818" />

          <PremiumShadows y={-0.31} opacity={0.3} scale={14} />

          <PremiumPostProcessing
            bloomIntensity={0.75}
            bloomThreshold={0.3}
            bloomSmoothing={0.6}
            vignetteOpacity={0.35}
            chromaticAberration={0.0005}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI / 7}
            maxPolarAngle={Math.PI / 2.3}
            dampingFactor={0.06}
            enableDamping
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
