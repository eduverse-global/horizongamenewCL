"""Rebuild PixelLab sprites from pixelart_workbench `crop` text exports.

The session's network policy blocks PixelLab's file host, but the workbench can export any
region (max 32x32) as text rows plus a colour legend. Each JSON file in art/pixellab/frames/
holds the quadrants of one 48x48 frame:
  {"character": "<id>", "view": "south", "size": [48, 48],
   "parts": [{"region": [x0, y0, x1, y1], "rows": [...], "legend": {"#": "#050202ff", ...}}]}
'.' is transparent. Output: one PNG per JSON under art/pixellab/png/.
Usage: python scripts/pixellab-frames.py   (needs Pillow)
"""
import json, sys
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
src, out = root / 'art/pixellab/frames', root / 'art/pixellab/png'
out.mkdir(parents=True, exist_ok=True)
def rgba(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4, 6))
for f in sorted(src.glob('*.json')):
    d = json.loads(f.read_text()); w, h = d.get('size', [48, 48])
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0)); covered = set()
    for p in d['parts']:
        x0, y0, x1, y1 = p['region']; rows = p['rows']
        if len(rows) != y1 - y0 + 1 or any(len(r) != x1 - x0 + 1 for r in rows):
            sys.exit(f'{f.name}: region {p["region"]} does not match its rows')
        for dy, row in enumerate(rows):
            for dx, c in enumerate(row):
                covered.add((x0 + dx, y0 + dy))
                if c != '.': img.putpixel((x0 + dx, y0 + dy), rgba(p['legend'][c]))
    if len(covered) != w * h: sys.exit(f'{f.name}: quadrants cover {len(covered)} of {w * h} pixels')
    img.save(out / (f.stem + '.png')); print('wrote', f.stem + '.png')

# Game atlas, one 48x48 cell per column. The captain's west view mirrors his east view.
from PIL import ImageOps
CELLS = [('captain-south', False), ('captain-east', True), ('captain-east', False), ('captain-north', False),
         ('official-south', False), ('merchant-south', False), ('innkeeper-south', False)]
atlas = Image.new('RGBA', (48 * len(CELLS), 48), (0, 0, 0, 0))
for i, (name, mirror) in enumerate(CELLS):
    cell = Image.open(out / (name + '.png'))
    atlas.paste(ImageOps.mirror(cell) if mirror else cell, (48 * i, 0))
atlas.save(root / 'dist/assets/siam-cast.png'); print('wrote dist/assets/siam-cast.png')
