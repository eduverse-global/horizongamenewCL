# Dialogue portraits

Painted portraits generated with the Gemini API (`gemini-3-pro-image`), September 2026, by `scripts/gemini-portraits.py`. Each request sent two references: the character's PixelLab sprite (`art/pixellab/png/`) for identity and costume, and the existing Mara portrait for painting style. The characters are original; the setting is 1680s Ayutthaya.

- `raw/`: the 1024×1024 generations: captain, official (Khun Phithak Wari), merchant (Tan Heng), innkeeper (Mae Im).
- `dist/assets/siam-portraits.jpg`: 512 px cells in that order, used by the courtyard dialogue box.

Regenerate one: `python scripts/gemini-portraits.py merchant` (needs Pillow and a Gemini credential, either a `GEMINI_API_KEY` variable or one the session proxy adds for `generativelanguage.googleapis.com`).

Mae Im's portrait was regenerated after playtest feedback to show her as a young woman in her early twenties.

Mae Im was then redone in a pixel-painted style at the user's request. The style reference is `style/pixel-painted.png`, a portrait crop from the user's screenshot of another build. The generated painting is cropped closer, given livelier colour, and reduced to a 150 px grid with 56 colours before being enlarged with hard square pixels (`pixelate()` in the script). Other characters keep the smooth painted style unless added to `PIXEL_PAINTED`.
