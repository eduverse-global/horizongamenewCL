# PixelLab characters

Original characters generated with PixelLab (pixellab.ai) for this project, September 2026, at 48×48 px with a low top-down view. The 1680s dress follows the art notes in the Horinzonnext setting spec.

| Atlas column | Character | PixelLab character id | Mode |
| --- | --- | --- | --- |
| 0–3 | Thai captain: south, west, east, north | `dd27201b-3de0-41f2-a70d-e0b0c24922cd` | made during the Horinzonnext art test |
| 4 | Khun Phithak Wari, Krom Tha official | `0c6c36f7-5dc2-472e-bc87-af7b8b7d09ea` | v3 |
| 5 | Tan Heng, junk merchant | `38c1d8e8-63fe-4d5e-be4e-0ca8788ba1e9` | v3 |
| 6 | Mae Im, river lodge innkeeper | `026c0146-2949-4ce9-9666-ea7fc14f0117` | v3 |

## How the frames got here

This cloud environment's network policy blocks PixelLab's file host (`backblaze.pixellab.ai`). The frames were therefore exported through PixelLab's `pixelart_workbench crop` command, which returns pixels as text rows plus a colour legend (at most 32×32 per call). `frames/*.json` stores the four 24×24 quadrants of each frame. `scripts/pixellab-frames.py` rebuilds the PNGs in `png/` and the game atlas `dist/assets/siam-cast.png`.

Edit: the olive ground patch under Mae Im's feet was removed (see the note in her JSON).

If the file host is allowed, download the rotations or the spritesheet directly instead.

## Walk cycle (captain)

`walk/captain-<direction>-<frame>.png`: 6 frames per direction. West, east and north come from PixelLab's `walking-6-frames` template. That template, and the 8-frame one, turned the captain's back to the camera in some south-facing frames, so south uses v3 mode ("walking forward toward the viewer"). Its last frame has a slight dark smudge across the face. The frames came from the character spritesheet endpoint on `api.pixellab.ai`; v3 cells are 64 px, cropped to the centre 48 px, which was checked to line up exactly with the idle frames. The atlas row layout is in `dist/assets/siam-cast.json`.

The idle frames rebuilt from text exports were checked against PixelLab's originals and are identical.

## Diagonals

The captain's four diagonal idle frames are PixelLab's own rotations. The diagonal walk cycles (`walk/captain-{south-east,north-east,north-west,south-west}-*.png`) are v3 mode, 6 frames each, cropped from 64 px cells to the centre 48 px and checked for alignment. The atlas now has 11 idle columns and 8 walk rows.

## NPC facings and breathing

Khun Phithak Wari, Tan Heng and Mae Im use all 8 of their PixelLab rotations, so they can turn to face the captain. Each also has a 4-frame `breathing-idle` loop (south) in `anim/`. PixelLab redrew the breathing frames 1-4 px shorter than the rotations, so they play only at rest, and the switch happens as the character turns. The olive ground patch was also removed from Mae Im's new rotations. The atlas has 32 idle columns (8 facings for each of the 4 characters), 8 captain walk rows and 3 NPC breathing rows.

After playtesting, breathing was switched off for Khun Phithak Wari and Tan Heng (`BREATHES` in `dist/engine/actors.js`): their breathing frames are 3-4 px shorter than their standing sprites and looked shrunken. Mae Im keeps hers, since her frames match her standing size. The frames remain in the atlas.
Later Mae Im's breathing was switched off as well, so all characters stand still at rest. The breathing rows remain in the atlas for cutscenes and special events.
