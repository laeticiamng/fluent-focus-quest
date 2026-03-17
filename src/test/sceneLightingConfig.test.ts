import { describe, it, expect } from "vitest";
import { getSceneLightingRig, SCENE_LIGHTING_RIGS } from "@/components/3d/premium/SceneLightingConfig";

describe("SceneLightingConfig", () => {
  const SCENES = ["hub", "map", "inventory", "lazarus", "lazarus_activated"] as const;

  it("provides rigs for all expected scenes", () => {
    for (const scene of SCENES) {
      const rig = getSceneLightingRig(scene);
      expect(rig).toBeDefined();
      expect(rig.ambientIntensity).toBeGreaterThan(0);
    }
  });

  it("falls back to hub for unknown scene", () => {
    const rig = getSceneLightingRig("nonexistent");
    const hub = getSceneLightingRig("hub");
    expect(rig).toEqual(hub);
  });

  describe("per-scene fog configuration", () => {
    for (const scene of SCENES) {
      it(`${scene} has atmospheric fog config`, () => {
        const rig = getSceneLightingRig(scene);
        expect(rig.heightFogGroundColor).toBeDefined();
        expect(rig.heightFogMidColor).toBeDefined();
        expect(rig.heightFogBaseY).toBeDefined();
        expect(rig.heightFogRadius).toBeGreaterThan(0);
        expect(rig.heightFogGroundOpacity).toBeGreaterThan(0);
        expect(rig.heightFogMidOpacity).toBeGreaterThan(0);
      });

      it(`${scene} has animated fog config`, () => {
        const rig = getSceneLightingRig(scene);
        expect(rig.animFogLayers).toBeGreaterThan(0);
        expect(rig.animFogRadius).toBeGreaterThan(0);
        expect(rig.animFogMaxOpacity).toBeGreaterThan(0);
      });
    }

    it("inventory has lightest fog (showroom feel)", () => {
      const inv = getSceneLightingRig("inventory");
      const hub = getSceneLightingRig("hub");
      expect(inv.heightFogGroundOpacity).toBeLessThanOrEqual(hub.heightFogGroundOpacity);
    });

    it("map has lighter fog than hub (readable exploration)", () => {
      const map = getSceneLightingRig("map");
      const hub = getSceneLightingRig("hub");
      expect(map.heightFogGroundOpacity).toBeLessThanOrEqual(hub.heightFogGroundOpacity);
    });
  });

  describe("exposure and readability", () => {
    it("all scenes have sufficient ambient intensity", () => {
      for (const scene of SCENES) {
        const rig = getSceneLightingRig(scene);
        expect(rig.ambientIntensity).toBeGreaterThanOrEqual(0.2);
      }
    });

    it("all scenes have fill light for depth separation", () => {
      for (const scene of SCENES) {
        const rig = getSceneLightingRig(scene);
        expect(rig.fillIntensity).toBeGreaterThanOrEqual(0.3);
      }
    });

    it("inventory has brightest ambient (showroom feel)", () => {
      const inv = getSceneLightingRig("inventory");
      const hub = getSceneLightingRig("hub");
      expect(inv.ambientIntensity).toBeGreaterThan(hub.ambientIntensity);
    });
  });
});
