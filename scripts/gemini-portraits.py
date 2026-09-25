"""Painted dialogue portraits for the Siam cast, generated with the Gemini API.

Each request sends two references: the character's PixelLab sprite (identity, costume, colours)
and the existing Mara portrait (painting style and framing). Results go to art/portraits/raw/,
and a 4-cell atlas (captain, official, merchant, innkeeper) to dist/assets/siam-portraits.jpg.

Usage: GEMINI_API_KEY=... python scripts/gemini-portraits.py [id ...]   (needs Pillow)
Optional: GEMINI_IMAGE_MODEL (default gemini-2.5-flash-image). Existing raw portraits are kept
unless their id is named on the command line.
"""
import base64, io, json, os, sys, urllib.request
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
raw = root / 'art/portraits/raw'; raw.mkdir(parents=True, exist_ok=True)
MODEL = os.environ.get('GEMINI_IMAGE_MODEL', 'gemini-2.5-flash-image')
STYLE = ('Painted head-and-shoulders character portrait for a story-driven RPG dialogue box, in the same '
         'painting style, lighting and framing as the style reference: warm semi-realistic illustration, soft '
         'brushwork, dark warm background, character slightly turned, looking toward the viewer. Square image. '
         'No text, no border, no frame. Keep the character\'s identity, clothing and colours from the pixel-art '
         'sprite reference, redrawn at full detail. Setting: the port of Ayutthaya, Siam, in the 1680s; '
         'dress must stay period-appropriate and respectful.')
CAST = {
    'captain': ('captain-south', 'A young Thai sea captain of the royal trade fleet: mahadthai haircut (short on top, shaved sides), '
                'deep red fitted jacket with gold buttons, white sash, a sword at the hip, determined and kind expression.'),
    'official': ('official-south', 'Khun Phithak Wari, a middle-aged Siamese harbour official of the Krom Tha: mahadthai haircut, '
                 'short beard, fitted long-sleeved white jacket with gold buttons, patterned sash, holding a folded ledger; '
                 'dignified, courteous and shrewd.'),
    'merchant': ('merchant-south', 'Tan Heng, a plump, good-humoured Chinese junk merchant: dark blue-grey long robe, black skullcap, '
                 'moustache, an abacus at his belt; a trader\'s knowing smile.'),
    'innkeeper': ('innkeeper-south', 'Mae Im, a warm middle-aged Siamese woman who keeps a riverside lodge: short cropped hair, green '
                  'pha sabai breast cloth draped over one shoulder, a jasmine garland in her hand; a kind, teasing smile.'),
}

def png_b64(img):
    buf = io.BytesIO(); img.save(buf, 'PNG'); return base64.b64encode(buf.getvalue()).decode()

def style_reference():
    # Mara is the bottom-right cell of the 2x2 story portrait atlas.
    atlas = Image.open(root / 'dist/assets/story-portraits.png').convert('RGB'); w, h = atlas.size
    return atlas.crop((w // 2, h // 2, w, h))

def generate(key, sprite, description, style):
    sprite = Image.open(root / f'art/pixellab/png/{sprite}.png').convert('RGBA')
    sprite = sprite.resize((sprite.width * 8, sprite.height * 8), Image.NEAREST)
    body = {'contents': [{'parts': [
        {'text': f'{STYLE}\nCharacter: {description}\nFirst image: pixel-art sprite of this character. Second image: style reference.'},
        {'inline_data': {'mime_type': 'image/png', 'data': png_b64(sprite)}},
        {'inline_data': {'mime_type': 'image/png', 'data': png_b64(style)}}]}],
        'generationConfig': {'responseModalities': ['IMAGE']}}
    req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent',
                                 data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'x-goog-api-key': key})
    with urllib.request.urlopen(req, timeout=300) as r: reply = json.load(r)
    for part in reply.get('candidates', [{}])[0].get('content', {}).get('parts', []):
        data = part.get('inlineData') or part.get('inline_data')
        if data: return Image.open(io.BytesIO(base64.b64decode(data['data']))).convert('RGB')
    raise RuntimeError('no image in reply: ' + json.dumps(reply)[:500])

def square(img, size=512):
    s = min(img.size); x, y = (img.width - s) // 2, (img.height - s) // 2
    return img.crop((x, y, x + s, y + s)).resize((size, size), Image.LANCZOS)

if __name__ == '__main__':
    key = os.environ.get('GEMINI_API_KEY')
    wanted = sys.argv[1:] or [c for c in CAST if not (raw / f'{c}.png').exists()]
    if wanted and not key: sys.exit('Set GEMINI_API_KEY to generate: ' + ', '.join(wanted))
    style = style_reference()
    for cid in wanted:
        generate(key, *CAST[cid], style).save(raw / f'{cid}.png'); print('generated', cid)
    missing = [c for c in CAST if not (raw / f'{c}.png').exists()]
    if missing: sys.exit('missing portraits: ' + ', '.join(missing))
    atlas = Image.new('RGB', (512 * len(CAST), 512))
    for i, cid in enumerate(CAST): atlas.paste(square(Image.open(raw / f'{cid}.png').convert('RGB')), (512 * i, 0))
    atlas.save(root / 'dist/assets/siam-portraits.jpg', quality=88); print('wrote dist/assets/siam-portraits.jpg')
