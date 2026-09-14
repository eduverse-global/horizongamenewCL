# The Captain Who Never Returned

The playable chapter starts in Lisbon: **Enter port → Explore town → The Lantern & Tide**. Walk with WASD/arrows or click the floor. Click an NPC (or their Approach button) to walk over and talk. E talks to the nearest character within reach. Escape closes a conversation or returns to the ship.

Follow Inês → London merchant guild / Elias → Azores wreck camp / Tomás → Lisbon / Inês. The journal offers a route to each next destination. Choose rescue (350 gold, Mara, 20% less provision use) or cargo (900 gold, Tomás, 25% cheaper repairs). The choice is committed only after its confirmation dialogue; reward and recruitment happen on returning to Inês. Old saves gain this chapter without resetting trading progress. Reloading resumes at the ship, preserving the chapter.

## Art provenance

- `dist/assets/story-portraits.png`: original generated 2×2 portrait atlas, 1254×1254. Order: Inês, Elias, Tomás, Mara.
- `dist/assets/story-sprites.png`: original generated transparent sprite atlas, 1983×793. Columns: player, Inês, Elias, Tomás, Mara. Idle and step poses. Custom UV bounds account for generated spacing.
- Generated with built-in image generation for this project, September 2026. Original characters; no extracted commercial game artwork.
- Rooms and props are authored procedurally in Three.js (`dist/interiors.js`), with cutaway walls, warm lighting, furniture collision, and sprite billboards. These are not Blender exports. The existing Blender background authoring bridge remains available for later replacement of room meshes with modeled assets.

## Validation

Automated tests cover both complete endings through save/reload, location/chapter guards, reward idempotency, companion calculations, old-save migration, and actor reachability around furniture. Browser QA confirmed Lisbon street traversal, tavern entry, NPC approach, portrait dialogue, market services, return-to-street positioning, and foreground building fade without console errors. The eastern expedition progression is covered by automated tests; its full browser journey was not exercised.

## Walkable towns and the eastern expedition

Lisbon, London, and Alexandria have 40×48-unit harbor quarters, each with six accessible buildings. Towns use a following camera, instanced paving, collision-aware click routes and strict cardinal keyboard movement. Room exits restore the captain’s last town position. The market and shipwright use the existing economy; taverns and chapels have contextual interactions; archives advance exploration.

`captain-directions.png` is a new original reference-guided RGBA atlas, 1086×1448. Rows face down, left, right, up; columns idle and two step poses. Per-frame source bounds use a shared rendering scale and bottom anchor; baked checkerboard drafts were rejected.

After completing the captain story, read the papers in Lisbon’s cartographer’s archive. Sail to Alexandria, read its archive itinerary, and walk to the northern caravan gate. The fictional Holy Land expedition travels to a courtyard near Jerusalem, where the captain copies a star chart and returns it to Alexandria for 450 gold. This is a stylized fictional route and courtyard, not a reconstruction of a specific sacred site. Caravan travel outward consumes one provision and advances one day; return travel is always available.
