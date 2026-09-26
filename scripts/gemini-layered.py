"""Layered dialogue portraits: a cut-out character over a backdrop that matches the current location and time.

Generates, with the Gemini image API:
  - a character bust on a flat magenta screen, keyed to transparency -> dist/assets/portraits/<id>.png
    (magenta, not green, because costumes such as Mae Im's pha sabai are green)
  - location backdrops (no people)                                   -> dist/assets/portraits/bg-<location>.jpg
Both get the pixel-painted finish (coarse grid, limited palette, hard pixels). Raw generations are kept in
art/portraits/layered/ so the finish can be re-run without new generations.

Usage: python scripts/gemini-layered.py [--regenerate] [name ...]   (needs Pillow; Gemini credential as in
gemini-portraits.py: GEMINI_API_KEY, or one the session proxy adds for generativelanguage.googleapis.com)
"""
import base64, io, json, os, sys, urllib.request
from pathlib import Path
from PIL import Image, ImageEnhance

root = Path(__file__).resolve().parent.parent
raw = root / 'art/portraits/layered'; raw.mkdir(parents=True, exist_ok=True)
out = root / 'dist/assets/portraits'; out.mkdir(parents=True, exist_ok=True)
MODEL = os.environ.get('GEMINI_IMAGE_MODEL', 'gemini-3-pro-image')
STYLE_REF = root / 'art/portraits/style/pixel-painted.png'
SETTING = 'Ayutthaya, Siam, in the 1680s; period-appropriate and respectful.'

CHARACTERS = {
    'captain': ('captain-south',
                'The Thai captain, a young Siamese sea captain of the Phra Khlang\'s royal trade fleet in his mid twenties: mahadthai haircut '
                '(short on top, shaved sides), deep red fitted jacket with gold buttons, white sash, a sword hilt at the hip; determined, kind, '
                'weathered by the sea.'),
    'innkeeper': ('innkeeper-south',
                  'Mae Im, a young Siamese woman in her early twenties who keeps a riverside lodge: youthful, lively face with a '
                  'playful smile, bright dark eyes, short black hair cropped in the Ayutthaya style, small gold earrings, green '
                  'pha sabai breast cloth draped over one shoulder, holding a jasmine garland.'),
    'official': ('official-south',
                 'Khun Phithak Wari, a middle-aged Siamese harbour official of the Krom Tha: mahadthai haircut, short grey-flecked beard, '
                 'fitted long-sleeved white jacket with gold buttons, patterned red-and-gold sash, holding a folded ledger; dignified, courteous and shrewd.'),
    'merchant': ('merchant-south',
                 'Tan Heng, a plump, good-humoured Chinese junk merchant: dark blue-grey long robe with side fastening, black skullcap, '
                 'moustache, an abacus at his belt; a trader\'s knowing smile.'),
}
LOCATIONS = {
    'courtyard-day': 'the riverside landing of a merchant\'s courtyard: a teak pavilion with a red clay-tile roof and hanging lanterns, '
                     'a timber jetty, the wide river with Siamese junks, palms and flowering trees; bright late-morning sunlight, blue sky.',
    'courtyard-evening': 'the riverside landing of a merchant\'s courtyard at dusk: a teak pavilion with a red clay-tile roof, warm '
                         'glowing lanterns, a timber jetty, the river with the silhouettes of junks, fireflies; deep blue-violet sky with '
                         'an orange afterglow.',
}

def png_b64(img):
    buf = io.BytesIO(); img.save(buf, 'PNG'); return base64.b64encode(buf.getvalue()).decode()

def generate(prompt, images, aspect):
    parts = [{'text': prompt}] + [{'inline_data': {'mime_type': 'image/png', 'data': png_b64(i)}} for i in images]
    body = {'contents': [{'parts': parts}], 'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': aspect}}}
    key = os.environ.get('GEMINI_API_KEY')
    req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent', data=json.dumps(body).encode(),
                                 headers={'Content-Type': 'application/json', **({'x-goog-api-key': key} if key else {})})
    with urllib.request.urlopen(req, timeout=300) as r: reply = json.load(r)
    for part in reply.get('candidates', [{}])[0].get('content', {}).get('parts', []):
        data = part.get('inlineData') or part.get('inline_data')
        if data: return Image.open(io.BytesIO(base64.b64decode(data['data']))).convert('RGB')
    raise RuntimeError('no image in reply: ' + json.dumps(reply)[:500])

