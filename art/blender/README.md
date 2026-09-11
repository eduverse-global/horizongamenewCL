# Local Blender authoring connection

Verified Blender 5.2.1 LTS at `/Applications/Blender.app/Contents/MacOS/Blender`.

Run `npm run blender:check` to verify Python and glTF capabilities and refresh `connection.json`. `node scripts/blender.mjs /absolute/path/to/authoring-script.py` runs an authoring script in a separate, factory-startup background process. It does not connect to or overwrite an already open Blender document. No paid service or API key is required for local Blender work.

Blender sources belong under `art/blender/`; accepted runtime GLBs belong under `dist/assets/`. Room construction and export have not been performed by the connection check. A first room can be a Lisbon tavern with a conversation counter, seated NPC area, and readable exit to the harbor. Room layout, form and runtime approval records are required by the selected 3D game rooms workflow before its respective production gates.
