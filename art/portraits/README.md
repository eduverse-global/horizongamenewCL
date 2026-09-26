# Dialogue portraits

Painted portraits generated with the Gemini API (`gemini-3-pro-image`), September 2026, by `scripts/gemini-portraits.py`. Each request sent two references: the character's PixelLab sprite (`art/pixellab/png/`) for identity and costume, and the existing Mara portrait for painting style. The characters are original; the setting is 1680s Ayutthaya.

- `raw/`: the 1024×1024 generations: captain, official (Khun Phithak Wari), merchant (Tan Heng), innkeeper (Mae Im).
- `dist/assets/siam-portraits.jpg`: 512 px cells in that order, used by the courtyard dialogue box.

Regenerate one: `python scripts/gemini-portraits.py merchant` (needs Pillow and a Gemini credential, either a `GEMINI_API_KEY` variable or one the session proxy adds for `generativelanguage.googleapis.com`).

Mae Im's portrait was regenerated after playtest feedback to show her as a young woman in her early twenties.

Mae Im was then redone in a pixel-painted style at the user's request. The style reference is `style/pixel-painted.png`, a portrait crop from the user's screenshot of another build. The generated painting is cropped closer, given livelier colour, and reduced to a 150 px grid with 56 colours before being enlarged with hard square pixels (`pixelate()` in the script). Other characters keep the smooth painted style unless added to `PIXEL_PAINTED`.

## Layered portraits

`scripts/gemini-layered.py` generates a character on a flat magenta screen (magenta, because Mae Im's cloth is green) and keys it out. It also generates location backdrops without people. Both get the pixel-painted finish. Raw generations are kept in `layered/`. The dialogue box stacks the cut-out over the backdrop that matches the location and time of day.

All three courtyard speakers (Khun Phithak Wari, Tan Heng, Mae Im) now use layered portraits, so the style no longer jumps between speakers. One colour grade, matched to the courtyard scene, is applied to every cut-out and backdrop (`grade()` in the script): slightly muted saturation, olive shadows and warm highlights, with backdrops darker and softer than characters. Each cut-out also has a dusk variant (`<id>-evening.png`): dimmer, cooler shadows and warm highlights. The dialogue box picks the variant that matches the scene's time of day. The earlier smooth painted atlas (`siam-portraits.jpg`) is now only a fallback.