def grade(img, backdrop=False):
    # One colour grade for every portrait, matched to the courtyard scene: slightly muted saturation, shadows pulled
    # toward the scene's olive green, highlights toward warm lantern light. Backdrops sit darker and softer.
    img = ImageEnhance.Color(img).enhance(.8 if backdrop else .9)
    lut = []
    for ch, (shadow, light) in enumerate([(34, 255), (40, 244), (26, 214)]):
        lut += [round(shadow + (light - shadow) * (v / 255) ** (1.04 if backdrop else 1.0)) for v in range(256)]
    img = img.point(lut)
    return ImageEnhance.Brightness(img).enhance(.86) if backdrop else img

def finish(img, width, colours, backdrop=False):
    # Pixel-painted finish: shared scene grade, coarse grid, limited palette, hard square pixels.
    img = grade(img, backdrop)
    small = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    return small.quantize(colours, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB'), small.size

def is_screen(r, g, b):
    return r > 150 and b > 150 and g < r * .6 and g < b * .6

def cutout(img, size):
    # Key the magenta screen at full resolution, shrink the mask to the pixel grid with a hard threshold, then pull
    # leftover magenta spill out of edge pixels.
    mask = Image.new('L', img.size); src, m = img.load(), mask.load()
    for y in range(img.height):
        for x in range(img.width):
            m[x, y] = 0 if is_screen(*src[x, y]) else 255
    small, _ = finish(img, size[0], 56)
    cut = small.convert('RGBA'); cut.putalpha(mask.resize(size, Image.LANCZOS).point(lambda a: 255 if a > 140 else 0))
    px = cut.load()
    for y in range(cut.height):
        for x in range(cut.width):
            r, g, b, a = px[x, y]
            if a and r > g * 1.35 and b > g * 1.35: px[x, y] = (g, g, g, a) if abs(r - b) < 40 else (r, g, b, a)
    return cut

def character(cid):
    sprite, description = CHARACTERS[cid]; path = raw / f'{cid}.png'
    if not path.exists() or regenerate:
        sp = Image.open(root / f'art/pixellab/png/{sprite}.png').convert('RGBA'); sp = sp.resize((sp.width * 8, sp.height * 8), Image.NEAREST)
        prompt = ('Close head-and-shoulders character bust for an RPG dialogue box, in the painting style of the style reference: rich '
                  'saturated colours, dramatic warm key light from the side, crisp jewellery highlights, body turned three-quarters, looking at '
                  'the viewer, the face in the upper half of the frame. The ENTIRE background must be one flat solid pure magenta (#FF00FF): no '
                  f'scenery, no gradient, no shadow on it, and no magenta or pink in the character. Character: {description} Setting: {SETTING} '
                  'First image: pixel-art sprite of this character (identity, costume, colours). Second image: style reference.')
        generate(prompt, [sp, Image.open(STYLE_REF).convert('RGB')], '3:4').save(path); print('generated', cid)
    img = Image.open(path).convert('RGB'); w = 150; size = (w, round(img.height * w / img.width))
    cut = cutout(img, size).resize((size[0] * 4, size[1] * 4), Image.NEAREST); cut.save(out / f'{cid}.png')
    # Dusk variant: dimmer, shadows cooled toward the evening sky, highlights kept warm as if lit by lanterns.
    rgb, alpha = cut.convert('RGB'), cut.split()[3]
    lut = []
    for shadow, light in [(10, 214), (12, 180), (34, 150)]:
        lut += [round(shadow + (light - shadow) * (v / 255) ** 1.08) for v in range(256)]
    dusk = rgb.point(lut).convert('RGBA'); dusk.putalpha(alpha); dusk.save(out / f'{cid}-evening.png')
    print('wrote portraits/%s.png and %s-evening.png' % (cid, cid))

def location(name):
    path = raw / f'bg-{name}.png'
    if not path.exists() or regenerate:
        prompt = ('Background painting for a character portrait in an RPG dialogue box, in the painting style of the style reference '
                  f'(rich saturated colour, painterly light). Scene: {LOCATIONS[name]} {SETTING} No people, no text. Soft depth of field so a '
                  'character can stand in front; keep the centre calm. Tall framing.')
        generate(prompt, [Image.open(STYLE_REF).convert('RGB')], '3:4').save(path); print('generated', name)
    small, size = finish(Image.open(path).convert('RGB'), 150, 64, backdrop=True)
    small.resize((size[0] * 4, size[1] * 4), Image.NEAREST).save(out / f'bg-{name}.jpg', quality=90); print('wrote portraits/bg-%s.jpg' % name)

if __name__ == '__main__':
    args = sys.argv[1:]; regenerate = '--regenerate' in args; names = [a for a in args if not a.startswith('--')]
    for n in names or [*CHARACTERS, *LOCATIONS]:
        character(n) if n in CHARACTERS else location(n)
