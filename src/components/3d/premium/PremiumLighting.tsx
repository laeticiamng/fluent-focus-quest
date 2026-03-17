import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

// ── GLSL Simplex Noise (inline) ──
const NOISE_GLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

/**
 * Animated GLSL Nebula Skybox — living, breathing cosmic dome.
 * Replaces static canvas texture with real-time shader.
 */
function NebulaSkybox({ preset = "default" }: { preset?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const palettes: Record<string, { c1: string; c2: string; c3: string; c4: string }> = {
    default:  { c1: "#050510", c2: "#0c0c2a", c3: "#6366f1", c4: "#d4a017" },
    dramatic: { c1: "#030308", c2: "#0a0822", c3: "#7c3aed", c4: "#f59e0b" },
    sacred:   { c1: "#040410", c2: "#0e0a28", c3: "#8b5cf6", c4: "#10b981" },
    showcase: { c1: "#060612", c2: "#0e0e2e", c3: "#6366f1", c4: "#d4a017" },
  };
  const p = palettes[preset] || palettes.default;

  const shaderData = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(p.c1) },
      uColor2: { value: new THREE.Color(p.c2) },
      uColor3: { value: new THREE.Color(p.c3) },
      uColor4: { value: new THREE.Color(p.c4) },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      ${NOISE_GLSL}
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform vec3 uColor4;
      varying vec3 vWorldPos;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        vec3 dir = normalize(vWorldPos);
        float elevation = dir.y * 0.5 + 0.5;

        // Base gradient
        vec3 base = mix(uColor1, uColor2, smoothstep(0.0, 0.6, elevation));

        // Nebula layers — flowing noise at different scales and speeds
        float n1 = snoise(dir * 2.0 + uTime * 0.02) * 0.5 + 0.5;
        float n2 = snoise(dir * 4.0 - uTime * 0.015 + 10.0) * 0.5 + 0.5;
        float n3 = snoise(dir * 8.0 + uTime * 0.01 + 20.0) * 0.5 + 0.5;

        // Nebula glow — colored clouds
        vec3 nebula1 = uColor3 * pow(n1, 3.0) * 0.15;
        vec3 nebula2 = uColor4 * pow(n2, 4.0) * 0.1;
        vec3 nebula3 = mix(uColor3, uColor4, 0.5) * pow(n3, 5.0) * 0.08;

        // Pulsating intensity
        float pulse = sin(uTime * 0.3) * 0.1 + 0.9;

        vec3 col = base + (nebula1 + nebula2 + nebula3) * pulse;

        // Stars — pseudo-random bright points
        vec2 starUV = vUv * 200.0;
        float starHash = hash(floor(starUV));
        float starBright = step(0.992, starHash);
        float twinkle = sin(uTime * (2.0 + starHash * 4.0) + starHash * 100.0) * 0.4 + 0.6;
        col += vec3(starBright * twinkle * 0.7);

        // Bright stars with glow
        vec2 starUV2 = vUv * 80.0;
        float starHash2 = hash(floor(starUV2));
        float bigStar = step(0.997, starHash2);
        float bigTwinkle = sin(uTime * (1.0 + starHash2 * 3.0) + starHash2 * 50.0) * 0.3 + 0.7;
        col += vec3(bigStar * bigTwinkle * 1.2);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  }), [p.c1, p.c2, p.c3, p.c4]);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.003;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[50, 64, 32]} />
      <shaderMaterial
        ref={matRef}
        args={[shaderData]}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Breathing light — a point light that pulses subtly over time.
 */
function BreathingLight({
  position,
  baseIntensity,
  color,
  distance,
  breathSpeed = 0.8,
  breathAmount = 0.3,
}: {
  position: [number, number, number];
  baseIntensity: number;
  color: string;
  distance: number;
  breathSpeed?: number;
  breathAmount?: number;
}) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.getElapsedTime();
      lightRef.current.intensity = baseIntensity + Math.sin(t * breathSpeed) * breathAmount * baseIntensity;
    }
  });

  return (
    <pointLight ref={lightRef} position={position} intensity={baseIntensity} color={color} distance={distance} decay={2} />
  );
}

