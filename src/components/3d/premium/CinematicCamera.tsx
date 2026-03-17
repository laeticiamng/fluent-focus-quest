import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Cinematic camera breathing — slow FOV pulsation and mouse-based parallax.
 * Gives scenes a "living" feel even when idle.
 */
export function CinematicCameraBreathing({
  fovBreath = 1.0,
  breathSpeed = 0.125,
  parallaxStrength = 0.3,
}: {
  fovBreath?: number;
  breathSpeed?: number;
  parallaxStrength?: number;
}) {
  const mouseRef = useRef({ x: 0, y: 0 });
  const { camera } = useThree();
  const baseFovRef = useRef<number | null>(null);

  useFrame(({ clock, pointer }) => {
    const perspCam = camera as THREE.PerspectiveCamera;
    if (!perspCam.isPerspectiveCamera) return;

    // Store initial FOV
    if (baseFovRef.current === null) {
      baseFovRef.current = perspCam.fov;
    }

    const t = clock.getElapsedTime();

    // Slow FOV breathing — ±fovBreath degrees over breathSpeed Hz
    const fovOffset = Math.sin(t * breathSpeed * Math.PI * 2) * fovBreath;
    perspCam.fov = baseFovRef.current + fovOffset;
    perspCam.updateProjectionMatrix();

    // Subtle parallax from mouse (smooth lerp)
    const targetX = pointer.x * parallaxStrength;
    const targetY = pointer.y * parallaxStrength * 0.5;
    mouseRef.current.x += (targetX - mouseRef.current.x) * 0.02;
    mouseRef.current.y += (targetY - mouseRef.current.y) * 0.02;

    // Apply subtle offset to camera rotation
    perspCam.rotation.y += (mouseRef.current.x * 0.01 - perspCam.rotation.y * 0.001);
  });

  return null;
}
