# NARAI: Winds of Siam — นารายณ์: สายลมแห่งสยาม (working title)

An original, playable Three.js seafaring prototype inspired by the trading and exploration of Uncharted Waters: New Horizons and the miniature-world presentation of HD-2D RPGs. This is a vertical slice, not a finished AAA game or a recreation of copyrighted assets.

## Run

`npm install` then `npm run dev`. Open http://localhost:5188.

`npm test` verifies the trading economy, commission progression, capacity limits, and safe save restoration. `npm run build` checks the authored JavaScript. The complete self-contained game is in `dist/`; serve it with any static web server. Google Fonts is optional and falls back to system fonts.

## New bilingual tactical prototype

The root page now opens a standalone river escort battle with English/Thai switching, two orders per turn, three crew teams, broadside and rigging fire, current drift, passenger signals, repairs, guarding, and Mali’s one-use parley. Review the forecast before committing. Progress saves as `narai-battle-v1`; language saves separately.

This milestone uses simple procedural ships and terrain to test mechanics. The earlier sailing game remains at `/voyage.html`, in English, with its original save untouched. Regional journey pacing, Siam towns, a full bilingual campaign, and production art remain future milestones. See `docs/design/SIAM-FIRST-CHAPTER.md`.

## Earlier sailing prototype controls

- Click open water or a harbor marker to plot a course. Navigate around islands; auto-navigation plots ocean routes around continents.
- W raises full sail, S lowers sail, A/D steer. Steering cancels a plotted course.
- Scroll zooms. E enters a nearby port. C opens cargo, M the chart, J the journal, P pauses, and Space fires the cannons.
- Buy three saffron in Lisbon. Sell three in London for a 500 gold commission, then approach the forgotten island west of Lisbon in the Azores to discover the observatory.
- The corsair patrols the north. Fire within 18 leagues; repair in any harbor.
- Port services restore hull and supplies. Progress saves on this browser/device; hosted and local previews have separate saves. Settings can start a new voyage.

## Structure

- `dist/world.js`: Three.js terrain, towns, ships, lighting, water shader, wildlife and effects.
- `dist/game.js`: simulation, navigation, encounters, UI, chart, audio effects and WebMCP integration.
- `dist/state.js`: game state, market prices, trading and save validation.
- `dist/style.css`: responsive nautical interface.
- `tests/state.test.js`: deterministic economy and persistence checks.

## Blender / next production phase

Blender is not required to run or edit this version. Current models are procedural. Coastlines come from public-domain Natural Earth 1:50m land polygons. To reach the requested premium HD-2D production target, the next art pass should supply:

1. A hero caravel with textured hull, rigging, separate sails, rudder and cannon pivots; roughly 30–60k triangles and 2k PBR textures.
2. Modular coastal town buildings, docks, market stalls, landmarks and cliffs with shared trim-sheet materials and several LODs.
3. Pixel-art character sprites with directional walk/idle sets, or stylized rigged 3D characters for on-foot towns.
4. Authored water/foam textures, environment lighting, music, ambient harbor/ocean sound and interaction effects.

Export Blender models as glTF binary (`.glb`), apply transforms, use meters with separate named animated parts, and pack textures. Three.js GLTFLoader can replace the existing procedural groups without changing the economy or missions.

A larger game also needs authored characters and dialogue, walkable port scenes, fleet progression, richer naval combat, diplomacy, longer quest lines, day/night lighting, weather, accessible input remapping, route planning, and wider device profiling. The present slice has 20 real trading ports, four commodities, two objectives and a geographic world map.

## World map update

The 3D sailing surface and sea chart share real coastline polygons and 20 port cities. The main camera follows the ship in a close-up sailing view. World atlas opens the geographic chart for planning routes. Nearby ports gain procedural town buildings, vegetation, docks and a lighthouse; these are stylized scenery, not surveyed city reconstructions. The atlas provides a city directory and routes around continents through a one-degree ocean graph with finer collision sampling. Very narrow channels and tiny islands are simplified. The chart spans 179°W–179°E and 78°N–65°S; polar navigation, Antarctica and date-line wrapping are not included. Harbor arrivals are deliberately offshore, including estuary cities such as London and Bangkok. Modern city/country labels are used without claiming a specific historical year; markets and the Azores discovery story are fictional.

Coastline source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_land.geojson
License: https://www.naturalearthdata.com/about/terms-of-use/ (public domain).
Simplified at 0.035 degrees; islands smaller than 0.035 square degrees omitted.

Local Blender Python execution and GLB-export capability are verified. Run `npm run blender:check`. See `art/blender/README.md`. This is background authoring support, not a connection to the currently open Blender scene. No room or prop assets have been created or exported in this update.
