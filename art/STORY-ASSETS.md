# The Captain Who Never Returned

The playable chapter starts in Lisbon: **Enter port → Enter tavern**. Walk with WASD/arrows or click the floor. Click an NPC (or their Approach button) to walk over and talk. E talks to the nearest character within reach. Escape closes a conversation or returns to the ship.

Follow Inês → London merchant guild / Elias → Azores wreck camp / Tomás → Lisbon / Inês. The journal offers a route to each next destination. Choose rescue (350 gold, Mara, 20% less provision use) or cargo (900 gold, Tomás, 25% cheaper repairs). The choice is committed only after its confirmation dialogue; reward and recruitment happen on returning to Inês. Old saves gain this chapter without resetting trading progress. Reloading resumes at the ship, preserving the chapter.

## Art provenance

- `dist/assets/story-portraits.png`: original generated 2×2 portrait atlas, 1254×1254. Order: Inês, Elias, Tomás, Mara.
- `dist/assets/story-sprites.png`: original generated transparent sprite atlas, 1983×793. Columns: player, Inês, Elias, Tomás, Mara. Idle and step poses. Custom UV bounds account for generated spacing.
- Generated with built-in image generation for this project, September 2026. Original characters; no extracted commercial game artwork.
- Rooms and props are authored procedurally in Three.js (`dist/interiors.js`), with cutaway walls, warm lighting, furniture collision, and sprite billboards. These are not Blender exports. The existing Blender background authoring bridge remains available for later replacement of room meshes with modeled assets.

## Validation

Automated tests cover both complete endings through save/reload, location/chapter guards, reward idempotency, companion calculations, old-save migration, and actor reachability around furniture. Browser visual and interaction QA has not been performed for this chapter.
