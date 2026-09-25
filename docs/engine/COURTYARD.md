# Siam courtyard: first playable rendering benchmark

Run `npm install && npm run dev`, then open `http://localhost:5188/courtyard.html`.
The sailing game remains the root page. Its courtyard link opens this independent visual prototype.

## Included
- Original Blender merchant pavilion with textured teak, tiled roof, raised floor, windows and furnishings; source and rebuild script in `art/blender/courtyard/`.
- Three.js r180 linear HDR pipeline with scene-depth focus, bloom, a single output conversion and direct-render performance mode.
- Lit alpha-tested character planes using the project's existing original character atlases.
- Four-direction keyboard/touch movement and cardinal pointer routes; collision data separate from rendering.
- Enter the pavilion through the center doorway; roof and walls cut away inside.
- EN/TH portrait conversation, inspectable ledger, and two saved narrative choices. Courtyard state uses `narai-courtyard-v1`; the main game save is untouched.
- Day/evening transition, lantern lights, water, instanced vegetation and paving.
- Practice target with a light/particle/arc effect and short synthesized audio cue.
- Optional on-screen frame/draw/triangle statistics, resize support and context-loss recovery prompt.

## HD-2D look pass
- Closer diorama camera (about 34° pitch) that follows the player; characters fill roughly a tenth of the frame height.
- Tilt-shift: the lens pass adds a screen-space blur band toward the top and bottom on top of scene-depth focus.
- Period lanterns: teak posts with a carved bracket, hanging lanterns with clay rims and a red cap, an additive glow halo, and emissive glow that rises at dusk.
- Static props are merged into one draw per material (`flush()` in `courtyard-scene.js`). Draw calls went from 536 to 107 in the courtyard and 79 inside, measured in headless Chromium (SwiftShader), where frame rate is not representative.
- Grass blades have upward normals on both faces, so they are lit like the ground instead of rendering as dark spikes.

## Siam cast (PixelLab)
- The player is the Thai captain from the Horinzonnext art test. Khun Phithak Wari (Krom Tha official) gives the ledger quest in Mara's place. Tan Heng (junk merchant) and Mae Im (river lodge) greet, then cycle their Horinzonnext lines from `dist/data/narai-story.js`.
- Art: `dist/assets/siam-cast.png`, rebuilt from `art/pixellab/` (see its README). Each character has one drawn frame per facing, so walking uses a short step bob until walk cycles are exported. Dialogue portraits are the sprites enlarged with pixelated scaling.
- Saves keep the same `narai-courtyard-v1` format; only the quest giver's id changed.

## Scope
This is an original stylized visual prototype, not a historical reconstruction or a finished AAA art pass. The pilgrim gate introduces a future destination; it does not load another region. The practice effect is not yet connected to the tactical combat system. Camera framing, architecture and vegetation still need art iteration. Performance numbers must be measured on target devices; 60 fps is not a delivery guarantee.

## Rebuild model
`node scripts/blender.mjs art/blender/courtyard/author.py`

Then optimize the intermediate export:
`npx --yes @gltf-transform/cli dedup dist/assets/merchant-pavilion.raw.glb dist/assets/merchant-pavilion.glb`

The raw export is reproducible and ignored by Git. The Blender source is the editable master. Exported `visibilityRole` extras preserve roof/shell cutaway groups. Geometry is joined by role/material to reduce draw calls. Runtime uses metre-like units, Y up, Z south. The Blender script converts these coordinates on authoring.

## Validation
`npm test` includes cardinal movement, route reachability, architectural collision, proximity/sequence guards, both narrative choices, and malformed-save handling. `npm run build` checks syntax of the shipping modules.
