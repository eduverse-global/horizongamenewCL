# NARAI combat milestone

Working title: NARAI: Winds of Siam / นารายณ์: สายลมแห่งสยาม. Final name and availability are not settled.

The main entry preserves the original sailing art. `/combat.html` is a standalone, bilingual Three.js tactical escort encounter. The earlier sailing prototype remains at /voyage.html. These modes have separate saves. This is a mechanics experiment using procedural models, not the final Siam environment or campaign.

## Playable scope

Assign exactly three teams between helm, guns and repairs. Queue up to two orders, inspect the exact turn forecast, undo, and commit. Movement is cardinal and avoids ships and shoals. Facing controls broadside arcs; northward movement receives a wind bonus. Rigging fire delays an opponent. Signals change the passenger route; anchoring resists the current. Mali can delay one enemy once. Win by reaching the northern exit or disabling both enemies; losing either friendly boat ends the battle.

English and Thai cover this encounter's story briefing, instructions, controls, errors, event forecast and outcomes. Switching languages preserves orders. Reload preserves committed turns. Sailing menus and the existing story now also have English/Thai presentation support.

## Validation and limits

Automated rules cover deterministic forecasts, collisions, invalid orders, resources, persistence and paired translations. A baseline of passing every turn loses. Passing until round three, using parley then passing can win; this benchmark is intentionally simple and is not evidence of finished difficulty balance. Browser playthrough verified Thai victory, language switching with a queued order, undo, and saved round restoration, with no captured console errors.

Next: add richer enemy choices and test multiple viable combat strategies with players, then build regional travel with meaningful journey duration, followed by authored Siam towns and the first chapter. Naval movement here is abstract turn-based grid movement, not the future open-water simulation. Historical setting and cultural detail need source review before final narrative and art.