/**
 * Cinematic lighting rig — premium immersive 2026.
 * 8-light setup with breathing dynamics for living feel.
 * Now with animated GLSL nebula skybox.
 */
export function PremiumLighting({
  preset = "default",
  accentColor = "#d4a017",
  rimColor = "#6366f1",
  intensity = 1,
}: {
  preset?: "default" | "dramatic" | "sacred" | "showcase";
  accentColor?: string;
  rimColor?: string;
  intensity?: number;
}) {
  const mult = intensity;

  const presets = {
    default:  { ambient: 0.35, key: 2.0, fill: 0.5, rim: 1.2, accent: 1.4, envIntensity: 0.3, backFill: 0.3 },
    dramatic: { ambient: 0.2,  key: 2.4, fill: 0.3, rim: 1.6, accent: 2.0, envIntensity: 0.2, backFill: 0.2 },
    sacred:   { ambient: 0.3,  key: 1.8, fill: 0.45, rim: 1.4, accent: 2.2, envIntensity: 0.25, backFill: 0.35 },
    showcase: { ambient: 0.45, key: 1.6, fill: 0.65, rim: 0.9, accent: 1.0, envIntensity: 0.4, backFill: 0.25 },
  };

  const p = presets[preset];

  return (
    <>
      {/* HDRI for reflections only */}
      <Environment preset="city" environmentIntensity={p.envIntensity} background={false} />

      {/* Animated GLSL nebula skybox — living cosmic dome */}
      <NebulaSkybox preset={preset} />

      {/* Ambient — desaturated cool blue for depth */}
      <ambientLight intensity={p.ambient * mult} color="#a0b0d0" />

      {/* Key light — warm cinematic from upper-right-front */}
      <directionalLight
        position={[6, 14, 7]}
        intensity={p.key * mult}
        color="#ffe4b5"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-near={0.1}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.001}
      />

      {/* Fill light — cool steel blue */}
      <directionalLight position={[-6, 8, -5]} intensity={p.fill * mult} color="#7090bb" />

      {/* Rim lights — breathing for living feel */}
      <BreathingLight position={[0, 3, -10]} baseIntensity={p.rim * mult} color={rimColor} distance={25} breathSpeed={0.6} breathAmount={0.15} />
      <BreathingLight position={[-8, 2, -5]} baseIntensity={p.rim * 0.5 * mult} color="#7c3aed" distance={18} breathSpeed={0.45} breathAmount={0.2} />
      <BreathingLight position={[8, 2, -5]} baseIntensity={p.rim * 0.35 * mult} color="#4f46e5" distance={14} breathSpeed={0.55} breathAmount={0.18} />

      {/* Top accent — breathing gold spotlight */}
      <BreathingLight position={[0, 10, 0]} baseIntensity={p.accent * mult} color={accentColor} distance={25} breathSpeed={0.4} breathAmount={0.12} />

      {/* Under-fill */}
      <pointLight position={[0, -2, 0]} intensity={p.backFill * mult} color="#1e2a4a" distance={15} decay={2} />

      {/* Side accents with breathing */}
      <BreathingLight position={[7, 1.5, 3]} baseIntensity={0.35 * mult} color="#22d3ee" distance={12} breathSpeed={0.7} breathAmount={0.25} />
      <BreathingLight position={[-7, 1.5, 3]} baseIntensity={0.2 * mult} color="#f59e0b" distance={10} breathSpeed={0.5} breathAmount={0.2} />
    </>
  );
}

/**
 * Premium contact shadows — soft, cinematic ground contact.
 */
export function PremiumShadows({
  y = -0.49,
  opacity = 0.4,
  scale = 18,
}: {
  y?: number;
  opacity?: number;
  scale?: number;
}) {
  return (
    <ContactShadows
      position={[0, y, 0]}
      opacity={opacity}
      scale={scale}
      blur={3}
      far={8}
      color="#050510"
    />
  );
}
