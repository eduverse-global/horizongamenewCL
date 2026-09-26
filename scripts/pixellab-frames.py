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

# Game atlas: row 0 holds one idle cell per column (the captain's eight facings, then the NPCs);
# rows 1-8 hold the captain's walk cycles in the same direction order, from art/pixellab/walk/.
# The frame count of each walk row is written to dist/assets/siam-cast.json.
WALK = ['south', 'west', 'east', 'north', 'south-east', 'north-east', 'north-west', 'south-west']
NPCS = ['official', 'merchant', 'innkeeper']
# Idle row: the captain's eight facings, then each NPC's eight facings (the NPCs turn to face the captain).
CELLS = [f'{who}-{d}' for who in ['captain', *NPCS] for d in WALK]
import re
# Exact names only: 'south' must not pick up 'south-east' frames.
walk = {d: sorted((p for p in (root / 'art/pixellab/walk').glob('captain-*.png') if re.fullmatch(f'captain-{d}-\\d+', p.stem)), key=lambda p: int(p.stem.rsplit('-', 1)[1])) for d in WALK}
# Special animations follow the walk rows, one row each, from art/pixellab/anim/<who>-<name>-<frame>.png: the NPC
# breathing loops (south) first, then event animations such as Mae Im's garland offering (east), in name order.
groups = {}
for f in (root / 'art/pixellab/anim').glob('*.png'): groups.setdefault(f.stem.rsplit('-', 1)[0], []).append(f)
order = [f'{n}-breathe' for n in NPCS] + sorted(g for g in groups if not g.endswith('-breathe'))
anim = {name: sorted(groups[name], key=lambda p: int(p.stem.rsplit('-', 1)[1])) for name in order if name in groups}
cols = max(len(CELLS), *(len(v) for v in walk.values()))
atlas = Image.new('RGBA', (48 * cols, 48 * (1 + len(WALK) + len(anim))), (0, 0, 0, 0))
for i, name in enumerate(CELLS): atlas.paste(Image.open(out / (name + '.png')), (48 * i, 0))
for r, d in enumerate(WALK, 1):
    for i, f in enumerate(walk[d]): atlas.paste(Image.open(f), (48 * i, 48 * r))
for r, (name, frames) in enumerate(anim.items(), 1 + len(WALK)):
    for i, f in enumerate(frames): atlas.paste(Image.open(f), (48 * i, 48 * r))
atlas.save(root / 'dist/assets/siam-cast.png')
(root / 'dist/assets/siam-cast.json').write_text(json.dumps({'cell': 48, 'columns': cols, 'rows': 1 + len(WALK) + len(anim), 'idle': CELLS, 'walk': {d: {'row': r, 'frames': len(walk[d])} for r, d in enumerate(WALK, 1)}, 'anim': {n: {'row': r, 'frames': len(f)} for r, (n, f) in enumerate(anim.items(), 1 + len(WALK))}}, indent=1) + '\n')
print('wrote dist/assets/siam-cast.png and siam-cast.json')
