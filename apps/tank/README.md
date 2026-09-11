# Tank floating-menu revision

The aquarium canvas keeps full viewport dimensions. FloatingPanel provides a
movable, resizable and collapsible overlay; its rectangle is stored separately
in tank-menu-v1. Existing aquarium and sound storage keys remain unchanged.
Catalog cards now use a single Add action, and less-used item controls collapse.

The original 4096x2427 decor-library-atlas.png was truncated. Repacked all 48
verified intact source images at their existing rectangles, preserving IDs.
Verified all 79 PNGs fully decode and all original cutouts have visible alpha.
Added six driftwood assets with append-only IDs 226–231; visible catalog is 56.

Terrain UV fills extend beyond expanded clipping triangles to close raster seams.
The front substrate face is textured continuously rather than cell-by-cell.
Corner drag combines distance-based size and horizontal 0–180-degree rotation;
state patches update the shared current state before the next pointer event.

Browser QA through the supervised preview: plant preview failures zero; add new
log; drag menu; resize with keyboard; minimize/expand; corner drag reaches -180
with size 100.27% from 100%. Canvas dimensions unchanged during menu interactions.
A later selector inspection timed out, so no browser FPS claim is made. TypeScript
and production build pass. Development asset-serving middleware supports the
existing source/assets folder layout and the supervised preview host.

Local working project only; no public deployment.

## Decoration quality and keychain revision

Click outside the floating menu to collapse it; the title bar remains draggable.
Placed UFO ornaments hang from the menu's lower edge and sway with drag motion.
When the menu is hidden they hang from the tank's top edge.

Decoration scale spans 20–600%. Rocks also have a Stack height control; dropping
one rock onto another aligns it above the target. Existing placements, IDs,
terrain, fish behavior and saved sound keys are preserved.

Full-resolution decoration images are stored as individual WebP payloads in
quality-decor-*.bin. qualityDecor.ts records byte ranges. The catalog uses a
separate small preview atlas so browsing does not decode every large original.

This pass replaces 52 low-resolution objects and adds 12 distinct rock assets,
while preserving the two already-detailed ship/temple originals. Native art is
roughly 1.2–2.1K along its longest edge, not infinite-resolution or 4K artwork.
Browser checks: outside-click minimization, keychain attachment, 600% size range,
new rock previews and placing a slate shelf above another rock (height 113).
The cloud preview intermittently timed out and reset its graphics context;
no frame-rate claim is made.

## Flow, terrain contact and menu revision

- Cached fish color artwork, reduced small-fish strips, batched bubble paths,
  cached background and 24 Hz light maps. Scene rendering caps at 60 Hz and
  adapts to 30 Hz for CPU-heavy frames; 3D normals update every second pose.
- Multi-layer drifting caustics and depth lighting use scaled cached surfaces.
- Foreground bubble walls (depth >= 98%) sweep the full viewport; no gray emitter
  geometry is drawn. Other emitters follow terrain at each bubble origin.
- Decorations sample terrain under their footprint and track terrain edits.
  Base embedding is 1.5 screen pixels. Rotation uses alpha contact bounds.
  Side placement extends beyond the old perspective bounds, with matching
  substrate edge coverage. Existing heightfield values are preserved.
- Direct Rotate sliders, individual moss ball (append-only ID 244), original
  moss cluster retained. Menu colors persist in tank-menu-colors-v1.
- Larger icon navigation; double-click tank toggles build/relax and menu state.
- Shorter 18-segment weighted chain with alternating click impulses, including
  relax mode. The minimized menu stays available as the keychain anchor.

No public deployment. Refresh the locally served project after Drive sync.

Species habitat pass: all 19 species have individual soft habitat preferences,
turn rates, acceleration, rest/forage/dart likelihoods, speed pulses and fin-beat
rates. Angelfish favor open upper water; small swimmers favor plant neighborhoods.
Individuals keep preferred neighborhoods but revisit other areas. Food, startle
signals, terrain avoidance and schooling remain active. A seeded 120-second
simulation confirmed upper-water angelfish averages (3.45–3.61 world units) versus
plant-associated neons (1.54), with multiple behavior states for each. Edge and
rotation normalization tests passed. Chain segment/anchor-jump checks passed.
Browser QA confirmed mode toggling, palette persistence, single moss-ball preview,
left-edge placement and full-screen foreground bubbles. Device FPS not measured.

Menu/contact refinement: UFO now renders only with the menu minimized; chain
constraints and damping tightened, retaining click nudges and vertical dragging.
Decor anchors use the terrain directly beneath them, with alpha-mask contact
alignment even without rotation; glass pebbles no longer receive an extra lift.
Floor catalog groups existing variants into Sand, Gravel, Lava rock and Aquasoil,
with a persistent material color; legacy saved floor appearance is preserved.
Removed catalog searches. Owned-item cards wrap by panel width, with separate
copy/delete buttons and full-width sliders. Icon tabs use hidden scrollbars,
wheel/trackpad scrolling and arrow buttons. Typecheck and production build passed.

Default menu theme: dark blue glass (#1b4160), 53% opacity, light text/icons.
Existing custom palettes are preserved; Blue glass preset restores the default.

Relax foreground bubbles render above all app UI, ignore pointer input,
cover the full viewport and continue when fish are paused. A gentle full-frame wash
adds variation behind bubble gaps. Wave strength/speed/size/depth/movement controls
are persistent; existing lighting colors and directions remain. These effects do
not guarantee burn-in prevention. Approved audio mix prepared: 55/25/4/39/57.
User confirmed saving this completed pass to the existing Google Drive project.

Decoration refresh: replaced the treasure chest image with a bubble-free photographic
cutout and removed its built-in bubble emitter. Existing chest IDs remain unchanged.
Appended five catalog choices (245–249): Zen stone cottage, stone moon gate,
sunken amphora, twisted root arch, and the original Zen stone lantern hut recovered
from the earlier photographic atlas. The restored original retains its native
242×307 resolution; the new artwork uses native 1.3–1.5K transparent sources.
Built-in image generation created the new sprites from these briefs: mossy stone
cottage; pale stone moon gate; weathered hollow terracotta amphora; asymmetric
root arch; bubble-free treasure chest with coins, gems, coral and starfish.
Final assets: assets/decor-refresh-20260911.bin and
assets/decor-refresh-20260911-preview.webp. No saved layout IDs were renumbered.
