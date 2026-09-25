# NARAI — story canon from Horinzonnext

**Source:** [nuiel9/Horinzonnext](https://github.com/nuiel9/Horinzonnext) at `cb03cc8`: the approved setting spec `docs/superpowers/specs/2026-09-23-horizonnext-narai-era-setting-design.md` (approved 2026-09-23) and the Ayutthaya quay cast in `src/data/npcs.json`.

**In this repo:** `dist/data/narai-story.js` holds the setting, timeline, leads and quay cast as bilingual `{ en, th }` data with no Three.js or DOM dependency. `tests/narai-story.test.js` checks EN/TH coverage, timeline order and the dialogue cycle. No scene uses the data yet (see §6).

Horinzonnext is a separate TypeScript/Vite build. Only its story and text come across here. Its engine, renderer and 87-port world data stay in that project.

## 1. Setting

- **Era:** the reign of King Narai of Ayutthaya (r. 1656–1688).
- **Opening:** 1 January 1682 at Ayutthaya's riverside landing. The Thai HUD shows the Buddhist Era by the modern convention (CE + 543, so 1682 → พ.ศ. 2225).
- **Campaign goal:** the great embassy to Louis XIV. It lands at Brest in June 1686 and has its Versailles audience on 1 September 1686.
- **Tone:** history with folk-legend touches. Amulets, sak yant, spirits of sea and forest, omens and sailors' sea monsters are real *within the story*, mostly in land adventures and story events. Trade, sailing and navigation stay grounded.
- **Respect rule:** King Narai, Kosa Pan, Kosa Lek and other historical Siamese figures appear as dignified characters, consistent with the record. Invented deeds belong to the fictional leads, never to real people. Foreign historical figures (Phaulkon, Chaumont, Choisy, Louis XIV) are portrayed fairly from the sources.

## 2. Historical spine

| Date | Event | Role in the game |
| --- | --- | --- |
| 1681 | Siam's first embassy to France is lost when the *Soleil d'Orient* sinks off Madagascar | Backstory: the court is grieving when the game opens |
| 1682 | The Dutch take Bantam; English and Danish traders are expelled from Java | Opening world state |
| 1683 | Kosa Lek (Chao Phraya Kosathibodi, the Phra Khlang) dies; Constantine Phaulkon rises to control royal trade | Early turning point for the Thai captain and the Persian merchant |
| 1684 | A small second embassy (Khun Phichaiwalit and Khun Phichitmaitri, with Bénigne Vachet) reaches France | The road to France is open again |
| Sept 1685 | The Chevalier de Chaumont's embassy arrives in Ayutthaya, with the Abbé de Choisy | The French lead arrives |
| Dec 1685 | Kosa Pan (Ok-phra Wisut Sunthon) sails for France with Chaumont | The fleet departs; the leads' paths converge |
| June 1686 | The embassy lands at Brest | Arrival in France |
| Aug–Sept 1686 | The Makassarese exiles revolt in Ayutthaya | Parallel climax at home |
| 1 Sept 1686 | Audience with Louis XIV in the Hall of Mirrors | The campaign's climax |
| 1688 | Palace revolution: Narai dies, Phaulkon is executed, the French are expelled | Epilogue or sequel hook |

If a source contradicts a date here, the source wins and this table is corrected. Horinzonnext's `docs/research/ports-1682.md` records the sources behind the port and goods research.

## 3. Five leads (Octopath-style, converging on 1686)

| # | Lead | Start | Hook |
| --- | --- | --- | --- |
| 1 | **Thai captain**, a young kinsman of Kosa Pan's family and a captain in the Phra Khlang's royal trade fleet | Ayutthaya, 1682 | Earns a place in the 1686 embassy fleet after Kosa Lek's death reshapes the court |
| 2 | **Japanese-Siamese swordsman** of Ban Yipun | Ayutthaya | Land combat and escort work; ties to Nagasaki's closed-country trade |
| 3 | **French officer or missionary** (not yet chosen) | Arrives with Chaumont, 1685 | The outsider's view; guide for the France chapter |
| 4 | **Persian merchant** | Ayutthaya / Mergui | Trade, diplomacy and intrigue toward Bandar Abbas and Isfahan |
| 5 | **Makassarese prince in exile** | Ayutthaya | Tragic-hero arc climaxing in the 1686 revolt |

The Thai captain's name is still undecided.

## 4. Ayutthaya quay cast, January 1682

Each character has a greeting and four lines of original EN/TH text. The NPCs address the player as นายสำเภา (master of a junk).

| Character | Service | Lines cover |
| --- | --- | --- |
| **Khun Phithak Wari** (ขุนพิทักษ์วารี), official of the Krom Tha | Harbour | Port dues reckoned by a ship's beam; the royal warehouses' first right to buy; the June south-west monsoon to Canton; the envoys' ship "not heard of since Bantam" |
| **Tan Heng** (ตันเฮง), Chinese junk merchant | Market | Deer hides for Japanese copper; the Qing coastal ban against Koxinga's heirs; stowing porcelain under tea; incense to Mazu |
| **Mae Im** (แม่อิ่ม), keeper of the river lodge | Lodge | Dutch intervention at Bantam; jasmine for Mae Ya Nang, the boat spirit; the spires of Wat Phra Si Sanphet at dusk; rest and morale |
| **The captain** | Gangway | "The tide is turning. Do we go aboard?" |

## 5. How this fits the existing Siam chapter draft

`SIAM-FIRST-CHAPTER.md` (Draft 0.1, *A Letter Against the Tide*) and the Horinzonnext spec were written separately. They agree on the Narai era, the France embassy as the campaign frame, the 1 September 1686 anchor, grounded history with a light touch of folklore, and fictional leads beside real figures. Where they differ:

| Topic | Siam chapter draft 0.1 | Horinzonnext (approved) | Suggested merge |
| --- | --- | --- | --- |
| Campaign window | 1685–1688, opening about 1685 | Opens 1 January 1682 | Open in 1682; set *A Letter Against the Tide* in autumn 1685, while Chaumont's embassy is in Ayutthaya and Kosa Pan's fleet prepares |
| Protagonists | Six eventual; Niran (river pilot) and Mali (interpreter's assistant) open | Five leads; the Thai captain opens | Undecided: keep Niran and Mali as chapter companions who meet the Thai captain, or fold them into the lead list |
| Folklore | Ambiguous; no supernatural combat | Beliefs are real within the story, mostly on land | Compatible: the sanctuary lantern beat already fits |
| First place | Bang Kok district → Ayutthaya landing | Ayutthaya riverside landing | Use the quay cast at the Ayutthaya landing of beat 6, or as the opening scene |
| Title | NARAI: Winds of Siam (working) | Horizonnext | Keep NARAI for this repo |

The open decisions are the start year and how Niran, Mali and the Thai captain relate. They belong to the owner and are not settled by this import.

## 6. Next steps

1. Decide the two open items in §5.
2. Wire `QUAY_CAST` into an Ayutthaya on-foot scene. The courtyard engine (`dist/engine/`) already has EN/TH dialogue, proximity interaction and saved choices. It needs sprites and portraits for the three NPCs, since the current art is the European Lisbon cast.
3. Seek Thai review of the new Thai text for the timeline and leads in `narai-story.js`. The quay cast Thai comes unchanged from Horinzonnext.
