# 3D Visual QA Checklist

## Overview
Manual QA checklist for the 3D scene system covering all scenes and quality tiers.
Run through this checklist on each target platform before release.

---

## Platforms to Test
- [ ] Desktop Chrome (high quality)
- [ ] Desktop Firefox (medium quality)
- [ ] Desktop Safari (medium quality)
- [ ] Laptop (integrated GPU — medium tier auto-detection)
- [ ] Mobile Chrome Android (?quality=mobile)
- [ ] Mobile Safari iOS (?quality=mobile)

---

## Per-Scene Checks

### Hub Scene
- [ ] Central pillar core is clearly visible and premium (glowing, iridescent)
- [ ] Zone portals are readable at idle — colors/icons distinguishable
- [ ] Pillars and floor rings visible, not crushed to black
- [ ] Background structures create depth without black holes
- [ ] Fog adds atmosphere without obscuring portals
- [ ] Text labels readable over 3D background
- [ ] Locked portals are dimmed but still distinguishable
- [ ] Vortex portals animate smoothly on unlocked gates
- [ ] Center focal point is dramatic but not overblown

### Map Scene
- [ ] Zone buildings are clearly visible with distinct shapes
- [ ] Room indicators (small spheres) are visible
- [ ] Connector lines between zones are readable
- [ ] Labels are readable on all buildings
- [ ] Floor grid and rune rings add depth
- [ ] Corner pillar lights visible
- [ ] Drag/rotate/zoom controls work smoothly
- [ ] Fog is lighter than Hub — exploration feel

### Lazarus Scene
- [ ] Altar core is the clear focal point
- [ ] Sigil slots are individually visible and interactable
- [ ] Sentinel pillars create spatial framing
- [ ] Energy beams animate without obscuring sigils
- [ ] Fog is denser but still allows sigil interaction
- [ ] Activation state change is dramatic and visible
- [ ] Green/gold color shift on activation is clear
- [ ] Rune rings rotate smoothly

### Inventory Scene
- [ ] Artifact gems are individually distinguishable by color/shape
- [ ] Hover/selection state is clear and responsive
- [ ] Sigil stand shows collection progress
- [ ] Showcase pillars frame the scene without competing
- [ ] Fog is very light — showroom feel
- [ ] Tooltips are readable on selection
- [ ] No shimmer or flicker on artifact materials

---

## Quality Tier Checks

### High Tier (?quality=high)
- [ ] SSAO visible — contact shadows and depth shading
- [ ] Bloom supports emissive accents, not veiling
- [ ] Chromatic aberration barely perceptible
- [ ] Reflections on premium floor
- [ ] Fireflies and energy trails active
- [ ] Background structures visible
- [ ] Contact shadows present
- [ ] Full particle count
- [ ] DPR up to 1.5

### Medium Tier (?quality=medium)
- [ ] No SSAO — scene still has good depth
- [ ] Bloom reduced but present
- [ ] No chromatic aberration
- [ ] No reflections — floor still looks good
- [ ] Fireflies active, trails disabled
- [ ] Background structures present
- [ ] Contact shadows present
- [ ] Half particle count
- [ ] DPR up to 1.25

### Mobile Tier (?quality=mobile)
- [ ] No SSAO, DOF, or chromatic aberration
- [ ] Bloom at 50% — still accents emissive
- [ ] No reflections or contact shadows
- [ ] No fireflies, trails, or background structures
- [ ] No fog layers
- [ ] 30% particle count
- [ ] DPR at 1.0
- [ ] Scene still looks intentional, not broken
- [ ] Performance acceptable (no jank)

---

## Cross-Cutting Checks

### Readability
- [ ] No large unreadable black zones on desktop
- [ ] Interactable objects readable without hover
- [ ] UI overlay text has sufficient contrast
- [ ] Center focal points are dramatic but not clipped

### Performance
- [ ] No visible frame drops on target hardware
- [ ] Scene transitions don't cause stutters
- [ ] Canvas resize on window resize works

### Fallback
- [ ] WebGL unavailable → fallback UI shows, not crash
- [ ] Reduced motion → fallback UI shows
- [ ] Runtime error → error boundary catches, retry available
- [ ] Mobile quality mode → acceptable visual result

### Diagnostics (debug=1)
- [ ] Badge shows correct quality tier
- [ ] Badge expandable to show capabilities
- [ ] Renderer and WebGL version displayed
- [ ] Per-effect enable/disable status correct
- [ ] Safe mode hint visible
- [ ] Badge hidden in production (no debug param)

---

## Regression Guards
- [ ] Auth/login flow not blocked (PR #24)
- [ ] Offline mode still functional
- [ ] simState logic not regressed (PR #23)
- [ ] AI coach guards intact
- [ ] No new env guards blocking Supabase

---

## Sign-Off
- Date: ___________
- Tester: ___________
- Platform: ___________
- Quality Tier: ___________
- Status: PASS / FAIL / PARTIAL
- Notes: ___________
