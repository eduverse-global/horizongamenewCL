# Horizon — Tides of Fortune

An original, playable Three.js seafaring prototype inspired by the trading and exploration of Uncharted Waters: New Horizons and the miniature-world presentation of HD-2D RPGs. This is a vertical slice, not a finished AAA game or a recreation of copyrighted assets.

## Run

`npm install` then `npm run dev`. Open http://localhost:5188.

`npm test` verifies the trading economy, commission progression, capacity limits, and safe save restoration. `npm run build` checks the authored JavaScript. The complete self-contained game is in `dist/`; serve it with any static web server. Google Fonts is optional and falls back to system fonts.

## Play

- Click open water or a harbor marker to plot a course. Navigate around islands; auto-navigation stops at shallows rather than routing around land.
- W raises full sail, S lowers sail, A/D steer. Steering cancels a plotted course.
- Scroll zooms. E enters a nearby port. C opens cargo, M the chart, J the journal, P pauses, and Space fires the cannons.
- Buy three saffron in Port Aurelia. Sell three in Bellhaven for a 500 gold commission, then approach the forgotten island southwest of Aurelia to discover the observatory.
- The corsair patrols the north. Fire within 18 leagues; repair in any harbor.
- Port services restore hull and supplies. Progress saves on this browser/device; hosted and local previews have separate saves. Settings can start a new voyage.

## Structure

- `dist/world.js`: Three.js terrain, towns, ships, lighting, water shader, wildlife and effects.
- `dist/game.js`: simulation, navigation, encounters, UI, chart, audio effects and WebMCP integration.
- `dist/state.js`: game state, market prices, trading and save validation.
- `dist/style.css`: responsive nautical interface.
- `tests/state.test.js`: deterministic economy and persistence checks.

## Blender / next production phase

Blender is not required to run or edit this version. Current models are procedural, with no external art dependencies. To reach the requested premium HD-2D production target, the next art pass should supply:

1. A hero caravel with textured hull, rigging, separate sails, rudder and cannon pivots; roughly 30–60k triangles and 2k PBR textures.
2. Modular coastal town buildings, docks, market stalls, landmarks and cliffs with shared trim-sheet materials and several LODs.
3. Pixel-art character sprites with directional walk/idle sets, or stylized rigged 3D characters for on-foot towns.
4. Authored water/foam textures, environment lighting, music, ambient harbor/ocean sound and interaction effects.

Export Blender models as glTF binary (`.glb`), apply transforms, use meters with separate named animated parts, and pack textures. Three.js GLTFLoader can replace the existing procedural groups without changing the economy or missions.

A larger game also needs authored characters and dialogue, walkable port scenes, fleet progression, richer naval combat, diplomacy, longer quest lines, day/night lighting, weather, accessible input remapping, route planning, and wider device profiling. The present slice has three trading ports, four commodities, two objectives and one repeatable sandbox region.
