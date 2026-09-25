# PixelLab characters

Original characters generated with PixelLab (pixellab.ai) for this project, September 2026, at 48×48 px with a low top-down view. The 1680s dress follows the art notes in the Horinzonnext setting spec.

| Atlas column | Character | PixelLab character id | Mode |
| --- | --- | --- | --- |
| 0–3 | Thai captain: south, west (mirrored east), east, north | `dd27201b-3de0-41f2-a70d-e0b0c24922cd` | made during the Horinzonnext art test |
| 4 | Khun Phithak Wari, Krom Tha official | `0c6c36f7-5dc2-472e-bc87-af7b8b7d09ea` | v3 |
| 5 | Tan Heng, junk merchant | `38c1d8e8-63fe-4d5e-be4e-0ca8788ba1e9` | v3 |
| 6 | Mae Im, river lodge innkeeper | `026c0146-2949-4ce9-9666-ea7fc14f0117` | v3 |

## How the frames got here

This cloud environment's network policy blocks PixelLab's file host (`backblaze.pixellab.ai`). The frames were therefore exported through PixelLab's `pixelart_workbench crop` command, which returns pixels as text rows plus a colour legend (at most 32×32 per call). `frames/*.json` stores the four 24×24 quadrants of each frame. `scripts/pixellab-frames.py` rebuilds the PNGs in `png/` and the game atlas `dist/assets/siam-cast.png`.

Edit: the olive ground patch under Mae Im's feet was removed (see the note in her JSON).

If the file host is allowed, download the rotations or the spritesheet directly instead.
