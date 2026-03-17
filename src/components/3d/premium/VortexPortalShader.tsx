import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Energy Vortex Portal — animated GLSL shader with Voronoi distortion.
 * Replaces flat emissive planes with living energy fields.
 */
export function VortexPortal({
  width = 0.82,
  height = 1.4,
  color = "#6366f1",
  secondaryColor = "#d4a017",
  intensity = 1.5,
  speed = 1.0,
  activated = true,
}: {
  width?: number;
  height?: number;
  color?: string;
  secondaryColor?: string;
  intensity?: number;
  speed?: number;
  activated?: boolean;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const shaderData = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uColor2: { value: new THREE.Color(secondaryColor) },
      uIntensity: { value: intensity },
      uSpeed: { value: speed },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uColor2;
      uniform float uIntensity;
      uniform float uSpeed;
      varying vec2 vUv;

      // Simple 2D Voronoi
      vec2 hash2(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return fract(sin(p) * 43758.5453);
      }

      float voronoi(vec2 p) {
        vec2 n = floor(p);
        vec2 f = fract(p);
        float md = 8.0;
        for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = hash2(n + g);
            o = 0.5 + 0.5 * sin(uTime * uSpeed * 0.8 + 6.2831 * o);
            vec2 r = g + o - f;
            float d = dot(r, r);
            md = min(md, d);
          }
        }
        return sqrt(md);
      }

      void main() {
        vec2 center = vUv - 0.5;
        float dist = length(center);

        // Radial distortion
        float angle = atan(center.y, center.x);
        float twist = angle + uTime * uSpeed * 0.5 + dist * 3.0;

        // Voronoi energy pattern
        vec2 uvDistorted = vec2(
          cos(twist) * dist * 4.0 + uTime * uSpeed * 0.2,
          sin(twist) * dist * 4.0 + uTime * uSpeed * 0.15
        );
        float v = voronoi(uvDistorted * 3.0);

        // Energy veins — thin bright lines
        float veins = 1.0 - smoothstep(0.0, 0.15, v);
        
        // Outer glow ring
        float ring = smoothstep(0.5, 0.35, dist) * smoothstep(0.0, 0.08, dist);

        // Color mixing
        vec3 col = mix(uColor, uColor2, v * 0.7 + sin(uTime * 0.5) * 0.15);
        col += veins * uColor2 * 2.0;

        // Pulse
        float pulse = sin(uTime * uSpeed * 2.0 - dist * 6.0) * 0.15 + 0.85;

        float alpha = (veins * 0.6 + ring * 0.4 + v * 0.1) * uIntensity * pulse;
        alpha *= smoothstep(0.52, 0.38, dist); // Fade at edges

        gl_FragColor = vec4(col * (1.0 + veins * 1.5), alpha);
      }
    `,
  }), [color, secondaryColor, intensity, speed]);

  useFrame(({ clock }) => {
    if (matRef.current && activated) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  if (!activated) return null;

  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        ref={matRef}
        args={[shaderData]}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
