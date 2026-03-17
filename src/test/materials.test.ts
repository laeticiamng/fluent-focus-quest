import { describe, it, expect } from "vitest";
import { heroCrystalProps, ritualMetalProps, supportStoneProps } from "@/components/3d/premium/materials";

describe("heroCrystalProps", () => {
  it("returns expected defaults for hero elements", () => {
    const props = heroCrystalProps({ color: "#fbbf24", emissive: "#fbbf24" });
    expect(props.metalness).toBe(0.3);
    expect(props.roughness).toBe(0.05);
    expect(props.clearcoat).toBe(1);
    expect(props.iridescence).toBe(0.5);
    expect(props.transmission).toBe(0.4);
    expect(props.envMapIntensity).toBe(1.2);
    expect(props.emissiveIntensity).toBe(1.0);
  });

  it("allows custom iridescence and transmission", () => {
    const props = heroCrystalProps({
      color: "#10b981",
      emissive: "#10b981",
      iridescence: 1.0,
      transmission: 0.6,
    });
    expect(props.iridescence).toBe(1.0);
    expect(props.transmission).toBe(0.6);
  });

  it("has lower metalness than ritual metal (hero = gem, not metal)", () => {
    const hero = heroCrystalProps({ color: "#fff", emissive: "#fff" });
    const metal = ritualMetalProps({ color: "#fff", emissive: "#fff" });
    expect(hero.metalness).toBeLessThan(metal.metalness);
  });
});

describe("ritualMetalProps", () => {
  it("returns high metalness low roughness for accents", () => {
    const props = ritualMetalProps({ color: "#d4a017", emissive: "#d4a017" });
    expect(props.metalness).toBe(0.95);
    expect(props.roughness).toBe(0.08);
    expect(props.emissiveIntensity).toBe(0.6);
  });

  it("supports transparency", () => {
    const props = ritualMetalProps({
      color: "#6366f1",
      emissive: "#6366f1",
      transparent: true,
      opacity: 0.5,
    });
    expect(props.transparent).toBe(true);
    expect(props.opacity).toBe(0.5);
  });
});

describe("supportStoneProps", () => {
  it("returns moderate metalness and higher roughness", () => {
    const props = supportStoneProps({ color: "#1e2040" });
    expect(props.metalness).toBe(0.6);
    expect(props.roughness).toBe(0.35);
    expect(props.emissiveIntensity).toBe(0.02);
    expect(props.envMapIntensity).toBe(0.3);
  });

  it("has lower metalness than ritual metal", () => {
    const support = supportStoneProps({ color: "#1e2040" });
    const metal = ritualMetalProps({ color: "#1e2040", emissive: "#1e2040" });
    expect(support.metalness).toBeLessThan(metal.metalness);
  });

  it("has higher roughness than ritual metal", () => {
    const support = supportStoneProps({ color: "#1e2040" });
    const metal = ritualMetalProps({ color: "#1e2040", emissive: "#1e2040" });
    expect(support.roughness).toBeGreaterThan(metal.roughness);
  });
});

describe("Material hierarchy invariants", () => {
  it("hero has lowest roughness (most polished)", () => {
    const hero = heroCrystalProps({ color: "#f", emissive: "#f" });
    const metal = ritualMetalProps({ color: "#f", emissive: "#f" });
    const stone = supportStoneProps({ color: "#f" });
    expect(hero.roughness).toBeLessThan(metal.roughness);
    expect(metal.roughness).toBeLessThan(stone.roughness);
  });

  it("support stone has lowest env map intensity", () => {
    const hero = heroCrystalProps({ color: "#f", emissive: "#f" });
    const stone = supportStoneProps({ color: "#f" });
    expect(stone.envMapIntensity).toBeLessThan(hero.envMapIntensity);
  });
});
